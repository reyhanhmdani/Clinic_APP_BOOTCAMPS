import React from 'react';
import { useNavigate } from 'react-router';
import { User, ShieldCheck, LogOut } from 'lucide-react';
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
    <div className="space-y-4 animate-fade-in text-[#12241E]">
      {/* Profile Card (Frosted Glass) */}
      <div className="bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-5 shadow-[0_8px_30px_rgba(5,150,105,0.05)] space-y-4">
        {/* Avatar & Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold text-lg shadow-2xs shrink-0 border border-emerald-200">
            <User size={28} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-[#12241E] truncate">
              {patient?.name || user?.username}
            </h3>
            <p className="text-xs text-[#5A6E65] font-mono mt-0.5">
              {patient?.noRm ? `No. RM: ${patient.noRm}` : 'Belum Terdaftar No. RM'}
            </p>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border mt-1.5 ${
                isNikLinked
                  ? 'bg-emerald-50 text-[#059669] border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              <ShieldCheck size={12} className={isNikLinked ? 'text-[#059669]' : 'text-amber-600'} />
              <span>{isNikLinked ? 'Identitas Terverifikasi' : 'Wajib Lengkapi NIK'}</span>
            </span>
          </div>
        </div>

        {/* Data Identitas Pasien */}
        <div className="border-t border-emerald-950/6 pt-3.5 space-y-2.5 text-xs font-medium">
          <div className="flex justify-between py-1 border-b border-emerald-950/4">
            <span className="text-[#5A6E65]">16-Digit NIK</span>
            <span className="font-mono font-bold text-[#12241E]">{patient?.nik || '-'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-emerald-950/4">
            <span className="text-[#5A6E65]">Jenis Kelamin</span>
            <span className="font-bold text-[#12241E]">
              {patient?.gender === 'MALE' ? 'Laki-Laki' : patient?.gender === 'FEMALE' ? 'Perempuan' : '-'}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-emerald-950/4">
            <span className="text-[#5A6E65]">Usia Pasien</span>
            <span className="font-bold text-[#12241E]">{patient?.age ? `${patient.age} Tahun` : '-'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-emerald-950/4">
            <span className="text-[#5A6E65]">Nomor WhatsApp</span>
            <span className="font-bold text-[#12241E] font-mono">{patient?.phone || '-'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#5A6E65]">Alamat Domisili</span>
            <span className="font-bold text-[#12241E] text-right max-w-[200px] truncate">
              {patient?.address || '-'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-emerald-950/6 flex gap-2.5">
          <button
            type="button"
            onClick={openNikModal}
            className="flex-1 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-extrabold transition-all cursor-pointer shadow-xs active:scale-95 text-center"
          >
            Edit Data Pasien
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1"
            title="Keluar Akun"
          >
            <LogOut size={14} />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
