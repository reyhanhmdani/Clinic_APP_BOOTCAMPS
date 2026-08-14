import React from 'react';
import { getCurrentUser } from '../../services/authService';

interface TopAppBarProps {
  onToggleSidebar: () => void;
  onAddPatientVisit?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ onToggleSidebar, onAddPatientVisit }) => {
  const currentUser = getCurrentUser();
  const displayName = currentUser?.username ? currentUser.username.toUpperCase() : 'REY';

  const formattedDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 w-full">
      {/* Top Left: Logo + Tag + Title */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="flex items-center gap-3.5">
          {/* Main Spa Logo Badge */}
          <div className="w-13 h-13 rounded-2xl bg-[#a3e635] border-3 border-[#18181b] flex items-center justify-center text-[#18181b] shadow-[3px_3px_0px_#18181b] shrink-0">
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              spa
            </span>
          </div>
          <div>
            <div className="inline-block bg-[#fde047] text-[#18181b] font-black text-[9px] px-2 py-0.5 border-2 border-[#18181b] shadow-[1px_1px_0px_#18181b] uppercase tracking-wider mb-0.5">
              RAWAT JALAN KLINIK
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#18181b] tracking-tight uppercase">
              HELLO, {displayName}!
            </h1>
            <p className="text-xs md:text-sm text-[#52525b] font-bold">
              Halaman Utama Dashboard Operasional ReyClinic
            </p>
          </div>
        </div>

        {/* Mobile Hamburger Navigation Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden p-2.5 bg-white text-[#18181b] border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] hover:bg-[#d9f99d] transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>
      </div>

      {/* Top Right: Realtime Date Badge & Primary Action Button */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Realtime Date & Clinic Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 bg-white border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] text-xs font-black text-[#18181b] shrink-0">
          <span className="material-symbols-outlined text-[16px] text-[#50604f]">calendar_today</span>
          <span>{formattedDate}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80] border border-black animate-pulse ml-1" title="Klinik Buka (Sistem Aktif)" />
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onAddPatientVisit}
          className="neubrutal-btn-primary px-4 py-2.5 text-xs font-black text-[#18181b] border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] hover:scale-[1.02] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>+ Tambah Antrian Pasien</span>
        </button>
      </div>
    </header>
  );
};
