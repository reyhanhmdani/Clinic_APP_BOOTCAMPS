import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Visit } from "../types/clinic";
import { useVisitStore } from "../stores/visitStore";
import { useInvoiceStore } from "../stores/invoiceStore";
import { useDoctorStore } from "../stores/doctorStore";
import { usePatientStore } from "../stores/patientStore";

// Components
import { StatsGrid } from "../components/dashboard/StatsGrid";
import { WorkflowGuide } from "../components/common/WorkflowGuide";
import { HomeDashboard } from "../components/dashboard/HomeDashboard";

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
  }, []);

  // Operational Stats Computation
  const stats = {
    totalCheckedIn: visits.length,
    currentlyWaiting: visits.filter((v) => v.status === "WAITING" && v.invoice?.status !== "UNPAID").length,
    awaitingPayment: visits.filter(
      (v) => v.invoice?.status === "UNPAID" || (v.status === "COMPLETED" && v.invoice?.status !== "PAID")
    ).length,
    todayEstimatedRevenue: invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((sum, inv) => sum + Number(inv.totalAmount), 0),
    completedVisits: visits.filter((v) => v.status === "COMPLETED" && v.invoice?.status === "PAID").length,
  };

  const handleActionClick = async (visit: Visit, actionType: string) => {
    if (actionType === "CALL_PATIENT") {
      try {
        await callPatient(visit.id);
      } catch (err: any) {
        alert(err.message || "Gagal memanggil pasien");
      }
    } else if (actionType === "CONSULTATION") {
      navigate(`/dashboard/consultations?visitId=${visit.id}`);
    } else if (actionType === "PROCESS_PAYMENT") {
      navigate(`/dashboard/invoices?visitId=${visit.id}`);
    } else if (actionType === "PRINT_RECEIPT") {
      setSelectedReceiptVisit(visit);
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
        <HomeDashboard
          visits={visits}
          onActionClick={handleActionClick}
        />
      </div>

      {/* Modal Struk Nota Pembayaran (Popup Neubrutalism) */}
      {selectedReceiptVisit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-[#18181b] shadow-[8px_8px_0px_#18181b] p-6 space-y-4 rounded-2xl">
            {/* Header Struk */}
            <div className="text-center pb-3 border-b-2 border-dashed border-[#18181b]">
              <div className="inline-block bg-[#fde047] text-[#18181b] px-2.5 py-0.5 border border-[#18181b] font-black text-[10px] uppercase rounded">
                STRUK RESMI RAWAT JALAN
              </div>
              <h2 className="text-xl font-black uppercase mt-1">REYCLINIC MEDICAL CENTER</h2>
              <p className="text-[11px] font-bold text-[#71717a]">
                Jl. Kesehatan No. 45, Jakarta • Telp: (021) 555-0123
              </p>
            </div>

            {/* Info Kunjungan & Pasien */}
            <div className="bg-[#f8fafc] p-3.5 border-2 border-[#18181b] rounded-xl text-xs space-y-1.5 font-mono">
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
                <span className="font-black text-[#18181b]">
                  {selectedReceiptVisit.doctor?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Metode Bayar:</span>
                <span className="font-black text-[#18181b]">
                  {selectedReceiptVisit.invoice?.paymentMethod || "CASH"}
                </span>
              </div>
            </div>

            {/* Total Pembayaran */}
            <div className="bg-[#d9f99d] p-3 border-2 border-[#18181b] rounded-xl flex justify-between items-center">
              <span className="font-black text-xs uppercase">TOTAL TERBAYAR (PAID):</span>
              <span className="font-black text-base text-[#18181b]">
                Rp{" "}
                {Number(selectedReceiptVisit.invoice?.totalAmount || 0).toLocaleString("id-ID")}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-[#a3e635] text-[#18181b] border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] font-black text-xs uppercase rounded-xl hover:bg-lime-400 cursor-pointer"
              >
                Cetak Struk
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceiptVisit(null)}
                className="flex-1 py-2.5 bg-[#18181b] text-white border-2 border-[#18181b] font-black text-xs uppercase rounded-xl hover:bg-zinc-800 cursor-pointer"
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
