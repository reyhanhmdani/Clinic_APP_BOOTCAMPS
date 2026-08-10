import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';

export const getAllConsultationService = async () => {
  const consultations = await prisma.consultation.findMany();

  if (!consultations) {
    throw new ApiError(404, 'Consultation nya kosong');
  }

  return consultations;
};
