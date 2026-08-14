import { api } from './api';
import type { Medicine } from '../types/clinic';

export const getMedicineService = async (): Promise<Medicine[]> => {
  const response = await api.get<{ data: Medicine[] }>('/medicines');
  return response.data.data;
};

export const createMedicineService = async (medicineInput: Omit<Medicine, 'id' | 'code'>): Promise<Medicine> => {
  const response = await api.post<{ data: Medicine }>('/medicines', medicineInput);
  return response.data.data;
};
