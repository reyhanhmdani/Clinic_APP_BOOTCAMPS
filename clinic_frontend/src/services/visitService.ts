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

export const getVisitByIdService = async (visitId: number): Promise<Visit> => {
  const response = await api.get<{ data: Visit }>(`/visits/${visitId}`);
  return response.data.data;
};

export const updateVisitService = async (
  visitId: number,
  visitInput: { status?: string; doctorId?: number; patientId?: number },
): Promise<Visit> => {
  const response = await api.patch<{ data: Visit }>(`/visits/${visitId}`, visitInput);
  return response.data.data;
};

export const cancelVisitService = async (visitId: number): Promise<Visit> => {
  return updateVisitService(visitId, { status: 'CANCELLED' });
};
