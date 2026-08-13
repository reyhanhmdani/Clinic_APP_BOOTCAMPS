import { api } from './api';
import type { Doctor } from '../types/clinic';

export const getDoctorsService = async (): Promise<Doctor[]> => {
  const response = await api.get<{ data: Doctor[] }>('/doctors');
  return response.data.data;
};
