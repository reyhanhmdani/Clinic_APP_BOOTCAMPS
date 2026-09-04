import React, { useState, useEffect, useCallback } from 'react';
import {
  PackageCheck,
  Clock,
  CheckCircle2,
  Pill,
  Stethoscope,
  RefreshCw,
  Search,
  Check,
} from 'lucide-react';
import { getPharmacyQueueService, dispenseMedicineService } from '../../services/pharmacyService';
import type { Consultation, PharmacyQueueData } from '../../types/clinic';
import { socket } from '../../services/socket';
import { toast } from 'sonner';
import { confirmDialog } from '../../stores/confirmStore';

export const PharmacyPage: React.FC = () => {
  const [data, setData] = useState<PharmacyQueueData>({
    pending: [],
    completed: [],
    stats: { totalPending: 0, totalCompleted: 0 },
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDispensing, setIsDispensing] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await getPharmacyQueueService();
      setData(res);
    } catch (err: any) {
      toast.error('Gagal memuat antrean farmasi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();

    // Listen to real-time WebSocket events
    const handleQueueUpdate = () => {
      fetchQueue();
    };

    socket.on('QUEUE_UPDATED', handleQueueUpdate);
    return () => {
      socket.off('QUEUE_UPDATED', handleQueueUpdate);
    };
  }, [fetchQueue]);

  const handleDispense = async (consultation: Consultation) => {
    const patientName = consultation.visit?.patient?.name || 'Pasien';
    const isConfirmed = await confirmDialog({
      title: 'Konfirmasi Penyerahan Obat',
      description: `Apakah Anda yakin obat untuk pasien ${patientName} sudah disiapkan dan siap diserahkan?`,
      confirmText: 'Ya, Serahkan Obat',
      cancelText: 'Batal',
      variant: 'success',
    });
    if (!isConfirmed) {
      return;
    }

    setIsDispensing(consultation.id);
    try {
      await dispenseMedicineService(consultation.id);
      toast.success(`Obat untuk pasien ${patientName} berhasil diserahkan!`);
      setSuccessMessage(`Obat untuk pasien ${patientName} berhasil diserahkan!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchQueue();
    } catch (err: any) {
      toast.error(`Gagal menyerahkan obat: ${err?.response?.data?.message || err.message}`);
    } finally {
      setIsDispensing(null);
    }
  };

  // Filter list by patient name or RM or queue number
  const currentList = activeTab === 'pending' ? data.pending : data.completed;
  const filteredList = currentList.filter((item) => {
    const patientName = item.visit?.patient?.name?.toLowerCase() || '';
    const noRm = item.visit?.patient?.noRm?.toLowerCase() || '';
    const queueNo = String(item.visit?.queueNumber || '');
    const q = searchQuery.toLowerCase();
    return patientName.includes(q) || noRm.includes(q) || queueNo.includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* 1. Header & Summary Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-[#061e15] text-[#b4f105] flex items-center justify-center font-bold">
              <PackageCheck size={16} />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Apotek & Penyerahan Obat
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Antrean Farmasi (Dispensing)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar resep dari dokter untuk pasien yang telah menyelesaikan pembayaran di kasir.
          </p>
        </div>

        {/* Action Controls & Live Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              fetchQueue();
            }}
            className="p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. Success Alert */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs font-bold animate-fade-in shadow-2xs">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 3. Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Antrean Menunggu */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Menunggu Penyiapan
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{data.stats.totalPending}</span>
              <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Antrean
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock size={24} />
          </div>
        </div>

        {/* Sudah Diserahkan */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Selesai Diserahkan
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{data.stats.totalCompleted}</span>
              <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Hari Ini
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Total Keseluruhan Resep */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Resep Masuk
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {data.stats.totalPending + data.stats.totalCompleted}
              </span>
              <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                Total
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
            <Pill size={24} />
          </div>
        </div>
      </div>

      {/* 4. Tab Navigation & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Pill Tab Switcher */}
        <div className="inline-flex bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Antrean Siap Diracik</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === 'pending'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {data.stats.totalPending}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Riwayat Diserahkan</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === 'completed'
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {data.stats.totalCompleted}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pasien / No. RM / Antrean..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* 5. Queue Card Feed */}
      {isLoading ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center">
          <RefreshCw size={28} className="animate-spin text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-500">Memuat data antrean farmasi...</p>
        </div>
      ) : filteredList.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredList.map((consul) => {
            const visit = consul.visit;
            const patient = visit?.patient;
            const doctor = visit?.doctor;
            const invoice = visit?.invoice;
            const isCompleted = consul.isDispensed;

            return (
              <div
                key={consul.id}
                className={`bg-white border rounded-3xl p-5 shadow-2xs space-y-4 transition-all duration-200 ${
                  isCompleted
                    ? 'border-slate-200/80 hover:border-slate-300'
                    : 'border-amber-200/80 ring-1 ring-amber-100 hover:border-amber-300'
                }`}
              >
                {/* Header Card: Queue Token, Patient Info, and Status */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-start gap-3">
                    {/* Queue Token Badge */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black text-center shrink-0 border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200/80'
                          : 'bg-[#061e15] text-[#b4f105] border-[#061e15]'
                      }`}
                    >
                      <span className="text-[9px] uppercase tracking-tighter opacity-80 leading-none">
                        No
                      </span>
                      <span className="text-base leading-tight">
                        {visit?.queueNumber ? `A-${String(visit.queueNumber).padStart(3, '0')}` : 'A-000'}
                      </span>
                    </div>

                    {/* Patient & Doctor Meta */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-extrabold text-slate-900 truncate">
                          {patient?.name || 'Pasien Anonim'}
                        </h3>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                          {patient?.noRm || 'RM-NEW'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Stethoscope size={12} className="text-emerald-700" />
                        <span>{doctor?.name || 'Dokter Jaga'}</span>
                        <span className="text-slate-300">•</span>
                        <span>{doctor?.spesialis || 'Umum'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                    }`}
                  >
                    {isCompleted ? '✓ Diserahkan' : '⏳ Siapkan Obat'}
                  </span>
                </div>

                {/* Resep Obat List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Daftar Resep Obat (R/):
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-slate-400">
                      {consul.consultationMedicines?.length || 0} Macam Obat
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {consul.consultationMedicines?.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 text-xs space-y-0.5"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>
                            • {item.medicine?.name || 'Obat'}{' '}
                            <span className="text-slate-500 font-normal">
                              ({item.qty} {item.medicine?.unit || 'pcs'})
                            </span>
                          </span>
                          <span className="font-mono text-slate-900">
                            Rp {Number(item.subTotal || 0).toLocaleString('id-ID')}
                          </span>
                        </div>

                        {item.instructions && (
                          <div className="text-[10.5px] text-emerald-800 font-medium pl-2.5 flex items-center gap-1">
                            <span className="text-slate-400 font-normal">↳ Signa / Aturan:</span>
                            <span className="font-semibold">{item.instructions}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Catatan Dokter (jika ada) */}
                {consul.notes && (
                  <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 text-xs">
                    <span className="text-[9.5px] font-bold uppercase text-amber-800 block mb-0.5">
                      Catatan Dokter:
                    </span>
                    <p className="text-[11px] text-amber-900 italic">{consul.notes}</p>
                  </div>
                )}

                {/* Footer Action Card */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-500">
                    <span>Invoice: </span>
                    <span className="font-bold text-slate-800">{invoice?.invoiceNo}</span>
                    <span className="ml-2 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      PAID
                    </span>
                  </div>

                  {!isCompleted ? (
                    <button
                      type="button"
                      disabled={isDispensing === consul.id}
                      onClick={() => handleDispense(consul)}
                      className="bg-[#061e15] hover:bg-[#0a2e21] text-[#b4f105] font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Check size={14} />
                      <span>{isDispensing === consul.id ? 'Memproses...' : 'Serahkan Obat'}</span>
                    </button>
                  ) : (
                    <div className="text-[10px] text-slate-400 font-medium italic flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      <span>
                        Diserahkan pada{' '}
                        {consul.dispensedAt
                          ? new Date(consul.dispensedAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'hari ini'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <PackageCheck size={28} />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">
            {activeTab === 'pending'
              ? 'Tidak Ada Antrean Resep Menunggu'
              : 'Belum Ada Riwayat Penyerahan Obat'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'Semua resep pasien yang telah melunasi tagihan kasir telah selesai disiapkan dan diserahkan.'
              : 'Daftar pasien yang telah menerima obat pada hari ini akan otomatis tersimpan di tab ini.'}
          </p>
        </div>
      )}
    </div>
  );
};
