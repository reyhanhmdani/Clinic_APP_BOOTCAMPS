import { create } from 'zustand';
import { getMedicineService } from '../services/medicineService';
import type { Medicine } from '../types/clinic';

interface MedicineState {
  medicines: Medicine[];
  loading: boolean;
  fetchMedicines: () => Promise<void>;
}

export const useMedicineStore = create<MedicineState>((set) => ({
  medicines: [],
  loading: false,

  fetchMedicines: async () => {
    set({ loading: true });
    try {
      const data = await getMedicineService();
      set({ medicines: data || [] });
    } catch (error) {
      console.error('Gagal memuat data obat:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
