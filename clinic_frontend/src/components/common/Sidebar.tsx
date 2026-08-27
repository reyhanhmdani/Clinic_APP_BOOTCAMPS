import React from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { LayoutGrid, Users, Stethoscope, Pill, LogOut, X } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeRoute = location.pathname;

  const { user, logout } = useAuthStore();
  const userName = user?.username ? user.username : "Administrator";
  const userEmail = user?.email || "admin@reyclinic.com";

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
      logout();
      onClose();
      navigate("/login");
    }
  };

  const navMenuItems = [
    { label: "Dashboard", Icon: LayoutGrid, path: "/dashboard" },
  ];

  const navMasterItems = [
    { label: "Data Pasien", Icon: Users, path: "/dashboard/patients" },
    { label: "Data Dokter", Icon: Stethoscope, path: "/dashboard/doctors" },
    { label: "Katalog Obat", Icon: Pill, path: "/dashboard/medicines" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container: Deep Forest Green (#061e15) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#061e15] text-slate-200 border-r border-[#092c1f] shadow-2xl z-50 flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6 overflow-y-auto">
          {/* Header Brand with Electric Lime Asterisk Star */}
          <div className="flex items-center justify-between pb-3 pt-1">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <span className="text-[#b4f105] text-2xl font-black transition-transform duration-300 group-hover:rotate-45 leading-none select-none">
                ✱
              </span>
              <span className="font-extrabold text-lg text-white tracking-tight">
                ReyClinic
              </span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Section: MENU */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400/70 tracking-widest uppercase px-3 block">
              Menu
            </span>
            <nav className="space-y-1">
              {navMenuItems.map((item) => {
                const isActive =
                  item.path === "/dashboard"
                    ? activeRoute === "/dashboard" || activeRoute === "/dashboard/"
                    : activeRoute.startsWith(item.path);

                const ItemIcon = item.Icon;

                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? "bg-[#092c1f] text-white shadow-sm font-bold"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <ItemIcon
                      size={18}
                      className={isActive ? "text-[#b4f105]" : "text-slate-400"}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Section: MASTER DATA */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400/70 tracking-widest uppercase px-3 block">
              Master Data & Layanan
            </span>
            <nav className="space-y-1">
              {navMasterItems.map((item) => {
                const isActive = activeRoute.startsWith(item.path);
                const ItemIcon = item.Icon;

                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? "bg-[#092c1f] text-white shadow-sm font-bold"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <ItemIcon
                      size={18}
                      className={isActive ? "text-[#b4f105]" : "text-slate-400"}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom User Card */}
        <div className="pt-3 border-t border-[#092c1f]">
          <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#b4f105] text-[#061e15] font-black text-xs flex items-center justify-center shrink-0">
                {userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate capitalize">{userName}</p>
                <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Keluar"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
