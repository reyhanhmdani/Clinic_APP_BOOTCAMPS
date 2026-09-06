import { VisitStatus } from '@prisma/client';
import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { CreateConsultationInput, UpdateConsultationInput } from '../validation/consultationSchema.js';
import { getVisitByIdService } from './visitService.js';
import { getMedicineByIdService } from './medicineService.js';
import { getDoctorByIdService } from './doctorService.js';
import { io } from '../app.js';

const consultationSelectPayload = {
  id: true,
  complaint: true,
  diagnosis: true,
  notes: true,
  consultationFee: true,
  isDispensed: true,
  dispensedAt: true,
  createdAt: true,
  visit: {
    select: {
      id: true,
      visitDate: true,
      patient: {
        select: {
          id: true,
          noRm: true,
          name: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
          spesialis: true,
        },
      },
    },
  },
  consultationMedicines: {
    select: {
      id: true,
      qty: true,
      price: true,
      subTotal: true,
      instructions: true,
      medicine: {
        select: {
          id: true,
          code: true,
          name: true,
          unit: true,
        },
      },
    },
  },
};

export const getAllConsultationService = async () => {
  const consultations = await prisma.consultation.findMany({
    select: consultationSelectPayload,
  });

  if (consultations.length === 0) {
    throw new ApiError(404, 'Data Konsultasi masih kosong');
  }

  return consultations;
};

export const createConsultationService = async (input: CreateConsultationInput) => {
  // Validasi ada ga Visitnya
  const visit = await getVisitByIdService(input.visitId);
  const existingConsultation = await prisma.consultation.findUnique({
    where: { visitId: input.visitId },
  });
  if (existingConsultation) {
    throw new ApiError(400, `Kunjungan (visitId: ${input.visitId}) sudah memiliki data konsultasi.`);
  }
  const doctor = await getDoctorByIdService(visit.doctorId);

  // Validasi Stok Obat terlebih dahulu (Sebelum membuat transaksi)
  if (input.medicine && input.medicine.length > 0) {
    for (const item of input.medicine) {
      const med = await getMedicineByIdService(item.medicineId);
      if (med.stock < item.qty) {
        throw new ApiError(400, `Stok obat ${med.name} tidak mencukupi (sisa: ${med.stock})`);
      }
    }
  }

  // Buat Data Konsultasi
  const createConsultation = await prisma.consultation.create({
    data: {
      visitId: input.visitId,
      complaint: input.complaint,
      diagnosis: input.diagnosis,
      notes: input.notes,
      consultationFee: doctor.fee,
    },
  });

  // Simpan Resep Obat & Potong Stok
  if (input.medicine && input.medicine.length > 0) {
    for (const item of input.medicine) {
      const med = await getMedicineByIdService(item.medicineId);
      const subTotal = Number(med.price) * item.qty;

      await prisma.consultationMedicine.create({
        data: {
          consultationId: createConsultation.id,
          medicineId: item.medicineId,
          qty: item.qty,
          price: med.price,
          subTotal: subTotal,
          instructions: item.instructions,
        },
      });
    }
  }

  // Ubah Status Visit menjadi COMPLETED
  await prisma.visit.update({
    where: { id: input.visitId },
    data: { status: VisitStatus.COMPLETED },
  });
  io.emit('QUEUE_UPDATED', {
    type: 'CONSULTATION_COMPLETED',
    visitId: input.visitId,
  });

  return createConsultation;
};

export const getConsultationByIdService = async (id: number) => {
  const getConsultation = await prisma.consultation.findUnique({
    where: {
      id,
    },
    select: consultationSelectPayload,
  });

  if (!getConsultation) {
    throw new ApiError(404, 'Konsultasi yang di cari ga ada');
  }

  return getConsultation;
};

export const updateConsultationService = async (id: number, input: UpdateConsultationInput) => {
  const existing = await getConsultationByIdService(id);

  // Proteksi: Jika obat sudah diserahkan di farmasi, resep terkunci
  if (existing.isDispensed && input.medicine !== undefined) {
    throw new ApiError(400, 'Resep tidak dapat diubah karena obat sudah diserahkan oleh farmasi');
  }

  if (input.medicine !== undefined) {
    // Hapus relasi resep lama (tidak perlu rollback stok fisik karena belum dipotong)
    await prisma.consultationMedicine.deleteMany({
      where: { consultationId: id },
    });

    if (input.medicine && input.medicine.length > 0) {
      for (const item of input.medicine) {
        const med = await getMedicineByIdService(item.medicineId);
        if (med.stock < item.qty) {
          throw new ApiError(400, `Stok obat ${med.name} tidak mencukupi (sisa: ${med.stock})`);
        }

        const subTotal = Number(med.price) * item.qty;
        await prisma.consultationMedicine.create({
          data: {
            consultationId: id,
            medicineId: item.medicineId,
            qty: item.qty,
            price: med.price,
            subTotal: subTotal,
            instructions: item.instructions,
          },
        });
      }
    }
  }

  const updatedConsultation = await prisma.consultation.update({
    where: { id },
    data: {
      complaint: input.complaint,
      diagnosis: input.diagnosis,
      notes: input.notes,
      consultationFee: input.consultationFee,
    },
  });

  return updatedConsultation;
};
