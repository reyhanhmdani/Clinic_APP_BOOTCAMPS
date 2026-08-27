import { create } from 'zustand';
import { getDoctorsService } from '../services/doctorService';
import type { Doctor } from '../types/clinic';

interface DoctorState {
  doctors: Doctor[];
  loading: boolean;
  fetchDoctors: () => Promise<void>;
}

export const useDoctorStore = create<DoctorState>((set) => ({
  doctors: [],
  loading: false,

  fetchDoctors: async () => {
    set({ loading: true });
    try {
      const data = await getDoctorsService();
      set({ doctors: data || [] });
    } catch (error) {
      console.error('Gagal memuat data dokter:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
