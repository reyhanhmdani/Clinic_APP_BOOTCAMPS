import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { Menu, Plus, Maximize2, Minimize2, Calendar } from 'lucide-react';
import { getCurrentUser } from '../../services/authService';

interface TopAppBarProps {
  onToggleSidebar: () => void;
  onAddPatientVisit?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ onToggleSidebar, onAddPatientVisit }) => {
  const currentUser = getCurrentUser();
  const displayName = currentUser?.username ? currentUser.username : 'Admin';
  const location = useLocation();

  // Fullscreen State & Listener
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  };

  const formattedDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Dynamic Page Title & Subtitle based on Route
  const getPageInfo = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard/patients')) {
      return {
        title: 'Data Pasien',
        subtitle: 'Database rekam medis & profil pasien klinik.',
      };
    }
    if (path.startsWith('/dashboard/doctors')) {
      return {
        title: 'Data Dokter',
        subtitle: 'Kelola jadwal praktek & jasa tenaga medis.',
      };
    }
    if (path.startsWith('/dashboard/medicines')) {
      return {
        title: 'Katalog Obat',
        subtitle: 'Kelola inventori farmasi & persediaan apotek.',
      };
    }
    if (path.startsWith('/dashboard/consultations')) {
      return {
        title: 'Pemeriksaan Medis',
        subtitle: 'Sesi konsultasi, anamnesis, & diagnosa dokter.',
      };
    }
    if (path.startsWith('/dashboard/invoices')) {
      return {
        title: 'Kasir & Pembayaran',
        subtitle: 'Pelunasan faktur tagihan dan cetak nota transaksi.',
      };
    }
    return {
      title: 'Dashboard',
      subtitle: 'Sistem manajemen rekam medis dan antrean pasien klinik secara presisi.',
    };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header className="mb-4 sm:mb-6 w-full space-y-2 sm:space-y-0">
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Sisi Kiri: Hamburger Menu + Page Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden w-9 h-9 bg-white text-slate-700 border border-slate-200/80 rounded-full shadow-xs hover:bg-slate-50 active:scale-90 active:translate-y-0.5 active:shadow-inner transition-all duration-150 ease-out cursor-pointer flex items-center justify-center shrink-0 select-none"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
              {title}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 font-normal truncate hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Sisi Kanan: Action Button + Fullscreen + Tanggal + User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Tombol Tambah Antrean (Mobile, Tablet, & Desktop) */}
          {onAddPatientVisit && (
            <button
              type="button"
              onClick={onAddPatientVisit}
              className="btn-lime flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold shadow-xs cursor-pointer select-none active:scale-95 transition-all"
              title="Daftarkan Pasien Baru"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span className="hidden sm:inline">Tambah Antrean</span>
              <span className="sm:hidden text-[11px] font-extrabold">+ Antrean</span>
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-white border border-slate-200/80 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs active:scale-88 active:translate-y-0.5 active:bg-slate-100 active:shadow-inner transition-all duration-150 ease-out cursor-pointer flex items-center justify-center select-none shrink-0"
            title={isFullscreen ? 'Keluar Layar Penuh (Esc)' : 'Tampilan Layar Penuh (Fullscreen)'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Date Pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs select-none shrink-0">
            <Calendar size={14} className="text-slate-400" />
            <span>{formattedDate}</span>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white border border-slate-200/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-xs select-none shrink-0">
            <div className="w-6 h-6 rounded-full bg-[#061e15] text-[#b4f105] text-[10px] font-bold flex items-center justify-center shrink-0">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-slate-800 capitalize hidden xs:inline sm:inline">
              {displayName}
            </span>
          </div>
        </div>
      </div>

      {/* Subtitle khusus mobile */}
      <p className="text-[11px] text-slate-400 font-normal truncate sm:hidden">
        {subtitle}
      </p>
    </header>
  );
};
