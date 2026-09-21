import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Banknote,
  QrCode,
  Calendar,
  Printer,
  Search,
  Clock,
  TrendingUp,
  Receipt,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useVisitStore } from '../../stores/visitStore';
import { getInvoiceService, payInvoiceService } from '../../services/invoiceService';
import { formatRupiah } from '../../utils/formatRupiah';
import type { Invoice, PaymentMethod } from '../../types/clinic';

export const InvoicePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const visitIdParam = searchParams.get('visitId');

  const visits = useVisitStore((state) => state.visits);
  const fetchVisits = useVisitStore((state) => state.fetchVisits);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [methodFilter, setMethodFilter] = useState<'ALL' | PaymentMethod>('ALL');

  // Modal Cetak Struk
  const [selectedReceiptInvoice, setSelectedReceiptInvoice] = useState<Invoice | null>(null);

  // Single checkout state
  const selectedVisit = visits.find((item) => item.id === Number(visitIdParam));
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'CASH' | 'QRIS' | 'TRANSFER' | 'CARD'>('CASH');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchVisits();
      const invoiceData = await getInvoiceService();
      setInvoices(invoiceData || []);
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedVisit?.invoice?.paymentMethod) {
      setCheckoutPaymentMethod(selectedVisit.invoice.paymentMethod as any);
    }
  }, [selectedVisit?.invoice?.status, selectedVisit?.invoice?.paymentMethod]);

  // Handle single checkout payment
  const handleProcessPayment = async () => {
    if (!selectedVisit?.invoice?.id) {
      toast.error('Faktur tagihan tidak ditemukan!');
      return;
    }

    setIsProcessing(true);
    try {
      await payInvoiceService(selectedVisit.invoice.id, {
        paymentMethod: checkoutPaymentMethod,
      });

      await loadData();
      toast.success('Pembayaran berhasil diproses dan status telah LUNAS (PAID)!');
      setSearchParams({});
    } catch (error: any) {
      toast.error(`Gagal memproses pembayaran: ${error?.response?.data?.message || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    let unpaidAmount = 0;
    let qrisCount = 0;
    let cashCount = 0;

    invoices.forEach((inv) => {
      const amount = Number(inv.totalAmount || 0);
      if (inv.status === 'PAID') {
        totalRevenue += amount;
        paidCount += 1;
        if (inv.paymentMethod === 'QRIS') qrisCount += 1;
        if (inv.paymentMethod === 'CASH') cashCount += 1;
      } else {
        unpaidCount += 1;
        unpaidAmount += amount;
      }
    });

    return {
      totalRevenue,
      paidCount,
      unpaidCount,
      unpaidAmount,
      qrisCount,
      cashCount,
      totalTransactions: invoices.length,
    };
  }, [invoices]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // 1. Status Filter
      if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;

      // 2. Method Filter
      if (methodFilter !== 'ALL' && inv.paymentMethod !== methodFilter) return false;

      // 3. Search Query (Invoice No, Patient Name, No. RM, Doctor Name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const patient = inv.visit?.patient || visits.find((v) => v.id === inv.visitId)?.patient;
        const doctor = inv.visit?.doctor || visits.find((v) => v.id === inv.visitId)?.doctor;

        const matchInvoiceNo = inv.invoiceNo?.toLowerCase().includes(q);
        const matchPatient = patient?.name?.toLowerCase().includes(q) || patient?.noRm?.toLowerCase().includes(q);
        const matchDoctor = doctor?.name?.toLowerCase().includes(q) || doctor?.spesialis?.toLowerCase().includes(q);

        if (!matchInvoiceNo && !matchPatient && !matchDoctor) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, statusFilter, methodFilter, searchQuery, visits]);

  // =========================================================================
  // JIKA SEDANG MEMPROSES CHECKOUT DARI KASIR / VISITS (?visitId=...)
  // =========================================================================
  if (visitIdParam && selectedVisit) {
    const isAlreadyPaid = selectedVisit.invoice?.status === 'PAID';
    const invoiceNo = selectedVisit.invoice?.invoiceNo || `INV-${String(selectedVisit.id).padStart(5, '0')}`;
    const patientName = selectedVisit.patient?.name || '-';
    const patientNoRm = selectedVisit.patient?.noRm || '-';
    const doctorName = selectedVisit.doctor?.name || '-';
    const doctorSpecialist = selectedVisit.doctor?.spesialis || '-';
    const doctorRoom = selectedVisit.doctor?.room || 'Poli 1';

    const totalConsultationFee = Number(
      selectedVisit.invoice?.totalConsultationFee || selectedVisit.doctor?.fee || 0
    );
    const totalMedicineFee = Number(selectedVisit.invoice?.totalMedicineFee || 0);
    const totalAmount = Number(
      selectedVisit.invoice?.totalAmount || totalConsultationFee + totalMedicineFee
    );

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-xs hover:bg-slate-50 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Rekap Pemasukan</span>
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
              <div className="flex items-center gap-2.5 mb-1.5">
                <img
                  src="/logo.png"
                  alt="ReyClinic Logo"
                  className="w-6 h-6 rounded-md object-cover border border-white/20 shadow-xs"
                />
                <span className="text-xs font-bold tracking-widest uppercase text-white/70">
                  ReyClinic Medical Center
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Faktur Tagihan Pasien
              </h1>
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
                  {new Date(
                    selectedVisit.visitDate || selectedVisit.createdAt || Date.now()
                  ).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
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
                No. RM: {patientNoRm} •{' '}
                {selectedVisit.patient?.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'} (
                {selectedVisit.patient?.age} th)
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {selectedVisit.patient?.address || 'Alamat tidak tersedia'}
              </p>
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
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Rincian Biaya Layanan
            </h3>

            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <th className="p-3.5">Deskripsi Layanan</th>
                    <th className="p-3.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900">Jasa Konsultasi Medis</span>
                      <span className="text-[11px] text-slate-400 block">Pemeriksaan & tindakan dokter</span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(totalConsultationFee)}
                    </td>
                  </tr>
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
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pilih Metode Pembayaran
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'CASH', label: 'Tunai (Cash)', icon: Banknote },
                    { id: 'QRIS', label: 'QRIS Statis/Dinamis', icon: QrCode },
                    { id: 'TRANSFER', label: 'Bank Transfer', icon: CreditCard },
                    { id: 'CARD', label: 'Kartu Debit/Kredit', icon: CreditCard },
                  ].map((pm) => {
                    const isSelected = checkoutPaymentMethod === pm.id;
                    const Icon = pm.icon;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setCheckoutPaymentMethod(pm.id as any)}
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
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSearchParams({})}
                    className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
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
  }

  // =========================================================================
  // VIEW UTAMA: REKAPITULASI PEMASUKAN & DAFTAR INVOICE KLINIK
  // =========================================================================
  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Ringkasan & Judul Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full text-xs font-bold text-[#107c41] mb-1.5 shadow-2xs">
            <Receipt size={14} />
            <span>KASIR & KEUANGAN KLINIK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Rekapitulasi Pemasukan & Faktur Tagihan
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pantau seluruh arus kas masuk, pelunasan kasir fisik, dan transaksi online QRIS secara terpadu.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <span>↻ Segarkan Data</span>
        </button>
      </div>

      {/* 2. 4 FINANCIAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pemasukan Lunas */}
        <div className="bg-[#061e15] text-white p-5 rounded-3xl border border-[#061e15] shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#b4f105]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Total Pemasukan Kas</span>
            <div className="w-8 h-8 rounded-xl bg-[#b4f105]/20 text-[#b4f105] flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-[#b4f105] tracking-tight font-mono">
              {formatRupiah(stats.totalRevenue)}
            </h2>
            <p className="text-[11px] text-slate-300 mt-1">
              Dari {stats.paidCount} transaksi berhasil
            </p>
          </div>
        </div>

        {/* Card 2: Transaksi Lunas */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Transaksi Lunas (PAID)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#107c41] flex items-center justify-center border border-emerald-100">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.paidCount} <span className="text-xs font-normal text-slate-400">faktur</span>
            </h2>
            <p className="text-[11px] text-[#107c41] font-semibold mt-1">
              ● 100% Pembayaran tervalidasi
            </p>
          </div>
        </div>

        {/* Card 3: Tagihan Tertunda (Pending) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tagihan Tertunda (UNPAID)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-amber-700 tracking-tight">
              {stats.unpaidCount} <span className="text-xs font-normal text-slate-400">faktur</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Potensi: {formatRupiah(stats.unpaidAmount)}
            </p>
          </div>
        </div>

        {/* Card 4: Rekap QRIS & Tunai */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kanal Pembayaran Lunas</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <QrCode size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">QRIS</span>
                <span className="text-base font-extrabold text-slate-900">{stats.qrisCount} trx</span>
              </div>
              <div className="w-px h-7 bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tunai</span>
                <span className="text-base font-extrabold text-slate-900">{stats.cashCount} trx</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              Total {stats.totalTransactions} rekaman invoice
            </p>
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Semua ({invoices.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PAID')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'PAID'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Lunas ({stats.paidCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('UNPAID')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'UNPAID'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Belum Lunas ({stats.unpaidCount})
            </button>
          </div>

          {/* Search Bar & Method Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 md:max-w-xl justify-end">
            {/* Filter Metode */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#107c41] cursor-pointer"
            >
              <option value="ALL">Semua Metode Bayar</option>
              <option value="QRIS">QRIS Midtrans</option>
              <option value="CASH">Tunai (Cash Loket)</option>
              <option value="TRANSFER">Transfer Bank</option>
              <option value="CARD">Kartu Debit/Kredit</option>
            </select>

            {/* Input Search */}
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari No. Faktur, Pasien, Dokter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#107c41] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. INVOICES TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <th className="p-4">No. Faktur & Waktu</th>
                <th className="p-4">Pasien</th>
                <th className="p-4">Dokter & Poli</th>
                <th className="p-4 text-right">Biaya Medis</th>
                <th className="p-4 text-right">Biaya Obat</th>
                <th className="p-4 text-right">Total Tagihan</th>
                <th className="p-4 text-center">Metode & Status</th>
                <th className="p-4 text-center">Aksi Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <div className="inline-block animate-spin w-5 h-5 border-2 border-[#107c41] border-t-transparent rounded-full mb-2" />
                    <p className="text-xs">Memuat data rekapitulasi faktur...</p>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <Receipt size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">Tidak ada data tagihan ditemukan</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Coba ubah kata kunci pencarian atau ganti filter status tagihan.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPaid = inv.status === 'PAID';
                  const patient = inv.visit?.patient || visits.find((v) => v.id === inv.visitId)?.patient;
                  const doctor = inv.visit?.doctor || visits.find((v) => v.id === inv.visitId)?.doctor;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* No. Faktur & Waktu */}
                      <td className="p-4 font-mono">
                        <span className="font-bold text-slate-900 block">
                          {inv.invoiceNo || `INV-V${inv.visitId}`}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(inv.createdAt || Date.now()).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Pasien */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                            {patient?.noRm || '-'}
                          </span>
                          <span className="font-bold text-slate-900">{patient?.name || 'Pasien Anonim'}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {patient?.gender === 'MALE' ? 'L' : 'P'}, {patient?.age || '-'} th
                        </span>
                      </td>

                      {/* Dokter & Poli */}
                      <td className="p-4">
                        <span className="font-semibold text-slate-900 block">{doctor?.name || '-'}</span>
                        <span className="text-[11px] text-[#107c41] block mt-0.5">
                          {doctor?.spesialis || 'Poli Umum'} ({doctor?.room || 'Poli 1'})
                        </span>
                      </td>

                      {/* Biaya Dokter */}
                      <td className="p-4 text-right font-mono text-slate-600">
                        {formatRupiah(Number(inv.totalConsultationFee || 0))}
                      </td>

                      {/* Biaya Obat */}
                      <td className="p-4 text-right font-mono text-slate-600">
                        {formatRupiah(Number(inv.totalMedicineFee || 0))}
                      </td>

                      {/* Total Tagihan */}
                      <td className="p-4 text-right font-mono font-black text-slate-900 text-sm">
                        {formatRupiah(Number(inv.totalAmount || 0))}
                      </td>

                      {/* Status & Metode */}
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            isPaid
                              ? 'bg-emerald-50 text-[#107c41] border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                          }`}
                        >
                          {isPaid ? '● LUNAS' : '● BELUM LUNAS'}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono mt-1 uppercase">
                          {inv.paymentMethod || 'TUNAI'}
                        </span>
                      </td>

                      {/* Aksi Kasir */}
                      <td className="p-4 text-center">
                        {isPaid ? (
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptInvoice(inv)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer active:scale-95"
                            title="Lihat & Cetak Nota Resmi"
                          >
                            <Printer size={13} />
                            <span>Struk</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSearchParams({ visitId: String(inv.visitId) })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#061e15] hover:bg-[#061e15]/90 text-[#b4f105] text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                            title="Proses Pembayaran di Kasir"
                          >
                            <Banknote size={13} />
                            <span>Bayar Kasir</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL STRUK RESMI PEMBAYARAN (PRINT-READY) */}
      {selectedReceiptInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4 rounded-3xl">
            {/* Header Struk */}
            <div className="text-center pb-3 border-b border-dashed border-slate-200 flex flex-col items-center">
              <img
                src="/logo.png"
                alt="ReyClinic Logo"
                className="w-10 h-10 rounded-xl mb-1.5 object-cover border border-slate-200/80 shadow-2xs"
              />
              <div className="inline-block bg-lime-100 text-lime-900 px-2.5 py-0.5 border border-lime-200 font-bold text-[10px] uppercase rounded-full">
                STRUK RESMI PEMBAYARAN
              </div>
              <h2 className="text-lg font-bold uppercase mt-1 text-slate-900">
                REYCLINIC MEDICAL CENTER
              </h2>
              <p className="text-[11px] font-medium text-slate-500">
                Jl. Kesehatan No. 45, Jakarta • Telp: (021) 555-0123
              </p>
            </div>

            {/* Info Kunjungan & Pasien */}
            <div className="bg-slate-50 p-4 border border-slate-200/80 rounded-2xl text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Faktur:</span>
                <span className="font-bold text-slate-800">
                  {selectedReceiptInvoice.invoiceNo || `INV-V${selectedReceiptInvoice.visitId}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pasien:</span>
                <span className="font-bold text-slate-800">
                  {selectedReceiptInvoice.visit?.patient?.name ||
                    visits.find((v) => v.id === selectedReceiptInvoice.visitId)?.patient?.name ||
                    '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dokter Jaga:</span>
                <span className="font-bold text-slate-800">
                  {selectedReceiptInvoice.visit?.doctor?.name ||
                    visits.find((v) => v.id === selectedReceiptInvoice.visitId)?.doctor?.name ||
                    '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Bayar:</span>
                <span className="font-bold text-[#107c41]">
                  {selectedReceiptInvoice.paymentMethod || 'TUNAI'}
                </span>
              </div>
            </div>

            {/* Rincian Biaya */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Jasa Konsultasi Medis</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatRupiah(Number(selectedReceiptInvoice.totalConsultationFee || 0))}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Resep Obat Apotek</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatRupiah(Number(selectedReceiptInvoice.totalMedicineFee || 0))}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t border-dashed border-slate-300 font-bold text-sm">
                <span className="text-slate-900">Total Pembayaran:</span>
                <span className="text-emerald-700 font-mono">
                  {formatRupiah(Number(selectedReceiptInvoice.totalAmount || 0))}
                </span>
              </div>
            </div>

            {/* Footer Modal Action */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReceiptInvoice(null)}
                className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-forest px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer size={14} />
                <span>Cetak Nota</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

