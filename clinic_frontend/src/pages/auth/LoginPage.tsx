import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, AlertCircle, ShieldCheck, HeartPulse, Clock } from 'lucide-react';
import { loginService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const authData = await loginService({ email, password });
      loginStore(authData.user as any, authData.token);

      if (authData.user.role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/customers');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Email atau kata sandi tidak sesuai!';
      setErrorMessage(msg);
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
  
        {/* sisi kiri */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-7 text-white pr-6">
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
              spesialis, dan layanan pembayaran mandiri tanpa antre.
            </p>
          </div>

          {/* 3 Hospital Benefit Cards */}
          <div className="grid grid-cols-3 gap-3.5 pt-2">
            <div className="bg-white/10 border border-white/10 backdrop-blur-md p-4 rounded-2xl space-y-2 hover:bg-white/15 transition-all">
              <div className="w-8 h-8 rounded-xl bg-[#b4f105] text-[#061e15] flex items-center justify-center font-bold">
                <HeartPulse size={18} />
              </div>
              <h4 className="text-xs font-bold text-white">Poli Lengkap</h4>
              <p className="text-[11px] text-slate-300 leading-tight">Dokter spesialis berpengalaman</p>
            </div>

            <div className="bg-white/10 border border-white/10 backdrop-blur-md p-4 rounded-2xl space-y-2 hover:bg-white/15 transition-all">
              <div className="w-8 h-8 rounded-xl bg-[#b4f105] text-[#061e15] flex items-center justify-center font-bold">
                <Clock size={18} />
              </div>
              <h4 className="text-xs font-bold text-white">Antrean Cepat</h4>
              <p className="text-[11px] text-slate-300 leading-tight">Pantau antrean dari HP</p>
            </div>

            <div className="bg-white/10 border border-white/10 backdrop-blur-md p-4 rounded-2xl space-y-2 hover:bg-white/15 transition-all">
              <div className="w-8 h-8 rounded-xl bg-[#b4f105] text-[#061e15] flex items-center justify-center font-bold">
                <ShieldCheck size={18} />
              </div>
              <h4 className="text-xs font-bold text-white">Rekam Medis</h4>
              <p className="text-[11px] text-slate-300 leading-tight">Data riwayat akurat</p>
            </div>
          </div>
        </div>

        {/* sisi kanan */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto flex flex-col justify-between min-h-screen lg:min-h-0 bg-[#061e15] lg:bg-transparent">
          {/* Mobile Top Hero */}
          <div className="relative h-[22vh] sm:h-[25vh] lg:hidden w-full flex flex-col justify-between p-5 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
              style={{ backgroundImage: `url('/images/clinic_bg.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#061e15]/85 via-[#061e15]/75 to-[#061e15]" />

            <div className="relative z-10 flex items-center justify-end w-full">
              <div className="inline-flex items-center gap-1.5 bg-[#b4f105]/20 border border-[#b4f105]/30 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-[#b4f105]">
                <span>✱</span> Portal Masuk
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center text-center pb-1">
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-1.5">
                Rey<span className="text-[#b4f105]">Clinic</span>
              </h1>
            </div>
          </div>

          {/* Playora White Card */}
          <div className="flex-1 lg:flex-initial w-full bg-white rounded-t-[36px] lg:rounded-[36px] shadow-2xl p-6 sm:p-8 flex flex-col justify-between border border-slate-100 animate-slide-up">
            <div className="space-y-4">
              {/* Header Title (Persis Playora) */}
              <div className="text-center space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back!</h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Log in to track your queue, find specialists, book visits, and access medical records.
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2.5">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Inputs (Persis Playora) */}
              <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                {/* Username / Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 ml-1 block">Username / Email</label>
                  <input
                    type="email"
                    required
                    placeholder="andhikagonzales@gmail.com"
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
                      placeholder="••••••••••••••••"
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

                  <div className="text-right pt-0.5">
                    <button
                      type="button"
                      onClick={() => toast.info('Fitur reset kata sandi akan dikirim ke email terdaftar.')}
                      className="text-[11px] font-bold text-[#5e773f] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {/* Primary Pill Button (Persis Playora Olive/Forest Green) */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#5e773f] hover:bg-[#4d6333] text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                >
                  <span>{isLoading ? 'Verifying...' : 'Login'}</span>
                </button>
              </form>

              {/* 2 Social Login Buttons (Persis Playora) */}
              <div className="space-y-2.5 pt-2">
                {/* 1. Login with Google */}
                <button
                  type="button"
                  onClick={() => {
                    setEmail('budi@gmail.com');
                    setPassword('budi123');
                  }}
                  className="w-full py-3 px-4 rounded-full bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 text-xs font-bold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer"
                >
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
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.19 0 10.04 0 12s.46 3.81 1.26 5.42l4.02-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Login with Google</span>
                </button>

                {/* 2. Login with Apple ID */}
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@gmail.com');
                    setPassword('admin123');
                  }}
                  className="w-full py-3 px-4 rounded-full bg-slate-100/90 hover:bg-slate-200/80 text-slate-800 text-xs font-bold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.64 1.35-.56.65-1.05 1.71-.92 2.72 1.01.08 2.03-.47 2.64-1.22z" />
                  </svg>
                  <span>Login with Apple ID </span>
                </button>
              </div>
            </div>

            <div className="pt-3 pb-1 text-center text-xs text-slate-500 shrink-0">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-bold text-[#5e773f] hover:underline cursor-pointer ml-1"
              >
                Register here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
