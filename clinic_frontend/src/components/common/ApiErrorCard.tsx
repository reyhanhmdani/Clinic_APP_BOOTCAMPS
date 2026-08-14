import React from 'react';

interface ApiErrorCardProps {
  errorMessage?: string | null;
  onRetry?: () => void;
}

export const ApiErrorCard: React.FC<ApiErrorCardProps> = ({
  errorMessage = 'Gagal memuat data dari server API',
  onRetry,
}) => {
  return (
    <div className="neubrutal-card p-6 sm:p-8 bg-[#ffe4e6] border-2 border-[#18181b] shadow-[5px_5px_0px_#18181b] my-4 text-left relative overflow-hidden transition-all duration-300">
      {/* Decorative Background Icon */}
      <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-[#18181b]">
        <span className="material-symbols-outlined text-[140px]">wifi_off</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
        {/* Animated Warning Icon Container */}
        <div className="w-14 h-14 rounded-2xl bg-[#f43f5e] border-2 border-[#18181b] text-white flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#18181b] animate-bounce">
          <span className="material-symbols-outlined text-[32px]">warning</span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#f43f5e] text-white text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-md border-2 border-[#18181b] shadow-[1px_1px_0px_#18181b] uppercase">
              Connection Error
            </span>
            <span className="text-xs font-extrabold text-[#9f1239] animate-pulse flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#f43f5e] inline-block"></span> 401 Unauthorized
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-black text-[#18181b] tracking-tight">
            Gagal Memuat Data Dashboard ReyClinic
          </h3>

          <p className="text-xs font-semibold text-[#881337] mt-1 max-w-2xl leading-relaxed">
            {errorMessage || 'Terjadi kesalahan saat menghubungkan ke Server API Backend.'} Silakan login kembali untuk mendapatkan Akses Token JWT yang valid.
          </p>
        </div>

        {/* Action Button Container */}
        <div className="flex items-center gap-3 shrink-0 mt-3 sm:mt-0 w-full sm:w-auto">
          {onRetry && (
            <button
              onClick={onRetry}
              className="neubrutal-card-sm px-4 py-2 bg-[#fde047] text-xs font-black text-[#18181b] flex items-center justify-center gap-2 hover:bg-[#fef08a] hover:scale-[1.03] transition-all cursor-pointer w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
              <span>Coba Lagi</span>
            </button>
          )}

          <a
            href="/login"
            className="neubrutal-btn-primary px-4 py-2 text-xs font-black text-[#18181b] flex items-center justify-center gap-2 hover:scale-[1.03] transition-all cursor-pointer w-full sm:w-auto text-center inline-block"
          >
            <span>Halaman Login</span>
          </a>
        </div>
      </div>
    </div>
  );
};
