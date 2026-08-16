import React, { useState, useEffect } from 'react';
import type { Doctor } from '../types/clinic';
import {
  getDoctorsService,
  createDoctorService,
  updateDoctorService,
  deleteDoctorService,
} from '../services/doctorService';

export const DoctorPage: React.FC = () => {
  // data state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // filter dan search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'RECENT' | 'NAME_ASC' | 'NAME_DESC' | 'FEE_ASC' | 'FEE_DESC'>('RECENT');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // form state
  const [formData, setFormData] = useState({
    name: '',
    spesialis: 'Dokter Umum',
    fee: 50000,
    phone: '',
    isActive: true,
  });

  // fetch data dokter
  const fetchDoctors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDoctorsService();
      setDoctors(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat data dokter dari server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // submit form create dan update
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.spesialis.trim() || formData.fee < 0) {
      return alert('Mohon isi nama dokter, spesialisasi, dan tarif konsultasi dengan benar');
    }

    try {
      if (modalMode === 'CREATE') {
        // create data
        await createDoctorService({
          name: formData.name,
          spesialis: formData.spesialis,
          fee: Number(formData.fee),
          phone: formData.phone || undefined,
          isActive: formData.isActive,
        });
        alert('Dokter baru berhasil ditambahkan');
      } else if (modalMode === 'EDIT' && selectedDoctor) {
        // update data
        await updateDoctorService(selectedDoctor.id, {
          name: formData.name,
          spesialis: formData.spesialis,
          fee: Number(formData.fee),
          phone: formData.phone || undefined,
          isActive: formData.isActive,
        });
        alert('Data dokter berhasil diperbarui');
      }

      setIsModalOpen(false);
      await fetchDoctors();
    } catch (err: any) {
      alert(`Gagal menyimpan data dokter: ${err?.response?.data?.message || err.message}`);
    }
  };

  // delete dokter (nonaktifkan)
  const handleDeleteDoctor = async (id: number, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menonaktifkan dokter "${name}"?`)) {
      return;
    }

    try {
      await deleteDoctorService(id);
      alert(`Dokter "${name}" berhasil dinonaktifkan`);
      await fetchDoctors();
    } catch (err: any) {
      alert(`Gagal menonaktifkan dokter: ${err?.response?.data?.message || err.message}`);
    }
  };

  // buka modal create
  const handleOpenCreateModal = () => {
    setModalMode('CREATE');
    setSelectedDoctor(null);
    setFormData({
      name: '',
      spesialis: 'Dokter Umum',
      fee: 50000,
      phone: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // buka modal edit
  const handleOpenEditModal = (item: Doctor) => {
    setModalMode('EDIT');
    setSelectedDoctor(item);
    setFormData({
      name: item.name,
      spesialis: item.spesialis,
      fee: Number(item.fee),
      phone: item.phone || '',
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  // filter dan search logic
  const filteredAndSortedDoctors = doctors
    .filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.spesialis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.phone && item.phone.includes(searchTerm));

      if (!matchSearch) return false;
      if (selectedStatus === 'ACTIVE') return item.isActive;
      if (selectedStatus === 'INACTIVE') return !item.isActive;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name);
      if (sortBy === 'FEE_ASC') return a.fee - b.fee;
      if (sortBy === 'FEE_DESC') return b.fee - a.fee;
      return b.id - a.id;
    });

  // hitung data kpi
  const totalDoctors = doctors.length;
  const activeCount = doctors.filter((d) => d.isActive).length;
  const inactiveCount = doctors.filter((d) => !d.isActive).length;

  return (
    <div className="space-y-6 w-full text-[#18181b] font-sans antialiased pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-4 border-[#18181b] p-6 shadow-[6px_6px_0px_#18181b]">
        <div className="space-y-1">
          <div className="inline-block bg-[#fde047] text-[#18181b] font-black text-xs px-3 py-1 border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] uppercase tracking-wider">
            TENAGA MEDIS & KLINIK
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#18181b] uppercase">
            DATA MASTER DOKTER & JADWAL
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#52525b]">
            Kelola data dokter jaga, spesialisasi medis, status keaktifan praktik, dan tarif jasa konsultasi.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-5 py-3.5 bg-[#a3e635] text-[#18181b] border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] hover:bg-[#bef264] active:translate-y-0.5 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>+ Tambah Dokter Baru</span>
        </button>
      </div>

      {/* 2. KPI Summary Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#fef08a] border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#18181b]">TOTAL DOKTER</span>
            <div className="text-3xl font-black">{totalDoctors}</div>
          </div>
          <span className="material-symbols-outlined text-4xl text-[#18181b]">medical_services</span>
        </div>

        <div className="p-4 bg-[#a3e635] border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#18181b]">DOKTER AKTIF JAGA</span>
            <div className="text-3xl font-black">{activeCount}</div>
          </div>
          <span className="material-symbols-outlined text-4xl text-[#18181b]">check_circle</span>
        </div>

        <div className="p-4 bg-[#f472b6] border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#18181b]">NONAKTIF / CUTI</span>
            <div className="text-3xl font-black">{inactiveCount}</div>
          </div>
          <span className="material-symbols-outlined text-4xl text-[#18181b]">cancel</span>
        </div>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Filter & Search */}
        <div className="md:col-span-4 space-y-4">
          <div className="p-4 bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] space-y-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#71717a]">
                search
              </span>
              <input
                type="text"
                placeholder="Cari nama, spesialis..."
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
                <option value="NAME_ASC">Nama Dokter (A - Z)</option>
                <option value="NAME_DESC">Nama Dokter (Z - A)</option>
                <option value="FEE_ASC">Tarif Termurah</option>
                <option value="FEE_DESC">Tarif Tertinggi</option>
              </select>
            </div>
          </div>

          {/* Filter Status Aktif */}
          <div className="p-4 bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-[#71717a] pb-2 border-b-2 border-[#18181b]/10 flex justify-between items-center">
              <span>STATUS PRAKTIK</span>
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStatus('ALL')}
              className={`w-full text-left p-2.5 font-black text-xs border-2 border-[#18181b] flex items-center justify-between transition-all cursor-pointer ${
                selectedStatus === 'ALL'
                  ? 'bg-[#18181b] text-white shadow-[2px_2px_0px_#a3e635]'
                  : 'bg-white hover:bg-[#fef9c3] text-[#18181b]'
              }`}
            >
              <span>SEMUA DOKTER</span>
              <span className="px-2 py-0.5 text-[10px] bg-white text-[#18181b] border border-[#18181b] font-black">
                {totalDoctors}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('ACTIVE')}
              className={`w-full text-left p-2.5 font-black text-xs border-2 border-[#18181b] flex items-center justify-between transition-all cursor-pointer ${
                selectedStatus === 'ACTIVE'
                  ? 'bg-[#18181b] text-white shadow-[2px_2px_0px_#a3e635]'
                  : 'bg-white hover:bg-[#fef9c3] text-[#18181b]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a3e635] border border-[#18181b]" />
                <span>AKTIF PRAKTIK</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] bg-[#a3e635] text-[#18181b] border border-[#18181b] font-black">
                {activeCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('INACTIVE')}
              className={`w-full text-left p-2.5 font-black text-xs border-2 border-[#18181b] flex items-center justify-between transition-all cursor-pointer ${
                selectedStatus === 'INACTIVE'
                  ? 'bg-[#18181b] text-white shadow-[2px_2px_0px_#f472b6]'
                  : 'bg-white hover:bg-[#fef9c3] text-[#18181b]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-[#18181b]" />
                <span>NONAKTIF / CUTI</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] bg-rose-500 text-white border border-[#18181b] font-black">
                {inactiveCount}
              </span>
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Main Table / Grid Area */}
        <div className="md:col-span-8 space-y-4">
          <div className="flex items-center justify-between bg-white border-3 border-[#18181b] p-3 shadow-[4px_4px_0px_#18181b]">
            <div className="text-xs font-black uppercase text-[#18181b] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span>Daftar Dokter ({filteredAndSortedDoctors.length})</span>
            </div>

            <div className="flex items-center gap-1">
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
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-12 text-center bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b]">
              <span className="material-symbols-outlined text-4xl animate-spin text-[#18181b]">progress_activity</span>
              <p className="mt-2 text-xs font-black uppercase tracking-wider">MENGAMBIL DATA DOKTER DARI SERVER...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-4 bg-rose-100 border-3 border-rose-600 text-rose-900 font-bold text-xs shadow-[4px_4px_0px_#e11d48]">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredAndSortedDoctors.length === 0 && (
            <div className="p-12 text-center bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] space-y-3">
              <span className="material-symbols-outlined text-5xl text-[#a1a1aa]">folder_open</span>
              <h3 className="text-base font-black uppercase">DATA DOKTER KOSONG / TIDAK DITEMUKAN</h3>
              <p className="text-xs font-bold text-[#71717a]">
                Belum ada dokter yang terdaftar atau hasil pencarian tidak sesuai.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-[#a3e635] text-[#18181b] border-2 border-[#18181b] font-black text-xs shadow-[2px_2px_0px_#18181b] hover:bg-[#bef264] cursor-pointer"
              >
                + Tambah Dokter Baru
              </button>
            </div>
          )}

          {/* Data List: GRID VIEW */}
          {!isLoading && !error && filteredAndSortedDoctors.length > 0 && viewMode === 'GRID' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredAndSortedDoctors.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] flex flex-col justify-between ${
                    !item.isActive ? 'opacity-70 bg-zinc-50' : ''
                  }`}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-[#38bdf8] border-2 border-[#18181b] flex items-center justify-center font-black text-sm text-[#18181b] shadow-[2px_2px_0px_#18181b]">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span
                        className={`px-2 py-0.5 border border-[#18181b] text-[9px] font-black uppercase ${
                          item.isActive ? 'bg-[#a3e635] text-[#18181b]' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {item.isActive ? 'AKTIF PRAKTIK' : 'NONAKTIF'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black uppercase text-base text-[#18181b]">{item.name}</h3>
                      <p className="text-xs font-black text-[#0284c7] mt-0.5">{item.spesialis}</p>
                      <p className="text-xs font-bold text-[#71717a] flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        <span>{item.phone || 'Tidak ada kontak'}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t-2 border-[#18181b]/10 flex justify-between items-baseline">
                      <span className="text-[11px] font-bold text-[#71717a]">Tarif Jasa:</span>
                      <span className="text-sm font-black text-emerald-800">
                        Rp {Number(item.fee).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

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
                      onClick={() => handleDeleteDoctor(item.id, item.name)}
                      className="py-1.5 px-3 bg-white text-rose-600 border-2 border-[#18181b] text-xs font-black hover:bg-rose-100 shadow-[2px_2px_0px_#18181b] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">person_off</span>
                      <span>NONAKTIF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Data List: TABLE VIEW */}
          {!isLoading && !error && filteredAndSortedDoctors.length > 0 && viewMode === 'TABLE' && (
            <div className="p-4 bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b-3 border-[#18181b] text-[11px] font-black uppercase tracking-wider text-[#71717a]">
                    <th className="pb-3 px-2">No</th>
                    <th className="pb-3 px-2">Nama Dokter</th>
                    <th className="pb-3 px-2">Spesialisasi</th>
                    <th className="pb-3 px-2">No. HP</th>
                    <th className="pb-3 px-2">Tarif Konsultasi</th>
                    <th className="pb-3 px-2 text-center">Status</th>
                    <th className="pb-3 px-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18181b]/10 text-xs font-bold text-[#18181b]">
                  {filteredAndSortedDoctors.map((item, index) => (
                    <tr key={item.id} className="hover:bg-[#fef9c3]/30 transition-colors">
                      <td className="py-3 px-2 font-black text-[#71717a]">{index + 1}</td>
                      <td className="py-3 px-2 font-black uppercase">{item.name}</td>
                      <td className="py-3 px-2">
                        <span className="bg-[#e0f2fe] text-[#0369a1] px-1.5 py-0.5 border border-[#18181b] font-black text-[10px]">
                          {item.spesialis}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-[11px]">{item.phone || '-'}</td>
                      <td className="py-3 px-2 font-black text-emerald-800">
                        Rp {Number(item.fee).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 border border-[#18181b] font-black text-[9px] ${
                            item.isActive ? 'bg-[#a3e635] text-[#18181b]' : 'bg-rose-500 text-white'
                          }`}
                        >
                          {item.isActive ? 'AKTIF' : 'NONAKTIF'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1 border border-[#18181b] bg-white hover:bg-[#fde047] cursor-pointer"
                            title="Edit Dokter"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDoctor(item.id, item.name)}
                            className="p-1 border border-[#18181b] bg-white text-rose-600 hover:bg-rose-100 cursor-pointer"
                            title="Nonaktifkan Dokter"
                          >
                            <span className="material-symbols-outlined text-[15px]">person_off</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 4. Modal Form Tambah / Edit Dokter */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-[#18181b] shadow-[8px_8px_0px_#18181b] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b-3 border-[#18181b]">
              <div>
                <span className="text-[10px] font-black uppercase text-[#fde047] bg-[#18181b] px-2 py-0.5">
                  {modalMode === 'CREATE' ? 'DOKTER BARU' : 'EDIT DOKTER'}
                </span>
                <h3 className="text-lg font-black uppercase text-[#18181b] mt-1">
                  {modalMode === 'CREATE' ? 'Formulir Dokter Baru' : `Edit: ${selectedDoctor?.name}`}
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
                  Nama Lengkap Dokter (Gelar)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: dr. Amanda Sp.A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[2px_2px_0px_#18181b]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[#18181b] tracking-wider block">
                  Spesialisasi Medis
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dokter Anak / Gigi / Umum"
                  value={formData.spesialis}
                  onChange={(e) => setFormData({ ...formData, spesialis: e.target.value })}
                  className="w-full p-2.5 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[2px_2px_0px_#18181b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-[#18181b] tracking-wider block">
                    Tarif Konsultasi (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    required
                    value={formData.fee || ''}
                    onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                    className="w-full p-2.5 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[2px_2px_0px_#18181b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-[#18181b] tracking-wider block">
                    Status Praktik
                  </label>
                  <select
                    value={formData.isActive ? 'ACTIVE' : 'INACTIVE'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'ACTIVE' })}
                    className="w-full p-2.5 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[2px_2px_0px_#18181b] cursor-pointer"
                  >
                    <option value="ACTIVE">AKTIF PRAKTIK</option>
                    <option value="INACTIVE">NONAKTIF / CUTI</option>
                  </select>
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
                  {modalMode === 'CREATE' ? 'SIMPAN DOKTER' : 'UPDATE DOKTER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
