import { api } from './api';
import type { Doctor } from '../types/clinic';

// get all doctors
export const getDoctorsService = async (): Promise<Doctor[]> => {
  const response = await api.get<{ data: Doctor[] }>('/doctors');
  return response.data.data;
};

// get doctor by id
export const getDoctorByIdService = async (id: number): Promise<Doctor> => {
  const response = await api.get<{ data: Doctor }>(`/doctors/${id}`);
  return response.data.data;
};

// create doctor
export const createDoctorService = async (input: Omit<Doctor, 'id' | 'createdAt'>): Promise<Doctor> => {
  const response = await api.post<{ data: Doctor }>('/doctors', input);
  return response.data.data;
};

// update doctor
export const updateDoctorService = async (
  id: number,
  input: Partial<Omit<Doctor, 'id' | 'createdAt'>>,
): Promise<Doctor> => {
  const response = await api.patch<{ data: Doctor }>(`/doctors/${id}`, input);
  return response.data.data;
};

// delete doctor (deactivate)
export const deleteDoctorService = async (id: number): Promise<Doctor> => {
  const response = await api.delete<{ data: Doctor }>(`/doctors/${id}`);
  return response.data.data;
};
