import { api } from "./api";
import type { Patient, Visit } from "../types/clinic";

export interface PatientHistoryResponse {
  patient: Patient;
  totalVisits: number;
  visits: Visit[];
}

export const getPatientService = async (): Promise<Patient[]> => {
  const response = await api.get<{ data: Patient[] }>("/patients");
  return response.data.data;
};

export const createPatientService = async (
  patientInput: Omit<Patient, "id" | "noRm">
): Promise<Patient> => {
  const response = await api.post<{ data: Patient }>("/patients", patientInput);
  return response.data.data;
};

export const getByIdPatientService = async (patientId: number): Promise<Patient> => {
  const response = await api.get<{ data: Patient }>(`/patients/${patientId}`);
  return response.data.data;
};

export const getPatientHistoryService = async (
  patientId: number
): Promise<PatientHistoryResponse> => {
  const response = await api.get<{ data: PatientHistoryResponse }>(
    `/patients/${patientId}/history`
  );
  return response.data.data;
};

export const updatePatientService = async (
  patientId: number,
  patientInput: Partial<Omit<Patient, "id" | "noRm">>
): Promise<Patient> => {
  const response = await api.patch<{ data: Patient }>(`/patients/${patientId}`, patientInput);
  return response.data.data;
};

export const deletePatientService = async (patientId: number): Promise<Patient> => {
  const response = await api.delete<{ data: Patient }>(`/patients/${patientId}`);
  return response.data.data;
};
