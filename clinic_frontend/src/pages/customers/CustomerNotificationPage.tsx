import React from 'react';
import { Bell, CheckCircle2, Clock } from 'lucide-react';
import { useCustomerContext } from '../../layouts/CustomerLayout';

export const CustomerNotificationPage: React.FC = () => {
  const { activeVisit, history } = useCustomerContext();

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-1">
        <h2 className="text-base font-bold text-slate-900">Pusat Pemberitahuan</h2>
        <p className="text-xs text-slate-500">Update status antrean dan jadwal klinik secara real-time.</p>
      </div>

      <div className="space-y-2.5">
        {/* Notifikasi Tiket Aktif */}
        {activeVisit?.visit && (
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#061e15] text-[#b4f105] flex items-center justify-center font-bold text-xs shrink-0">
              <Clock size={15} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-950">Tiket Antrean Aktif</h4>
                <span className="text-[10px] text-emerald-700 font-mono">Hari ini</span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5 leading-snug">
                Nomor antrean Anda <strong>A-{String(activeVisit.visit.queueNumber).padStart(3, '0')}</strong> bersama{' '}
                {activeVisit.visit.doctor?.name}. Sisa antrean di depan: {activeVisit.queueAhead} orang.
              </p>
            </div>
          </div>
        )}

        {/* Notifikasi Pembayaran Terakhir */}
        {history?.visits && history.visits.length > 0 && (
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
              <CheckCircle2 size={15} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">Kunjungan Medis Tercatat</h4>
                <span className="text-[10px] text-slate-400 font-mono">Terbaru</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                Pemeriksaan terakhir Anda telah tersimpan rapi di rekam medis digital.
              </p>
            </div>
          </div>
        )}

        {/* Notifikasi Selamat Datang */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#061e15] text-[#b4f105] flex items-center justify-center font-bold text-xs shrink-0">
            <Bell size={15} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">Selamat Datang di ReyClinic</h4>
              <span className="text-[10px] text-slate-400 font-mono">Sistem</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-snug">
              Akun Anda telah siap digunakan untuk mengambil antrean dan memantau rekam medis digital secara mandiri.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
