import { api } from './api';
import type { Patient, Doctor, Visit, Invoice } from '../types/clinic';

export interface CheckNikResult {
  exists: boolean;
  isLinked: boolean;
  message: string;
  data: Patient | null;
}

export interface CustomerHistoryData {
  patient: Patient;
  totalVisits: number;
  visits: Array<
    Visit & {
      doctor: { id: number; name: string; spesialis: string; fee: number };
      consultation?: {
        id: number;
        complaint: string;
        diagnosis: string;
        notes?: string;
        consultationMedicines?: Array<{
          medicine: { id: number; name: string; price: number; unit: string };
        }>;
      };
      invoice?: Invoice;
    }
  >;
}

export interface ActiveCustomerVisitData {
  visit: Visit & {
    doctor: { id: number; name: string; spesialis: string; fee: number };
    consultation?: any;
    invoice?: Invoice;
  };
  queueAhead: number;
}

// cek status NIK (klaim loket lama / pasien baru)
export const checkNikCustomerService = async (nik: string): Promise<CheckNikResult> => {
  const response = await api.get<{ message: string; data: CheckNikResult }>(`/customers/check-nik/${nik}`);
  return response.data.data;
};

// registrasi profil pasien (onboarding / auto-link)
export const registerCustomerProfileService = async (data: Partial<Patient>): Promise<Patient> => {
  const response = await api.post<{ message: string; data: Patient }>('/customers/profile', data);
  return response.data.data;
};

// ambil profil diri sendiri (kartu pasien digital)
export const getCustomerProfileService = async (): Promise<Patient | null> => {
  const response = await api.get<{ message: string; data: Patient | null }>('/customers/profile');
  return response.data.data;
};

// booking antrian mandiri
export const bookCustomerVisitService = async (doctorId: number): Promise<Visit> => {
  const response = await api.post<{ message: string; data: Visit }>('/customers/book-visit', { doctorId });
  return response.data.data;
};

// ambil daftar dokter yang aktif
export const getActiveDoctorsCustomerService = async (): Promise<Doctor[]> => {
  const response = await api.get<{ message: string; data: Doctor[] }>('/customers/doctors');
  return response.data.data;
};

// live antrian aktif
export const getActiveCustomerVisitService = async (): Promise<ActiveCustomerVisitData | null> => {
  const response = await api.get<{ message: string; data: ActiveCustomerVisitData | null }>('/customers/active-visit');
  return response.data.data;
};

// riwayat rekam medis & resep pasien
export const getCustomerHistoryService = async (): Promise<CustomerHistoryData> => {
  const response = await api.get<{ message: string; data: CustomerHistoryData }>('/customers/history');
  return response.data.data;
};

// pembayaran mandiri
export const payCustomerInvoiceService = async (invoiceId: number, paymentMethod: 'QRIS'): Promise<Invoice> => {
  const response = await api.post<{ message: string; data: Invoice }>('/customers/pay-invoice', {
    invoiceId,
    paymentMethod,
  });
  return response.data.data;
};
