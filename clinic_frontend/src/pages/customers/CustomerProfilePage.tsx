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
    <div className="space-y-4 animate-fade-in text-[#0F172A]">
      {/* Profile Card (Clinical Frosted Glass) */}
      <div className="bg-white/95 backdrop-blur-xl border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(14,90,89,0.04)] space-y-4">
        {/* Avatar & Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0E5A59] via-[#106967] to-[#2EC4B6] text-white flex items-center justify-center font-bold text-lg shadow-[0_4px_16px_rgba(14,90,89,0.2)] shrink-0">
            <User size={28} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-[#0F172A] truncate">
              {patient?.name || user?.username}
            </h3>
            <p className="text-xs text-[#64748B] font-mono mt-0.5">
              {patient?.noRm ? `No. RM: ${patient.noRm}` : 'Belum Terdaftar No. RM'}
            </p>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border mt-1.5 ${
                isNikLinked
                  ? 'bg-[#F0FAF9] text-[#0E5A59] border-[#CCEBE9]'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              <ShieldCheck size={12} className={isNikLinked ? 'text-[#2EC4B6]' : 'text-amber-600'} />
              <span>{isNikLinked ? 'Identitas Terverifikasi' : 'Wajib Lengkapi NIK'}</span>
            </span>
          </div>
        </div>

        {/* Data Identitas Pasien */}
        <div className="border-t border-[#E2E8F0] pt-3.5 space-y-2.5 text-xs font-medium">
          <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
            <span className="text-[#64748B]">16-Digit NIK</span>
            <span className="font-mono font-bold text-[#0F172A]">{patient?.nik || '-'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
            <span className="text-[#64748B]">Jenis Kelamin</span>
            <span className="font-bold text-[#0F172A]">
              {patient?.gender === 'MALE' ? 'Laki-Laki' : patient?.gender === 'FEMALE' ? 'Perempuan' : '-'}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
            <span className="text-[#64748B]">Usia Pasien</span>
            <span className="font-bold text-[#0F172A]">{patient?.age ? `${patient.age} Tahun` : '-'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
            <span className="text-[#64748B]">Nomor WhatsApp</span>
            <span className="font-bold text-[#0F172A] font-mono">{patient?.phone || '-'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#64748B]">Alamat Domisili</span>
            <span className="font-bold text-[#0F172A] text-right max-w-[200px] truncate">
              {patient?.address || '-'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-[#E2E8F0] flex gap-2.5">
          <button
            type="button"
            onClick={openNikModal}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0E5A59] via-[#004140] to-[#0E5A59] hover:from-[#004140] hover:to-[#002B2A] text-white text-xs font-extrabold transition-all cursor-pointer shadow-[0_4px_14px_rgba(14,90,89,0.25)] active:scale-95 text-center"
          >
            Edit Data Pasien
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1"
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
