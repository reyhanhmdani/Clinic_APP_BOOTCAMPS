import { create } from 'zustand';
import { getPatientService } from '../services/patientService';
import type { Patient } from '../types/clinic';

interface PatientState {
  patients: Patient[];
  loading: boolean;
  fetchPatients: () => Promise<void>;
}

export const usePatientStore = create<PatientState>((set) => ({
  patients: [],
  loading: false,

  fetchPatients: async () => {
    set({ loading: true });
    try {
      const data = await getPatientService();
      set({ patients: data || [] });
    } catch (error) {
      console.error('Gagal memuat data pasien:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
