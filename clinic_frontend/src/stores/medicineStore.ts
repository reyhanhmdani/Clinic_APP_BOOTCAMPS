import { create } from "zustand";
import type { Medicine } from "../types/clinic";
import { getMedicineService } from "../services/medicineService";

interface MedicineState {
  medicines: Medicine[];
  loading: boolean;
  error: string | null;
  fetchMedicines: () => Promise<void>;
}

export const useMedicineStore = create<MedicineState>((set) => ({
  medicines: [],
  loading: false,
  error: null,
  fetchMedicines: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getMedicineService();
      set({ medicines: data || [], loading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Gagal mengambil data obat";
      set({ error: message, loading: false });
    }
  },
}));
