import React from 'react';
import type { Doctor } from '../../types/clinic';

interface DoctorAvailabilityProps {
  doctors: Doctor[];
}

export const DoctorAvailability: React.FC<DoctorAvailabilityProps> = ({ doctors }) => {
  // Limit 5 dokter untuk tampilan Dashboard
  const displayedDoctors = doctors.slice(0, 5);

  return (
    <div className="p-6 bg-white border-3 border-[#18181b] shadow-[5px_5px_0px_#18181b] flex-1 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-[#18181b]/10 pb-3">
        <div>
          <div className="inline-block bg-[#fde047] text-[#18181b] text-[9px] font-black tracking-wider px-2 py-0.5 border-2 border-[#18181b] shadow-[1px_1px_0px_#18181b] uppercase mb-1">
            DOKTER JAGA
          </div>
          <h2 className="text-xl font-black text-[#18181b] tracking-tight uppercase">Status Dokter Aktif</h2>
          <p className="text-xs text-[#52525b] font-bold">
            Jadwal praktik dokter aktif bertugas hari ini
          </p>
        </div>
        <span className="material-symbols-outlined text-[#18181b] cursor-pointer hover:text-[#50604f]">more_horiz</span>
      </div>

      {/* Doctor Cards */}
      <div className="space-y-3">
        {displayedDoctors.map((doctor) => {
          const isActive = doctor.isActive ?? true;
          const initials = doctor.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 3);

          return (
            <div
              key={doctor.id}
              className="flex items-center justify-between p-3 border-2 border-[#18181b] bg-white shadow-[2px_2px_0px_#18181b] hover:bg-[#fef08a]/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 bg-[#a3e635] border-2 border-[#18181b] text-[#18181b] font-black text-xs flex items-center justify-center shadow-[1px_1px_0px_#18181b]">
                    {initials}
                  </div>
                  {/* Status Dot */}
                  <div
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-[#18181b] ${
                      isActive ? 'bg-[#4ade80]' : 'bg-zinc-400'
                    }`}
                  />
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-[#18181b]">{doctor.name}</p>
                  <p className="text-[11px] font-bold text-[#52525b]">{doctor.spesialis}</p>
                </div>
              </div>

              {/* Status Badge */}
              {isActive ? (
                <span className="bg-[#4ade80] text-[#18181b] border-2 border-[#18181b] font-black text-[10px] px-2 py-0.5 shadow-[1px_1px_0px_#18181b] uppercase">
                  READY
                </span>
              ) : (
                <span className="bg-zinc-200 text-[#52525b] border-2 border-[#18181b] font-black text-[10px] px-2 py-0.5 uppercase">
                  OFFLINE
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Schedule Button */}
      <button
        type="button"
        className="w-full mt-2 py-3 bg-[#18181b] text-white text-xs font-black uppercase tracking-wider hover:bg-[#a3e635] hover:text-[#18181b] border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] transition-all cursor-pointer"
      >
        Lihat Semua Dokter Aktif ➔
      </button>
    </div>
  );
};
