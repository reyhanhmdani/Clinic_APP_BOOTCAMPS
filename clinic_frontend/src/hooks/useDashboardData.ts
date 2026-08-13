import { useState, useEffect, useMemo } from 'react';
import type { DashboardStats, Doctor } from '../types/clinic';
import type { Patient } from '../types/clinic';
import type { Visit } from '../types/clinic';
import type { Invoice } from '../types/clinic';
import { getDoctorsService } from '../services/doctorService';
import { getPatientService } from '../services/patientService';
import { getVisitService } from '../services/visitService';
import { getInvoiceService } from '../services/invoiceService';

export const useDashboardData = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // fetch api doctorny
  useEffect(() => {
    const fetchApiDoctor = async () => {
      try {
        setIsLoading(true);
        setApiError(null);

        // fetch API secara paralel sekaligus
        const [doctorsRes, patientsRes, visitsRest, invoicesRes] = await Promise.all([
          getDoctorsService(),
          getPatientService(),
          getVisitService(),
          getInvoiceService(),
        ]);

        setDoctors(doctorsRes);
        setPatients(patientsRes);
        setVisits(visitsRest);
        setInvoices(invoicesRes);
      } catch (error) {
        console.log(`Error di fetch Doctor`, error);
        setApiError('Gagal memuat data dokter');
      } finally {
        setIsLoading(false); // matikan loading setelah selesai
      }
    };
    fetchApiDoctor();
  }, []);

  const stats: DashboardStats = useMemo(() => {
    // Hitung Rata-rata Waktu Tunggu Real (dalam Menit) dari pendaftaran (createdAt) ke pemeriksaan (updatedAt)
    const processedVisits = visits.filter((v) => v.createdAt && v.updatedAt && v.status !== 'WAITING');
    let avgWaitTime = 12; // default fallback 12m jika belum ada sampel durasi
    if (processedVisits.length > 0) {
      const totalWaitMs = processedVisits.reduce((acc, v) => {
        const start = new Date(v.createdAt!).getTime();
        const end = new Date(v.updatedAt!).getTime();
        return acc + Math.max(0, end - start);
      }, 0);
      avgWaitTime = Math.max(1, Math.round(totalWaitMs / (processedVisits.length * 60000)));
    }

    return {
      totalCheckedIn: visits.length,
      currentlyWaiting: visits.filter((v) => v.status === 'WAITING' && v.invoice?.status !== 'UNPAID').length,
      awaitingPayment: visits.filter((v) => v.invoice?.status === 'UNPAID' || (v.status === 'COMPLETED' && v.invoice?.status !== 'PAID')).length,
      completedVisits: visits.filter((v) => v.status === 'COMPLETED' && v.invoice?.status === 'PAID').length,
      // total pemasukan kalau udah bayar yaa ...
      todayEstimatedRevenue: invoices
        .filter((inv) => inv.status === 'PAID')
        .reduce((sumb, inv) => sumb + Number(inv.totalAmount), 0),
      avgWaitTimeMinutes: avgWaitTime,
      checkedInGrowth: 12,
      awaitingPaymentGrowth: -5,
    };
  }, [visits, invoices]);
  return { doctors, patients, visits, invoices, stats, isLoading, apiError };
};
