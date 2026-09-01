import React, { useState, useMemo } from 'react';
import { Stethoscope, X, User, CheckCircle2, Search, Sparkles } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDoctors = useMemo(() => {
    if (!searchTerm.trim()) return doctors;
    const term = searchTerm.toLowerCase();
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(term) ||
        d.spesialis.toLowerCase().includes(term) ||
        (d.room && d.room.toLowerCase().includes(term)),
    );
  }, [doctors, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl p-5 max-w-md w-full space-y-4 shadow-[0_20px_50px_rgba(15,76,58,0.18)] border border-white/90 animate-scale-in text-[#12241E]">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-emerald-950/6 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center font-bold text-sm">
              <Stethoscope size={16} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#12241E] leading-tight">Pendaftaran Antrean Poli</h3>
              <span className="text-[10px] text-[#5A6E65] font-medium">Pilih dokter dan jadwal konsultasi hari ini</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#F6F8F6] text-[#5A6E65] hover:text-[#12241E] flex items-center justify-center cursor-pointer transition-all active:scale-90"
          >
            <X size={15} />
          </button>
        </div>

        {/* Search Bar Input (Capsule Pill) */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6E65] pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari dokter, spesialis (Gigi, Umum)..."
            className="w-full pl-9 pr-8 py-2.5 bg-[#F6F8F6] border border-emerald-950/10 rounded-full text-xs font-semibold text-[#12241E] placeholder:text-[#5A6E65] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:bg-white transition-all"
            autoFocus
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6E65] hover:text-[#12241E] p-0.5"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between text-[11px] px-1 text-[#5A6E65] font-medium -mt-1">
          <span>Pilih salah satu dokter:</span>
          <span className="font-extrabold text-[#059669]">{filteredDoctors.length} dokter siaga</span>
        </div>

        {/* Form Booking */}
        <form onSubmit={onSubmitBooking} className="space-y-3.5">
          {/* List Dokter (Listing Rows) */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc) => {
                const isSelected = selectedDoctorId === doc.id;
                const initials = doc.name
                  .split(' ')
                  .map((n) => n[0])
                  .filter((_, i) => i < 2)
                  .join('')
                  .toUpperCase();

                return (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDoctor(doc.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50/80 border-[#059669] shadow-xs'
                        : 'bg-white border-emerald-950/6 hover:border-emerald-950/15 hover:bg-[#F6F8F6]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 border ${
                          isSelected
                            ? 'bg-[#059669] text-white border-[#059669]'
                            : doc.gender === 'FEMALE'
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : 'bg-emerald-50 text-[#059669] border-emerald-200'
                        }`}
                      >
                        {initials || <User size={14} />}
                      </div>

                      {/* Info Dokter */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-extrabold text-[#12241E] truncate leading-tight">{doc.name}</h4>
                          <span className="text-[10px] font-bold text-[#059669] shrink-0">
                            ★ 4.95
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5A6E65] font-medium truncate mt-0.5">
                          {doc.spesialis} {doc.room ? `• Ruang ${doc.room}` : ''}
                        </p>
                        <p className="text-[11px] font-bold text-[#12241E] mt-0.5 font-mono">
                          Rp {Number(doc.fee).toLocaleString('id-ID')}{' '}
                          <span className="text-[10px] text-[#5A6E65] font-normal">/ kunjungan</span>
                        </p>
                      </div>
                    </div>

                    {/* Radio Checkmark */}
                    <div className="shrink-0 ml-2">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold shadow-xs">
                          <CheckCircle2 size={13} className="stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-emerald-950/15" />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-[#5A6E65] bg-[#F6F8F6] rounded-2xl border border-dashed border-emerald-950/15">
                Tidak ada dokter dengan kata kunci "{searchTerm}".
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-emerald-950/6 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#F6F8F6] hover:bg-emerald-50 text-[#12241E] text-xs font-bold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={filteredDoctors.length === 0}
              className="flex-1 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-extrabold transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Konfirmasi Antrean</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
