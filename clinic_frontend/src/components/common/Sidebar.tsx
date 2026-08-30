import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import {
  LayoutGrid,
  Users,
  Stethoscope,
  Pill,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeRoute = location.pathname;

  const { user, logout } = useAuthStore();
  const userName = user?.username ? user.username : 'Administrator';
  const userEmail = user?.email || 'admin@reyclinic.com';

  // Handle Esc key to close mobile sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      logout();
      onClose();
      navigate('/login');
    }
  };

  const navigationItems = [
    { label: 'Dashboard', Icon: LayoutGrid, path: '/dashboard' },
    { label: 'Data Pasien', Icon: Users, path: '/dashboard/patients' },
    { label: 'Data Dokter', Icon: Stethoscope, path: '/dashboard/doctors' },
    // { label: 'Pemeriksaan Medis', Icon: ClipboardList, path: '/dashboard/consultations' },
    // { label: 'Kasir & Invoice', Icon: CreditCard, path: '/dashboard/invoices' },
    { label: 'Katalog Obat', Icon: Pill, path: '/dashboard/medicines' },
  ];

  return (
    <>
      {/* 1. Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* 2. Responsive Sidebar:
             - Desktop (md:): Vertically Centered Floating Capsule Dock (Semua Item + Logout DI DALAM Border)
             - Mobile (< md): Sliding Full-Height Drawer (Scrollable & Touch-Friendly)
      */}
      <aside
        className={`fixed z-50 bg-white border border-slate-200/90 transition-all duration-300 ease-in-out ${
          // DESKTOP: Vertically Centered Pill Dock di Tengah Sisi Kiri
          'md:top-1/2 md:-translate-y-1/2 md:left-4 md:w-16 md:h-fit md:max-h-[92vh] md:rounded-[36px] md:py-4 md:px-2 md:shadow-[0_12px_40px_rgba(0,0,0,0.08)] md:flex md:flex-col md:items-center md:gap-2.5 md:translate-x-0 md:overflow-visible'
        } ${
          // MOBILE: Full Sliding Drawer (w-64, scrollable, max-h-screen)
          'top-3 bottom-3 left-3 w-64 max-w-[85vw] p-5 rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.18)] flex flex-col justify-between overflow-y-auto'
        } ${
          // Mobile Animation Toggle
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-[115%] opacity-0 md:opacity-100 md:translate-x-0'
        }`}
      >
        {/* Top Header Section */}
        <div className="flex flex-col gap-4 w-full md:items-center md:gap-2.5">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between w-full md:justify-center">
            <Link
              to="/dashboard"
              onClick={onClose}
              className="flex items-center gap-3 group select-none cursor-pointer"
              title="ReyClinic Admin"
            >
              <div className="w-10 h-10 rounded-full bg-[#061e15] text-[#b4f105] flex items-center justify-center font-black text-lg shadow-xs group-hover:scale-105 transition-all shrink-0">
                <span>✱</span>
              </div>
              <div className="md:hidden">
                <span className="font-extrabold text-base text-slate-900 tracking-tight block leading-tight">
                  Rey<span className="text-[#107c41]">Clinic</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  Admin Portal
                </span>
              </div>
            </Link>

            {/* Mobile Close Button (X) */}
            <button
              type="button"
              onClick={onClose}
              className="md:hidden w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer active:scale-90"
              aria-label="Tutup Menu Navigasi"
            >
              <X size={16} />
            </button>
          </div>

          {/* Micro Divider */}
          <div className="w-full md:w-8 h-px bg-slate-100 my-0.5 md:my-0" />

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 md:gap-2 w-full md:items-center">
            {navigationItems.map((item) => {
              const isActive =
                item.path === '/dashboard'
                  ? activeRoute === '/dashboard' || activeRoute === '/dashboard/'
                  : activeRoute.startsWith(item.path);

              const ItemIcon = item.Icon;

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-2xl transition-all duration-200 cursor-pointer relative group ${
                    // Mobile: Wide clickable row | Desktop: Circular icon button
                    'px-3.5 py-2.5 md:w-10 md:h-10 md:p-0 md:justify-center md:rounded-full'
                  } ${
                    isActive
                      ? 'bg-[#061e15] text-[#b4f105] shadow-md font-bold'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 active:scale-95'
                  }`}
                  aria-label={item.label}
                >
                  <ItemIcon
                    size={19}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    className="shrink-0"
                  />

                  {/* Text Label on Mobile */}
                  <span className="text-xs font-semibold md:hidden whitespace-nowrap">
                    {item.label}
                  </span>

                  {/* Desktop Active Notch Indicator */}
                  {isActive && (
                    <span className="hidden md:block absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-[#b4f105] rounded-r-full shadow-xs" />
                  )}

                  {/* Desktop Floating Tooltip ala Spotbank */}
                  <span className="hidden md:block absolute left-14 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 shadow-lg whitespace-nowrap z-50 translate-x-1 group-hover:translate-x-0">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Profile on Mobile + Logout (Enclosed in Border) */}
        <div className="flex flex-col gap-2.5 w-full md:items-center pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 mt-2 md:mt-0">
          {/* Micro Divider for Desktop */}
          <div className="hidden md:block w-8 h-px bg-slate-100 my-0.5" />

          {/* User Info (Visible on Mobile) */}
          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-100 rounded-2xl md:hidden">
            <div className="w-8 h-8 rounded-full bg-[#061e15] text-[#b4f105] font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate capitalize leading-tight">{userName}</p>
              <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">{userEmail}</p>
            </div>
          </div>

          {/* Logout Action Button */}
          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center gap-3 text-rose-600 hover:bg-rose-50 rounded-2xl transition-all cursor-pointer relative group active:scale-95 ${
              'px-3.5 py-2.5 md:w-10 md:h-10 md:p-0 md:justify-center md:rounded-full text-slate-400 hover:text-rose-600'
            }`}
            title="Keluar Akun"
            aria-label="Logout"
          >
            <LogOut size={18} className="shrink-0" />
            
            {/* Text on Mobile */}
            <span className="text-xs font-bold md:hidden">Keluar Akun</span>

            {/* Tooltip on Desktop */}
            <span className="hidden md:block absolute left-14 bg-rose-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 shadow-lg whitespace-nowrap z-50">
              Keluar Akun
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
