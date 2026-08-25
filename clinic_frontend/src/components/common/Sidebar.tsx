import React from "react";
import { Link, useNavigate, useLocation } from "react-router";
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
  const userInitials = user?.username ? user.username.slice(0, 2).toUpperCase() : "AD";
  const userName = user?.username ? user.username.toUpperCase() : "ADMIN KLINIK";
  const userRole = user?.role || "ADMIN";

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
      logout();
      onClose();
      navigate("/login");
    }
  };

  // Navigasi utama persis seperti 4 Tab Utama di Mobile
  const navItems = [
    { label: "Dashboard Antrean", icon: "grid_view", path: "/dashboard" },
    { label: "Data Pasien", icon: "groups", path: "/dashboard/patients" },
    { label: "Data Dokter", icon: "badge", path: "/dashboard/doctors" },
    { label: "Katalog Obat", icon: "medication", path: "/dashboard/medicines" },
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

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r-4 border-[#18181b] shadow-[6px_0px_0px_#18181b] z-50 flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-5">
          {/* Header Brand */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#18181b]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#a3e635] border-2 border-[#18181b] flex items-center justify-center text-[#18181b] shadow-[2px_2px_0px_#18181b]">
                <span className="material-symbols-outlined text-[24px]">local_hospital</span>
              </div>
              <div>
                <span className="font-black text-base text-[#18181b] uppercase tracking-tight block">
                  ReyClinic
                </span>
                <span className="text-[9px] font-black text-[#71717a] uppercase tracking-wider">
                  Rawat Jalan
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1 bg-[#f4f3ed] border-2 border-[#18181b] rounded-lg text-[#18181b] hover:bg-rose-100"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-2.5 p-2.5 bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl shadow-[2px_2px_0px_#18181b]">
            <div className="w-9 h-9 bg-[#a3e635] text-[#18181b] font-black text-xs flex items-center justify-center border-2 border-[#18181b] rounded-lg shrink-0">
              {userInitials}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-black text-[#18181b] truncate">{userName}</p>
              <p className="text-[9px] font-bold text-[#71717a] uppercase tracking-wider">
                {userRole}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                item.path === "/dashboard"
                  ? activeRoute === "/dashboard" || activeRoute === "/dashboard/"
                  : activeRoute.startsWith(item.path);

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 border-[#18181b] text-xs font-black uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-[#18181b] text-white shadow-[3px_3px_0px_#a3e635] translate-x-1"
                      : "bg-white text-[#18181b] hover:bg-[#fef08a] hover:shadow-[2px_2px_0px_#18181b]"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? "text-[#a3e635]" : "text-[#18181b]"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-[#a3e635] border border-black" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t-2 border-[#18181b]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-black text-white bg-[#f43f5e] border-2 border-[#18181b] rounded-xl hover:bg-rose-600 active:translate-y-0.5 shadow-[2px_2px_0px_#18181b] uppercase tracking-wider cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
