import { create } from "zustand";
import type { Patient } from "../types/clinic";
import { getPatientService } from "../services/patientService";

interface PatientState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  fetchPatients: () => Promise<void>;
}

export const usePatientStore = create<PatientState>((set) => ({
  patients: [],
  loading: false,
  error: null,
  fetchPatients: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getPatientService();
      set({ patients: data || [], loading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Gagal mengambil data pasien";
      set({ error: message, loading: false });
    }
  },
}));
