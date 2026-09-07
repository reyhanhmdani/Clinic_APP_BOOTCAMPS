import { create } from 'zustand';
import { getVisitService, updateVisitService } from '../services/visitService';
import type { Visit } from '../types/clinic';

interface VisitState {
  visits: Visit[];
  loading: boolean;
  fetchVisits: () => Promise<void>;
  confirmPatientEntered: (visitId: number) => Promise<void>;
}

export const useVisitStore = create<VisitState>((set, get) => ({
  visits: [],
  loading: false,

  fetchVisits: async () => {
    set({ loading: true });
    try {
      const data = await getVisitService();
      set({ visits: data || [] });
    } catch (error) {
      console.error('Gagal memuat data antrean:', error);
    } finally {
      set({ loading: false });
    }
  },

  confirmPatientEntered: async (visitId: number) => {
    try {
      await updateVisitService(visitId, { status: 'IN_KONSULTASI' });
      await get().fetchVisits();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal mengonfirmasi pasien masuk';
      throw new Error(message, { cause: error });
    }
  },
}));
