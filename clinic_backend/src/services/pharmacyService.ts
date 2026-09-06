import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { io } from '../app.js';

export const getPharmacyQueueService = async () => {
  const queues = await prisma.consultation.findMany({
    where: {
      consultationMedicines: {
        some: {}, // Pastikan ada obatnya
      },
      visit: {
        invoice: {
          status: 'PAID',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      visit: {
        include: {
          patient: true,
          doctor: true,
          invoice: true,
        },
      },
      consultationMedicines: {
        include: {
          medicine: true,
        },
      },
    },
  });

  // pisahkan antara yang menunggu dengan yang sudah diserahkan
  const pending = queues.filter((q) => !q.isDispensed);
  const completed = queues.filter((q) => q.isDispensed);

  return {
    pending,
    completed,
    stats: {
      totalPending: pending.length,
      totalCompleted: completed.length,
    },
  };
};

export const dispenseMedicineService = async (consultationId: number) => {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: {
      visit: {
        include: {
          invoice: true,
        },
      },
      consultationMedicines: {
        include: {
          medicine: true,
        },
      },
    },
  });

  if (!consultation) {
    throw new ApiError(404, 'Data konsul resep ga nemu');
  }
  if (consultation.visit.invoice?.status !== 'PAID') {
    throw new ApiError(400, 'Tagihan kasir belum lunas! obat belum bisa di serahkan sebelum pembayaran');
  }
  if (consultation.isDispensed) {
    throw new ApiError(400, 'Obat untuk konsul ini sudah pernah di serahkan sebelumnya');
  }

  // eksekusi atomic transaction (potong stok & tandai di serahkan)
  const updated = await prisma.$transaction(async (tx) => {
    // kurangi stok masing masing obat
    for (const item of consultation.consultationMedicines) {
      // ambil stok real time saat transaksi berlangsung
      const currentMed = await tx.medicine.findUnique({
        where: { id: item.medicineId },
      });

      if (!currentMed || currentMed.stock < item.qty) {
        throw new ApiError(
          400,
          `Stok obat ${currentMed?.name || 'Obat'} tidak mencukupi (sisa: ${currentMed?.stock ?? 0}, dibutuhkan: ${item.qty})`,
        );
      }

      // Potong stok
      await tx.medicine.update({
        where: { id: item.medicineId },
        data: { stock: { decrement: item.qty } },
      });
    }
    // Tandai obat telah diserahkan
    return await tx.consultation.update({
      where: { id: consultationId },
      data: {
        isDispensed: true,
        dispensedAt: new Date(),
      },
      include: {
        visit: {
          include: {
            patient: true,
            doctor: true,
          },
        },
        consultationMedicines: {
          include: {
            medicine: true,
          },
        },
      },
    });
  });

  // broadcast realtime ke socket agar UI admin & dashboard langsung sync
  io.emit('QUEUE_UPDATED', {
    type: 'MEDICINE_DISPENSED',
    consultationId,
    visitId: updated.visitId,
  });

  return updated;
};
