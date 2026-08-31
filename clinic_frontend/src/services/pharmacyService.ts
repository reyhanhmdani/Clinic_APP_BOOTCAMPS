import { api } from './api';
import type { Consultation, PharmacyQueueData } from '../types/clinic';

export const getPharmacyQueueService = async (): Promise<PharmacyQueueData> => {
  const response = await api.get<{ data: PharmacyQueueData }>('/pharmacy/queue');
  return response.data.data;
};

export const dispenseMedicineService = async (consultationId: number): Promise<Consultation> => {
  const response = await api.patch<{ data: Consultation }>(`/pharmacy/${consultationId}/dispense`);
  return response.data.data;
};
