import React from 'react';
import { useNavigate } from 'react-router';
import { logoutService } from '../../services/authService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoute?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeRoute = '/dashboard' }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Apakah anda yakin ingin keluar dari sistem?')) {
      logoutService();
      onClose();
      navigate('/login');
    }
  };

  const navItems = [
    { label: 'Dashboard', icon: 'grid_view', path: '/dashboard' },
    { label: 'Antrean Pasien', icon: 'groups', path: '/dashboard/queue' },
    { label: 'Konsultasi Dokter', icon: 'stethoscope', path: '/dashboard/consultations' },
    { label: 'Tagihan Kasir', icon: 'payments', path: '/dashboard/invoices' },
    { label: 'Farmasi & Obat', icon: 'medication', path: '/dashboard/pharmacy' },
    { label: 'Data Dokter', icon: 'badge', path: '/dashboard/doctors' },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 md:hidden transition-opacity"
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
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#18181b]">
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-[#50604f] text-[30px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                spa
              </span>
              <span className="font-black text-lg text-[#18181b] tracking-tight">ReyClinic</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] text-[#18181b] hover:bg-[#fde047] transition-colors cursor-pointer"
              aria-label="Close Menu"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 my-5 p-3 rounded-xl bg-[#fef08a] border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b]">
            <div className="w-10 h-10 rounded-full bg-[#a3e635] text-[#18181b] font-black text-xs flex items-center justify-center border-2 border-[#18181b] shrink-0 shadow-[1px_1px_0px_#18181b]">
              REY
            </div>
            <div>
              <p className="text-xs font-black text-[#18181b]">Rey Receptionist</p>
              <p className="text-[11px] font-bold text-[#52525b]">Front Desk Admin</p>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black border-2 border-[#18181b] transition-all ${
                    isActive
                      ? 'bg-[#a3e635] text-[#18181b] shadow-[3px_3px_0px_#18181b]'
                      : 'bg-white text-[#18181b] hover:bg-[#fde047]/30 hover:shadow-[2px_2px_0px_#18181b]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Mobile Drawer Bottom Actions */}
        <div className="pt-4 border-t-2 border-[#18181b] space-y-2">
          <a
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black text-[#18181b] bg-white border-2 border-[#18181b] hover:bg-zinc-100 transition-colors shadow-[2px_2px_0px_#18181b]"
          >
            <span className="material-symbols-outlined text-[19px]">settings</span>
            Pengaturan
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-rose-500 border-2 border-[#18181b] hover:bg-rose-600 transition-colors shadow-[2px_2px_0px_#18181b] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px]">logout</span>
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Fixed Compact Pill Dock Sidebar for Desktop (Vertically Centered on Screen) */}
      <aside className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 w-14 py-3.5 rounded-[32px] bg-white border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b] flex-col items-center justify-between z-40 gap-2.5 max-h-[85vh] overflow-y-auto scrollbar-none">
        {/* Top Black Circle 4-Dot / Dashboard Button */}
        <a
          href="/dashboard"
          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 border-[#18181b] transition-transform hover:scale-105 shrink-0 ${
            activeRoute === '/dashboard' || activeRoute === '/'
              ? 'bg-[#a3e635] text-[#18181b] font-black shadow-[2px_2px_0px_#18181b]'
              : 'bg-[#18181b] text-white shadow-xs'
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
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#52525b] hover:bg-[#fde047] hover:text-[#18181b] transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]">settings</span>
          </a>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#52525b] hover:bg-rose-100 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">logout</span>
          </button>

          {/* Receptionist Profile Avatar Badge */}
          <div
            className="w-8 h-8 rounded-full bg-[#a3e635] text-[#18181b] font-black text-[10px] flex items-center justify-center border-2 border-[#18181b] shadow-[1px_1px_0px_#18181b] cursor-pointer shrink-0 mt-0.5"
            title="Rey Receptionist"
          >
            Rey
          </div>
        </div>
      </aside>
    </>
  );
};
