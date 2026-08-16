import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router';
import type { Visit } from '../types/clinic';
import type { DashboardContextType } from '../types/clinic';

import { updateVisitService } from '../services/visitService';

// sub import
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { WorkflowGuide } from '../components/common/WorkflowGuide';
import { DoctorAvailability } from '../components/dashboard/DoctorAvailability';
import { HomeDashboard } from '../components/dashboard/HomeDashboard';

export const DashboardPage: React.FC = () => {
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<string>('ALL');
  const [selectedReceiptVisit, setSelectedReceiptVisit] = useState<Visit | null>(null);

  const { doctors, visits, stats, isLoading, refreshData } = useOutletContext<DashboardContextType>();

  const navigate = useNavigate();
  const handleActionClick = async (visit: Visit, actionType: string) => {
    if (actionType === 'CALL_PATIENT') {
      try {
        await updateVisitService(visit.id, { status: 'IN_KONSULTASI' });
        await refreshData();
      } catch (err: any) {
        alert(`Gagal memanggil pasien: ${err?.response?.data?.message || err.message}`);
      }
    } else if (actionType === 'CONSULTATION') {
      navigate(`/dashboard/consultations?visitId=${visit.id}`);
    } else if (actionType === 'PROCESS_PAYMENT') {
      navigate(`/dashboard/invoices?visitId=${visit.id}`);
    } else if (actionType === 'PRINT_RECEIPT') {
      setSelectedReceiptVisit(visit);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Workflow Guide Banner */}
      <WorkflowGuide activeTab={activeWorkflowTab} onTabChange={(tab) => setActiveWorkflowTab(tab)} />

      {/* Operational Stats Grid */}
      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start w-full">
        <div className="col-span-1 md:col-span-8">
          <HomeDashboard
            visits={visits}
            activeFilter={activeWorkflowTab}
            onFilterChange={(tab) => setActiveWorkflowTab(tab)}
            onActionClick={handleActionClick}
          />
        </div>
        <div className="col-span-1 md:col-span-4">
          {isLoading ? (
            <div className="neubrutal-card p-6 text-center text-xs font-bold text-[#18181b] animate-pulse flex flex-col items-center justify-center gap-3 min-h-[220px]">
              <span className="material-symbols-outlined text-[32px] text-[#18181b] animate-spin">sync</span>
              <p className="font-extrabold text-sm">Memuat Data Dokter...</p>
              <p className="text-[11px] font-semibold text-[#52525b]">Menghubungkan ke API Backend ReyClinic</p>
            </div>
          ) : (
            <DoctorAvailability doctors={doctors} />
          )}
        </div>
      </div>

      {/* Modal Struk Nota Pembayaran (Popup Neubrutalism) */}
      {selectedReceiptVisit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-[#18181b] shadow-[8px_8px_0px_#18181b] p-6 space-y-4">
            {/* Header Struk */}
            <div className="text-center pb-3 border-b-2 border-dashed border-[#18181b]">
              <div className="inline-block bg-[#fde047] text-[#18181b] px-2.5 py-0.5 border border-[#18181b] font-black text-[10px] uppercase">
                STRUK RESMI RAWAT JALAN
              </div>
              <h2 className="text-xl font-black uppercase mt-1">REYCLINIC MEDICAL CENTER</h2>
              <p className="text-[11px] font-bold text-[#71717a]">Jl. Kesehatan No. 45, Jakarta • Telp: (021) 555-0123</p>
            </div>

            {/* Info Kunjungan & Pasien */}
            <div className="bg-[#f8fafc] p-3.5 border-2 border-[#18181b] text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-[#71717a]">No. Invoice:</span>
                <span className="font-black text-[#18181b]">
                  {selectedReceiptVisit.invoice?.invoiceNo || `INV-V${selectedReceiptVisit.id}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Pasien:</span>
                <span className="font-black text-[#18181b]">
                  {selectedReceiptVisit.patient?.name} ({selectedReceiptVisit.patient?.noRm})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Dokter Jaga:</span>
                <span className="font-black text-[#18181b]">{selectedReceiptVisit.doctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Metode Bayar:</span>
                <span className="font-black text-[#18181b]">
                  {selectedReceiptVisit.invoice?.paymentMethod || 'CASH'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Status:</span>
                <span className="font-black text-emerald-700 bg-emerald-100 px-1.5 border border-emerald-600">
                  LUNAS
                </span>
              </div>
            </div>

            {/* Rincian Biaya */}
            <div className="p-3 bg-[#fef08a] border-2 border-[#18181b] flex justify-between items-baseline">
              <span className="text-xs font-black uppercase">TOTAL TAGIHAN:</span>
              <span className="text-lg font-black text-emerald-900">
                Rp {Number(selectedReceiptVisit.invoice?.totalAmount || selectedReceiptVisit.doctor?.fee || 50000).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Tombol Cetak & Tutup */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedReceiptVisit(null)}
                className="px-4 py-2.5 bg-white text-[#18181b] border-2 border-[#18181b] text-xs font-black shadow-[2px_2px_0px_#18181b] cursor-pointer"
              >
                TUTUP
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-[#38bdf8] text-[#18181b] border-2 border-[#18181b] text-xs font-black shadow-[2px_2px_0px_#18181b] hover:bg-[#7dd3fc] flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>CETAK STRUK SEKARANG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
