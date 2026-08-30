import React from 'react';
import { Stethoscope, X, User, CheckCircle2 } from 'lucide-react';
import type { Doctor } from '../../types/clinic';

interface CustomerBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  selectedDoctorId: number;
  onSelectDoctor: (id: number) => void;
  onSubmitBooking: (e: React.FormEvent) => void;
}

export const CustomerBookingModal: React.FC<CustomerBookingModalProps> = ({
  isOpen,
  onClose,
  doctors,
  selectedDoctorId,
  onSelectDoctor,
  onSubmitBooking,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-scale-in">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#061e15] text-[#b4f105] flex items-center justify-center font-bold text-base shadow-2xs">
              <Stethoscope size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Pendaftaran Antrean Poli</h3>
              <span className="text-[10px] text-slate-400 font-medium">Pilih dokter dan jam kedatangan</span>
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

        {/* Form Booking */}
        <form onSubmit={onSubmitBooking} className="space-y-3 pt-1">
          {/* Pilih Dokter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 ml-1 block">Pilih Dokter Jaga</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {doctors.length > 0 ? (
                doctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDoctor(doc.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      selectedDoctorId === doc.id
                        ? 'bg-slate-50 border-[#061e15] ring-1 ring-[#061e15]'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-2xs ${
                          doc.gender === 'FEMALE'
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        }`}
                      >
                        <User size={16} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">{doc.name}</h4>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {doc.spesialis} • Biaya: Rp {doc.fee.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    {selectedDoctorId === doc.id && <CheckCircle2 size={16} className="text-[#061e15]" />}
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">Memuat daftar dokter...</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#061e15] hover:bg-[#0a2f21] text-[#b4f105] text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
            >
              Konfirmasi Antrean
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
