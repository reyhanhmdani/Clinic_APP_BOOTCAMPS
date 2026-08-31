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
      consultationMedicines: true,
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

  // Update status obat diserahkan
  const updated = await prisma.consultation.update({
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

  io.emit('QUEUE_UPDATED', {
    type: 'MEDICINE_DISPENSED',
    consultationId,
    visitId: updated.visitId,
  });

  return updated;
};
