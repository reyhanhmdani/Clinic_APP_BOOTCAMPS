import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  HeartPulse,
  Stethoscope,
  Clock,
} from 'lucide-react';
import { loginService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const authData = await loginService({ email, password });
      loginStore(authData.user as any, authData.token);

      // cek apakah dia admin atau customer
      if (authData.user.role === 'ADMIN') {
        navigate('/dashboard');
      } else if (authData.user.role === 'CUSTOMER') {
        navigate('/portal');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Email atau kata sandi tidak sesuai!';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans antialiased overflow-x-hidden bg-[#061e15]">
      {/* 1. Background Hospital Photo with Warm Cinematic Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
        style={{
          backgroundImage: `url('/images/clinic_bg.jpg')`,
        }}
      />
      {/* Dark Forest & Warm Amber Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#061e15]/95 via-[#061e15]/80 to-[#072418]/60 backdrop-blur-[2px]" />

      {/* 2. Main Responsive Grid Container */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Brand Story & Hospitality Showcase (Hidden on Mobile, Visible on Tablet/Desktop) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between space-y-8 text-white pr-4">
          {/* Header Brand */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-white shadow-xs">
              <span className="text-[#b4f105] text-sm">✱</span>
              <span>ReyClinic Medical Center • Layanan Kesehatan Terpadu</span>
            </div>

            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Pelayanan Medis Modern yang <span className="text-[#b4f105]">Ramah & Nyaman</span> untuk Seluruh Keluarga
            </h1>

            <p className="text-sm xl:text-base text-slate-200/90 font-normal leading-relaxed max-w-xl">
              Portal sistem terpadu untuk efisiensi antrean klinik, rekam medis digital terintegrasi, konsultasi dokter
              spesialis, dan layanan apotek farmasi terpercaya.
            </p>
          </div>

          {/* 3 Hospital Benefit Cards */}
          <div className="grid grid-cols-3 gap-3.5 pt-2">
            <div className="bg-white/10 border border-white/10 backdrop-blur-md p-4 rounded-2xl space-y-2 hover:bg-white/15 transition-all">
              <div className="w-8 h-8 rounded-xl bg-[#b4f105] text-[#061e15] flex items-center justify-center font-bold">
                <HeartPulse size={18} />
              </div>
              <h4 className="text-xs font-bold text-white">Poli Lengkap</h4>
              <p className="text-[11px] text-slate-300 leading-tight">Dokter spesialis & umum berpengalaman</p>
            </div>

            <div className="bg-white/10 border border-white/10 backdrop-blur-md p-4 rounded-2xl space-y-2 hover:bg-white/15 transition-all">
              <div className="w-8 h-8 rounded-xl bg-[#b4f105] text-[#061e15] flex items-center justify-center font-bold">
                <Clock size={18} />
              </div>
              <h4 className="text-xs font-bold text-white">Antrean Cepat</h4>
              <p className="text-[11px] text-slate-300 leading-tight">Pantau antrean secara transparan</p>
            </div>

            <div className="bg-white/10 border border-white/10 backdrop-blur-md p-4 rounded-2xl space-y-2 hover:bg-white/15 transition-all">
              <div className="w-8 h-8 rounded-xl bg-[#b4f105] text-[#061e15] flex items-center justify-center font-bold">
                <ShieldCheck size={18} />
              </div>
              <h4 className="text-xs font-bold text-white">Rekam Medis</h4>
              <p className="text-[11px] text-slate-300 leading-tight">Data riwayat tersimpan aman & akurat</p>
            </div>
          </div>

          {/* Reassurance Footer */}
          <div className="flex items-center gap-3 pt-2 text-xs text-slate-300">
            <div className="w-2 h-2 rounded-full bg-[#b4f105] animate-pulse" />
            <span>Sistem Operasional Aktif • Standar Keamanan Enkripsi Data Medis</span>
          </div>
        </div>

        {/* Right Side: Sleek Modern Login Card */}
        <div className="w-full lg:col-span-5 max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 space-y-6">
            {/* Header Login Card */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#061e15] text-2xl font-black leading-none select-none">✱</span>
                  <span className="font-extrabold text-base text-slate-900 tracking-tight">ReyClinic</span>
                </div>

                <div className="inline-flex items-center gap-1 bg-lime-100/90 text-lime-900 border border-lime-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                  <Sparkles size={11} className="text-lime-700" />
                  <span>Portal Masuk</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight pt-2">Selamat Datang</h2>
              <p className="text-xs text-slate-500 font-normal">
                Silakan masuk untuk mengakses sistem administrasi & layanan klinik
              </p>
            </div>

            {/* Error Message Notification */}
            {errorMessages && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessages}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Email Akun</label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="nama@reyclinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700 block">Kata Sandi</label>
                </div>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-700 flex items-center cursor-pointer p-1"
                    title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-forest w-full py-3 sm:py-3.5 text-xs font-bold cursor-pointer flex items-center justify-center gap-2 rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition-all mt-3 disabled:opacity-50 tracking-wide"
              >
                <LogIn size={16} />
                <span>{isLoading ? 'Memverifikasi Akun...' : 'Masuk ke Sistem'}</span>
              </button>
            </form>

            {/* Support / Help Card for Staff & Patients */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Stethoscope size={13} className="text-slate-400" />
                <span>Pusat Bantuan Klinik</span>
              </span>
              <span className="font-semibold text-slate-600">v2.4 Production</span>
            </div>
          </div>

          {/* Mobile Footer Note */}
          <p className="text-center text-[11px] text-white/60 mt-4 lg:hidden font-medium">
            &copy; {new Date().getFullYear()} ReyClinic Medical Center • Layanan Kesehatan Terpadu
          </p>
        </div>
      </div>
    </div>
  );
};
