import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Visit } from '../../types/clinic';
import { useVisitStore } from '../../stores/visitStore';
import { useInvoiceStore } from '../../stores/invoiceStore';
import { useDoctorStore } from '../../stores/doctorStore';
import { usePatientStore } from '../../stores/patientStore';
import { cancelVisitService } from '../../services/visitService';
import { toast } from 'sonner';
import { confirmDialog } from '../../stores/confirmStore';

// Components
import { StatsGrid } from '../../components/dashboard/StatsGrid';
import { WorkflowGuide } from '../../components/common/WorkflowGuide';
import { HomeDashboard } from '../../components/dashboard/HomeDashboard';

// socket
import { socket } from '../../services/socket';

export const DashboardPage: React.FC = () => {
  const [selectedReceiptVisit, setSelectedReceiptVisit] = useState<Visit | null>(null);

  const navigate = useNavigate();

  const { visits, fetchVisits, callPatient } = useVisitStore();
  const { invoices, fetchInvoices } = useInvoiceStore();
  const { fetchDoctors } = useDoctorStore();
  const { fetchPatients } = usePatientStore();

  useEffect(() => {
    fetchVisits();
    fetchInvoices();
    fetchDoctors();
    fetchPatients();

    // Tangkap sinyal real-time:
    socket.on('QUEUE_UPDATED', () => {
      fetchVisits();
      fetchInvoices();
    });
    return () => {
      socket.off('QUEUE_UPDATED');
    };
  }, []);

  // Operational Stats Computation
  const stats = {
    totalCheckedIn: visits.length,
    currentlyWaiting: visits.filter((v) => v.status === 'WAITING' && v.invoice?.status !== 'UNPAID').length,
    awaitingPayment: visits.filter(
      (v) => v.invoice?.status === 'UNPAID' || (v.status === 'COMPLETED' && v.invoice?.status !== 'PAID'),
    ).length,
    todayEstimatedRevenue: invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((sum, inv) => sum + Number(inv.totalAmount), 0),
    completedVisits: visits.filter((v) => v.status === 'COMPLETED' && v.invoice?.status === 'PAID').length,
  };

  const handleActionClick = async (visit: Visit, actionType: string) => {
    if (actionType === 'CALL_PATIENT') {
      try {
        await callPatient(visit.id);
        toast.info(`Memanggil pasien ${visit.patient?.name || ''}...`);
      } catch (err: any) {
        toast.error(err.message || 'Gagal memanggil pasien');
      }
    } else if (actionType === 'CONSULTATION') {
      navigate(`/dashboard/consultations?visitId=${visit.id}`);
    } else if (actionType === 'PROCESS_PAYMENT') {
      navigate(`/dashboard/invoices?visitId=${visit.id}`);
    } else if (actionType === 'PRINT_RECEIPT') {
      setSelectedReceiptVisit(visit);
    } else if (actionType === 'CANCEL_VISIT') {
      const isConfirmed = await confirmDialog({
        title: 'Batalkan Kunjungan Pasien',
        description: `Apakah Anda yakin ingin membatalkan antrean pasien ${visit.patient?.name || ''}?`,
        confirmText: 'Ya, Batalkan Antrean',
        cancelText: 'Kembali',
        variant: 'danger',
      });
      if (!isConfirmed) return;

      try {
        await cancelVisitService(visit.id);
        await fetchVisits();
        toast.success('Antrean berhasil dibatalkan');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error.message || 'Gagal membatalkan antrean');
      }
    }
  };

  return (
    <div className="space-y-4 w-full pb-10">
      {/* 1. Slim Minimalist Workflow Reference */}
      <WorkflowGuide />

      {/* 2. Unified Compact Stats & Revenue Grid (4 Clean Cards) */}
      <StatsGrid stats={stats} />

      {/* 3. Main Queue List */}
      <div className="w-full">
        <HomeDashboard visits={visits} onActionClick={handleActionClick} />
      </div>

      {/* Modal Struk Nota Pembayaran */}
      {selectedReceiptVisit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 shadow-2xl p-6 space-y-4 rounded-2xl">
            {/* Header Struk */}
            <div className="text-center pb-3 border-b border-dashed border-slate-200">
              <div className="inline-block bg-lime-100 text-lime-900 px-2.5 py-0.5 border border-lime-200 font-bold text-[10px] uppercase rounded-full">
                STRUK RESMI PEMBAYARAN
              </div>
              <h2 className="text-lg font-bold uppercase mt-1.5 text-slate-900">REYCLINIC MEDICAL CENTER</h2>
              <p className="text-[11px] font-medium text-slate-500">
                Jl. Kesehatan No. 45, Jakarta • Telp: (021) 555-0123
              </p>
            </div>

            {/* Info Kunjungan & Pasien */}
            <div className="bg-slate-50 p-4 border border-slate-200/80 rounded-xl text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Invoice:</span>
                <span className="font-bold text-slate-800">
                  {selectedReceiptVisit.invoice?.invoiceNo || `INV-V${selectedReceiptVisit.id}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pasien:</span>
                <span className="font-bold text-slate-800">
                  {selectedReceiptVisit.patient?.name} ({selectedReceiptVisit.patient?.noRm})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dokter Jaga:</span>
                <span className="font-bold text-slate-800">{selectedReceiptVisit.doctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Bayar:</span>
                <span className="font-bold text-slate-800">
                  {selectedReceiptVisit.invoice?.paymentMethod || 'CASH'}
                </span>
              </div>

              {/* Rincian Resep Obat (Jika Ada) */}
              {selectedReceiptVisit.consultation?.consultationMedicines &&
                selectedReceiptVisit.consultation.consultationMedicines.length > 0 && (
                  <div className="pt-2.5 border-t border-dashed border-slate-200 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Rincian Terapi Obat (R/):
                    </span>
                    <div className="space-y-1.5">
                      {selectedReceiptVisit.consultation.consultationMedicines.map((m: any, idx: number) => (
                        <div key={m.id || idx} className="text-[11px] bg-white p-2 rounded-lg border border-slate-200/60 space-y-0.5">
                          <div className="flex justify-between items-center text-slate-800">
                            <span className="font-bold">
                              • {m.medicine?.name} ({m.qty} {m.medicine?.unit || 'pcs'})
                            </span>
                            <span className="font-semibold text-slate-900">
                              Rp {Number(m.subTotal || (m.price * m.qty) || 0).toLocaleString('id-ID')}
                            </span>
                          </div>
                          {m.instructions && (
                            <div className="text-[10px] text-emerald-800 font-medium pl-2.5 flex items-center gap-1">
                              <span className="text-slate-400 font-normal">↳ Intruksi:</span>
                              <span>{m.instructions}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Total Pembayaran */}
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex justify-between items-center">
              <span className="font-bold text-xs text-emerald-900 uppercase">TOTAL TERBAYAR (PAID):</span>
              <span className="font-black text-base text-emerald-700">
                Rp {Number(selectedReceiptVisit.invoice?.totalAmount || 0).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Catatan Farmasi */}
            <p className="text-[10px] text-slate-400 font-mono text-center italic -mt-1">
              * Tunjukkan struk resmi ini ke Loket Farmasi untuk penyerahan obat.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-forest flex-1 py-2.5 font-bold text-xs uppercase cursor-pointer"
              >
                Cetak Struk
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceiptVisit(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
