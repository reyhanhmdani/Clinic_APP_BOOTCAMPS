import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { useCustomerContext } from '../../layouts/CustomerLayout';
import { MedicalRecordModal } from '../../components/customers/MedicalRecordModal';

export const CustomerHistoryPage: React.FC = () => {
  const { patient, history, payInvoice } = useCustomerContext();
  const [selectedVisitForPrint, setSelectedVisitForPrint] = useState<any>(null);

  return (
    <>
      <div className="space-y-4 animate-fade-in print:hidden text-[#12241E]">
        {/* Header Riwayat (Frosted Glass) */}
        <div className="bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-5 shadow-[0_4px_20px_rgba(5,150,105,0.04)] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#5A6E65]">
              REKAM MEDIS ELEKTRONIK
            </span>
            <span className="text-xs font-mono font-extrabold bg-emerald-50 text-[#059669] px-3 py-0.5 rounded-full border border-emerald-200">
              {patient?.noRm || 'RM-ONLINE'}
            </span>
          </div>
          <h2 className="text-base font-extrabold text-[#12241E]">Riwayat Kunjungan Pasien</h2>
          <p className="text-xs text-[#5A6E65] font-medium">
            Total {history?.totalVisits || history?.visits?.length || 0} catatan konsultasi dan resep obat tersimpan aman.
          </p>
        </div>

        {/* List Riwayat Detail */}
        {history?.visits && history.visits.length > 0 ? (
          <div className="space-y-3.5">
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
                  className="bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-5 shadow-[0_6px_25px_rgba(5,150,105,0.04)] space-y-4 hover:border-emerald-300/80 transition-all"
                >
                  {/* Header Kartu: Dokter & Status */}
                  <div className="flex items-start justify-between gap-2 border-b border-emerald-950/6 pb-3">
                    <div>
                      <span className="text-[10px] text-[#5A6E65] font-medium block">{visitDateFormatted}</span>
                      <h3 className="text-sm font-extrabold text-[#12241E] leading-tight mt-0.5">
                        {v.doctor?.name || 'Dokter Spesialis'}
                      </h3>
                      <p className="text-xs font-bold text-[#059669] mt-0.5">{v.doctor?.spesialis}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          isPaid
                            ? 'bg-emerald-50 text-[#059669] border-emerald-200'
                            : isUnpaid
                            ? 'bg-rose-50 text-[#FF4D6D] border-rose-200'
                            : 'bg-[#F6F8F6] text-[#5A6E65] border-emerald-950/10'
                        }`}
                      >
                        {isPaid ? '✓ Lunas' : isUnpaid ? '⏳ Belum Bayar' : 'Selesai'}
                      </span>

                      <button
                        type="button"
                        onClick={() => setSelectedVisitForPrint(v)}
                        className="text-xs font-extrabold text-[#059669] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                      >
                        <FileText size={13} />
                        <span>Unduh Rekam Medis</span>
                      </button>
                    </div>
                  </div>

                  {/* Detail Diagnosa & Keluhan */}
                  <div className="bg-[#F6F8F6]/80 rounded-2xl p-3.5 space-y-2 border border-emerald-950/6 text-xs">
                    <div>
                      <span className="text-[9px] font-extrabold text-[#5A6E65] uppercase tracking-wider block">
                        Diagnosa Dokter:
                      </span>
                      <p className="font-extrabold text-[#12241E] mt-0.5">
                        {v.consultation?.diagnosis || 'Pemeriksaan rutin / konsultasi umum'}
                      </p>
                    </div>
                    {v.consultation?.complaint && (
                      <div>
                        <span className="text-[9px] font-extrabold text-[#5A6E65] uppercase tracking-wider block">
                          Keluhan Utama:
                        </span>
                        <p className="text-[#5A6E65] font-medium mt-0.5">{v.consultation.complaint}</p>
                      </div>
                    )}
                  </div>

                  {/* Rincian Resep Obat */}
                  {v.consultation?.consultationMedicines && v.consultation.consultationMedicines.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-extrabold text-[#5A6E65] uppercase tracking-wider block">
                        Rincian Terapi Obat (R/):
                      </span>
                      <div className="space-y-1.5">
                        {v.consultation.consultationMedicines.map((m: any, idx: number) => (
                          <div
                            key={m.id || idx}
                            className="text-xs bg-white p-2.5 rounded-xl border border-emerald-950/6 space-y-0.5 font-medium"
                          >
                            <div className="flex justify-between items-center text-[#12241E]">
                              <span className="font-bold">
                                • {m.medicine?.name} ({m.qty} {m.medicine?.unit || 'pcs'})
                              </span>
                              <span className="font-bold font-mono text-[#059669]">
                                Rp {Number(m.subTotal || (m.price * m.qty) || 0).toLocaleString('id-ID')}
                              </span>
                            </div>
                            {m.instructions && (
                              <div className="text-[10.5px] text-[#059669] font-bold pl-2.5 flex items-center gap-1">
                                <span className="text-[#5A6E65] font-normal">↳ Petunjuk:</span>
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
                    <div className="pt-3 border-t border-emerald-950/6 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#5A6E65] block font-mono">
                          No. Invoice: {v.invoice.invoiceNo}
                        </span>
                        <span className="text-sm font-black text-[#12241E] font-mono">
                          Rp {Number(v.invoice.totalAmount).toLocaleString('id-ID')}
                        </span>
                      </div>

                      {isUnpaid && payInvoice && (
                        <button
                          type="button"
                          onClick={() => payInvoice(v.invoice!.id)}
                          className="bg-[#FF4D6D] hover:bg-[#E00B41] text-white text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
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
          <div className="text-center py-10 px-4 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/80 text-xs text-[#5A6E65] space-y-1">
            <p className="font-bold text-[#12241E]">Belum ada riwayat kunjungan.</p>
            <p>Ambil antrean periksa untuk memulai konsultasi dokter pertama Anda.</p>
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
