import { create } from "zustand";
import type { Invoice } from "../types/clinic";
import { getInvoiceService } from "../services/invoiceService";

interface InvoiceState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  fetchInvoices: () => Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  loading: false,
  error: null,
  fetchInvoices: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getInvoiceService();
      set({ invoices: data || [], loading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Gagal mengambil data tagihan kasir";
      set({ error: message, loading: false });
    }
  },
}));
