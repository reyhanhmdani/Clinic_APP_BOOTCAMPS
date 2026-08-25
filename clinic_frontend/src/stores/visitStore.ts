import { create } from "zustand";
import type { Visit } from "../types/clinic";
import { getVisitService, updateVisitService } from "../services/visitService";

interface VisitState {
  visits: Visit[];
  loading: boolean;
  error: string | null;
  fetchVisits: () => Promise<void>;
  callPatient: (visitId: number) => Promise<void>;
}

export const useVisitStore = create<VisitState>((set, get) => ({
  visits: [],
  loading: false,
  error: null,
  fetchVisits: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getVisitService();
      set({ visits: data || [], loading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Gagal mengambil data antrean";
      set({ error: message, loading: false });
    }
  },
  callPatient: async (visitId: number) => {
    try {
      await updateVisitService(visitId, { status: "IN_KONSULTASI" });
      await get().fetchVisits();
    } catch (error: any) {
      const message = error.response?.data?.message || "Gagal memanggil pasien";
      throw new Error(message);
    }
  },
}));
