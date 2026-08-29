import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, AlertCircle, ShieldCheck, HeartPulse, Clock } from 'lucide-react';
import { registerService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  // state input form
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // state feedback & loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // handle submit regis
  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !email.trim() || !password) {
      setErrorMessage('Semua form harus diisi ya');
      return;
    }

    if (password.length < 5) {
      setErrorMessage('Kata sandi minimal 5 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok, samakan dulu ya');
      return;
    }

    setIsLoading(true);

    try {
      const authData = await registerService({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      loginStore(authData.user as any, authData.token);
      navigate('/customers');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Gagal mendaftar akun. Silakan coba lagi';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-0 lg:p-8 font-sans antialiased overflow-x-hidden bg-[#061e15] selection:bg-[#b4f105] selection:text-[#061e15]">
      {/* 1. Desktop Ambient Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-100 opacity-90 hidden lg:block"
        style={{ backgroundImage: `url('/images/clinic_bg.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#061e15]/95 via-[#061e15]/90 to-[#072418]/85 hidden lg:block backdrop-blur-[2px]" />

      {/* 2. Main Responsive Grid Container */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-screen lg:min-h-0">
        {/* ============================================================ */}
        {/* SISI KIRI (DESKTOP ONLY SHOWCASE)                            */}
        {/* ============================================================ */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-7 text-white pr-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-white shadow-xs">
              <span className="text-[#b4f105] text-sm">✱</span>
              <span>ReyClinic Medical Center • Registrasi Pasien</span>
            </div>

            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Daftar Akun & Nikmati Kemudahan <span className="text-[#b4f105]">Antrean Mandiri</span>
            </h1>

            <p className="text-sm xl:text-base text-slate-200/90 font-normal leading-relaxed max-w-xl">
              Daftarkan diri Anda untuk mengambil nomor antrean dokter langsung dari HP, pantau estimasi antrean secara
              live, dan akses riwayat resep medis terpadu.
            </p>
          </div>

          {/* 3 Hospital Benefit Cards */}
          <div className="grid grid-cols-3 gap-3.5 pt-2">
            <div className="bg-white/10 border border-white/10 backdrop-blur-md p-4 rounded-2xl space-y-2 hover:bg-white/15 transition-all">
              <div className="w-8 h-8 rounded-xl bg-[#b4f105] text-[#061e15] flex items-center justify-center font-bold">
                <HeartPulse size={18} />
              </div>
              <h4 className="text-xs font-bold text-white">Auto Link NIK</h4>
              <p className="text-[11px] text-slate-300 leading-tight">Sinkron data rekam medis</p>
            </div>

            <div className="bg-white/10 border border-white/10 backdrop-blur-md p-4 rounded-2xl space-y-2 hover:bg-white/15 transition-all">
              <div className="w-8 h-8 rounded-xl bg-[#b4f105] text-[#061e15] flex items-center justify-center font-bold">
                <Clock size={18} />
              </div>
              <h4 className="text-xs font-bold text-white">Live Tracker</h4>
              <p className="text-[11px] text-slate-300 leading-tight">Pantau nomor antrean live</p>
            </div>

            <div className="bg-white/10 border border-white/10 backdrop-blur-md p-4 rounded-2xl space-y-2 hover:bg-white/15 transition-all">
              <div className="w-8 h-8 rounded-xl bg-[#b4f105] text-[#061e15] flex items-center justify-center font-bold">
                <ShieldCheck size={18} />
              </div>
              <h4 className="text-xs font-bold text-white">QRIS Instan</h4>
              <p className="text-[11px] text-slate-300 leading-tight">Bayar tagihan praktis</p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SISI KANAN (PLAYORA AUTH CARD)                               */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto flex flex-col min-h-screen lg:min-h-0 bg-[#061e15] lg:bg-transparent">
          {/* Mobile Top Hero (Proporsional 25vh) */}
          <div className="relative h-[25vh] sm:h-[28vh] lg:hidden w-full flex flex-col justify-between p-5 overflow-hidden shrink-0">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
              style={{ backgroundImage: `url('/images/clinic_bg.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#061e15]/85 via-[#061e15]/75 to-[#061e15]" />

            <div className="relative z-10 flex items-center justify-end w-full">
              <div className="inline-flex items-center gap-1.5 bg-[#b4f105]/20 border border-[#b4f105]/30 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-[#b4f105]">
                <span>✱</span> Portal Pasien
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center text-center pb-2">
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-1.5">
                Rey<span className="text-[#b4f105]">Clinic</span>
              </h1>
            </div>
          </div>

          {/* Playora White Card (Proporsional & Padat) */}
          <div className="flex-1 lg:flex-initial w-full bg-white rounded-t-[36px] lg:rounded-[36px] shadow-2xl p-6 sm:p-7 flex flex-col justify-between border border-slate-100 animate-slide-up">
            <div className="space-y-3.5">
              {/* Header Title */}
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account!</h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Sign up to book doctor appointments, track live queues, and view medical records.
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Inputs */}
              <form onSubmit={handleRegister} className="space-y-3 pt-1">
                {/* Username */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 ml-1 block">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: fajar_pratama"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 border border-transparent text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] focus:ring-1 focus:ring-[#061e15] transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 ml-1 block">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 border border-transparent text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] focus:ring-1 focus:ring-[#061e15] transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 ml-1 block">Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 5 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 pr-12 py-3 rounded-2xl bg-slate-100/80 border border-transparent text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] focus:ring-1 focus:ring-[#061e15] transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-700 text-xs font-bold p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 ml-1 block">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Ketik ulang kata sandi"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 border border-transparent text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] focus:ring-1 focus:ring-[#061e15] transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Primary Pill Button (Register) */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#5e773f] hover:bg-[#4d6333] text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                >
                  <span>{isLoading ? 'Creating Account...' : 'Register'}</span>
                </button>
              </form>
            </div>

            {/* Footer Switcher */}
            <div className="pt-3 pb-1 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-bold text-[#5e773f] hover:underline cursor-pointer ml-1"
              >
                Login here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
