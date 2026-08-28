import React, { useState } from 'react';
import { X, Users } from 'lucide-react';
import type { Patient, Doctor } from '../../types/clinic';
import { useVisitStore } from '../../stores/visitStore';
import { createVisitService } from '../../services/visitService';

interface CreateVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  doctors: Doctor[];
}

export const CreateVisitModal: React.FC<CreateVisitModalProps> = ({
  isOpen,
  onClose,
  patients,
  doctors,
}) => {
  const { fetchVisits } = useVisitStore();

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hanya dokter yang bertatus aktif
  const activeDoctors = doctors.filter((doc) => doc.isActive);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatientId) {
      alert('Pilih pasien terdaftar terlebih dahulu!');
      return;
    }

    if (!selectedDoctorId) {
      alert('Pilih dokter terlebih dahulu!');
      return;
    }

    setIsSubmitting(true);
    try {
      await createVisitService({
        patientId: Number(selectedPatientId),
        doctorId: Number(selectedDoctorId),
      });

      await fetchVisits();
      alert('Antrean pasien berhasil ditambahkan!');

      // Reset form
      setSelectedPatientId('');
      setSelectedDoctorId('');
      onClose();
    } catch (error: any) {
      alert(`Gagal menambah antrean: ${error?.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
          <div>
            <div className="inline-block bg-lime-100 text-lime-900 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-lime-200 uppercase mb-1">
              PENDAFTARAN ANTREAN
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pendaftaran Antrean Pasien
            </h2>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              Pilih pasien terdaftar dan dokter pemeriksa bertugas
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PILIH PASIEN */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Users size={14} className="text-slate-400" />
              <span>Cari & Pilih Pasien Terdaftar *</span>
            </label>
            <select
              required
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#061e15] cursor-pointer"
            >
              <option value="">-- Pilih Rekam Medis Pasien --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.noRm} - {p.name} {p.nik ? `(NIK: ${p.nik})` : ''} ({p.gender === 'MALE' ? 'L' : 'P'}, {p.age} th)
                </option>
              ))}
            </select>
          </div>

          {/* DOKTER JAGA PEMERIKSA */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Dokter Jaga & Poli *
            </label>
            {activeDoctors.length === 0 ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                ⚠️ Tidak ada dokter yang berstatus AKTIF saat ini. Silakan aktifkan jadwal dokter di menu Data Dokter.
              </div>
            ) : (
              <select
                required
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#061e15] cursor-pointer"
              >
                <option value="">-- Pilih Dokter Bertugas --</option>
                {activeDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.spesialis} ({doc.room || 'Poli 1'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || activeDoctors.length === 0}
              className="btn-forest px-5 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Mendaftarkan...' : '+ Simpan & Masukkan Antrean'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
