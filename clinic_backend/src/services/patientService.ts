import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { CreatePatientInput, UpdatePatientInput } from '../validation/patientSchema.js';
import { Prisma } from '@prisma/client';

export const getAllPatientsService = async () => {
  const patients = await prisma.patient.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      userId: true,
      name: true,
      nik: true,
      noRm: true,
      gender: true,
      age: true,
      phone: true,
      address: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (patients.length === 0) {
    return [];
    // throw new ApiError(404, 'Data Patient KOSONG');
  }
  return patients;
};

export const createPatientService = async (input: CreatePatientInput) => {
  const year = new Date().getFullYear();

  const count = await prisma.patient.count({
    where: { noRm: { startsWith: `RM-${year}` } },
  });

  const noRm = `RM-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

  const newPatient = await prisma.patient.create({
    data: {
      name: input.name,
      nik: input.nik ? input.nik.trim() : null, // Disimpan sebagai NULL jika tidak diisi
      noRm: noRm,
      gender: input.gender,
      age: input.age,
      phone: input.phone ?? null,
      address: input.address ?? null,
    },
  });

  return newPatient;
};

export const getPatientByIdService = async (id: number) => {
  const patient = await prisma.patient.findUnique({
    where: {
      id: id,
    },
  });

  if (!patient) {
    throw new ApiError(404, 'patien nya ga ada ');
  }

  return patient;
};

export const updatePatientService = async (id: number, input: UpdatePatientInput) => {
  const patient = await prisma.patient.findUnique({
    where: {
      id: id,
    },
  });

  if (!patient) {
    throw new ApiError(404, 'patien yang ingin di update tidak di temukan');
  }

  const uptPatient = await prisma.patient.update({
    where: { id },
    data: input,
  });

  return uptPatient;
};

export const deletePatientService = async (id: number) => {
  await getPatientByIdService(id);

  //  Cek apakah pasien memiliki riwayat kunjungan / rekam medis
  const hasVisits = await prisma.visit.findFirst({
    where: { patientId: id },
  });

  if (hasVisits) {
    throw new ApiError(400, 'Pasien tidak dapat dihapus karena memiliki riwayat rekam medis/kunjungan');
  }

  //  Eksekusi hapus jika tidak ada riwayat
  return await prisma.patient.delete({
    where: { id },
  });
};

export const getPatientHistoryService = async (id: number) => {
  const patient = await getPatientByIdService(id);

  // Ambil semua riwayat kunjungan pasien dari yang terbaru
  const visits = await prisma.visit.findMany({
    where: { patientId: id },
    orderBy: { visitDate: 'desc' },
    include: {
      doctor: {
        select: {
          id: true,
          name: true,
          spesialis: true,
        },
      },
      consultation: {
        include: {
          consultationMedicines: {
            include: {
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
        },
      },
      invoice: {
        select: {
          id: true,
          invoiceNo: true,
          totalAmount: true,
          status: true,
          paymentMethod: true,
          paidAt: true,
        },
      },
    },
  });

  return {
    patient,
    totalVisits: visits.length,
    visits,
  };
};

// CUSTOMERS
export const checkNikService = async (nik: string) => {
  if (!nik || nik.trim().length !== 16) {
    throw new ApiError(400, `NIK harus terdiri 16 angka`);
  }

  const existingPatient = await prisma.patient.findUnique({
    where: { nik: nik.trim() },
    select: {
      id: true,
      noRm: true,
      name: true,
      gender: true,
      age: true,
      phone: true,
      address: true,
      userId: true,
    },
  });

  // NIK belum pernah ada di klinik (pasien baru)
  if (!existingPatient) {
    return {
      exists: false,
      isLinked: false,
      message: 'NIK belum terdaftar di klinik. Silakan lengkapi profil pasien baru.',
      data: null,
    };
  }

  // NIK sudah pernah di klaim akun lain
  if (existingPatient?.userId) {
    return {
      exists: true,
      isLinked: true,
      message: 'NIK ini sudah terhubung ke akun lain',
      data: null,
    };
  }

  // NIK ditemukan di data loket offline (Bisa langsung di-link!)
  return {
    exists: true,
    isLinked: false,
    message: `Data rekam medis ditemukan atas nama ${existingPatient?.name} (${existingPatient?.noRm}).`,
    data: existingPatient,
  };
};

export const registerPatientProfileService = async (userId: number, input: CreatePatientInput) => {
  const nik = input.nik?.trim() || null;
  const phone = input.phone?.trim() || null;
  const address = input.address?.trim() || null;

  // 1. cek apakah user sudah punya data pasien (Update mode)
  const existingUser = await prisma.patient.findUnique({
    where: { userId },
  });
  if (existingUser) {
    return await prisma.patient.update({
      where: { id: existingUser.id },
      data: {
        nik: nik || existingUser.nik,
        name: input.name || existingUser.name,
        gender: input.gender || existingUser.gender,
        age: input.age !== undefined ? Number(input.age) : existingUser.age,
        phone: phone !== null ? phone : existingUser.phone,
        address: address !== null ? address : existingUser.address,
      },
    });
  }
  // 2. Jika NIK sudah ada di sistem (pernah berobat di loket offline) -> Hubungkan!
  if (nik) {
    const offlinePatient = await prisma.patient.findUnique({ where: { nik } });
    if (offlinePatient) {
      if (offlinePatient.userId) {
        throw new ApiError(400, `NIK ${nik} sudah terhubung ke akun lain.`);
      }
      return await prisma.patient.update({
        where: { id: offlinePatient.id },
        data: {
          userId,
          phone: phone || offlinePatient.phone,
          address: input.address?.trim() || offlinePatient.address,
        },
      });
    }
  }
  // 3. Jika pasien baru murni -> Terbitkan No. RM baru
  if (!input.name || !input.gender || input.age === undefined) {
    throw new ApiError(400, 'Untuk pasien baru, Nama, Jenis Kelamin, dan Usia wajib diisi.');
  }
  const year = new Date().getFullYear();
  const count = await prisma.patient.count({ where: { noRm: { startsWith: `RM-${year}` } } });
  const noRm = `RM-${year}-${String(count + 1).padStart(3, '0')}`;

  return await prisma.patient.create({
    data: {
      userId,
      nik,
      noRm,
      name: input.name,
      gender: input.gender,
      age: Number(input.age),
      phone,
      address: input.address?.trim() || null,
    },
  });
};

export const getMyProfileService = async (userId: number) => {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    select: {
      id: true,
      noRm: true,
      nik: true,
      name: true,
      gender: true,
      age: true,
      phone: true,
      address: true,
    },
  });

  return patient;
};

export const getCustomerHistoryService = async (userId: number) => {
  const patient = await prisma.patient.findUnique({
    where: { userId },
  });

  if (!patient) {
    return {
      patient: null,
      totalVisits: 0,
      visits: [],
    };
  }

  const visits = await prisma.visit.findMany({
    where: { patientId: patient.id },
    include: {
      doctor: {
        select: { id: true, name: true, spesialis: true, fee: true },
      },
      consultation: {
        select: {
          id: true,
          complaint: true,
          diagnosis: true,
          notes: true,
          consultationMedicines: {
            include: {
              medicine: {
                select: { id: true, name: true, price: true, unit: true },
              },
            },
          },
        },
      },
      invoice: {
        select: {
          id: true,
          invoiceNo: true,
          totalConsultationFee: true,
          totalMedicineFee: true,
          totalAmount: true,
          status: true,
          paymentMethod: true,
          paidAt: true,
        },
      },
    },
    orderBy: { visitDate: 'desc' },
  });

  return {
    patient,
    totalVisits: visits.length,
    visits,
  };
};
