import { tr } from 'zod/locales';
import prisma from '../config/prisma.js';
import { Request, Response } from 'express';
import { ApiError } from '../utils/apiError.js';
import { CreatePatientInput, updatePatientInput } from '../validation/patientSchema.js';
import { Prisma } from '@prisma/client';

export const getAllPatientsService = async () => {
  const existingPatient = await prisma.patient.findMany({
    select: {
      id: true,
      name: true,
      noRm: true,
      gender: true,
      age: true,
      phone: true,
      address: true,
    },
  });

  if (!existingPatient) {
    throw new ApiError(404, 'data patient kosong');
  }
  return existingPatient;
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

export const updatePatientService = async (id: number, input: updatePatientInput) => {
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
    data: input as Prisma.PatientUpdateInput,
  });

  return uptPatient;
};

export const deletePatientService = async (id: number) => {
  const getPatient = await prisma.patient.findUnique({
    where: {
      id: id,
    },
  });
  if (!getPatient) {
    throw new ApiError(404, 'patien yang ingin di hapus nya tidak di temukan');
  }

  const deletePatient = await prisma.patient.delete({
    where: {
      id: id,
    },
  });

  return deletePatient;
};
