import React from 'react';
import { FileText } from 'lucide-react';
import { useCustomerContext } from '../../layouts/CustomerLayout';

export const CustomerHistoryPage: React.FC = () => {
  const { patient, history, payInvoice } = useCustomerContext();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header Riwayat */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Catatan Medis Digital
          </span>
          <span className="text-xs font-mono font-bold bg-[#edf3ec] text-[#346538] px-2.5 py-0.5 rounded-full border border-emerald-200/60">
            {patient?.noRm || 'RM-ONLINE'}
          </span>
        </div>
        <h2 className="text-base font-bold text-slate-900">Riwayat Kunjungan Pasien</h2>
        <p className="text-xs text-slate-500">
          Total {history?.totalVisits || history?.visits?.length || 0} kunjungan konsultasi tercatat.
        </p>
      </div>

      {/* List Riwayat Detail */}
      {history?.visits && history.visits.length > 0 ? (
        <div className="space-y-3">
          {history.visits.map((v, i) => {
            const visitDateFormatted = new Date(v.visitDate).toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            const isPaid = v.invoice?.status === 'PAID';
            const isUnpaid = v.invoice?.status === 'UNPAID';

            return (
              <div key={v.id || i} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">{visitDateFormatted}</span>
                    <h4 className="text-sm font-bold text-slate-900">{v.doctor?.name || 'Dokter Spesialis'}</h4>
                    <p className="text-[11px] text-slate-500">{v.doctor?.spesialis}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      isPaid
                        ? 'bg-[#edf3ec] text-[#346538] border-emerald-200/60'
                        : isUnpaid
                        ? 'bg-[#fbf3db] text-[#956400] border-[#f1dfaa]'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {isPaid ? '✓ Lunas' : isUnpaid ? '⏳ Belum Bayar' : 'Selesai'}
                  </span>
                </div>

                {/* Detail Diagnosa & Keluhan */}
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Diagnosa Dokter:
                    </span>
                    <p className="font-semibold text-slate-800">
                      {v.consultation?.diagnosis || 'Pemeriksaan Poli Umum & Tindakan Medis'}
                    </p>
                  </div>
                  {v.consultation?.complaint && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Keluhan:</span>
                      <p className="text-slate-600">{v.consultation.complaint}</p>
                    </div>
                  )}
                </div>

                {/* Resep Obat */}
                {v.consultation?.consultationMedicines && v.consultation.consultationMedicines.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Resep Obat Diberikan:
                    </span>
                    <div className="space-y-1">
                      {v.consultation.consultationMedicines.map((m, mIdx) => (
                        <div
                          key={mIdx}
                          className="flex items-center justify-between text-xs py-1 px-2.5 bg-slate-50 rounded-lg"
                        >
                          <span className="font-medium text-slate-800">
                            {m.medicine?.name || 'Obat'} ({m.qty}x)
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">{m.instructions || '-'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invoice & Tombol Bayar */}
                {v.invoice && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        No. Invoice: {v.invoice.invoiceNo || (v.invoice as any).invoiceNumber}
                      </span>
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        Rp {v.invoice.totalAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                    {isUnpaid && (
                      <button
                        type="button"
                        onClick={() => payInvoice(v.invoice!.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#061e15] hover:bg-[#0a2f21] text-[#b4f105] text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        Bayar QRIS
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center space-y-2">
          <FileText size={32} className="text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">Belum Ada Riwayat Kunjungan</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Semua catatan konsultasi, diagnosa dokter, dan resep obat Anda akan tersimpan rapi di sini.
          </p>
        </div>
      )}
    </div>
  );
};
