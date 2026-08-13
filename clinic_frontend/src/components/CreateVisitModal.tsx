import React, { useState } from 'react';
import type { Patient, Doctor, Gender } from '../types/clinic';
import { createPatientService } from '../services/patientService';
import { createVisitService } from '../services/visitService';

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
      <div className="neubrutal-card bg-white w-full max-w-xl p-6 border-2 border-[#18181b] shadow-[6px_6px_0px_#18181b] max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex justify-between items-center pb-4 border-b-2 border-[#18181b] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#a3e635] border-2 border-[#18181b] flex items-center justify-center text-[#18181b] font-black shadow-[2px_2px_0px_#18181b]">
              <span className="material-symbols-outlined text-[22px]">person_add</span>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-[#18181b] tracking-tight">
                Pendaftaran Antrian Pasien Baru
              </h2>
              <p className="text-xs text-[#52525b] font-bold">
                Masukkan pasien ke dalam antrian periksa klinik hari ini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] flex items-center justify-center text-[#18181b] hover:bg-[#fde047] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-100 border-2 border-[#18181b] text-xs font-black text-rose-700 shadow-[2px_2px_0px_#18181b] flex items-center justify-between">
            <span>⚠️ {errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-700 underline font-bold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Tab Pilihan: Pasien Terdaftar vs Pasien Baru */}
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setPatientMode('EXISTING')}
            className={`flex-1 py-2.5 px-3 rounded-xl border-2 border-[#18181b] text-xs font-black transition-all cursor-pointer ${
              patientMode === 'EXISTING'
                ? 'bg-[#a3e635] text-[#18181b] shadow-[2px_2px_0px_#18181b]'
                : 'bg-white text-[#18181b] hover:bg-zinc-100'
            }`}
          >
            🔍 Pasien Terdaftar (Lama)
          </button>
          <button
            type="button"
            onClick={() => setPatientMode('NEW')}
            className={`flex-1 py-2.5 px-3 rounded-xl border-2 border-[#18181b] text-xs font-black transition-all cursor-pointer ${
              patientMode === 'NEW'
                ? 'bg-[#fde047] text-[#18181b] shadow-[2px_2px_0px_#18181b]'
                : 'bg-white text-[#18181b] hover:bg-zinc-100'
            }`}
          >
            ✨ Registrasi Pasien Baru
          </button>
        </div>

        <form onSubmit={patientMode === 'EXISTING' ? handleCreateVisit : handleCreatePatient} className="space-y-4">
          {patientMode === 'EXISTING' ? (
            /* Mode 1: Pilih Pasien Terdaftar & Dokter Tujuan */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#18181b] mb-1.5 uppercase tracking-wider">
                  Pilih Pasien Terdaftar *
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none shadow-[2px_2px_0px_#18181b]"
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

              {/* Pilih Dokter Tujuan (HANYA MUNCUL DI MODE PASIEN TERDAFTAR) */}
              <div>
                <label className="block text-xs font-black text-[#18181b] mb-1.5 uppercase tracking-wider">
                  Pilih Dokter Tujuan *
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none shadow-[2px_2px_0px_#18181b]"
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
            /* Mode 2: Form Input Pasien Baru (Sesuai Field Schema Prisma Patient) */
            <div className="space-y-3.5 p-4 rounded-xl border-2 border-[#18181b] bg-[#fefcf8] shadow-[2px_2px_0px_#18181b]">
              {/* Auto-Generated No RM Badge Info */}
              <div className="p-2.5 rounded-lg bg-[#a3e635]/20 border-2 border-[#18181b] flex items-center justify-between text-xs font-bold text-[#18181b]">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">pin</span>
                  <span>No. Rekam Medis (No RM)</span>
                </span>
                <span className="bg-[#a3e635] px-2 py-0.5 rounded border border-[#18181b] font-black text-[10px]">
                  Auto-Generated
                </span>
              </div>

              <div>
                <label className="block text-xs font-black text-[#18181b] mb-1">Nama Lengkap Pasien *</label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-[#18181b] bg-white text-xs font-semibold focus:outline-none shadow-[1px_1px_0px_#18181b]"
                  required={patientMode === 'NEW'}
                />
              </div>

              {/* Grid 2 Kolom: Umur Pasien & Jenis Kelamin */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#18181b] mb-1">Umur Pasien (Tahun) *</label>
                  <input
                    type="number"
                    placeholder="Contoh: 30"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border-2 border-[#18181b] bg-white text-xs font-semibold focus:outline-none shadow-[1px_1px_0px_#18181b]"
                    required={patientMode === 'NEW'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#18181b] mb-1">Jenis Kelamin *</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 rounded-lg border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none shadow-[1px_1px_0px_#18181b]"
                  >
                    <option value="MALE">Laki-Laki (MALE)</option>
                    <option value="FEMALE">Perempuan (FEMALE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#18181b] mb-1">No. Telepon / WA (phone)</label>
                <input
                  type="text"
                  placeholder="08123456789"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-[#18181b] bg-white text-xs font-semibold focus:outline-none shadow-[1px_1px_0px_#18181b]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#18181b] mb-1">Alamat Lengkap (address)</label>
                <textarea
                  rows={2}
                  placeholder="Jl. Merdeka No. 45, Jakarta..."
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-[#18181b] bg-white text-xs font-medium focus:outline-none shadow-[1px_1px_0px_#18181b]"
                />
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t-2 border-[#18181b]/10 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border-2 border-[#18181b] bg-white text-xs font-extrabold text-[#18181b] hover:bg-zinc-100 transition-all cursor-pointer shadow-[2px_2px_0px_#18181b]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="neubrutal-btn-primary px-5 py-2.5 rounded-xl text-xs font-black text-[#18181b] cursor-pointer shadow-[3px_3px_0px_#18181b]"
            >
              {patientMode === 'EXISTING' ? '+ Simpan & Masukkan Antrian' : '+ Simpan Data Pasien Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
