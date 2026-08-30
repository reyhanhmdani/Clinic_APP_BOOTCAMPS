import React from 'react';
import { QrCode, X, CheckCircle2 } from 'lucide-react';

interface CustomerQrisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerQrisModal: React.FC<CustomerQrisModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-center animate-scale-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#061e15] text-[#b4f105] flex items-center justify-center font-bold text-base shadow-2xs">
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Pembayaran QRIS</h3>
              <span className="text-[10px] text-slate-400 font-medium">Scan QRIS melalui aplikasi e-wallet / m-banking</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-all active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dynamic Mock QR Code */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center space-y-3">
          <div className="w-44 h-44 bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=REYCLINIC_QRIS_INVOICE_PAID"
              alt="QRIS Code"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 block">NMID: ID102003004005</span>
            <span className="text-[10px] text-slate-400 font-mono">ReyClinic Central Jakarta</span>
          </div>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-center gap-2 text-left">
          <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
          <span className="text-[11px] font-semibold text-emerald-950">
            Pembayaran otomatis terverifikasi secara instan setelah QR discan.
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#061e15] hover:bg-[#0a2f21] text-[#b4f105] text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
        >
          Tutup & Selesai
        </button>
      </div>
    </div>
  );
};
