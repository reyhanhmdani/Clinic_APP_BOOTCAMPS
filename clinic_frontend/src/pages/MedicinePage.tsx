import React, { useState, useEffect } from 'react';
import type { Medicine } from '../types/clinic';
import {
  getMedicineService,
  createMedicineService,
  updateMedicineService,
  deleteMedicineService,
} from '../services/medicineService';

export const MedicinePage: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'SAFE' | 'LOW' | 'OUT'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME_ASC' | 'NAME_DESC' | 'STOCK_ASC' | 'STOCK_DESC' | 'PRICE_DESC'>(
    'NAME_ASC',
  );
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stock: 0,
    unit: 'Strip',
  });

  // Fetch Data Obat dari Backend
  const fetchMedicines = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMedicineService();
      setMedicines(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat data obat dari server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || formData.price < 0 || formData.stock < 0) {
      return alert('Mohon lengkapi data obat dengan benar!');
    }

    try {
      if (modalMode === 'CREATE') {
        await createMedicineService(formData);
        alert('Obat baru berhasil di tambahkan');
      } else if (modalMode === 'EDIT' && selectedMedicine) {
        await updateMedicineService(selectedMedicine.id, formData);
        alert('Data obat berhasil di perbarui');
      }

      // tutup modal dan refresh data tabel dari db
      setIsModalOpen(false);
      await fetchMedicines();
    } catch (error: any) {
      alert(`Gagal menyimpan obat ${error?.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteMedicine = async (id: number, name: string) => {
    if (!window.confirm(`Apakah kamu yakin ingin menghapus obat ${name}`)) {
      return;
    }
    try {
      await deleteMedicineService(id);
      alert(`Obat ${name} berhasil di hapus`);
      await fetchMedicines();
    } catch (error: any) {
      alert(`Gagal menghapus obat: ${error?.response?.data?.message || error.message}`);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('CREATE');
    setSelectedMedicine(null);
    setFormData({ name: '', price: 0, stock: 0, unit: 'Strip' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (med: Medicine) => {
    setModalMode('EDIT');
    setSelectedMedicine(med);
    setFormData({
      name: med.name,
      price: med.price,
      stock: med.stock,
      unit: med.unit,
    });
    setIsModalOpen(true);
  };

  // Filter & Sort Logic
  const filteredAndSortedMedicines = medicines
    .filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;
      if (selectedFilter === 'SAFE') return item.stock >= 20;
      if (selectedFilter === 'LOW') return item.stock > 0 && item.stock < 20;
      if (selectedFilter === 'OUT') return item.stock === 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name);
      if (sortBy === 'STOCK_ASC') return a.stock - b.stock;
      if (sortBy === 'STOCK_DESC') return b.stock - a.stock;
      if (sortBy === 'PRICE_DESC') return b.price - a.price;
      return 0;
    });

  // KPI Stats
  const totalItems = medicines.length;
  const totalStockUnits = medicines.reduce((sum, m) => sum + m.stock, 0);
  const lowStockCount = medicines.filter((m) => m.stock > 0 && m.stock < 20).length;
  const outOfStockCount = medicines.filter((m) => m.stock === 0).length;

  return (
    <div className="space-y-6 w-full text-[#18181b] font-sans antialiased pb-12">
      {/* 1. Top Header Banner Ala PZN */}
      <div className="space-y-2">
        <div className="inline-block bg-[#a3e635] text-[#18181b] font-black text-xs px-3 py-1 border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] uppercase tracking-wider">
          KATALOG FARMASI
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#18181b] uppercase">
          DATA MASTER OBAT & STOK APOTEK
        </h1>
        <p className="text-xs sm:text-sm font-bold text-[#52525b] max-w-3xl">
          Kelola inventaris obat klinik, monitor batas stok minimum, dan tetapkan harga resmi dengan akurat.
        </p>
      </div>
      {/* 2. Main Two-Column Layout (PZN Catalog Style) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Search & Filter Stacked Menu (4 Cols) */}
        <div className="md:col-span-4 space-y-4">
          {/* Action Button: Tambah Obat */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="w-full py-3.5 bg-[#a3e635] text-[#18181b] border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] hover:scale-[1.01] active:translate-y-0.5 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>+ Tambah Obat Baru</span>
          </button>

          {/* Search Box */}
          <div className="p-4 bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] space-y-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#71717a]">
                search
              </span>
              <input
                type="text"
                placeholder="Cari obat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-[#71717a] tracking-wider block">
                Urutkan Berdasarkan:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-2 border-2 border-[#18181b] bg-white text-xs font-black text-[#18181b] focus:outline-none cursor-pointer"
              >
                <option value="NAME_ASC">Nama Obat (A - Z)</option>
                <option value="NAME_DESC">Nama Obat (Z - A)</option>
                <option value="STOCK_ASC">Stok Paling Sedikit</option>
                <option value="STOCK_DESC">Stok Terbanyak</option>
                <option value="PRICE_DESC">Harga Tertinggi</option>
              </select>
            </div>
          </div>

          {/* Stacked Categories List (Identik Style PZN) */}
          <div className="p-4 bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-[#71717a] border-b-2 border-[#18181b]/10 pb-2">
              Kategori & Status Stok
            </p>

            <div className="space-y-1.5 pt-1">
              {[
                { id: 'ALL', label: 'SEMUA OBAT', count: totalItems },
                { id: 'SAFE', label: 'STOK AMAN (≥20)', count: medicines.filter((m) => m.stock >= 20).length },
                { id: 'LOW', label: 'STOK MENIPIS (<20)', count: lowStockCount },
                { id: 'OUT', label: 'STOK HABIS (0)', count: outOfStockCount },
              ].map((filter) => {
                const isActive = selectedFilter === filter.id;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setSelectedFilter(filter.id as any)}
                    className={`w-full px-3 py-2.5 text-left text-xs font-black border-2 border-[#18181b] transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[#18181b] text-white shadow-[2px_2px_0px_#a3e635]'
                        : 'bg-white text-[#18181b] hover:bg-[#fde047]'
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 font-black border border-[#18181b] rounded ${
                        isActive ? 'bg-white text-[#18181b]' : 'bg-[#f4f4f5] text-[#18181b]'
                      }`}
                    >
                      {filter.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stock Summary Box */}
          <div className="p-4 bg-[#fef08a] border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] space-y-2 text-xs">
            <p className="font-black uppercase tracking-wider text-[#18181b] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">inventory</span>
              <span>Ringkasan Inventaris</span>
            </p>
            <div className="flex justify-between border-b border-[#18181b]/20 pb-1 font-bold">
              <span>Total Jenis:</span>
              <span className="font-black">{totalItems} Obat</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total Fisik Stok:</span>
              <span className="font-black">{totalStockUnits} Unit</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Grid Kartu Obat PZN Style & Table Toggle (8 Cols) */}
        <div className="md:col-span-8 space-y-4">
          {/* Bar Kontrol Atas (Mode View & Hasil Pencarian) */}
          <div className="p-3.5 bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] flex justify-between items-center">
            <div className="text-xs font-black text-[#18181b]">
              Menampilkan <span className="text-emerald-700 font-black">{filteredAndSortedMedicines.length}</span> dari{' '}
              {totalItems} Obat
            </div>

            {/* View Mode Toggle: Grid vs Table */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                title="Tampilan Grid Kartu"
                className={`p-1.5 border-2 border-[#18181b] text-xs font-black flex items-center gap-1 cursor-pointer transition-all ${
                  viewMode === 'GRID' ? 'bg-[#a3e635] shadow-[2px_2px_0px_#18181b]' : 'bg-white hover:bg-zinc-100'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                title="Tampilan Tabel Data"
                className={`p-1.5 border-2 border-[#18181b] text-xs font-black flex items-center gap-1 cursor-pointer transition-all ${
                  viewMode === 'TABLE' ? 'bg-[#a3e635] shadow-[2px_2px_0px_#18181b]' : 'bg-white hover:bg-zinc-100'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">table_rows</span>
                <span className="hidden sm:inline">Tabel</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="p-12 text-center bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] space-y-3">
              <div className="w-10 h-10 border-4 border-[#18181b] border-t-[#a3e635] rounded-full animate-spin mx-auto" />
              <p className="text-xs font-black text-[#18181b] uppercase tracking-wider">
                Mengambil data katalog obat dari database...
              </p>
            </div>
          ) : error ? (
            <div className="p-6 bg-[#fecdd3] border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] text-xs font-bold text-[#9f1239] space-y-3 text-center">
              <span className="material-symbols-outlined text-[32px]">error</span>
              <p className="font-black">{error}</p>
              <button
                type="button"
                onClick={fetchMedicines}
                className="px-4 py-2 bg-white text-[#18181b] border-2 border-[#18181b] font-black shadow-[2px_2px_0px_#18181b] cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          ) : filteredAndSortedMedicines.length === 0 ? (
            <div className="p-12 text-center bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] space-y-2">
              <span className="material-symbols-outlined text-[36px] text-[#71717a]">search_off</span>
              <p className="text-sm font-black text-[#18181b]">Tidak ada obat yang cocok dengan pencarian.</p>
              <p className="text-xs font-bold text-[#71717a]">Coba reset filter atau kata kunci pencarian Anda.</p>
            </div>
          ) : viewMode === 'GRID' ? (
            /* Mode 1: GRID CARDS (Style Identik Kartu PZN) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredAndSortedMedicines.map((med) => {
                const isOut = med.stock === 0;
                const isLow = med.stock > 0 && med.stock < 20;

                return (
                  <div
                    key={med.id}
                    className="bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] flex flex-col justify-between hover:-translate-y-1 transition-transform"
                  >
                    <div>
                      {/* Top Header Card Box (Black Header Box ala PZN) */}
                      <div className="bg-[#18181b] text-white p-3.5 flex items-center justify-between relative border-b-3 border-[#18181b]">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#a3e635] text-[20px]">pill</span>
                          <span className="font-mono text-xs font-black text-white tracking-wider">{med.code}</span>
                        </div>

                        {/* Status Badge di Pojok Kanan Atas */}
                        {isOut ? (
                          <span className="bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 border border-white tracking-wider uppercase">
                            HABIS
                          </span>
                        ) : isLow ? (
                          <span className="bg-[#fde047] text-[#18181b] font-black text-[10px] px-2 py-0.5 border border-[#18181b] tracking-wider uppercase">
                            MENIPIS
                          </span>
                        ) : (
                          <span className="bg-[#a3e635] text-[#18181b] font-black text-[10px] px-2 py-0.5 border border-[#18181b] tracking-wider uppercase">
                            READY
                          </span>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-black text-sm text-[#18181b] tracking-tight line-clamp-1 uppercase">
                            {med.name}
                          </h3>
                          <span className="inline-block bg-[#f4f4f5] text-[#52525b] text-[10px] font-black px-2 py-0.5 border border-[#18181b] mt-1">
                            Kemasan: {med.unit}
                          </span>
                        </div>

                        {/* Info Stok & Bar Indikator */}
                        <div className="space-y-1 bg-[#f9fafb] p-2.5 border-2 border-[#18181b]/10 text-xs">
                          <div className="flex justify-between items-center font-black">
                            <span className="text-[#71717a]">Sisa Stok:</span>
                            <span
                              className={`text-sm ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-[#18181b]'}`}
                            >
                              {med.stock} <span className="text-xs font-bold text-[#71717a]">{med.unit}</span>
                            </span>
                          </div>
                        </div>

                        {/* Harga Satuan Box */}
                        <div className="pt-2 border-t-2 border-[#18181b]/10 flex justify-between items-baseline">
                          <span className="text-[11px] font-bold text-[#71717a]">Harga Resmi:</span>
                          <span className="text-base font-black text-emerald-800">
                            Rp {Number(med.price).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons (Ala PZN Button Detail/Lihat) */}
                    <div className="p-3 bg-[#f8fafc] border-t-3 border-[#18181b] grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(med)}
                        className="py-2 px-3 bg-white text-[#18181b] border-2 border-[#18181b] text-xs font-black hover:bg-[#fde047] shadow-[2px_2px_0px_#18181b] flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span>EDIT</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMedicine(med.id, med.name)}
                        className="py-2 px-3 bg-white text-rose-600 border-2 border-[#18181b] text-xs font-black hover:bg-rose-100 shadow-[2px_2px_0px_#18181b] flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>HAPUS</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Mode 2: TABLE VIEW */
            <div className="p-4 bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b-3 border-[#18181b] text-[11px] font-black uppercase tracking-wider text-[#71717a]">
                    <th className="pb-3 px-2">No</th>
                    <th className="pb-3 px-2">Kode</th>
                    <th className="pb-3 px-2">Nama Obat</th>
                    <th className="pb-3 px-2">Satuan</th>
                    <th className="pb-3 px-2">Harga</th>
                    <th className="pb-3 px-2 text-center">Stok</th>
                    <th className="pb-3 px-2 text-center">Status</th>
                    <th className="pb-3 px-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18181b]/10 text-xs font-bold text-[#18181b]">
                  {filteredAndSortedMedicines.map((item, index) => {
                    const isOutOfStock = item.stock === 0;
                    const isLowStock = item.stock > 0 && item.stock < 20;

                    return (
                      <tr key={item.id} className="hover:bg-[#fef9c3]/30 transition-colors">
                        <td className="py-3 px-2 font-black text-[#71717a]">{index + 1}</td>
                        <td className="py-3 px-2">
                          <span className="font-mono bg-[#f4f4f5] px-1.5 py-0.5 rounded border border-[#18181b] font-black text-[11px]">
                            {item.code}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-black uppercase text-sm">{item.name}</td>
                        <td className="py-3 px-2">
                          <span className="bg-[#fef08a] px-1.5 py-0.5 border border-[#18181b] text-[10px] font-black">
                            {item.unit}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-black text-emerald-800">
                          Rp {Number(item.price).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-2 text-center font-black">{item.stock}</td>
                        <td className="py-3 px-2 text-center">
                          {isOutOfStock ? (
                            <span className="bg-rose-500 text-white border border-[#18181b] font-black text-[9px] px-2 py-0.5">
                              HABIS
                            </span>
                          ) : isLowStock ? (
                            <span className="bg-[#fde047] text-[#18181b] border border-[#18181b] font-black text-[9px] px-2 py-0.5">
                              MENIPIS
                            </span>
                          ) : (
                            <span className="bg-[#a3e635] text-[#18181b] border border-[#18181b] font-black text-[9px] px-2 py-0.5">
                              AMAN
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1 border border-[#18181b] bg-white hover:bg-[#fde047] cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMedicine(item.id, item.name)}
                              className="p-1 border border-[#18181b] bg-white text-rose-600 hover:bg-rose-100 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* 3. Modal Form Tambah / Edit Obat (Pop-up Modal Neubrutalism) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-[#18181b] shadow-[8px_8px_0px_#18181b] p-6 space-y-5">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b-3 border-[#18181b] pb-3">
              <h3 className="text-base font-black text-[#18181b] uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-emerald-700">
                  {modalMode === 'CREATE' ? 'add_circle' : 'edit_square'}
                </span>
                <span>{modalMode === 'CREATE' ? 'TAMBAH OBAT BARU' : 'EDIT DATA OBAT'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 bg-white border-2 border-[#18181b] hover:bg-rose-500 hover:text-white cursor-pointer font-black"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Nama Obat */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[#18181b] tracking-wider block">
                  Nama Obat & Dosis
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Paracetamol 500mg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[2px_2px_0px_#18181b]"
                />
              </div>

              {/* Satuan / Unit & Stok */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-[#18181b] tracking-wider block">
                    Satuan / Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2.5 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[2px_2px_0px_#18181b] cursor-pointer"
                  >
                    <option value="Strip">Strip</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Botol">Botol</option>
                    <option value="Kapsul">Kapsul</option>
                    <option value="Ampul">Ampul</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Box">Box</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-[#18181b] tracking-wider block">
                    Jumlah Stok
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-2.5 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[2px_2px_0px_#18181b]"
                  />
                </div>
              </div>

              {/* Harga Jual Satuan */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[#18181b] tracking-wider block">
                  Harga Satuan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  placeholder="15000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full p-2.5 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[2px_2px_0px_#18181b]"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t-2 border-[#18181b]/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border-2 border-[#18181b] bg-white text-xs font-black text-[#18181b] hover:bg-zinc-100 shadow-[2px_2px_0px_#18181b] cursor-pointer uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#a3e635] text-[#18181b] border-2 border-[#18181b] text-xs font-black shadow-[2px_2px_0px_#18181b] hover:scale-102 cursor-pointer uppercase tracking-wider"
                >
                  {modalMode === 'CREATE' ? 'Simpan Obat Baru' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
