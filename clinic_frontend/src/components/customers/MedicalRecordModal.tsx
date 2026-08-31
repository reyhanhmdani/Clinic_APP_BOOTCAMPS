import React from 'react';
import type { Patient } from '../../types/clinic';
import type { CustomerHistoryVisit } from '../../services/customerService';

interface MedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  visitData: CustomerHistoryVisit | null;
}

export const MedicalRecordModal: React.FC<MedicalRecordModalProps> = ({
  isOpen,
  onClose,
  patient,
  visitData,
}) => {
  if (!isOpen || !visitData) {
    return null;
  }

  return (
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
              {visitData.invoice?.invoiceNo || `INV-V${visitData.id}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Pasien:</span>
            <span className="font-bold text-slate-800">
              {patient?.name || (visitData as any).patient?.name} ({patient?.noRm || (visitData as any).patient?.noRm || 'RM-ONLINE'})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Dokter Jaga:</span>
            <span className="font-bold text-slate-800">{visitData.doctor?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Metode Bayar:</span>
            <span className="font-bold text-slate-800">
              {visitData.invoice?.paymentMethod || 'CASH'}
            </span>
          </div>

          {/* Rincian Resep Obat (Jika Ada) */}
          {visitData.consultation?.consultationMedicines &&
            visitData.consultation.consultationMedicines.length > 0 && (
              <div className="pt-2.5 border-t border-dashed border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Rincian Terapi Obat (R/):
                </span>
                <div className="space-y-1.5">
                  {visitData.consultation.consultationMedicines.map((m: any, idx: number) => (
                    <div
                      key={m.id || idx}
                      className="text-[11px] bg-white p-2 rounded-lg border border-slate-200/60 space-y-0.5"
                    >
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
            Rp {Number(visitData.invoice?.totalAmount || 0).toLocaleString('id-ID')}
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
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
