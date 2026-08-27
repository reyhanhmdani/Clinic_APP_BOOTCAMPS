import { create } from 'zustand';
import { getInvoiceService } from '../services/invoiceService';
import type { Invoice } from '../types/clinic';

interface InvoiceState {
  invoices: Invoice[];
  loading: boolean;
  fetchInvoices: () => Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  loading: false,

  fetchInvoices: async () => {
    set({ loading: true });
    try {
      const data = await getInvoiceService();
      set({ invoices: data || [] });
    } catch (error) {
      console.error('Gagal memuat data tagihan kasir:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
