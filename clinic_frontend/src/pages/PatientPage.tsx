import React, { useState, useEffect } from 'react';
import { UserPlus, Search, X, Table2, LayoutGrid, FileText, Phone, MapPin, UserX, Loader2 } from 'lucide-react';
import type { Patient } from '../types/clinic';
import { usePatientStore } from '../stores/patientStore';
import { createPatientService, updatePatientService, deletePatientService } from '../services/patientService';
import { PatientHistoryModal } from '../components/patients/PatientHistoryModal';

export const PatientPage: React.FC = () => {
  const { patients, loading: isLoading, fetchPatients } = usePatientStore();

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Rekam Medis Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [patientForHistory, setPatientForHistory] = useState<Patient | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    age: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const openCreateModal = () => {
    setModalMode('CREATE');
    setSelectedPatient(null);
    setFormData({
      name: '',
      nik: '',
      gender: 'MALE',
      age: '',
      phone: '',
      address: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (patient: Patient) => {
    setModalMode('EDIT');
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      nik: patient.nik || '',
      gender: patient.gender,
      age: String(patient.age),
      phone: patient.phone || '',
      address: patient.address || '',
    });
    setIsModalOpen(true);
  };

  const openHistoryModal = (patient: Patient) => {
    setPatientForHistory(patient);
    setIsHistoryModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Nama pasien wajib diisi!');
      return;
    }
    const numAge = Number(formData.age);
    if (!formData.age || isNaN(numAge) || numAge <= 0) {
      alert('Usia pasien harus berupa angka valid!');
      return;
    }

    try {
      if (modalMode === 'CREATE') {
        await createPatientService({
          name: formData.name.trim(),
          nik: formData.nik.trim() || undefined,
          gender: formData.gender,
          age: numAge,
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim() || undefined,
        });
        alert('Pasien baru berhasil didaftarkan!');
      } else if (modalMode === 'EDIT' && selectedPatient) {
        await updatePatientService(selectedPatient.id, {
          name: formData.name.trim(),
          nik: formData.nik.trim() || undefined,
          gender: formData.gender,
          age: numAge,
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim() || undefined,
        });
        alert('Data pasien berhasil diperbarui!');
      }
      setIsModalOpen(false);
      fetchPatients();
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Gagal menyimpan data pasien';
      alert(message);
    }
  };

  const handleDeletePatient = async (id: number, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data pasien ${name}?`)) {
      try {
        await deletePatientService(id);
        alert(`Data pasien ${name} berhasil dihapus`);
        fetchPatients();
      } catch (err: any) {
        const message = err?.response?.data?.message || err.message || 'Gagal menghapus pasien';
        alert(message);
      }
    }
  };

  // Filter Logic
  const filteredPatients = patients.filter((patient) => {
    if (selectedGender !== 'ALL' && patient.gender !== selectedGender) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return (
        patient.name.toLowerCase().includes(q) ||
        patient.noRm.toLowerCase().includes(q) ||
        (patient.phone && patient.phone.includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 shadow-sm rounded-[24px] p-6">
        <div>
          <div className="inline-block bg-lime-100 text-lime-900 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-lime-200 uppercase mb-1">
            Master Data
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Data Pasien</h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Total {patients.length} pasien terdaftar dalam database klinik
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn-lime px-4 py-2.5 rounded-full flex items-center gap-2 cursor-pointer text-xs font-bold shadow-xs hover:shadow-md transition-all tracking-wide"
        >
          <UserPlus size={16} strokeWidth={2.5} />
          <span>+ Tambah Pasien Baru</span>
        </button>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white border border-slate-100 shadow-xs rounded-[24px] p-4">
        {/* Search Bar */}
        <div className="flex-1 flex items-center bg-slate-50/70 border border-slate-200/80 rounded-full px-4 py-2">
          <Search size={16} className="text-slate-400 mr-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama, No. RM, atau nomor HP..."
            className="w-full bg-transparent text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />
          {searchTerm.length > 0 && (
            <button type="button" onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-700">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Gender Filter Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'MALE', label: 'Laki-laki' },
            { id: 'FEMALE', label: 'Perempuan' },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedGender(g.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedGender === g.id
                  ? 'bg-[#061e15] text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle (Table / Grid) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('TABLE')}
            className={`p-1.5 rounded-full transition-all ${
              viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Tampilan Tabel"
          >
            <Table2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('GRID')}
            className={`p-1.5 rounded-full transition-all ${
              viewMode === 'GRID' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Tampilan Grid Kartu"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 text-center bg-white border border-slate-100 shadow-sm rounded-[24px] p-6 flex flex-col items-center justify-center">
          <Loader2 size={32} className="text-slate-700 animate-spin mb-2" />
          <p className="font-bold text-sm text-slate-700">Memuat Data Pasien...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-100 shadow-sm rounded-[24px] p-6 space-y-2 flex flex-col items-center justify-center">
          <UserX size={44} className="text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">Tidak Ada Data Pasien</h3>
          <p className="text-xs text-slate-400 font-normal max-w-sm mx-auto">
            {searchTerm
              ? `Tidak ada pasien yang cocok dengan pencarian "${searchTerm}"`
              : 'Belum ada pasien yang didaftarkan ke sistem.'}
          </p>
        </div>
      ) : viewMode === 'TABLE' ? (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-100 shadow-sm rounded-[24px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-100">
                  <th className="p-4">No. RM</th>
                  <th className="p-4">Nama Pasien</th>
                  <th className="p-4">Gender / Usia</th>
                  <th className="p-4">Kontak & Alamat</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <span className="bg-lime-100 text-lime-900 border border-lime-200 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono">
                        {patient.noRm}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-sm text-slate-900 capitalize leading-tight">{patient.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">NIK: {patient.nik || '-'}</div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            patient.gender === 'MALE'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {patient.gender === 'MALE' ? 'L' : 'P'}
                        </span>
                        <span>{patient.age} Th</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{patient.phone || '-'}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">
                        {patient.address || 'Belum ada alamat'}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Tombol Rekam Medis */}
                        <button
                          type="button"
                          onClick={() => openHistoryModal(patient)}
                          className="bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-sky-100 transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Lihat Riwayat Rekam Medis"
                        >
                          <FileText size={14} />
                          <span>Rekam Medis</span>
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => openEditModal(patient)}
                          className="bg-white border border-slate-200/80 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          Edit
                        </button>

                        {/* Hapus */}
                        <button
                          type="button"
                          onClick={() => handleDeletePatient(patient.id, patient.name)}
                          className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-rose-100 transition-all cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-[24px] p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-lime-100 text-lime-900 border border-lime-200 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
                    {patient.noRm}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      patient.gender === 'MALE'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {patient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'} • {patient.age} Th
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900 capitalize">{patient.name}</div>
                <div className="text-[11px] text-slate-400 font-mono">NIK: {patient.nik || '-'}</div>
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1.5 mb-4">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-400" />
                    <span>{patient.phone || 'Tidak ada nomor HP'}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-start gap-1.5">
                    <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate">{patient.address || 'Alamat belum diisi'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => openHistoryModal(patient)}
                  className="flex-1 bg-sky-50 text-sky-800 border border-sky-200 py-2 rounded-xl text-xs font-bold hover:bg-sky-100 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText size={14} />
                  <span>Rekam Medis</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(patient)}
                  className="bg-white border border-slate-200/80 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePatient(patient.id, patient.name)}
                  className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-rose-100 cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah / Edit Pasien */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {modalMode === 'CREATE' ? 'Tambah Pasien Baru' : 'Edit Data Pasien'}
                </h3>
                <p className="text-xs text-slate-400 font-normal">Formulir pendaftaran rekam medis klinik</p>
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
              {/* Nama Pasien */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Pasien *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#061e15]"
                />
              </div>

              {/* NIK */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Induk Kependudukan (NIK - 16 Digit)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  placeholder="Contoh: 3201011504950001"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#061e15]"
                />
              </div>

              {/* Gender & Usia */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#061e15] cursor-pointer"
                  >
                    <option value="MALE">Laki-laki</option>
                    <option value="FEMALE">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Usia (Tahun) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Contoh: 30"
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#061e15]"
                  />
                </div>
              </div>

              {/* Nomor HP */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor HP / WhatsApp</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#061e15]"
                />
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Tinggal</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Contoh: Jl. Sudirman No. 10, Jakarta Pusat"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#061e15]"
                />
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
                  {modalMode === 'CREATE' ? 'Simpan Pasien' : 'Update Pasien'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Riwayat Rekam Medis Pasien */}
      <PatientHistoryModal
        isOpen={isHistoryModalOpen}
        patient={patientForHistory}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  );
};
