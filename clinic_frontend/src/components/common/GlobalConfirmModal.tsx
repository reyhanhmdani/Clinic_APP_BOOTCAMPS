import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, HelpCircle, X } from 'lucide-react';
import { useConfirmStore } from '../../stores/confirmStore';

export const GlobalConfirmModal: React.FC = () => {
  const isOpen = useConfirmStore((state) => state.isOpen);
  const options = useConfirmStore((state) => state.options);
  const closeConfirm = useConfirmStore((state) => state.closeConfirm);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        closeConfirm(false);
      } else if (e.key === 'Enter') {
        closeConfirm(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeConfirm]);

  if (!isOpen) return null;

  const variant = options.variant || 'primary';

  // Konfigurasi icon & styling berdasarkan varian aksi
  const variantConfig = {
    danger: {
      icon: <AlertTriangle size={22} className="text-rose-600 shrink-0" />,
      iconBg: 'bg-rose-50 border border-rose-100',
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 focus:ring-rose-400',
    },
    warning: {
      icon: <AlertCircle size={22} className="text-amber-600 shrink-0" />,
      iconBg: 'bg-amber-50 border border-amber-100',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200 focus:ring-amber-400',
    },
    success: {
      icon: <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />,
      iconBg: 'bg-emerald-50 border border-emerald-100',
      confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 focus:ring-emerald-400',
    },
    primary: {
      icon: <HelpCircle size={22} className="text-[#b4f105] shrink-0" />,
      iconBg: 'bg-[#061e15]',
      confirmBtn: 'bg-[#061e15] hover:bg-[#0a2f21] text-[#b4f105] shadow-emerald-900/10 focus:ring-emerald-400',
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div
        className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header dengan Icon & Tombol Silang */}
        <div className="flex items-start justify-between">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${variantConfig.iconBg}`}>
            {variantConfig.icon}
          </div>
          <button
            type="button"
            onClick={() => closeConfirm(false)}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-all active:scale-90"
            aria-label="Tutup dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Konten Judul & Deskripsi */}
        <div className="space-y-1.5 pt-1">
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {options.title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {options.description}
          </p>
        </div>

        {/* Tombol Aksi Batal & Konfirmasi */}
        <div className="pt-2 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => closeConfirm(false)}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            {options.cancelText || 'Batal'}
          </button>
          <button
            type="button"
            onClick={() => closeConfirm(true)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer focus:ring-2 focus:outline-none ${variantConfig.confirmBtn}`}
          >
            {options.confirmText || 'Lanjutkan'}
          </button>
        </div>
      </div>
    </div>
  );
};
