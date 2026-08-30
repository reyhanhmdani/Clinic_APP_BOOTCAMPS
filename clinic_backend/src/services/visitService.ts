import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { CreateVisitInput, UpdateVisitInput } from '../validation/visitSchema.js';
import { getDoctorByIdService } from './doctorService.js';
import { getPatientByIdService } from './patientService.js';
import { VisitStatus } from '@prisma/client';
import { io } from '../app.js';

export const getAllVisitService = async () => {
  const visits = await prisma.visit.findMany({
    orderBy: [
      {
        visitDate: 'desc',
      },
      {
        queueNumber: 'desc',
      },
    ],
    include: {
      patient: true,
      doctor: true,
      invoice: true,
    },
  });

  return visits;
};

export const createVisitService = async (input: CreateVisitInput) => {
  // cek apakah ada id pasien yang di pilih atau doctor
  const patient = await getPatientByIdService(input.patientId);
  const doctor = await getDoctorByIdService(input.doctorId);

  if (!doctor.isActive) {
    throw new ApiError(400, 'Doctor yang dipilih sudah tidak aktif');
  }

  const visitDate = input.visitDate ?? new Date();

  const dateStr = visitDate.toISOString().split('T')[0];

  const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateStr}T23:59:59.000Z`);

  // hitung antrian khusus di hari tersebut (lanjutkan dari antrean tertinggi hari ini)
  const lastVisitOfDay = await prisma.visit.findFirst({
    where: {
      visitDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { queueNumber: 'desc' },
    select: { queueNumber: true },
  });

  const queueNumber = (lastVisitOfDay?.queueNumber || 0) + 1;

  const createVisit = await prisma.visit.create({
    data: {
      patientId: input.patientId,
      doctorId: input.doctorId,
      visitDate: visitDate,
      queueNumber: queueNumber,
    },
  });

  io.emit('QUEUE_UPDATED', { type: 'NEW_VISIT', visitId: createVisit.id });
  return createVisit;
};

export const getVisitByIdService = async (id: number) => {
  const visit = await prisma.visit.findUnique({
    where: {
      id: id,
    },
  });

  if (!visit) {
    throw new ApiError(404, 'Visit nya ga ada');
  }

  return visit;
};

export const updateVisitService = async (id: number, input: UpdateVisitInput) => {
  await getVisitByIdService(id);

  if (input.patientId) {
    await getPatientByIdService(input.patientId);
  }
  if (input.doctorId) {
    const doctor = await getDoctorByIdService(input.doctorId);
    if (!doctor.isActive) {
      throw new ApiError(400, 'Dokter yang dipilih sedang tidak aktif');
    }
  }

  const updateData: any = { ...input };
  if (input.status === VisitStatus.IN_KONSULTASI) {
    updateData.checkInTime = new Date();
  }

  const updatedVisit = await prisma.visit.update({
    where: { id },
    data: updateData,
  });

  io.emit('QUEUE_UPDATED', { type: 'STATUS_UPDATED', visitId: updatedVisit.id });
  return updatedVisit;
};

// CUSTOMERS
export const bookCustomerVisitService = async (userId: number, doctorId: number) => {
  // pastikan dulu si user nya sudah punya profil pasien blum
  const patient = await prisma.patient.findUnique({
    where: { userId },
  });
  if (!patient) {
    throw new ApiError(404, 'Silahkan lengkapi profil pasien Anda terlebih dahulu sebelum mendaftar antrian');
  }

  // pastikan dokter ada dan sedang aktif
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });
  if (!doctor) {
    throw new ApiError(404, 'Dokter yang dipilih tidak ditemukan');
  }
  if (!doctor.isActive) {
    throw new ApiError(400, 'Dokter yang dipilih sedang tidak bertugas');
  }

  // cek apakah pasien sudah punya antrian aktif hari ini (waiting/ in_konsultasi)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const activeExisting = await prisma.visit.findFirst({
    where: {
      patientId: patient.id,
      visitDate: { gte: todayStart, lte: todayEnd },
      status: { in: [VisitStatus.WAITING, VisitStatus.IN_KONSULTASI] },
    },
  });

  if (activeExisting) {
    throw new ApiError(400, `Anda sudah memiliki antrian aktif (No. ${activeExisting.queueNumber}) yang belum selesai`);
  }

  // hitung nomor antrian hari ini (lanjutkan dari antrean tertinggi hari ini)
  const lastTodayVisit = await prisma.visit.findFirst({
    where: {
      visitDate: { gte: todayStart, lte: todayEnd },
    },
    orderBy: { queueNumber: 'desc' },
    select: { queueNumber: true },
  });

  const queueNumber = (lastTodayVisit?.queueNumber || 0) + 1;

  // buat tiket antrian
  const created = await prisma.visit.create({
    data: {
      patientId: patient.id,
      doctorId,
      visitDate: new Date(),
      queueNumber,
      status: VisitStatus.WAITING,
    },
    include: {
      doctor: {
        select: { id: true, name: true, spesialis: true, fee: true },
      },
      patient: {
        select: { id: true, noRm: true, name: true },
      },
    },
  });

  io.emit('QUEUE_UPDATED', { type: 'CUSTOMER_BOOKED', visitId: created.id });
  return created;
};

export const getActiveCustomerVisitService = async (userId: number) => {
  const patient = await prisma.patient.findUnique({
    where: { userId },
  });
  if (!patient) return null;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Cari kunjungan aktif hari ini
  const activeVisit = await prisma.visit.findFirst({
    where: {
      patientId: patient.id,
      visitDate: { gte: todayStart, lte: todayEnd },
      OR: [{ status: { in: [VisitStatus.WAITING, VisitStatus.IN_KONSULTASI] } }, { invoice: { status: 'UNPAID' } }],
    },
    include: {
      doctor: { select: { id: true, name: true, spesialis: true, fee: true } },
      consultation: {
        select: {
          diagnosis: true,
          complaint: true,
          consultationMedicines: {
            include: { medicine: { select: { name: true, price: true, unit: true } } },
          },
        },
      },
      invoice: {
        select: { id: true, invoiceNo: true, totalAmount: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!activeVisit) return null;

  // hitung sisa antrian yang masih menunggu di depan pasien ini untuk dokter yang sama
  const queueAhead = await prisma.visit.count({
    where: {
      doctorId: activeVisit.doctorId,
      visitDate: { gte: todayStart, lte: todayEnd },
      status: VisitStatus.WAITING,
      queueNumber: { lt: activeVisit.queueNumber },
    },
  });

  return {
    visit: activeVisit,
    queueAhead,
  };
};
