import React from 'react';
import { useNavigate } from 'react-router';
import { User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCustomerContext } from '../../layouts/CustomerLayout';

export const CustomerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { patient, isNikLinked, openNikModal } = useCustomerContext();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
        {/* Avatar & Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-[#061e15] text-[#b4f105] flex items-center justify-center font-bold text-lg shadow-2xs">
            <User size={26} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{patient?.name || user?.username}</h3>
            <p className="text-xs text-slate-400 font-mono">
              {patient?.noRm ? `No. RM: ${patient.noRm}` : 'Belum Ada No. RM'}
            </p>
            <span className="inline-block text-[10px] font-bold text-emerald-800 bg-[#edf3ec] px-2 py-0.5 rounded-full border border-emerald-200/60 mt-1">
              {isNikLinked ? 'Akun Pasien Terverifikasi' : 'Profil Belum Lengkap'}
            </span>
          </div>
        </div>

        {/* Data Identitas */}
        <div className="border-t border-slate-100 pt-3 space-y-2 text-xs font-medium text-slate-700">
          <div className="flex justify-between py-1">
            <span className="text-slate-400">16-Digit NIK</span>
            <span className="font-mono font-bold text-slate-900">{patient?.nik || '-'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Jenis Kelamin</span>
            <span className="font-semibold text-slate-900">
              {patient?.gender === 'MALE' ? 'Laki-Laki' : 'Perempuan'}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Usia</span>
            <span className="font-semibold text-slate-900">{patient?.age || '-'} Tahun</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">No. WhatsApp</span>
            <span className="font-semibold text-slate-900">{patient?.phone || '-'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Alamat Domisili</span>
            <span className="font-semibold text-slate-900 text-right max-w-[200px] truncate">
              {patient?.address || '-'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={openNikModal}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            Edit Data Pasien
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
          >
            Keluar Akun
          </button>
        </div>
      </div>
    </div>
  );
};
