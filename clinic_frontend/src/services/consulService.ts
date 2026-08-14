import { api } from './api';
import type { Consultation } from '../types/clinic';

export interface CreateConsultationInput {
  visitId: number;
  complaint: string;
  diagnosis: string;
  notes?: string;
  medicine?: Array<{
    medicineId: number;
    qty: number;
    instructions?: string;
  }>;
}

export const createConsultationService = async (consulInput: CreateConsultationInput) => {
  const response = await api.post<{ data: Consultation }>(`/consultations`, consulInput);
  return response.data.data;
};
