import React, { useState, useEffect } from "react";
import { Plus, Search, X, AlertTriangle, Pill, Loader2 } from "lucide-react";
import type { Medicine } from "../types/clinic";
import { useMedicineStore } from "../stores/medicineStore";
import {
  createMedicineService,
  updateMedicineService,
  deleteMedicineService,
} from "../services/medicineService";
import { formatRupiah } from "../utils/formatRupiah";

export const MedicinePage: React.FC = () => {
  const { medicines, loading: isLoading, fetchMedicines } = useMedicineStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW_STOCK" | "IN_STOCK">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    unit: "Tablet",
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const openCreateModal = () => {
    setModalMode("CREATE");
    setSelectedMedicine(null);
    setFormData({
      name: "",
      price: "",
      stock: "",
      unit: "Tablet",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (medicine: Medicine) => {
    setModalMode("EDIT");
    setSelectedMedicine(medicine);
    setFormData({
      name: medicine.name,
      price: String(medicine.price),
      stock: String(medicine.stock),
      unit: medicine.unit || "Tablet",
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Nama obat wajib diisi!");
      return;
    }
    const numPrice = Number(formData.price);
    const numStock = Number(formData.stock);

    if (!formData.price || isNaN(numPrice) || numPrice < 0) {
      alert("Harga satuan obat harus berupa angka valid!");
      return;
    }
    if (!formData.stock || isNaN(numStock) || numStock < 0) {
      alert("Jumlah stok obat harus berupa angka valid!");
      return;
    }

    try {
      if (modalMode === "CREATE") {
        await createMedicineService({
          name: formData.name.trim(),
          price: numPrice,
          stock: numStock,
          unit: formData.unit.trim() || "Tablet",
        });
        alert("Obat baru berhasil ditambahkan ke apotek!");
      } else if (modalMode === "EDIT" && selectedMedicine) {
        await updateMedicineService(selectedMedicine.id, {
          name: formData.name.trim(),
          price: numPrice,
          stock: numStock,
          unit: formData.unit.trim() || "Tablet",
        });
        alert("Data obat berhasil diperbarui!");
      }
      setIsModalOpen(false);
      fetchMedicines();
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || "Gagal menyimpan data obat";
      alert(message);
    }
  };

  const handleDeleteMedicine = async (id: number, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ${name} dari inventori obat?`)) {
      try {
        await deleteMedicineService(id);
        alert(`Obat ${name} berhasil dihapus.`);
        fetchMedicines();
      } catch (err: any) {
        const message = err?.response?.data?.message || err.message || "Gagal menghapus obat";
        alert(message);
      }
    }
  };

  // Filter Logic
  const filteredMedicines = medicines.filter((medicine) => {
    if (stockFilter === "LOW_STOCK" && medicine.stock > 5) return false;
    if (stockFilter === "IN_STOCK" && medicine.stock === 0) return false;

    if (searchTerm.trim() !== "") {
      return medicine.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const lowStockCount = medicines.filter((m) => m.stock <= 5).length;

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 shadow-sm rounded-[24px] p-6">
        <div>
          <div className="inline-block bg-lime-100 text-lime-900 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-lime-200 uppercase mb-1">
            Farmasi & Apotek
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Katalog Obat & Inventori
          </h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Total {medicines.length} jenis obat terdaftar di apotek klinik
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn-lime px-4 py-2.5 rounded-full flex items-center gap-2 cursor-pointer text-xs font-bold shadow-xs hover:shadow-md transition-all tracking-wide"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>+ Tambah Obat Baru</span>
        </button>
      </div>

      {/* Critical Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-4 flex items-center justify-between text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-amber-700 shrink-0" />
            <span>
              <strong>Peringatan Stok Obat:</strong> Terdapat <strong>{lowStockCount} obat</strong> dengan persediaan kritis (≤ 5 unit). Segera lakukan restok.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setStockFilter(stockFilter === "LOW_STOCK" ? "ALL" : "LOW_STOCK")}
            className="px-3 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-900 rounded-full font-bold text-[11px] transition-all cursor-pointer shrink-0"
          >
            {stockFilter === "LOW_STOCK" ? "Tampilkan Semua" : "Filter Stok Kritis"}
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white border border-slate-100 shadow-xs rounded-[24px] p-4">
        {/* Search */}
        <div className="flex-1 flex items-center bg-slate-50/70 border border-slate-200/80 rounded-full px-4 py-2">
          <Search size={16} className="text-slate-400 mr-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama obat atau sediaan..."
            className="w-full bg-transparent text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-slate-400 hover:text-slate-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Stock Filter Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { id: "ALL", label: "Semua Obat" },
            { id: "LOW_STOCK", label: `Kritis (≤5)` },
            { id: "IN_STOCK", label: "Tersedia" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStockFilter(f.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                stockFilter === f.id
                  ? "bg-[#061e15] text-white shadow-xs font-bold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Table */}
      {isLoading ? (
        <div className="py-20 text-center bg-white border border-slate-100 shadow-sm rounded-[24px] p-6 flex flex-col items-center justify-center">
          <Loader2 size={32} className="text-slate-700 animate-spin mb-2" />
          <p className="font-bold text-sm text-slate-700">Memuat Katalog Obat...</p>
        </div>
      ) : filteredMedicines.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-100 shadow-sm rounded-[24px] p-6 space-y-2 flex flex-col items-center justify-center">
          <Pill size={44} className="text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">
            Tidak Ada Data Obat
          </h3>
          <p className="text-xs text-slate-400 font-normal max-w-sm mx-auto">
            {searchTerm
              ? `Tidak ada obat yang cocok dengan pencarian "${searchTerm}"`
              : "Belum ada obat yang didaftarkan ke inventori apotek."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 shadow-sm rounded-[24px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-100">
                  <th className="p-4">Nama Obat</th>
                  <th className="p-4">Harga Satuan</th>
                  <th className="p-4">Sisa Stok</th>
                  <th className="p-4">Status Ketersediaan</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                {filteredMedicines.map((medicine) => {
                  const isCritical = medicine.stock <= 5;
                  const isOutOfStock = medicine.stock === 0;

                  return (
                    <tr key={medicine.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-sm text-slate-900 capitalize">
                          {medicine.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: #{medicine.id}
                        </div>
                      </td>

                      <td className="p-4 font-mono font-bold text-slate-800 text-sm">
                        {formatRupiah(medicine.price)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`font-bold font-mono px-3 py-1 rounded-full text-xs border ${
                            isOutOfStock
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : isCritical
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-slate-100 text-slate-800 border-slate-200"
                          }`}
                        >
                          {medicine.stock} {medicine.unit || 'unit'}
                        </span>
                      </td>

                      <td className="p-4">
                        {isOutOfStock ? (
                          <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            Habis
                          </span>
                        ) : isCritical ? (
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            Stok Menipis
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            Tersedia
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(medicine)}
                            className="bg-white border border-slate-200/80 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMedicine(medicine.id, medicine.name)}
                            className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-rose-100 transition-all cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit Obat */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {modalMode === "CREATE" ? "Tambah Obat Baru" : "Edit Data Obat"}
                </h3>
                <p className="text-xs text-slate-400 font-normal">
                  Kelola nama obat, harga satuan, dan persediaan unit
                </p>
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
              {/* Nama Obat */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Obat & Sediaan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Paracetamol 500mg Tablet"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#061e15]"
                />
              </div>

              {/* Harga & Stok */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Satuan (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="15000"
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#061e15]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Stok (Unit) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="100"
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#061e15]"
                  />
                </div>
              </div>

              {/* Satuan Unit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Satuan Kemasan (Unit)
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="Tablet / Botol / Strip / Kapsul"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#061e15]"
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
                <button
                  type="submit"
                  className="btn-forest flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {modalMode === "CREATE" ? "Simpan Obat" : "Update Obat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
