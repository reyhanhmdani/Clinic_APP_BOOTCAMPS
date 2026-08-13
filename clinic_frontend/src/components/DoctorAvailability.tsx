import React from 'react';
import type { Doctor } from '../types/clinic';

interface DoctorAvailabilityProps {
  doctors: Doctor[];
}

export const DoctorAvailability: React.FC<DoctorAvailabilityProps> = ({ doctors }) => {
  // Limit 5 dokter untuk tampilan Dashboard
  const displayedDoctors = doctors.slice(0, 5);

  return (
    <div className="neubrutal-card p-6 flex-1">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-[#18181b] tracking-tight">
            Status Dokter Aktif
          </h2>
          <p className="text-xs text-[#52525b] font-medium mt-0.5">
            Daftar dokter yang jadwal praktiknya aktif hari ini
          </p>
        </div>
        <span className="material-symbols-outlined text-[#18181b] cursor-pointer hover:text-[#50604f]">
          more_horiz
        </span>
      </div>

      {/* Doctor Cards */}
      <div className="space-y-3.5">
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
              className="flex items-center justify-between p-3 rounded-xl border-2 border-[#18181b] bg-white shadow-[2px_2px_0px_#18181b] hover:bg-[#fef08a]/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-[#a3e635] border-2 border-[#18181b] text-[#18181b] font-black text-xs flex items-center justify-center shadow-[1px_1px_0px_#18181b]">
                    {initials}
                  </div>
                  {/* Status Dot */}
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#18181b] rounded-full ${
                      isActive ? 'bg-[#4ade80]' : 'bg-zinc-400'
                    }`}
                  />
                </div>
                <div>
                  <p className="text-xs font-black text-[#18181b]">
                    {doctor.name}
                  </p>
                  <p className="text-[11px] font-semibold text-[#52525b]">
                    {doctor.spesialis}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {isActive ? (
                <span className="bg-[#4ade80] text-[#18181b] border-2 border-[#18181b] font-black text-[11px] px-2.5 py-1 rounded-md shadow-[1px_1px_0px_#18181b]">
                  Available
                </span>
              ) : (
                <span className="bg-zinc-200 text-[#52525b] border-2 border-[#18181b] font-extrabold text-[11px] px-2.5 py-1 rounded-md">
                  Offline
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Schedule Button */}
      <button className="w-full mt-6 py-2.5 rounded-xl neubrutal-btn-primary text-xs font-black cursor-pointer shadow-[3px_3px_0px_#18181b] hover:scale-[1.01] transition-all">
        Lihat Semua Dokter Aktif ➔
      </button>
    </div>
  );
};
