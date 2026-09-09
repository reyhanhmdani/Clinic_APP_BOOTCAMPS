import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, ShieldCheck, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCustomerContext } from '../../layouts/CustomerLayout';
import { useGoogleLogin } from '@react-oauth/google';
import { linkGoogleService } from '../../services/authService';
import { toast } from 'sonner';

export const CustomerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const { patient, isNikLinked, openNikModal } = useCustomerContext();
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);

  const handleLinkGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLinkingGoogle(true);
        const updatedUser = await linkGoogleService(tokenResponse.access_token);
        updateUser(updatedUser);
        toast.success('Akun Google berhasil ditautkan!');
      } catch (error: any) {
        toast.error(error.response?.data?.message || error.message || 'Gagal menautkan akun Google');
      } finally {
        setIsLinkingGoogle(false);
      }
    },
    onError: () => {
      toast.error('Penautan akun Google dibatalkan');
    },
  });

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

        {/* Keamanan & Integrasi Akun Google */}
        <div className="border-t border-[#E2E8F0] pt-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F172A]">Integrasi Akun Google</span>
            {user?.googleId ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Terhubung</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Belum Terhubung
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.37 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.04 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.57H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.43l3.78-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.63 1.26 6.57l3.78 2.85c.95-2.83 3.6-4.93 6.96-4.93z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">Google Single Sign-On</p>
                <p className="text-[11px] text-slate-500 truncate">
                  {user?.googleId
                    ? 'Akun Google aktif untuk akses cepat 1-klik'
                    : 'Tautkan akun Google untuk kemudahan login'}
                </p>
              </div>
            </div>

            {!user?.googleId && (
              <button
                type="button"
                disabled={isLinkingGoogle}
                onClick={() => handleLinkGoogle()}
                className="py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {isLinkingGoogle ? 'Menautkan...' : 'Hubungkan'}
              </button>
            )}
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
