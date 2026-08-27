import React from 'react';
import { WifiOff, AlertTriangle, RotateCw, LogIn } from 'lucide-react';

interface ApiErrorCardProps {
  errorMessage?: string | null;
  onRetry?: () => void;
}

export const ApiErrorCard: React.FC<ApiErrorCardProps> = ({
  errorMessage = 'Gagal memuat data dari server API',
  onRetry,
}) => {
  return (
    <div className="p-6 sm:p-7 bg-rose-50 border border-rose-200 shadow-sm rounded-2xl my-4 text-left relative overflow-hidden transition-all duration-300">
      {/* Decorative Background Icon */}
      <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none text-rose-900">
        <WifiOff size={140} />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
        {/* Animated Warning Icon Container */}
        <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <AlertTriangle size={24} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-rose-200 uppercase">
              Connection Error
            </span>
            <span className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse"></span> 401 Unauthorized
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Gagal Memuat Data Dashboard ReyClinic
          </h3>

          <p className="text-xs font-medium text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {errorMessage || 'Terjadi kesalahan saat menghubungkan ke Server API Backend.'} Silakan login kembali untuk mendapatkan Akses Token JWT yang valid.
          </p>
        </div>

        {/* Action Button Container */}
        <div className="flex items-center gap-2.5 shrink-0 mt-3 sm:mt-0 w-full sm:w-auto">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer w-full sm:w-auto"
            >
              <RotateCw size={15} />
              <span>Coba Lagi</span>
            </button>
          )}

          <a
            href="/login"
            className="btn-forest px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto text-center inline-flex"
          >
            <LogIn size={15} />
            <span>Halaman Login</span>
          </a>
        </div>
      </div>
    </div>
  );
};
