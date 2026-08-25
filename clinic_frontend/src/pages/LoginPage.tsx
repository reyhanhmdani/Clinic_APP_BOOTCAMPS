import React, { useState } from "react";
import { useNavigate } from "react-router";
import { loginService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const authData = await loginService({ email, password });
      loginStore(authData.user as any, authData.token);
      navigate("/dashboard");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Email atau kata sandi tidak sesuai!";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f4f3ed] min-h-screen w-full flex items-center justify-center p-4 sm:p-6 text-[#18181b] font-sans antialiased">
      <div className="w-full max-w-md space-y-6">
        {/* Brand / Logo Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#a3e635] border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] mb-1">
            <span className="material-symbols-outlined text-[32px]">local_hospital</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#18181b] uppercase">
            ReyClinic System
          </h1>
          <p className="text-xs font-bold text-[#52525b]">
            Portal Autentikasi Staf Medis & Administrasi Klinik
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-4 border-[#18181b] shadow-[6px_6px_0px_#18181b] rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b-2 border-[#18181b] pb-3">
            <h2 className="text-sm font-black text-[#18181b] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-emerald-600">key</span>
              <span>Masuk Akun</span>
            </h2>
            <span className="bg-[#fde047] text-[#18181b] text-[10px] font-black px-2.5 py-1 rounded-md border-2 border-[#18181b] shadow-[1px_1px_0px_#18181b]">
              Admin Only
            </span>
          </div>

          {errorMessages && (
            <div className="p-3 rounded-xl bg-[#fecdd3] border-2 border-[#18181b] text-xs font-black text-[#9f1239] shadow-[2px_2px_0px_#18181b] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMessages}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-[#18181b] tracking-wider block">
                Email Pengguna
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[20px] text-[#71717a]">
                  mail
                </span>
                <input
                  type="email"
                  required
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#18181b] bg-[#f4f3ed] text-xs font-bold text-[#18181b] focus:outline-none focus:bg-white transition-all shadow-[2px_2px_0px_#18181b]"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-[#18181b] tracking-wider block">
                Kata Sandi
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[20px] text-[#71717a]">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-[#18181b] bg-[#f4f3ed] text-xs font-bold text-[#18181b] focus:outline-none focus:bg-white transition-all shadow-[2px_2px_0px_#18181b]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#71717a] hover:text-[#18181b] flex items-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Tombol Submit Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#a3e635] text-[#18181b] border-2 border-[#18181b] text-xs font-black cursor-pointer shadow-[3px_3px_0px_#18181b] hover:bg-lime-400 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>{isLoading ? "Memproses Masuk..." : "Masuk ke Sistem Klinik"}</span>
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <p className="text-center text-[11px] font-bold text-[#71717a]">
          &copy; {new Date().getFullYear()} ReyClinic Medical Center
        </p>
      </div>
    </div>
  );
};
