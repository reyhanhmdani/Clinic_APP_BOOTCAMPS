import React from 'react';
import { Clock } from 'lucide-react';
import type { Visit } from '../../types/clinic';

interface PatientBannerCardProps {
  activeVisit?: Visit;
  isLoading?: boolean;
}

export const PatientBannerCard: React.FC<PatientBannerCardProps> = ({ activeVisit, isLoading }) => {
  const formattedTime = activeVisit?.checkInTime
    ? new Date(activeVisit.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : '08:00 WIB';

  const patientName = activeVisit?.patient?.name || (isLoading ? 'Memuat data pasien...' : 'Pasien Tidak Ditemukan');
  const initials = activeVisit?.patient?.name ? activeVisit.patient.name.slice(0, 2).toUpperCase() : 'PA';

  return (
    <div className="p-5 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-4">
        {/* Patient Avatar Initials */}
        <div className="w-12 h-12 bg-[#051c12] text-[#b4f105] font-bold text-sm flex items-center justify-center rounded-2xl shadow-xs shrink-0">
          {initials}
        </div>

        {/* Patient Details */}
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-900 capitalize">{patientName}</h2>
            <span className="bg-slate-100 text-slate-700 font-semibold text-[10px] px-2.5 py-0.5 rounded-full uppercase border border-slate-200">
              {activeVisit?.patient?.gender === 'MALE' ? 'Laki-Laki' : 'Perempuan'} (
              {activeVisit?.patient?.age ?? '-'} Thn)
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            No RM: <span className="font-mono font-bold text-slate-800">{activeVisit?.patient?.noRm || '-'}</span> • Dokter: <span className="font-bold text-slate-800">{activeVisit?.doctor?.name || '-'}</span> (
              {activeVisit?.doctor?.spesialis || '-'})
          </p>
        </div>
      </div>

      {/* Check-in Time Badge */}
      <div className="text-xs font-semibold text-slate-700 bg-slate-50 px-3.5 py-2 border border-slate-200/80 rounded-xl flex items-center gap-2 shadow-xs shrink-0">
        <Clock size={15} className="text-slate-400" />
        <span>Waktu Masuk: {formattedTime}</span>
      </div>
    </div>
  );
};
