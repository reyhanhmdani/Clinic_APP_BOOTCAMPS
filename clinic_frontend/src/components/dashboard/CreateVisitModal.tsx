import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Users, Search, Stethoscope, Check, ChevronDown, UserCheck } from 'lucide-react';
import type { Patient, Doctor } from '../../types/clinic';
import { useVisitStore } from '../../stores/visitStore';
import { createVisitService } from '../../services/visitService';
import { toast } from 'sonner';

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

  // Search & Dropdown states
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState<boolean>(false);

  const [doctorSearch, setDoctorSearch] = useState<string>('');
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState<boolean>(false);

  // Refs for click outside detection
  const patientContainerRef = useRef<HTMLDivElement>(null);
  const doctorContainerRef = useRef<HTMLDivElement>(null);

  // Filter dokter yang berstatus aktif
  const activeDoctors = useMemo(() => doctors.filter((doc) => doc.isActive), [doctors]);

  // Pasien yang sedang dipilih
  const selectedPatient = useMemo(
    () => patients.find((p) => String(p.id) === selectedPatientId),
    [patients, selectedPatientId]
  );

  // Dokter yang sedang dipilih
  const selectedDoctor = useMemo(
    () => activeDoctors.find((d) => String(d.id) === selectedDoctorId),
    [activeDoctors, selectedDoctorId]
  );

  // Filter Pasien berdasarkan Nama, No. RM, atau NIK
  const filteredPatients = useMemo(() => {
    const q = patientSearch.toLowerCase().trim();
    if (!q) return patients.slice(0, 20); // Ambil 20 teratas jika belum ada input agar ringan
    return patients
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.noRm.toLowerCase().includes(q) ||
          (p.nik && p.nik.toLowerCase().includes(q))
      )
      .slice(0, 30);
  }, [patients, patientSearch]);

  // Filter Dokter berdasarkan Nama, Spesialisasi, atau Ruang Poli
  const filteredDoctors = useMemo(() => {
    const q = doctorSearch.toLowerCase().trim();
    if (!q) return activeDoctors;
    return activeDoctors.filter(
      (doc) =>
        doc.name.toLowerCase().includes(q) ||
        doc.spesialis.toLowerCase().includes(q) ||
        (doc.room && doc.room.toLowerCase().includes(q))
    );
  }, [activeDoctors, doctorSearch]);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        patientContainerRef.current &&
        !patientContainerRef.current.contains(event.target as Node)
      ) {
        setIsPatientDropdownOpen(false);
      }
      if (
        doctorContainerRef.current &&
        !doctorContainerRef.current.contains(event.target as Node)
      ) {
        setIsDoctorDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset form saat modal ditutup
  const handleModalClose = () => {
    setSelectedPatientId('');
    setSelectedDoctorId('');
    setPatientSearch('');
    setDoctorSearch('');
    setIsPatientDropdownOpen(false);
    setIsDoctorDropdownOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatientId) {
      toast.error('Pilih pasien terdaftar terlebih dahulu!');
      return;
    }

    if (!selectedDoctorId) {
      toast.error('Pilih dokter terlebih dahulu!');
      return;
    }

    setIsSubmitting(true);
    try {
      await createVisitService({
        patientId: Number(selectedPatientId),
        doctorId: Number(selectedDoctorId),
      });

      await fetchVisits();
      toast.success('Antrean pasien berhasil ditambahkan!');

      // Reset & tutup
      handleModalClose();
    } catch (error: any) {
      toast.error(`Gagal menambah antrean: ${error?.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 sm:p-7 max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div>
            <div className="inline-block bg-lime-100 text-lime-900 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-lime-200 uppercase mb-1">
              PENDAFTARAN ANTREAN
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pendaftaran Antrean Pasien
            </h2>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              Cari & pilih pasien serta dokter jaga pemeriksa
            </p>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-visible flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* ======================================================== */}
            {/* 1. SEARCHABLE COMBOBOX: PILIH PASIEN                     */}
            {/* ======================================================== */}
            <div ref={patientContainerRef} className="relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-[#107c41]" />
                  <span>Cari & Pilih Pasien Terdaftar *</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {patients.length} total pasien
                </span>
              </label>

              {/* Jika Pasien Sudah Dipilih: Tampilkan Kartu Pilihan Pasien */}
              {selectedPatient && !isPatientDropdownOpen ? (
                <div className="bg-[#f0faf5] border border-[#107c41]/30 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#061e15] text-[#b4f105] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      <UserCheck size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-extrabold bg-[#061e15] text-[#b4f105] px-2 py-0.5 rounded-md">
                          {selectedPatient.noRm}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {selectedPatient.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {selectedPatient.nik ? `NIK: ${selectedPatient.nik} • ` : ''}
                        {selectedPatient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}, {selectedPatient.age} th
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPatientDropdownOpen(true);
                      setPatientSearch('');
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#107c41] hover:text-[#061e15] bg-white border border-[#107c41]/30 rounded-lg hover:bg-slate-50 transition-all cursor-pointer shrink-0 ml-2"
                  >
                    Ganti
                  </button>
                </div>
              ) : (
                /* Input Search Pasien */
                <div className="relative">
                  <div className="relative flex items-center">
                    <Search
                      size={15}
                      className="absolute left-3.5 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder="Ketik Nama, No. RM, atau NIK pasien..."
                      value={patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value);
                        setIsPatientDropdownOpen(true);
                      }}
                      onFocus={() => setIsPatientDropdownOpen(true)}
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#107c41] focus:ring-1 focus:ring-[#107c41] transition-all"
                    />
                    {patientSearch ? (
                      <button
                        type="button"
                        onClick={() => setPatientSearch('')}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    ) : (
                      <ChevronDown
                        size={14}
                        className="absolute right-3 text-slate-400 pointer-events-none"
                      />
                    )}
                  </div>

                  {/* Dropdown Hasil Pencarian Pasien */}
                  {isPatientDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                      {filteredPatients.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="text-xs text-slate-500 font-medium">
                            Tidak ada pasien cocok dengan "{patientSearch}"
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Daftarkan pasien baru melalui menu Data Pasien.
                          </p>
                        </div>
                      ) : (
                        filteredPatients.map((p) => {
                          const isSelected = String(p.id) === selectedPatientId;
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedPatientId(String(p.id));
                                setIsPatientDropdownOpen(false);
                                setPatientSearch('');
                              }}
                              className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                                isSelected ? 'bg-lime-50/80 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                                    {p.noRm}
                                  </span>
                                  <span className="font-bold text-xs text-slate-900 truncate">
                                    {p.name}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                                  {p.nik ? `NIK: ${p.nik} • ` : ''}
                                  {p.gender === 'MALE' ? 'L' : 'P'}, {p.age} th • {p.phone || '-'}
                                </div>
                              </div>
                              {isSelected && (
                                <Check size={16} className="text-[#107c41] shrink-0" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* 2. SEARCHABLE COMBOBOX: PILIH DOKTER JAGA & POLI         */}
            {/* ======================================================== */}
            <div ref={doctorContainerRef} className="relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Stethoscope size={14} className="text-[#107c41]" />
                  <span>Pilih Dokter Jaga & Poli *</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {activeDoctors.length} dokter aktif
                </span>
              </label>

              {activeDoctors.length === 0 ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                  ⚠️ Tidak ada dokter yang berstatus AKTIF saat ini. Silakan aktifkan jadwal dokter di menu Data Dokter.
                </div>
              ) : selectedDoctor && !isDoctorDropdownOpen ? (
                /* Jika Dokter Sudah Dipilih: Tampilkan Kartu Pilihan Dokter */
                <div className="bg-[#f0faf5] border border-[#107c41]/30 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#061e15] text-[#b4f105] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      <Stethoscope size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {selectedDoctor.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        <span className="text-[#107c41] font-semibold">{selectedDoctor.spesialis}</span>
                        {' '}• {selectedDoctor.room || 'Poli 1'}
                        {' '}• Rp {Number(selectedDoctor.fee).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDoctorDropdownOpen(true);
                      setDoctorSearch('');
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#107c41] hover:text-[#061e15] bg-white border border-[#107c41]/30 rounded-lg hover:bg-slate-50 transition-all cursor-pointer shrink-0 ml-2"
                  >
                    Ganti
                  </button>
                </div>
              ) : (
                /* Input Search Dokter */
                <div className="relative">
                  <div className="relative flex items-center">
                    <Search
                      size={15}
                      className="absolute left-3.5 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder="Cari nama dokter atau poli/spesialis..."
                      value={doctorSearch}
                      onChange={(e) => {
                        setDoctorSearch(e.target.value);
                        setIsDoctorDropdownOpen(true);
                      }}
                      onFocus={() => setIsDoctorDropdownOpen(true)}
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#107c41] focus:ring-1 focus:ring-[#107c41] transition-all"
                    />
                    {doctorSearch ? (
                      <button
                        type="button"
                        onClick={() => setDoctorSearch('')}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    ) : (
                      <ChevronDown
                        size={14}
                        className="absolute right-3 text-slate-400 pointer-events-none"
                      />
                    )}
                  </div>

                  {/* Dropdown Hasil Pencarian Dokter */}
                  {isDoctorDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {filteredDoctors.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-500">
                          Tidak ada dokter yang cocok dengan "{doctorSearch}"
                        </div>
                      ) : (
                        filteredDoctors.map((doc) => {
                          const isSelected = String(doc.id) === selectedDoctorId;
                          return (
                            <div
                              key={doc.id}
                              onClick={() => {
                                setSelectedDoctorId(String(doc.id));
                                setIsDoctorDropdownOpen(false);
                                setDoctorSearch('');
                              }}
                              className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                                isSelected ? 'bg-lime-50/80 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <h4 className="font-bold text-xs text-slate-900 truncate">
                                  {doc.name}
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  <span className="text-[#107c41] font-medium">{doc.spesialis}</span>
                                  {' '}• {doc.room || 'Poli 1'}
                                  {' '}• Rp {Number(doc.fee).toLocaleString('id-ID')}
                                </p>
                              </div>
                              {isSelected && (
                                <Check size={16} className="text-[#107c41] shrink-0" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6 shrink-0">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedPatientId || !selectedDoctorId || activeDoctors.length === 0}
              className="btn-forest px-5 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Mendaftarkan...' : '+ Simpan & Masukkan Antrean'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

