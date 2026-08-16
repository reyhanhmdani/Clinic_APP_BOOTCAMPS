import React, { useState, useEffect } from 'react';
import type { Patient } from '../types/clinic';
import {
  getPatientService,
  createPatientService,
  updatePatientService,
  deletePatientService,
} from '../services/patientService';

export const PatientPage: React.FC = () => {
  // data state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // filter dan search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');
  const [sortBy, setSortBy] = useState<'RECENT' | 'NAME_ASC' | 'NAME_DESC' | 'AGE_ASC' | 'AGE_DESC'>('RECENT');
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // form state
  const [formData, setFormData] = useState({
    name: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    age: 0,
    phone: '',
    address: '',
  });

  // fetch data pasien
  const fetchPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPatientService();
      setPatients(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat data pasien dari server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // submit form create dan update
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || formData.age < 0) {
      return alert('Mohon isi nama dan usia pasien dengan benar');
    }

    try {
      if (modalMode === 'CREATE') {
        // create data
        await createPatientService({
          name: formData.name,
          gender: formData.gender,
          age: Number(formData.age),
          phone: formData.phone || undefined,
          address: formData.address || undefined,
        });
        alert('Pasien baru berhasil didaftarkan');
      } else if (modalMode === 'EDIT' && selectedPatient) {
        // update data
        await updatePatientService(selectedPatient.id, {
          name: formData.name,
          gender: formData.gender,
          age: Number(formData.age),
          phone: formData.phone || undefined,
          address: formData.address || undefined,
        });
        alert('Data pasien berhasil diperbarui');
      }

      setIsModalOpen(false);
      await fetchPatients();
    } catch (err: any) {
      alert(`Gagal menyimpan data pasien: ${err?.response?.data?.message || err.message}`);
    }
  };

  // delete data pasien
  const handleDeletePatient = async (id: number, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus data pasien "${name}"?`)) {
      return;
    }

    try {
      await deletePatientService(id);
      alert(`Data pasien "${name}" berhasil dihapus`);
      await fetchPatients();
    } catch (err: any) {
      alert(`Gagal menghapus pasien: ${err?.response?.data?.message || err.message}`);
    }
  };

  // buka modal create
  const handleOpenCreateModal = () => {
    setModalMode('CREATE');
    setSelectedPatient(null);
    setFormData({ name: '', gender: 'MALE', age: 0, phone: '', address: '' });
    setIsModalOpen(true);
  };

  // buka modal edit
  const handleOpenEditModal = (item: Patient) => {
    setModalMode('EDIT');
    setSelectedPatient(item);
    setFormData({
      name: item.name,
      gender: item.gender,
      age: item.age,
      phone: item.phone || '',
      address: item.address || '',
    });
    setIsModalOpen(true);
  };

  // filter dan search logic
  const filteredAndSortedPatients = patients
    .filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.noRm.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.phone && item.phone.includes(searchTerm));

      if (!matchSearch) return false;
      if (selectedGender === 'MALE') return item.gender === 'MALE';
      if (selectedGender === 'FEMALE') return item.gender === 'FEMALE';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name);
      if (sortBy === 'AGE_ASC') return a.age - b.age;
      if (sortBy === 'AGE_DESC') return b.age - a.age;
      return b.id - a.id;
    });

  // hitung data kpi
  const totalPatients = patients.length;
  const maleCount = patients.filter((p) => p.gender === 'MALE').length;
  const femaleCount = patients.filter((p) => p.gender === 'FEMALE').length;

  return (
    <div className="space-y-6 w-full text-[#18181b] font-sans antialiased pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-4 border-[#18181b] p-6 shadow-[6px_6px_0px_#18181b]">
        <div className="space-y-1">
          <div className="inline-block bg-[#38bdf8] text-[#18181b] font-black text-xs px-3 py-1 border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] uppercase tracking-wider">
            DATABASE REKAM MEDIS
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#18181b] uppercase">
            MASTER DATA PASIEN KLINIK
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#52525b]">
            Pusat database seluruh pasien terdaftar, manajemen biodata, dan nomor rekam medis resmi klinik.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-5 py-3.5 bg-[#a3e635] text-[#18181b] border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] hover:bg-[#bef264] active:translate-y-0.5 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>+ Registrasi Pasien Baru</span>
        </button>
      </div>

      {/* 2. KPI Summary Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#fef08a] border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#18181b]">TOTAL PASIEN</span>
            <div className="text-3xl font-black">{totalPatients}</div>
          </div>
          <span className="material-symbols-outlined text-4xl text-[#18181b]">groups</span>
        </div>

        <div className="p-4 bg-[#38bdf8] border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#18181b]">PASIEN LAKI-LAKI</span>
            <div className="text-3xl font-black">{maleCount}</div>
          </div>
          <span className="material-symbols-outlined text-4xl text-[#18181b]">man</span>
        </div>

        <div className="p-4 bg-[#f472b6] border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#18181b]">PASIEN PEREMPUAN</span>
            <div className="text-3xl font-black">{femaleCount}</div>
          </div>
          <span className="material-symbols-outlined text-4xl text-[#18181b]">woman</span>
        </div>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Search & Filter Stacked Menu */}
        <div className="md:col-span-4 space-y-4">
          <div className="p-4 bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] space-y-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#71717a]">
                search
              </span>
              <input
                type="text"
                placeholder="Cari nama, No. RM, No. HP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-[#71717a] tracking-wider block">
                Urutkan Berdasarkan:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-2 border-2 border-[#18181b] bg-white text-xs font-black text-[#18181b] focus:outline-none cursor-pointer"
              >
                <option value="RECENT">Pendaftaran Terbaru</option>
                <option value="NAME_ASC">Nama Pasien (A - Z)</option>
                <option value="NAME_DESC">Nama Pasien (Z - A)</option>
                <option value="AGE_ASC">Usia (Termuda)</option>
                <option value="AGE_DESC">Usia (Tertua)</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-[#71717a] pb-2 border-b-2 border-[#18181b]/10 flex justify-between items-center">
              <span>FILTER JENIS KELAMIN</span>
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedGender('ALL')}
              className={`w-full text-left p-2.5 font-black text-xs border-2 border-[#18181b] flex items-center justify-between transition-all cursor-pointer ${
                selectedGender === 'ALL'
                  ? 'bg-[#18181b] text-white shadow-[2px_2px_0px_#a3e635]'
                  : 'bg-white hover:bg-[#fef9c3] text-[#18181b]'
              }`}
            >
              <span>SEMUA PASIEN</span>
              <span className="px-2 py-0.5 text-[10px] bg-white text-[#18181b] border border-[#18181b] font-black">
                {totalPatients}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGender('MALE')}
              className={`w-full text-left p-2.5 font-black text-xs border-2 border-[#18181b] flex items-center justify-between transition-all cursor-pointer ${
                selectedGender === 'MALE'
                  ? 'bg-[#18181b] text-white shadow-[2px_2px_0px_#38bdf8]'
                  : 'bg-white hover:bg-[#fef9c3] text-[#18181b]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] border border-[#18181b]" />
                <span>LAKI-LAKI</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] bg-[#38bdf8] text-[#18181b] border border-[#18181b] font-black">
                {maleCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGender('FEMALE')}
              className={`w-full text-left p-2.5 font-black text-xs border-2 border-[#18181b] flex items-center justify-between transition-all cursor-pointer ${
                selectedGender === 'FEMALE'
                  ? 'bg-[#18181b] text-white shadow-[2px_2px_0px_#f472b6]'
                  : 'bg-white hover:bg-[#fef9c3] text-[#18181b]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f472b6] border border-[#18181b]" />
                <span>PEREMPUAN</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] bg-[#f472b6] text-white border border-[#18181b] font-black">
                {femaleCount}
              </span>
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Main Table / Grid Area */}
        <div className="md:col-span-8 space-y-4">
          <div className="flex items-center justify-between bg-white border-3 border-[#18181b] p-3 shadow-[4px_4px_0px_#18181b]">
            <div className="text-xs font-black uppercase text-[#18181b] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">list_alt</span>
              <span>Daftar Pasien ({filteredAndSortedPatients.length})</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 border-2 border-[#18181b] cursor-pointer transition-all ${
                  viewMode === 'TABLE' ? 'bg-[#18181b] text-white' : 'bg-white text-[#18181b] hover:bg-[#fde047]'
                }`}
                title="Mode Tabel"
              >
                <span className="material-symbols-outlined text-[18px]">table_rows</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 border-2 border-[#18181b] cursor-pointer transition-all ${
                  viewMode === 'GRID' ? 'bg-[#18181b] text-white' : 'bg-white text-[#18181b] hover:bg-[#fde047]'
                }`}
                title="Mode Grid Kartu"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-12 text-center bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b]">
              <span className="material-symbols-outlined text-4xl animate-spin text-[#18181b]">progress_activity</span>
              <p className="mt-2 text-xs font-black uppercase tracking-wider">MENGAMBIL DATA PASIEN DARI SERVER...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-4 bg-rose-100 border-3 border-rose-600 text-rose-900 font-bold text-xs shadow-[4px_4px_0px_#e11d48]">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredAndSortedPatients.length === 0 && (
            <div className="p-12 text-center bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] space-y-3">
              <span className="material-symbols-outlined text-5xl text-[#a1a1aa]">folder_open</span>
              <h3 className="text-base font-black uppercase">DATA PASIEN KOSONG / TIDAK DITEMUKAN</h3>
              <p className="text-xs font-bold text-[#71717a]">
                Belum ada pasien yang terdaftar atau hasil pencarian tidak sesuai.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-[#a3e635] text-[#18181b] border-2 border-[#18181b] font-black text-xs shadow-[2px_2px_0px_#18181b] hover:bg-[#bef264] cursor-pointer"
              >
                + Registrasi Pasien Baru
              </button>
            </div>
          )}

          {/* Data List: TABLE VIEW */}
          {!isLoading && !error && filteredAndSortedPatients.length > 0 && viewMode === 'TABLE' && (
            <div className="p-4 bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b-3 border-[#18181b] text-[11px] font-black uppercase tracking-wider text-[#71717a]">
                    <th className="pb-3 px-2">No</th>
                    <th className="pb-3 px-2">No. RM</th>
                    <th className="pb-3 px-2">Nama Pasien</th>
                    <th className="pb-3 px-2">Gender</th>
                    <th className="pb-3 px-2">Usia</th>
                    <th className="pb-3 px-2">No. HP</th>
                    <th className="pb-3 px-2">Alamat</th>
                    <th className="pb-3 px-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18181b]/10 text-xs font-bold text-[#18181b]">
                  {filteredAndSortedPatients.map((item, index) => (
                    <tr key={item.id} className="hover:bg-[#fef9c3]/30 transition-colors">
                      <td className="py-3 px-2 font-black text-[#71717a]">{index + 1}</td>
                      <td className="py-3 px-2">
                        <span className="font-mono bg-[#f4f4f5] px-1.5 py-0.5 rounded border border-[#18181b] font-black text-[11px]">
                          {item.noRm}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-black uppercase text-sm">{item.name}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-1.5 py-0.5 border border-[#18181b] text-[10px] font-black ${
                            item.gender === 'MALE' ? 'bg-[#38bdf8]' : 'bg-[#f472b6] text-white'
                          }`}
                        >
                          {item.gender === 'MALE' ? 'LAKI-LAKI' : 'PEREMPUAN'}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-black">{item.age} Th</td>
                      <td className="py-3 px-2 font-mono text-[11px]">{item.phone || '-'}</td>
                      <td className="py-3 px-2 text-[11px] text-[#71717a] max-w-[180px] truncate">
                        {item.address || '-'}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1 border border-[#18181b] bg-white hover:bg-[#fde047] cursor-pointer"
                            title="Edit Pasien"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePatient(item.id, item.name)}
                            className="p-1 border border-[#18181b] bg-white text-rose-600 hover:bg-rose-100 cursor-pointer"
                            title="Hapus Pasien"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Data List: GRID VIEW */}
          {!isLoading && !error && filteredAndSortedPatients.length > 0 && viewMode === 'GRID' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredAndSortedPatients.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] flex flex-col justify-between"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-mono bg-[#f4f4f5] px-2 py-0.5 border border-[#18181b] font-black text-xs">
                        {item.noRm}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 border border-[#18181b] text-[9px] font-black ${
                          item.gender === 'MALE' ? 'bg-[#38bdf8]' : 'bg-[#f472b6] text-white'
                        }`}
                      >
                        {item.gender === 'MALE' ? 'LAKI-LAKI' : 'PEREMPUAN'} ({item.age} TH)
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black uppercase text-base text-[#18181b]">{item.name}</h3>
                      <p className="text-xs font-bold text-[#71717a] flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        <span>{item.phone || 'Tidak ada kontak'}</span>
                      </p>
                      <p className="text-xs text-[#71717a] truncate mt-1">
                        <span className="font-bold">Alamat:</span> {item.address || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="p-3 bg-[#f8fafc] border-t-3 border-[#18181b] grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="py-1.5 px-3 bg-white text-[#18181b] border-2 border-[#18181b] text-xs font-black hover:bg-[#fde047] shadow-[2px_2px_0px_#18181b] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                      <span>EDIT</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePatient(item.id, item.name)}
                      className="py-1.5 px-3 bg-white text-rose-600 border-2 border-[#18181b] text-xs font-black hover:bg-rose-100 shadow-[2px_2px_0px_#18181b] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                      <span>HAPUS</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Modal Form Tambah / Edit Pasien */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-[#18181b] shadow-[8px_8px_0px_#18181b] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b-3 border-[#18181b]">
              <div>
                <span className="text-[10px] font-black uppercase text-[#a3e635] bg-[#18181b] px-2 py-0.5">
                  {modalMode === 'CREATE' ? 'REGISTRASI BARU' : 'PERBARUI BIODATA'}
                </span>
                <h3 className="text-lg font-black uppercase text-[#18181b] mt-1">
                  {modalMode === 'CREATE' ? 'Formulir Pasien Baru' : `Edit: ${selectedPatient?.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 bg-white border-2 border-[#18181b] hover:bg-rose-500 hover:text-white cursor-pointer font-black"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[#18181b] tracking-wider block">
                  Nama Lengkap Pasien
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Reyhan Hamdani"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[2px_2px_0px_#18181b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-[#18181b] tracking-wider block">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full p-2.5 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[2px_2px_0px_#18181b] cursor-pointer"
                  >
                    <option value="MALE">LAKI-LAKI</option>
                    <option value="FEMALE">PEREMPUAN</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-[#18181b] tracking-wider block">
                    Usia (Tahun)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="25"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full p-2.5 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[2px_2px_0px_#18181b]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[#18181b] tracking-wider block">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="08123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[2px_2px_0px_#18181b]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[#18181b] tracking-wider block">
                  Alamat Lengkap
                </label>
                <textarea
                  rows={2}
                  placeholder="Jl. Sudirman No. 123..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[2px_2px_0px_#18181b]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-white text-[#18181b] border-2 border-[#18181b] text-xs font-black hover:bg-zinc-100 shadow-[2px_2px_0px_#18181b] cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#a3e635] text-[#18181b] border-2 border-[#18181b] text-xs font-black hover:bg-[#bef264] shadow-[2px_2px_0px_#18181b] cursor-pointer"
                >
                  {modalMode === 'CREATE' ? 'SIMPAN PASIEN' : 'UPDATE BIODATA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
