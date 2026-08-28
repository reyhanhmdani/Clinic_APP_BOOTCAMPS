import React, { useState, useEffect } from 'react';
import { UserPlus, Search, X, PauseCircle, PlayCircle, Trash2, UserX, Loader2 } from 'lucide-react';
import type { Doctor } from '../../types/clinic';
import { useDoctorStore } from '../../stores/doctorStore';
import { useVisitStore } from '../../stores/visitStore';
import { createDoctorService, updateDoctorService, deleteDoctorService } from '../../services/doctorService';
import { formatRupiah } from '../../utils/formatRupiah';

export const DoctorPage: React.FC = () => {
  const { doctors, loading: isLoading, fetchDoctors } = useDoctorStore();
  const { visits, fetchVisits } = useVisitStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    spesialis: '',
    fee: '',
    room: '',
    isActive: true,
  });

  useEffect(() => {
    fetchDoctors();
    fetchVisits();
  }, []);

  const openCreateModal = () => {
    setModalMode('CREATE');
    setSelectedDoctor(null);
    setFormData({
      name: '',
      spesialis: '',
      fee: '',
      room: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (doctor: Doctor) => {
    setModalMode('EDIT');
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.name,
      spesialis: doctor.spesialis,
      fee: String(doctor.fee),
      room: doctor.room || '',
      isActive: doctor.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.spesialis.trim()) {
      alert('Nama dokter dan Spesialisasi wajib diisi!');
      return;
    }
    const numFee = Number(formData.fee);
    if (!formData.fee || isNaN(numFee) || numFee < 0) {
      alert('Tarif jasa medis harus berupa nominal angka valid!');
      return;
    }

    try {
      if (modalMode === 'CREATE') {
        await createDoctorService({
          name: formData.name.trim(),
          spesialis: formData.spesialis.trim(),
          fee: numFee,
          room: formData.room.trim() || undefined,
          isActive: true,
        });
        alert('Data dokter baru berhasil ditambahkan!');
      } else if (modalMode === 'EDIT' && selectedDoctor) {
        await updateDoctorService(selectedDoctor.id, {
          name: formData.name.trim(),
          spesialis: formData.spesialis.trim(),
          fee: numFee,
          room: formData.room.trim() || undefined,
          isActive: formData.isActive,
        });
        alert('Data dokter berhasil diperbarui!');
      }
      setIsModalOpen(false);
      fetchDoctors();
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Gagal menyimpan data dokter';
      alert(message);
    }
  };

  // Toggle Dokter Aktif / Nonaktif
  const handleToggleActiveDoctor = async (doctor: Doctor) => {
    const nextStatus = !doctor.isActive;
    const actionText = nextStatus ? 'mengaktifkan jadwal praktek' : 'menonaktifkan (liburkan)';

    if (confirm(`Apakah Anda yakin ingin ${actionText} dokter ${doctor.name}?`)) {
      try {
        await updateDoctorService(doctor.id, {
          isActive: nextStatus,
        });
        alert(`Status dokter ${doctor.name} berhasil diubah menjadi ${nextStatus ? 'AKTIF' : 'NONAKTIF'}.`);
        fetchDoctors();
      } catch (err: any) {
        const message = err?.response?.data?.message || err.message || 'Gagal mengubah status dokter';
        alert(message);
      }
    }
  };

  // Hapus Dokter dengan Pengecekan Riwayat Kunjungan
  const handleDeleteDoctor = async (id: number, name: string) => {
    const hasVisits = visits.some((v) => v.doctorId === id);
    if (hasVisits) {
      alert(
        `Dokter ${name} tidak dapat dihapus permanen karena telah memiliki riwayat kunjungan/pemeriksaan pasien. Silakan gunakan tombol 'Nonaktifkan' untuk meliburkan jadwal praktek dokter.`,
      );
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus data dokter ${name}? Aksi ini permanen.`)) {
      try {
        await deleteDoctorService(id);
        alert(`Data dokter ${name} berhasil dihapus dari sistem.`);
        fetchDoctors();
      } catch (err: any) {
        const message = err?.response?.data?.message || err.message || 'Gagal menghapus dokter';
        alert(message);
      }
    }
  };

  // Filter List
  const specialtiesList = Array.from(new Set(doctors.map((d) => d.spesialis)));
  const filteredDoctors = doctors.filter((doctor) => {
    if (selectedSpecialty !== 'ALL' && doctor.spesialis !== selectedSpecialty) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return (
        doctor.name.toLowerCase().includes(q) ||
        doctor.spesialis.toLowerCase().includes(q) ||
        (doctor.room && doctor.room.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 shadow-sm rounded-[24px] p-6">
        <div>
          <div className="inline-block bg-lime-100 text-lime-900 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-lime-200 uppercase mb-1">
            Master Data
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Data Dokter & Tenaga Medis</h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Total {doctors.length} tenaga medis terdaftar ({doctors.filter((d) => d.isActive).length} praktek aktif)
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn-lime px-4 py-2.5 rounded-full flex items-center gap-2 cursor-pointer text-xs font-bold shadow-xs hover:shadow-md transition-all tracking-wide"
        >
          <UserPlus size={16} strokeWidth={2.5} />
          <span>+ Tambah Dokter Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white border border-slate-100 shadow-xs rounded-[24px] p-4">
        {/* Search */}
        <div className="flex-1 flex items-center bg-slate-50/70 border border-slate-200/80 rounded-full px-4 py-2">
          <Search size={16} className="text-slate-400 mr-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama dokter, spesialisasi, atau ruangan..."
            className="w-full bg-transparent text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />
          {searchTerm.length > 0 && (
            <button type="button" onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-700">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Specialty Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500">Spesialisasi:</span>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="bg-slate-50 border border-slate-200/80 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
          >
            <option value="ALL">Semua Poli</option>
            {specialtiesList.map((sp) => (
              <option key={sp} value={sp}>
                {sp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="py-20 text-center bg-white border border-slate-100 shadow-sm rounded-[24px] p-6 flex flex-col items-center justify-center">
          <Loader2 size={32} className="text-slate-700 animate-spin mb-2" />
          <p className="font-bold text-sm text-slate-700">Memuat Data Dokter...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-100 shadow-sm rounded-[24px] p-6 space-y-2 flex flex-col items-center justify-center">
          <UserX size={44} className="text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">Tidak Ada Data Dokter</h3>
          <p className="text-xs text-slate-400 font-normal max-w-sm mx-auto">
            {searchTerm
              ? `Tidak ada dokter yang cocok dengan pencarian "${searchTerm}"`
              : 'Belum ada dokter yang didaftarkan ke sistem klinik.'}
          </p>
        </div>
      ) : (
        /* Doctor Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doctor) => {
            const hasVisits = visits.some((v) => v.doctorId === doctor.id);

            return (
              <div
                key={doctor.id}
                className={`bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden ${
                  !doctor.isActive ? 'opacity-75 bg-slate-50/50' : ''
                }`}
              >
                <div>
                  {/* Top Status & Room */}
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        doctor.isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          doctor.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      <span>{doctor.isActive ? 'Praktek Aktif' : 'Nonaktif / Libur'}</span>
                    </span>

                    <span className="bg-lime-100 text-lime-900 border border-lime-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                      {doctor.room || 'Poli 1'}
                    </span>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex items-center gap-3.5 mb-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#061e15] text-[#b4f105] font-black text-sm flex items-center justify-center shrink-0">
                      {doctor.name
                        .replace(/^dr\.\s*/i, '')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{doctor.name}</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">{doctor.spesialis}</p>
                    </div>
                  </div>

                  {/* Fee Info Box */}
                  <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs mb-4">
                    <span className="text-slate-500 font-medium">Jasa Konsultasi</span>
                    <span className="font-bold text-sm text-slate-900 font-mono">{formatRupiah(doctor.fee)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  {/* Toggle Aktifkan / Nonaktifkan */}
                  <button
                    type="button"
                    onClick={() => handleToggleActiveDoctor(doctor)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      doctor.isActive
                        ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                        : 'btn-forest'
                    }`}
                  >
                    {doctor.isActive ? (
                      <>
                        <PauseCircle size={14} />
                        <span>Nonaktifkan</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle size={14} />
                        <span>Aktifkan</span>
                      </>
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => openEditModal(doctor)}
                    className="bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Edit
                  </button>

                  {/* Hapus */}
                  <button
                    type="button"
                    onClick={() => handleDeleteDoctor(doctor.id, doctor.name)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      hasVisits
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                    title={
                      hasVisits
                        ? 'Dokter memiliki riwayat kunjungan dan tidak dapat dihapus permanen'
                        : 'Hapus data dokter'
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form Tambah / Edit Dokter */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {modalMode === 'CREATE' ? 'Tambah Dokter Baru' : 'Edit Data Dokter'}
                </h3>
                <p className="text-xs text-slate-400 font-normal">Kelola profil tenaga medis dan tarif konsultasi</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5">
              {/* Nama Dokter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: dr. Amanda Sp.A"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#061e15]"
                />
              </div>

              {/* Spesialisasi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Spesialisasi / Poli *</label>
                <input
                  type="text"
                  required
                  value={formData.spesialis}
                  onChange={(e) => setFormData({ ...formData, spesialis: e.target.value })}
                  placeholder="Contoh: Dokter Anak / Gigi / Umum"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#061e15]"
                />
              </div>

              {/* Ruangan & Jasa Medis */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ruang Praktek</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="Poli Anak 1"
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#061e15]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tarif Jasa Medis (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="5000"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                    placeholder="100000"
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#061e15]"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button type="submit" className="btn-forest flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                  {modalMode === 'CREATE' ? 'Simpan Dokter' : 'Update Dokter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
