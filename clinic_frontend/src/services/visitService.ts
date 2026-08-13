import { api } from './api';
import type { Visit } from '../types/clinic';

export const getVisitService = async (): Promise<Visit[]> => {
  const response = await api.get<{ data: Visit[] }>('/visits');
  return response.data.data;
};

export const createVisitService = async (visitInput: { patientId: number; doctorId: number }): Promise<Visit> => {
  const response = await api.post<{ data: Visit }>('/visits', visitInput);
  return response.data.data;
};
