import React, { useState } from 'react';
import { X, UserPlus, Users, Phone, MapPin } from 'lucide-react';
import type { Patient, Doctor } from '../../types/clinic';
import { useVisitStore } from '../../stores/visitStore';
import { usePatientStore } from '../../stores/patientStore';
import { createVisitService } from '../../services/visitService';
import { createPatientService } from '../../services/patientService';

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
  const { fetchPatients } = usePatientStore();

  const [patientMode, setPatientMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  // Form Pasien Baru
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [newAge, setNewAge] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hanya dokter yang bertatus aktif
  const activeDoctors = doctors.filter((doc) => doc.isActive);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoctorId) {
      alert('Pilih dokter terlebih dahulu!');
      return;
    }

    setIsSubmitting(true);
    try {
      let patientIdToUse: number;

      if (patientMode === 'NEW') {
        if (!newName.trim() || !newAge) {
          alert('Nama dan Usia pasien wajib diisi!');
          setIsSubmitting(false);
          return;
        }

        const createdPatient = await createPatientService({
          name: newName.trim(),
          gender: newGender,
          age: Number(newAge),
          phone: newPhone.trim() || undefined,
          address: newAddress.trim() || undefined,
        });

        await fetchPatients();
        patientIdToUse = createdPatient.id;
      } else {
        if (!selectedPatientId) {
          alert('Pilih pasien terdaftar terlebih dahulu!');
          setIsSubmitting(false);
          return;
        }
        patientIdToUse = Number(selectedPatientId);
      }

      await createVisitService({
        patientId: patientIdToUse,
        doctorId: Number(selectedDoctorId),
      });

      await fetchVisits();
      alert('Antrian pasien berhasil ditambahkan!');

      // Reset form
      setNewName('');
      setNewAge('');
      setNewPhone('');
      setNewAddress('');
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
      <div className="w-full max-w-lg bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
          <div>
            <div className="inline-block bg-lime-100 text-lime-900 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-lime-200 uppercase mb-1">
              PENDAFTARAN ANTREAN
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pendaftaran Antrean Pasien
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher: Pasien Lama vs Pasien Baru */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => setPatientMode('EXISTING')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              patientMode === 'EXISTING'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users size={15} />
            <span>Pasien Terdaftar</span>
          </button>
          <button
            type="button"
            onClick={() => setPatientMode('NEW')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              patientMode === 'NEW'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus size={15} />
            <span>Pasien Baru (+RM)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SECTION PASIEN LAMA */}
          {patientMode === 'EXISTING' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cari & Pilih Pasien Terdaftar *
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
                    {p.noRm} - {p.name} ({p.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}, {p.age} th)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* SECTION PASIEN BARU */
            <div className="space-y-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Pasien *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#061e15]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#061e15] cursor-pointer"
                  >
                    <option value="MALE">Laki-laki</option>
                    <option value="FEMALE">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Usia (Tahun) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="30"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#061e15]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor HP / WhatsApp
                </label>
                <div className="relative flex items-center">
                  <Phone size={14} className="absolute left-3 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="0812-3456-7890"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-[#061e15]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Pasien
                </label>
                <div className="relative flex items-center">
                  <MapPin size={14} className="absolute left-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Jl. Sudirman No. 12"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-[#061e15]"
                  />
                </div>
              </div>
            </div>
          )}

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
              {patientMode === 'EXISTING' ? '+ Simpan & Masukkan Antrian' : '+ Simpan Data Pasien Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
