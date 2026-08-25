import { create } from "zustand";
import type { Doctor } from "../types/clinic";
import { getDoctorsService } from "../services/doctorService";

interface DoctorState {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  fetchDoctors: () => Promise<void>;
}

export const useDoctorStore = create<DoctorState>((set) => ({
  doctors: [],
  loading: false,
  error: null,
  fetchDoctors: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getDoctorsService();
      set({ doctors: data || [], loading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Gagal mengambil data dokter";
      set({ error: message, loading: false });
    }
  },
}));
