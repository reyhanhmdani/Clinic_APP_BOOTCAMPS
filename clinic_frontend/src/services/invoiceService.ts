import { api } from './api';
import type { Invoice } from '../types/clinic';

export const getInvoiceService = async (): Promise<Invoice[]> => {
  const response = await api.get<{ data: Invoice[] }>('/invoices');
  return response.data.data;
};
