import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { useCustomerContext } from '../../layouts/CustomerLayout';
import { MedicalRecordModal } from '../../components/customers/MedicalRecordModal';

export const CustomerHistoryPage: React.FC = () => {
  const { patient, history, payInvoice } = useCustomerContext();
  const [selectedVisitForPrint, setSelectedVisitForPrint] = useState<any>(null);

  return (
    <>
      <div className="space-y-4 animate-fade-in print:hidden">
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
            {history.visits.map((v: any) => {
              const isPaid = v.invoice?.status === 'PAID';
              const isUnpaid = v.invoice?.status === 'UNPAID';
              const visitDateFormatted = new Date(v.visitDate).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });

              return (
                <div
                  key={v.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3.5 hover:border-slate-300 transition-colors"
                >
                  {/* Header Kartu: Dokter & Status */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">{visitDateFormatted}</span>
                      <h3 className="text-sm font-bold text-slate-900">{v.doctor?.name || 'Dokter Spesialis'}</h3>
                      <p className="text-xs font-medium text-emerald-800">{v.doctor?.spesialis}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isPaid
                            ? 'bg-[#edf3ec] text-[#346538] border-emerald-200/60'
                            : isUnpaid
                              ? 'bg-[#fbf3db] text-[#956400] border-[#f1dfaa]'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isPaid ? '✓ Lunas' : isUnpaid ? '⏳ Belum Bayar' : 'Selesai'}
                      </span>

                      <button
                        type="button"
                        onClick={() => setSelectedVisitForPrint(v)}
                        className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <FileText size={13} />
                        <span>Unduh Rekam Medis</span>
                      </button>
                    </div>
                  </div>

                  {/* Detail Diagnosa & Keluhan */}
                  <div className="bg-slate-50/70 rounded-xl p-3 space-y-2 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Diagnosa Dokter:
                      </span>
                      <p className="font-bold text-slate-900">
                        {v.consultation?.diagnosis || 'Pemeriksaan rutin / konsultasi umum'}
                      </p>
                    </div>
                    {v.consultation?.complaint && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Keluhan:
                        </span>
                        <p className="text-slate-600">{v.consultation.complaint}</p>
                      </div>
                    )}
                  </div>

                  {/* Rincian Resep Obat */}
                  {v.consultation?.consultationMedicines && v.consultation.consultationMedicines.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Rincian Terapi Obat (R/):
                      </span>
                      <div className="space-y-1.5">
                        {v.consultation.consultationMedicines.map((m: any, idx: number) => (
                          <div
                            key={m.id || idx}
                            className="text-xs bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60 space-y-0.5"
                          >
                            <div className="flex justify-between items-center text-slate-800">
                              <span className="font-bold">
                                • {m.medicine?.name} ({m.qty} {m.medicine?.unit || 'pcs'})
                              </span>
                              <span className="font-semibold text-slate-900 font-mono">
                                Rp {Number(m.subTotal || (m.price * m.qty) || 0).toLocaleString('id-ID')}
                              </span>
                            </div>
                            {m.instructions && (
                              <div className="text-[10.5px] text-emerald-800 font-medium pl-2.5 flex items-center gap-1">
                                <span className="text-slate-400 font-normal">↳ Instruksi:</span>
                                <span>{m.instructions}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tagihan & Tombol Bayar jika Unpaid */}
                  {v.invoice && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          No. Invoice: {v.invoice.invoiceNo}
                        </span>
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          Rp {Number(v.invoice.totalAmount).toLocaleString('id-ID')}
                        </span>
                      </div>

                      {isUnpaid && payInvoice && (
                        <button
                          type="button"
                          onClick={() => payInvoice(v.invoice!.id)}
                          className="bg-[#b4f105] text-[#061e15] hover:bg-[#a1da03] text-xs font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          Bayar Tagihan (QRIS)
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

      <MedicalRecordModal
        isOpen={!!selectedVisitForPrint}
        onClose={() => setSelectedVisitForPrint(null)}
        patient={patient}
        visitData={selectedVisitForPrint}
      />
    </>
  );
};
