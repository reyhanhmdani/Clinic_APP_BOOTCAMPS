import React from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
  SlidersHorizontal,
  Stethoscope,
  CheckCircle2,
  ArrowUpRight,
  ChevronRight,
  FileText,
  QrCode,
  Bell,
  Star,
  User,
  X,
  PackageCheck,
  CreditCard,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCustomerContext } from '../../layouts/CustomerLayout';

export const CustomerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    isNikLinked,
    patient,
    activeVisit,
    history,
    doctors,
    openBookingModal,
    openNikModal,
    payInvoice,
    cancelActiveVisit,
  } = useCustomerContext();

  const isUnpaid = activeVisit?.visit?.invoice?.status === 'UNPAID';
  const isWaitingPharmacy =
    activeVisit?.visit?.invoice?.status === 'PAID' &&
    !!activeVisit?.visit?.consultation?.consultationMedicines?.length &&
    !activeVisit?.visit?.consultation?.isDispensed;

  const unpaidVisit =
    isUnpaid
      ? activeVisit?.visit
      : history?.visits?.find((v) => v.invoice && v.invoice.status === 'UNPAID');

  const handleCancelTicket = async () => {
    if (!activeVisit?.visit) return;
    if (confirm(`Apakah Anda yakin ingin membatalkan antrean ${activeVisit.visit.doctor?.name}?`)) {
      await cancelActiveVisit(activeVisit.visit.id);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2.5 flex-1">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari dokter spesialis, jadwal poli, atau obat..."
            className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <button
          type="button"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {/* 2. Live Active Queue Ticket */}
      {activeVisit?.visit && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isWaitingPharmacy
                    ? 'bg-amber-500'
                    : isUnpaid
                    ? 'bg-rose-500'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {isWaitingPharmacy
                  ? 'Loket Farmasi'
                  : isUnpaid
                  ? 'Kasir Klinik'
                  : 'Antrean Poli Aktif'}
              </span>
            </div>

            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isWaitingPharmacy
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : isUnpaid
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : activeVisit.visit.status === 'IN_KONSULTASI'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-[#edf3ec] text-[#346538] border-emerald-200/60'
              }`}
            >
              {isWaitingPharmacy
                ? '⏳ Menyiapkan Obat'
                : isUnpaid
                ? '💳 Menunggu Pembayaran'
                : activeVisit.visit.status === 'IN_KONSULTASI'
                ? 'Sedang Diperiksa'
                : 'Dalam Antrean'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Nomor Tiket Anda</span>
              <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                A-{String(activeVisit.visit.queueNumber).padStart(3, '0')}
              </span>
            </div>
            <div className="text-right">
              {isWaitingPharmacy ? (
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Status Obat</span>
                  <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Sedang Diracik
                  </span>
                </div>
              ) : isUnpaid ? (
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Total Tagihan</span>
                  <span className="text-sm font-bold text-rose-700 font-mono">
                    Rp {Number(activeVisit.visit.invoice?.totalAmount || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Sisa Antrean di Depan</span>
                  <span className="text-xl font-bold text-emerald-800 font-mono">
                    {activeVisit.queueAhead} Orang
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Stethoscope size={13} className="text-slate-400" />
              <span>{activeVisit.visit.doctor?.name}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {new Date(activeVisit.visit.visitDate).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              WIB
            </span>
          </div>

          {/* Banner Menunggu di Loket Farmasi */}
          {isWaitingPharmacy && (
            <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-amber-950 font-extrabold text-xs">
                <PackageCheck size={16} className="text-amber-700 shrink-0" />
                <span>Resep Obat Sedang Disiapkan</span>
              </div>
              <p className="text-[11.5px] text-amber-900 leading-relaxed">
                Pembayaran Anda telah <strong>LUNAS (PAID)</strong>. Petugas farmasi sedang meracik dan menyiapkan obat sesuai resep dokter. Silakan menunggu di depan loket Apotek.
              </p>
              {activeVisit.visit.consultation?.consultationMedicines &&
                activeVisit.visit.consultation.consultationMedicines.length > 0 && (
                  <div className="pt-2 border-t border-amber-200/60 space-y-1">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                      Rincian Obat:
                    </span>
                    {activeVisit.visit.consultation.consultationMedicines.map((m: any, idx: number) => (
                      <div
                        key={m.id || idx}
                        className="text-[11px] text-amber-950 flex justify-between bg-white/70 px-2 py-1 rounded-md border border-amber-100"
                      >
                        <span className="font-semibold">
                          • {m.medicine?.name} ({m.qty} {m.medicine?.unit || 'pcs'})
                        </span>
                        {m.instructions && (
                          <span className="text-[10px] text-emerald-800 font-medium">
                            {m.instructions}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* Banner Tagihan Kasir Menunggu Pembayaran */}
          {isUnpaid && activeVisit.visit.invoice && (
            <div className="bg-rose-50/90 border border-rose-200/80 rounded-xl p-3.5 space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-950 font-extrabold text-xs">
                  <CreditCard size={16} className="text-rose-700 shrink-0" />
                  <span>Selesaikan Pembayaran Kasir</span>
                </div>
                <span className="text-xs font-black text-rose-900 font-mono">
                  Rp {Number(activeVisit.visit.invoice.totalAmount).toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-[11px] text-rose-800 leading-tight">
                Pemeriksaan dokter selesai. Silakan bayar tagihan via QRIS untuk mengambil obat di loket Farmasi.
              </p>
              <button
                type="button"
                onClick={() => payInvoice(activeVisit.visit.invoice!.id)}
                className="w-full py-2 bg-[#061e15] hover:bg-[#0a2f21] text-[#b4f105] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <QrCode size={14} />
                <span>Bayar Sekarang (QRIS)</span>
              </button>
            </div>
          )}

          {/* Tombol Batalkan Tiket (Jika belum diperiksa) */}
          {activeVisit.visit.status === 'WAITING' && (
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Berhalangan hadir hari ini?</span>
              <button
                type="button"
                onClick={handleCancelTicket}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-full border border-rose-200/80 transition-all cursor-pointer flex items-center gap-1"
              >
                <X size={11} className="stroke-[2.5]" />
                <span>Batalkan Antrean</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. 3-Step Clinical Flow */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Alur Pelayanan Digital
          </span>
          <span className="text-[11px] font-bold text-emerald-800 font-mono">3 Tahap Praktis</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center relative">
          <div
            onClick={() => !isNikLinked && openNikModal()}
            className={`p-2.5 rounded-xl border transition-all ${
              isNikLinked
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/70 border-amber-200 text-amber-900 cursor-pointer hover:bg-amber-100'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <span>1. Profil</span>
              {isNikLinked && <CheckCircle2 size={11} className="text-emerald-700" />}
            </div>
            <p className="text-[10px] font-semibold truncate leading-tight">
              {isNikLinked ? 'Terverifikasi' : 'Input NIK'}
            </p>
          </div>

          <div
            onClick={() => openBookingModal()}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              activeVisit?.visit
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <span>2. Tiket</span>
              {activeVisit?.visit && <CheckCircle2 size={11} className="text-emerald-700" />}
            </div>
            <p className="text-[10px] font-semibold truncate leading-tight">
              {activeVisit?.visit ? 'Antrean Aktif' : 'Pilih Dokter'}
            </p>
          </div>

          <div
            className={`p-2.5 rounded-xl border transition-all ${
              activeVisit?.visit?.status === 'IN_KONSULTASI'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1">3. Selesai</div>
            <p className="text-[10px] font-semibold truncate leading-tight">Resep & QRIS</p>
          </div>
        </div>
      </div>

      {/* 4. Bento Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#061e15] text-white p-4 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm group">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-[#b4f105] uppercase">POLI UMUM & GIGI</span>
            <h3 className="text-base font-bold leading-tight tracking-tight">Pelayanan Dokter Siaga Hari Ini</h3>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <span className="text-slate-300 font-mono">08:00 - 20:00 WIB</span>
            <div className="w-6 h-6 rounded-full bg-[#b4f105] text-[#061e15] flex items-center justify-center font-bold">
              <ArrowUpRight size={14} />
            </div>
          </div>
        </div>

        <div
          onClick={() => !isNikLinked && openNikModal()}
          className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
            isNikLinked
              ? 'bg-white border-slate-200/80'
              : 'bg-amber-50/50 border-amber-200 cursor-pointer hover:bg-amber-50'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">REKAM MEDIS</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                  isNikLinked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isNikLinked ? 'Aktif' : 'Belum Terhubung'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-2 leading-tight">
              {patient?.name || user?.username || 'Pasien Baru'}
            </h4>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {patient?.noRm ? `No. RM: ${patient.noRm}` : 'NIK belum terdaftar'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openNikModal()}
            className="text-xs font-bold text-slate-900 flex items-center gap-1 hover:underline cursor-pointer pt-2"
          >
            <span>{isNikLinked ? 'Lihat / Edit Data' : 'Lengkapi Sekarang'}</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* 5. Quick Actions */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { icon: Stethoscope, label: 'Poli Umum', action: () => openBookingModal() },
          { icon: FileText, label: 'Rekam Medis', action: () => navigate('/customers/history') },
          { icon: QrCode, label: 'Bayar QRIS', action: () => navigate('/customers') },
          { icon: Bell, label: 'Pemberitahuan', action: () => navigate('/customers/notifications') },
        ].map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={item.action}
            className="bg-white border border-slate-200/80 rounded-2xl p-2.5 flex flex-col items-center gap-1.5 hover:border-slate-300 transition-all cursor-pointer active:scale-95 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
              <item.icon size={17} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 truncate w-full">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 6. Dokter Jaga Hari Ini */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Jadwal Praktek</h3>
            <span className="text-sm font-bold text-slate-900">Dokter Spesialis Siaga</span>
          </div>
          <button
            type="button"
            onClick={() => openBookingModal()}
            className="text-xs font-bold text-[#061e15] hover:underline cursor-pointer"
          >
            Semua Jadwal
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {doctors.length > 0 ? (
            doctors.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-2xs ${
                        doc.gender === 'FEMALE'
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}
                    >
                      <User size={20} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[9px] font-bold text-emerald-800 bg-[#edf3ec] px-2 py-0.5 rounded-full border border-emerald-200/60">
                      {doc.isActive ? 'Praktek' : 'Tutup'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{doc.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate">{doc.spesialis}</p>
                    <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold pt-1">
                      <Star size={11} fill="currentColor" />
                      <span>5.0 (Poli Aktif)</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openBookingModal(doc.id)}
                  className="w-full py-2 rounded-xl bg-[#061e15] hover:bg-[#0a2f21] text-[#b4f105] text-[11px] font-bold transition-all cursor-pointer active:scale-95"
                >
                  Ambil Antrean
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center p-4 bg-white rounded-2xl border border-slate-200/80 text-xs text-slate-500">
              Memuat daftar dokter...
            </div>
          )}
        </div>
      </section>

      {/* 7. Tagihan & Pembayaran Mandiri QRIS */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900">Tagihan Obat & Pemeriksaan</span>
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              unpaidVisit
                ? 'bg-[#fbf3db] text-[#956400] border border-[#f1dfaa]'
                : 'bg-[#edf3ec] text-[#346538] border border-emerald-200/60'
            }`}
          >
            {unpaidVisit ? 'Menunggu Pembayaran' : 'Semua Lunas'}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Total Jumlah:</span>
            <span className="text-base font-bold text-slate-900 font-mono">
              {unpaidVisit?.invoice ? `Rp ${unpaidVisit.invoice.totalAmount.toLocaleString('id-ID')}` : 'Rp 0'}
            </span>
          </div>
          {unpaidVisit?.invoice ? (
            <button
              type="button"
              onClick={() => payInvoice(unpaidVisit.invoice!.id)}
              className="px-4 py-2 rounded-xl bg-[#061e15] hover:bg-[#0a2f21] text-[#b4f105] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <QrCode size={14} />
              <span>Bayar Mandiri (QRIS)</span>
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">
              ✓ Tidak Ada Tagihan
            </span>
          )}
        </div>
      </div>

      {/* 8. Riwayat Pemeriksaan Terakhir (Max 2 Item) */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Rekam Medis</h3>
            <span className="text-sm font-bold text-slate-900">Riwayat Pemeriksaan Terakhir</span>
          </div>
          {history?.visits && history.visits.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/customers/history')}
              className="text-xs font-bold text-[#061e15] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>Lihat Semua ({history.visits.length})</span>
              <ChevronRight size={13} />
            </button>
          )}
        </div>

        {history?.visits && history.visits.length > 0 ? (
          <div className="space-y-2.5">
            {history.visits.slice(0, 2).map((v) => {
              const formattedDate = new Date(v.visitDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const isPaid = v.invoice?.status === 'PAID';
              const isUnpaid = v.invoice?.status === 'UNPAID';

              return (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs text-[#061e15]">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                          {v.doctor?.name || 'Dokter Jaga'}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">• {formattedDate}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {v.consultation?.diagnosis || v.doctor?.spesialis || 'Pemeriksaan Rutin'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border block ${
                        isPaid
                          ? 'bg-[#edf3ec] text-[#346538] border-emerald-200/60'
                          : isUnpaid
                          ? 'bg-[#fbf3db] text-[#956400] border-[#f1dfaa]'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isPaid ? 'Lunas' : isUnpaid ? 'Belum Bayar' : 'Selesai'}
                    </span>
                    {v.invoice?.totalAmount ? (
                      <span className="text-[10px] font-mono text-slate-500 font-semibold mt-0.5 block">
                        Rp {v.invoice.totalAmount.toLocaleString('id-ID')}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {history.visits.length > 2 && (
              <button
                type="button"
                onClick={() => navigate('/customers/history')}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 mt-1"
              >
                <span>Lihat {history.visits.length - 2} Riwayat Lainnya</span>
                <ChevronRight size={13} />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-5 text-xs text-slate-400">
            Belum ada catatan riwayat rekam medis. Ambil antrean untuk memulai pemeriksaan.
          </div>
        )}
      </section>
    </div>
  );
};
