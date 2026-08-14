import React, { useState } from 'react';
import type { Patient, Doctor, Gender } from '../../types/clinic';
import { createPatientService } from '../../services/patientService';
import { createVisitService } from '../../services/visitService';

interface CreateVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients?: Patient[];
  doctors?: Doctor[];
  onSubmit?: (data: any) => void;
}

export const CreateVisitModal: React.FC<CreateVisitModalProps> = ({ isOpen, onClose, patients = [], doctors = [] }) => {
  const [patientMode, setPatientMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter hanya dokter yang status praktiknya aktif
  const activeDoctors = doctors.filter((d) => d.isActive !== false);

  // 1. Form State DULU
  const [newPatient, setNewPatient] = useState({
    name: '',
    gender: 'MALE',
    age: '',
    phone: '',
    address: '',
  });

  // 2. BARU Handler Function
  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await createPatientService({ ...newPatient, gender: newPatient.gender as Gender, age: Number(newPatient.age) });
      setNewPatient({
        name: '',
        gender: 'MALE',
        age: '',
        phone: '',
        address: '',
      });
      onClose();
      window.location.reload();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Gagal meregistrasi pasien baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await createVisitService({
        patientId: Number(selectedPatientId),
        doctorId: Number(selectedDoctorId),
      });
      onClose();
      window.location.reload();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Gagal mendaftarkan antrian pasien.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl p-6 border-3 border-[#18181b] shadow-[8px_8px_0px_#18181b] max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header Modal ala PZN */}
        <div className="flex justify-between items-start pb-4 border-b-2 border-[#18181b]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-[#a3e635] border-2 border-[#18181b] flex items-center justify-center text-[#18181b] shadow-[2px_2px_0px_#18181b] shrink-0">
              <span className="material-symbols-outlined text-[22px]">person_add</span>
            </div>
            <div>
              <div className="inline-block bg-[#fde047] text-[#18181b] font-black text-[9px] px-2 py-0.5 border-2 border-[#18181b] shadow-[1px_1px_0px_#18181b] uppercase tracking-wider mb-0.5">
                PENDAFTARAN RAWAT JALAN
              </div>
              <h2 className="text-lg md:text-xl font-black text-[#18181b] tracking-tight uppercase">
                ANTREAN PASIEN BARU
              </h2>
              <p className="text-xs text-[#52525b] font-bold">
                Masukkan pasien ke dalam alur pemeriksaan klinik hari ini
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-white border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] flex items-center justify-center text-[#18181b] hover:bg-rose-500 hover:text-white transition-all cursor-pointer font-black"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="p-3 bg-[#fecdd3] border-2 border-[#18181b] text-xs font-black text-[#9f1239] shadow-[2px_2px_0px_#18181b] flex items-center justify-between">
            <span>⚠️ {errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs text-[#9f1239] underline font-black cursor-pointer uppercase"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Tab Pilihan: Pasien Terdaftar vs Pasien Baru */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPatientMode('EXISTING')}
            className={`flex-1 py-2.5 px-3 border-2 border-[#18181b] text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              patientMode === 'EXISTING'
                ? 'bg-[#a3e635] text-[#18181b] shadow-[3px_3px_0px_#18181b]'
                : 'bg-white text-[#18181b] hover:bg-[#fde047]/40'
            }`}
          >
            🔍 Pasien Terdaftar (Lama)
          </button>
          <button
            type="button"
            onClick={() => setPatientMode('NEW')}
            className={`flex-1 py-2.5 px-3 border-2 border-[#18181b] text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              patientMode === 'NEW'
                ? 'bg-[#fde047] text-[#18181b] shadow-[3px_3px_0px_#18181b]'
                : 'bg-white text-[#18181b] hover:bg-[#fde047]/40'
            }`}
          >
            ✨ Registrasi Pasien Baru
          </button>
        </div>

        <form onSubmit={patientMode === 'EXISTING' ? handleCreateVisit : handleCreatePatient} className="space-y-4">
          {patientMode === 'EXISTING' ? (
            /* Mode 1: Pilih Pasien Terdaftar & Dokter Tujuan */
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-black text-[#18181b] uppercase tracking-wider">
                  Pilih Pasien Terdaftar <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[2px_2px_0px_#18181b] cursor-pointer"
                  required
                >
                  <option value="">-- Pilih Pasien --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.noRm || `RM-${p.id}`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilih Dokter Tujuan */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-[#18181b] uppercase tracking-wider">
                  Pilih Dokter Tujuan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[2px_2px_0px_#18181b] cursor-pointer"
                  required
                >
                  <option value="">-- Pilih Dokter Spesialis --</option>
                  {activeDoctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.spesialis})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            /* Mode 2: Form Input Pasien Baru */
            <div className="space-y-3.5 p-4 border-2 border-[#18181b] bg-[#fefcf8] shadow-[3px_3px_0px_#18181b]">
              {/* Auto-Generated No RM Badge Info */}
              <div className="p-2.5 bg-[#a3e635]/20 border-2 border-[#18181b] flex items-center justify-between text-xs font-bold text-[#18181b]">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">pin</span>
                  <span>No. Rekam Medis (No RM)</span>
                </span>
                <span className="bg-[#a3e635] px-2 py-0.5 border border-[#18181b] font-black text-[10px] uppercase">
                  Auto-Generated
                </span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-[#18181b] uppercase tracking-wider">
                  Nama Lengkap Pasien <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[1px_1px_0px_#18181b]"
                  required={patientMode === 'NEW'}
                />
              </div>

              {/* Grid 2 Kolom: Umur Pasien & Jenis Kelamin */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-[#18181b] uppercase tracking-wider">
                    Umur (Tahun) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 30"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[1px_1px_0px_#18181b]"
                    required={patientMode === 'NEW'}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black text-[#18181b] uppercase tracking-wider">
                    Jenis Kelamin <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none shadow-[1px_1px_0px_#18181b] cursor-pointer"
                  >
                    <option value="MALE">Laki-Laki (MALE)</option>
                    <option value="FEMALE">Perempuan (FEMALE)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-[#18181b] uppercase tracking-wider">
                  No. Telepon / WA (Phone)
                </label>
                <input
                  type="text"
                  placeholder="08123456789"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[1px_1px_0px_#18181b]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-[#18181b] uppercase tracking-wider">
                  Alamat Lengkap (Address)
                </label>
                <textarea
                  rows={2}
                  placeholder="Jl. Merdeka No. 45, Jakarta..."
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#18181b] bg-white text-xs font-medium text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[1px_1px_0px_#18181b]"
                />
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t-2 border-[#18181b]/10 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border-2 border-[#18181b] bg-white text-xs font-black uppercase text-[#18181b] hover:bg-zinc-100 transition-all cursor-pointer shadow-[2px_2px_0px_#18181b]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="neubrutal-btn-primary px-5 py-2.5 text-xs font-black text-[#18181b] border-2 border-[#18181b] cursor-pointer shadow-[3px_3px_0px_#18181b] uppercase tracking-wider disabled:opacity-50"
            >
              {patientMode === 'EXISTING' ? '+ Simpan & Masukkan Antrian' : '+ Simpan Data Pasien Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
