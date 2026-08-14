import React from 'react';
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
    <div className="p-5 bg-[#fef08a] border-3 border-[#18181b] shadow-[5px_5px_0px_#18181b] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-4">
        {/* Patient Avatar Initials */}
        <div className="w-12 h-12 bg-[#a3e635] border-2 border-[#18181b] text-[#18181b] font-black text-sm flex items-center justify-center shadow-[2px_2px_0px_#18181b] shrink-0">
          {initials}
        </div>

        {/* Patient Details */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-[#18181b] uppercase">{patientName}</h2>
            <span className="bg-white text-[#18181b] border-2 border-[#18181b] text-[10px] font-black px-2 py-0.5 shadow-[1px_1px_0px_#18181b] uppercase">
              {activeVisit?.patient?.gender === 'MALE' ? 'Laki-Laki' : 'Perempuan'} (
              {activeVisit?.patient?.age ?? '-'} Thn)
            </span>
          </div>
          <p className="text-xs font-bold text-[#52525b] mt-0.5">
            No RM: <span className="font-mono font-black text-[#18181b]">{activeVisit?.patient?.noRm || '-'}</span> | Dokter: <span className="font-black text-[#18181b]">{activeVisit?.doctor?.name || '-'}</span> (
            {activeVisit?.doctor?.spesialis || '-'})
          </p>
        </div>
      </div>

      {/* Check-in Time Badge */}
      <div className="text-xs font-black text-[#18181b] bg-white px-3 py-1.5 border-2 border-[#18181b] flex items-center gap-1.5 shadow-[2px_2px_0px_#18181b] shrink-0 uppercase">
        <span className="material-symbols-outlined text-[16px] text-[#50604f]">schedule</span>
        <span>Masuk: {formattedTime}</span>
      </div>
    </div>
  );
};
