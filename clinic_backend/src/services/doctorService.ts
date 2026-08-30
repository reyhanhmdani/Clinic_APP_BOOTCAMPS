import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { CreateDoctorInput, UpdateDoctorInput } from '../validation/doctorSchema.js';

export const getAllDoctorsService = async () => {
  const doctors = await prisma.doctor.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  if (doctors.length === 0) {
    return [];
  }

  return doctors;
};

export const createDoctorService = async (input: CreateDoctorInput) => {
  const createDoctor = await prisma.doctor.create({
    data: {
      name: input.name,
      gender: input.gender,
      spesialis: input.spesialis,
      fee: input.fee,
      phone: input.phone ?? null,
      isActive: input.isActive,
    },
  });

  return createDoctor;
};

export const getDoctorByIdService = async (id: number) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id: id,
    },
  });

  if (!doctor) {
    throw new ApiError(404, 'Dokter tidak ditemukan');
  }

  return doctor;
};

export const updateDoctorService = async (id: number, input: UpdateDoctorInput) => {
  await getDoctorByIdService(id);

  const updateDoctorById = await prisma.doctor.update({
    where: { id },
    data: input,
  });

  return updateDoctorById;
};

export const deleteDoctorService = async (id: number) => {
  await getDoctorByIdService(id);

  // Cek apakah dokter sudah memiliki riwayat kunjungan pasien
  const visitCount = await prisma.visit.count({
    where: { doctorId: id },
  });

  if (visitCount > 0) {
    throw new ApiError(
      400,
      'Dokter tidak dapat dihapus permanen karena memiliki riwayat kunjungan pasien. Silakan nonaktifkan status dokter.',
    );
  }

  // Jika belum ada riwayat kunjungan sama sekali, hapus permanen dari database
  const deletedDoctor = await prisma.doctor.delete({
    where: { id },
  });

  return deletedDoctor;
};

export const getActiveDoctorsService = async () => {
  return await prisma.doctor.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      gender: true,
      spesialis: true,
      fee: true,
    },
    orderBy: { name: 'asc' },
  });
};
