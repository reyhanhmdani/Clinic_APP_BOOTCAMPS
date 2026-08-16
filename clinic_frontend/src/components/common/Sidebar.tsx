import React from 'react';
import { useNavigate } from 'react-router';
import { logoutService, getCurrentUser } from '../../services/authService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoute?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeRoute = '/dashboard' }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userInitials = currentUser?.username
    ? currentUser.username.slice(0, 3).toUpperCase()
    : 'REY';
  const userName = currentUser?.username ? currentUser.username.toUpperCase() : 'REY ADMIN';
  const userRole = currentUser?.role || 'ADMIN KLINIK';

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      logoutService();
      onClose();
      navigate('/login');
    }
  };

  const navItems = [
    { label: 'Dashboard', icon: 'grid_view', path: '/dashboard' },
    { label: 'Data Pasien', icon: 'groups', path: '/dashboard/patients' },
    { label: 'Konsultasi Dokter', icon: 'stethoscope', path: '/dashboard/consultations' },
    { label: 'Tagihan Kasir', icon: 'payments', path: '/dashboard/invoices' },
    { label: 'Farmasi & Obat', icon: 'medication', path: '/dashboard/medicines' },
    { label: 'Data Dokter', icon: 'badge', path: '/dashboard/doctors' },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Mobile Slide-Over Drawer Container */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-72 bg-[#fefcf8] border-r-4 border-[#18181b] shadow-[8px_0px_0px_#18181b] z-50 md:hidden flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b-3 border-[#18181b]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#a3e635] border-2 border-[#18181b] flex items-center justify-center text-[#18181b] shadow-[2px_2px_0px_#18181b]">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  spa
                </span>
              </div>
              <div>
                <span className="font-black text-lg text-[#18181b] tracking-tight uppercase block">ReyClinic</span>
                <span className="text-[10px] font-black text-[#71717a] uppercase tracking-wider">Sistem Rawat Jalan</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-white border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] text-[#18181b] hover:bg-[#fde047] active:translate-y-0.5 transition-all cursor-pointer font-black"
              aria-label="Close Menu"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 my-5 p-3 bg-[#fef08a] border-3 border-[#18181b] shadow-[3px_3px_0px_#18181b]">
            <div className="w-10 h-10 bg-[#a3e635] text-[#18181b] font-black text-xs flex items-center justify-center border-2 border-[#18181b] shrink-0 shadow-[1px_1px_0px_#18181b]">
              {userInitials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-[#18181b] truncate uppercase">{userName}</p>
              <p className="text-[10px] font-bold text-[#52525b] uppercase tracking-wider">{userRole}</p>
            </div>
          </div>

          {/* Mobile Menu List */}
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive =
                item.path === '/dashboard'
                  ? activeRoute === '/dashboard' || activeRoute === '/'
                  : activeRoute.startsWith(item.path);

              return (
                <a
                  key={item.label}
                  href={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-black border-2 border-[#18181b] uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-[#18181b] text-white shadow-[3px_3px_0px_#a3e635]'
                      : 'bg-white text-[#18181b] hover:bg-[#fde047] hover:shadow-[2px_2px_0px_#18181b]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Mobile Drawer Bottom Actions */}
        <div className="pt-4 border-t-3 border-[#18181b] space-y-2">
          <a
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-black text-[#18181b] bg-white border-2 border-[#18181b] hover:bg-zinc-100 uppercase tracking-wider transition-colors shadow-[2px_2px_0px_#18181b]"
          >
            <span className="material-symbols-outlined text-[19px]">settings</span>
            <span>Pengaturan</span>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black text-white bg-rose-600 border-2 border-[#18181b] hover:bg-rose-700 uppercase tracking-wider transition-colors shadow-[2px_2px_0px_#18181b] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px]">logout</span>
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Fixed Compact Pill Dock Sidebar for Desktop (Vertically Centered on Screen) */}
      <aside className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 w-14 py-3.5 rounded-[32px] bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] flex-col items-center justify-between z-40 gap-2.5 max-h-[85vh] overflow-y-auto scrollbar-none">
        {/* Top Black Circle 4-Dot / Dashboard Button */}
        <a
          href="/dashboard"
          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 border-[#18181b] transition-transform hover:scale-105 shrink-0 ${
            activeRoute === '/dashboard' || activeRoute === '/'
              ? 'bg-[#a3e635] text-[#18181b] font-black shadow-[2px_2px_0px_#18181b]'
              : 'bg-[#18181b] text-white shadow-xs hover:bg-[#a3e635] hover:text-[#18181b]'
          }`}
          title="Dashboard"
        >
          <span className="material-symbols-outlined text-[19px]">grid_view</span>
        </a>

        {/* Center Navigation Menu Icons */}
        <div className="flex flex-col gap-2 items-center w-full my-auto">
          {navItems.slice(1).map((item) => {
            const isActive = activeRoute.startsWith(item.path);

            return (
              <a
                key={item.label}
                href={item.path}
                title={item.label}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#a3e635] text-[#18181b] font-black border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] scale-[1.08]'
                    : 'text-[#52525b] hover:bg-[#fde047] hover:text-[#18181b] hover:border-2 hover:border-[#18181b]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
              </a>
            );
          })}
        </div>

        {/* Bottom Tool Icons & Profile Avatar Badge */}
        <div className="flex flex-col gap-1.5 items-center w-full pt-2 border-t-2 border-[#18181b]/10 shrink-0">
          <a
            href="/dashboard/settings"
            title="Settings"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#52525b] hover:bg-[#fde047] hover:text-[#18181b] hover:border-2 hover:border-[#18181b] transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]">settings</span>
          </a>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#52525b] hover:bg-rose-100 hover:text-rose-600 hover:border-2 hover:border-rose-600 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">logout</span>
          </button>

          {/* User Profile Avatar Badge */}
          <div
            className="w-8 h-8 rounded-full bg-[#a3e635] text-[#18181b] font-black text-[10px] flex items-center justify-center border-2 border-[#18181b] shadow-[1px_1px_0px_#18181b] cursor-pointer shrink-0 mt-0.5"
            title={userName}
          >
            {userInitials}
          </div>
        </div>
      </aside>
    </>
  );
};
