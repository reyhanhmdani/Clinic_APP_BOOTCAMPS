import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2, CreditCard, Banknote, QrCode, Calendar, Printer } from 'lucide-react';
import { useVisitStore } from '../stores/visitStore';
import { payInvoiceService } from '../services/invoiceService';
import { formatRupiah } from '../utils/formatRupiah';

export const InvoicePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const visitIdParam = searchParams.get('visitId');

  const visits = useVisitStore((state) => state.visits);
  const fetchVisits = useVisitStore((state) => state.fetchVisits);

  const selectedVisit = visits.find((item) => item.id === Number(visitIdParam));

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'TRANSFER' | 'CARD'>(
    (selectedVisit?.invoice?.paymentMethod as any) || 'CASH',
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    fetchVisits();
  }, []);

  useEffect(() => {
    if (selectedVisit?.invoice?.paymentMethod) {
      setPaymentMethod(selectedVisit.invoice.paymentMethod as any);
    }
  }, [selectedVisit?.invoice?.status, selectedVisit?.invoice?.paymentMethod]);

  const handleProcessPayment = async () => {
    if (!selectedVisit?.invoice?.id) {
      alert('Faktur tagihan tidak ditemukan!');
      return;
    }

    setIsProcessing(true);
    try {
      await payInvoiceService(selectedVisit.invoice.id, {
        paymentMethod: paymentMethod,
      });

      await fetchVisits();
      alert('Pembayaran berhasil diproses dan status telah Lunas (PAID)!');
      navigate('/dashboard');
    } catch (error: any) {
      alert(`Gagal memproses pembayaran: ${error?.response?.data?.message || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedVisit) {
    return (
      <div className="text-center py-20">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Tagihan Tidak Ditemukan</p>
      </div>
    );
  }

  const isAlreadyPaid = selectedVisit.invoice?.status === 'PAID';
  const invoiceNo = selectedVisit.invoice?.invoiceNo || `INV-${String(selectedVisit.id).padStart(5, '0')}`;
  const patientName = selectedVisit.patient?.name || '-';
  const patientNoRm = selectedVisit.patient?.noRm || '-';
  const doctorName = selectedVisit.doctor?.name || '-';
  const doctorSpecialist = selectedVisit.doctor?.spesialis || '-';
  const doctorRoom = selectedVisit.doctor?.room || 'Poli 1';

  const totalConsultationFee = Number(selectedVisit.invoice?.totalConsultationFee || selectedVisit.doctor?.fee || 0);
  const totalMedicineFee = Number(selectedVisit.invoice?.totalMedicineFee || 0);
  const totalAmount = Number(selectedVisit.invoice?.totalAmount || totalConsultationFee + totalMedicineFee);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-xs hover:bg-slate-50 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Dashboard</span>
        </button>

        {isAlreadyPaid && (
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs font-bold bg-[#061e15] text-[#b4f105] px-4 py-2 rounded-full shadow-xs cursor-pointer"
          >
            <Printer size={15} />
            <span>Cetak Nota Transaksi</span>
          </button>
        )}
      </div>

      {/* Main Invoice Card */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-[24px] overflow-hidden">
        {/* Header Billing */}
        <div className="p-6 sm:p-8 bg-[#061e15] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#b4f105] text-xl font-black">✱</span>
              <span className="text-xs font-bold tracking-widest uppercase text-white/70">
                ReyClinic Medical Center
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Faktur Tagihan Pasien</h1>
            <p className="text-xs text-white/60 mt-1 font-mono">No. Faktur: {invoiceNo}</p>
          </div>

          <div className="text-left sm:text-right">
            <span
              className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isAlreadyPaid
                  ? 'bg-emerald-500/20 text-[#b4f105] border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              {isAlreadyPaid ? '● LUNAS / PAID' : '● BELUM LUNAS'}
            </span>
            <p className="text-[11px] text-white/60 mt-1.5 flex items-center justify-start sm:justify-end gap-1 font-mono">
              <Calendar size={13} />
              <span>
                {new Date(selectedVisit.visitDate || selectedVisit.createdAt || Date.now()).toLocaleDateString(
                  'id-ID',
                  {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  },
                )}
              </span>
            </p>
          </div>
        </div>

        {/* Patient & Doctor Detail Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Data Pasien
            </span>
            <h3 className="text-base font-bold text-slate-900 capitalize">{patientName}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              No. RM: {patientNoRm} • {selectedVisit.patient?.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'} (
              {selectedVisit.patient?.age} th)
            </p>
            <p className="text-xs text-slate-400 mt-1">{selectedVisit.patient?.address || 'Alamat tidak tersedia'}</p>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Dokter Pemeriksa
            </span>
            <h3 className="text-base font-bold text-slate-900">{doctorName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {doctorSpecialist} ({doctorRoom})
            </p>
          </div>
        </div>

        {/* Breakdown Items Table */}
        <div className="p-6 sm:p-8 space-y-6">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Rincian Biaya Layanan</h3>

          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <th className="p-3.5">Deskripsi Layanan</th>
                  <th className="p-3.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {/* 1. Jasa Medis Dokter */}
                <tr>
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900">Jasa Konsultasi Medis</span>
                    <span className="text-[11px] text-slate-400 block">Pemeriksaan & tindakan dokter</span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                    {formatRupiah(totalConsultationFee)}
                  </td>
                </tr>

                {/* 2. Biaya Resep Obat Apotek */}
                <tr>
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900">Total Resep Obat Apotek</span>
                    <span className="text-[11px] text-slate-400 block">Farmasi & obat-obatan pasien</span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                    {formatRupiah(totalMedicineFee)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grand Total Summary */}
          <div className="flex flex-col items-end gap-2 pt-2">
            <div className="flex items-center justify-between w-full max-w-xs text-xs text-slate-500">
              <span>Jasa Konsultasi Medis:</span>
              <span className="font-mono font-semibold">{formatRupiah(totalConsultationFee)}</span>
            </div>
            <div className="flex items-center justify-between w-full max-w-xs text-xs text-slate-500">
              <span>Total Resep Obat Apotek:</span>
              <span className="font-mono font-semibold">{formatRupiah(totalMedicineFee)}</span>
            </div>
            <div className="flex items-center justify-between w-full max-w-xs text-sm font-extrabold text-slate-900 pt-3 border-t border-slate-200">
              <span>Total Tagihan:</span>
              <span className="text-xl text-[#061e15] font-mono">{formatRupiah(totalAmount)}</span>
            </div>
          </div>

          {/* Payment Method Selector (Only for Unpaid) */}
          {!isAlreadyPaid && (
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pilih Metode Pembayaran</h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'CASH', label: 'Tunai (Cash)', icon: Banknote },
                  { id: 'QRIS', label: 'QRIS Statis/Dinamis', icon: QrCode },
                  { id: 'TRANSFER', label: 'Bank Transfer', icon: CreditCard },
                  { id: 'CARD', label: 'Kartu Debit/Kredit', icon: CreditCard },
                ].map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#061e15] text-[#b4f105] border-[#061e15] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Button Bayar */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleProcessPayment}
                  className="btn-forest px-8 py-3 rounded-full text-sm font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  <span>
                    {isProcessing
                      ? 'Memproses Transaksi...'
                      : `LUNASI & PROSES PEMBAYARAN (${formatRupiah(totalAmount)})`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
