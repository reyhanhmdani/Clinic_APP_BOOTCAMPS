import React from 'react';
import { Bell, CheckCircle2, Clock } from 'lucide-react';
import { useCustomerContext } from '../../layouts/CustomerLayout';

export const CustomerNotificationPage: React.FC = () => {
  const { activeVisit, history } = useCustomerContext();

  return (
    <div className="space-y-4 animate-fade-in text-[#12241E]">
      {/* Header Card (Frosted Glass) */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(15,76,58,0.04)] space-y-1">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#5A6E65] block">
          UPDATE AKTIVITAS
        </span>
        <h2 className="text-base font-extrabold text-[#12241E]">Pusat Pemberitahuan</h2>
        <p className="text-xs text-[#5A6E65] font-medium">
          Informasi status antrean, tindakan medis, dan pengingat resep obat Anda.
        </p>
      </div>

      <div className="space-y-3">
        {/* Notifikasi Tiket Aktif */}
        {activeVisit?.visit && (
          <div className="flex items-start gap-3.5 p-4 rounded-3xl bg-emerald-50/85 backdrop-blur-md border border-emerald-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#059669] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <Clock size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#059669]">Tiket Antrean Sedang Berjalan</h4>
                <span className="text-[10px] text-emerald-800 font-mono font-bold bg-emerald-100/60 px-2 py-0.5 rounded-full">
                  Hari ini
                </span>
              </div>
              <p className="text-xs text-[#12241E] mt-1 leading-relaxed font-medium">
                Nomor antrean Anda <strong className="font-mono text-[#059669]">A-{String(activeVisit.visit.queueNumber).padStart(3, '0')}</strong> bersama{' '}
                {activeVisit.visit.doctor?.name}. Sisa antrean di depan Anda:{' '}
                <span className="font-bold text-[#059669]">{activeVisit.queueAhead} pasien</span>.
              </p>
            </div>
          </div>
        )}

        {/* Notifikasi Pembayaran / Rekam Medis Terakhir */}
        {history?.visits && history.visits.length > 0 && (
          <div className="flex items-start gap-3.5 p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(5,150,105,0.04)]">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/60 text-[#059669] flex items-center justify-center font-bold text-xs shrink-0">
              <CheckCircle2 size={18} className="text-[#059669]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#12241E]">Kunjungan Medis Selesai</h4>
                <span className="text-[10px] text-[#5A6E65] font-mono">Terbaru</span>
              </div>
              <p className="text-xs text-[#5A6E65] mt-1 leading-relaxed font-medium">
                Catatan konsultasi, diagnosis dokter, dan riwayat resep obat Anda telah tersimpan aman di Rekam Medis.
              </p>
            </div>
          </div>
        )}

        {/* Notifikasi Selamat Datang */}
        <div className="flex items-start gap-3.5 p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(5,150,105,0.04)]">
          <div className="w-10 h-10 rounded-2xl bg-[#059669] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            <Bell size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#12241E]">Selamat Datang di ReyClinic</h4>
              <span className="text-[10px] text-[#5A6E65] font-mono">Sistem</span>
            </div>
            <p className="text-xs text-[#5A6E65] mt-1 leading-relaxed font-medium">
              Akun pasien Anda siap digunakan untuk mengambil nomor antrean digital, konsultasi poli, dan pembayaran non-tunai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
