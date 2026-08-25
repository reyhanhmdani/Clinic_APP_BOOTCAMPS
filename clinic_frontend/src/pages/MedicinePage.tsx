import React, { useState, useEffect } from "react";
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

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW_STOCK" | "IN_STOCK">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("Tablet");

  const commonUnits = ["Tablet", "Kapsul", "Sirup", "Botol", "Salep", "Pcs", "Strip"];

  useEffect(() => {
    fetchMedicines();
  }, []);

  const openCreateModal = () => {
    setModalMode("CREATE");
    setSelectedMedicine(null);
    setName("");
    setPrice("");
    setStock("");
    setUnit("Tablet");
    setIsModalOpen(true);
  };

  const openEditModal = (med: Medicine) => {
    setModalMode("EDIT");
    setSelectedMedicine(med);
    setName(med.name);
    setPrice(new Intl.NumberFormat("id-ID").format(Number(med.price)));
    setStock(String(med.stock));
    setUnit(med.unit);
    setIsModalOpen(true);
  };

  // Live Currency Formatting Handler
  const handlePriceChange = (text: string) => {
    const cleanNumber = text.replace(/\D/g, "");
    if (!cleanNumber) {
      setPrice("");
      return;
    }
    const formatted = new Intl.NumberFormat("id-ID").format(Number(cleanNumber));
    setPrice(formatted);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama obat wajib diisi!");
      return;
    }

    const cleanPrice = Number(price.replace(/\D/g, ""));
    if (!price.trim() || isNaN(cleanPrice) || cleanPrice <= 0) {
      alert("Harga jual obat harus berupa nominal angka valid!");
      return;
    }

    const numStock = Number(stock);
    if (!stock.trim() || isNaN(numStock) || numStock < 0) {
      alert("Jumlah stok obat harus berupa angka valid!");
      return;
    }

    const payload = {
      name: name.trim(),
      price: cleanPrice,
      stock: numStock,
      unit: unit,
    };

    try {
      if (modalMode === "CREATE") {
        await createMedicineService(payload);
        alert("Obat baru berhasil ditambahkan!");
      } else if (modalMode === "EDIT" && selectedMedicine) {
        await updateMedicineService(selectedMedicine.id, payload);
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
    if (confirm(`Apakah Anda yakin ingin menghapus data obat ${name}?`)) {
      try {
        await deleteMedicineService(id);
        alert(`Data obat ${name} berhasil dihapus`);
        fetchMedicines();
      } catch (err: any) {
        const message = err?.response?.data?.message || err.message || "Gagal menghapus obat";
        alert(message);
      }
    }
  };

  // Critical Low Stock Medicines (<= 5)
  const lowStockMedicines = medicines.filter((m) => m.stock <= 5);

  // Filter Logic
  const filteredMedicines = medicines.filter((med) => {
    if (stockFilter === "LOW_STOCK" && med.stock > 5) return false;
    if (stockFilter === "IN_STOCK" && med.stock <= 5) return false;

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      return (
        med.name.toLowerCase().includes(q) ||
        med.code.toLowerCase().includes(q) ||
        med.unit.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] rounded-2xl p-5">
        <div>
          <div className="inline-block bg-[#a3e635] text-[#18181b] text-[10px] font-black tracking-wider px-2 py-0.5 border-2 border-[#18181b] shadow-[1px_1px_0px_#18181b] uppercase mb-1">
            FARMASI & APOTEK
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#18181b] tracking-tight uppercase">
            KATALOG OBAT & TARIF
          </h1>
          <p className="text-xs md:text-sm text-[#52525b] font-bold">
            Total {medicines.length} produk obat & persediaan apotek klinik
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="neubrutal-btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer uppercase tracking-wider text-xs font-black"
        >
          <span className="material-symbols-outlined text-[18px]">add_box</span>
          <span>+ Tambah Obat Baru</span>
        </button>
      </div>

      {/* Critical Low Stock Alert Banner */}
      {lowStockMedicines.length > 0 && (
        <div className="bg-[#fef2f2] border-3 border-[#f43f5e] shadow-[4px_4px_0px_#f43f5e] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f43f5e] text-white rounded-xl flex items-center justify-center border-2 border-[#18181b] shrink-0">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <div>
              <h3 className="text-xs font-black text-[#991b1b] uppercase">
                Peringatan: {lowStockMedicines.length} Obat Stok Kritis!
              </h3>
              <p className="text-[11px] font-bold text-[#b91c1c]">
                {lowStockMedicines.map((m) => `${m.name} (sisa ${m.stock} ${m.unit})`).join(", ")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStockFilter("LOW_STOCK")}
            className="hidden sm:block px-3 py-1 bg-white border-2 border-[#f43f5e] text-[#991b1b] font-black text-xs uppercase rounded-lg hover:bg-rose-100 cursor-pointer"
          >
            Lihat Obat
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white border-3 border-[#18181b] shadow-[3px_3px_0px_#18181b] rounded-2xl p-4">
        {/* Search Bar */}
        <div className="flex-1 flex items-center bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2">
          <span className="material-symbols-outlined text-[18px] text-[#71717a] mr-2">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama obat, kode, atau satuan..."
            className="w-full bg-transparent text-xs font-bold text-[#18181b] outline-none placeholder:text-[#a1a1aa]"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-[#71717a] hover:text-[#18181b]"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
        </div>

        {/* Stock Filter Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { id: "ALL", label: "Semua" },
            { id: "LOW_STOCK", label: "Stok Kritis" },
            { id: "IN_STOCK", label: "Stok Cukup" },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStockFilter(s.id as any)}
              className={`px-3 py-1.5 rounded-xl border-2 border-[#18181b] text-xs font-black uppercase transition-all ${
                stockFilter === s.id
                  ? "bg-[#18181b] text-white shadow-[2px_2px_0px_#a3e635]"
                  : "bg-white text-[#18181b] hover:bg-[#fef08a]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Medicines Table */}
      {isLoading ? (
        <div className="py-20 text-center bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] rounded-2xl p-6">
          <span className="material-symbols-outlined text-[36px] text-[#18181b] animate-spin mb-2">
            sync
          </span>
          <p className="font-black text-sm uppercase">Memuat Katalog Obat...</p>
        </div>
      ) : filteredMedicines.length === 0 ? (
        <div className="py-16 text-center bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] rounded-2xl p-6 space-y-2">
          <span className="material-symbols-outlined text-[48px] text-[#71717a]">
            medication_liquid
          </span>
          <h3 className="text-base font-black uppercase text-[#18181b]">Tidak Ada Data Obat</h3>
          <p className="text-xs text-[#71717a] font-medium max-w-sm mx-auto">
            {searchTerm
              ? `Tidak ada obat yang cocok dengan pencarian "${searchTerm}"`
              : "Belum ada obat yang didaftarkan ke apotek klinik."}
          </p>
        </div>
      ) : (
        <div className="bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#18181b] text-white uppercase font-black text-[11px] tracking-wider border-b-3 border-[#18181b]">
                  <th className="p-3.5">Kode</th>
                  <th className="p-3.5">Nama Obat</th>
                  <th className="p-3.5">Satuan</th>
                  <th className="p-3.5">Harga Jual</th>
                  <th className="p-3.5">Sisa Stok</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-zinc-200 font-bold text-[#18181b]">
                {filteredMedicines.map((medicine) => {
                  const isLow = medicine.stock <= 5;

                  return (
                    <tr key={medicine.id} className="hover:bg-[#f4f3ed] transition-colors">
                      <td className="p-3.5">
                        <span className="bg-[#fef08a] border border-[#18181b] px-2 py-0.5 rounded text-[11px] font-black">
                          {medicine.code}
                        </span>
                      </td>
                      <td className="p-3.5 font-black text-sm uppercase">{medicine.name}</td>
                      <td className="p-3.5">
                        <span className="bg-[#f4f3ed] border border-[#18181b] px-2.5 py-0.5 rounded text-xs font-black">
                          {medicine.unit}
                        </span>
                      </td>
                      <td className="p-3.5 font-black text-sm text-[#059669]">
                        {formatRupiah(medicine.price)}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg border-2 border-[#18181b] text-xs font-black ${
                            isLow
                              ? "bg-[#fecdd3] text-[#991b1b]"
                              : "bg-[#d9f99d] text-[#166534]"
                          }`}
                        >
                          {medicine.stock} {medicine.unit} {isLow && "⚠️"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(medicine)}
                            className="bg-white border-2 border-[#18181b] px-2.5 py-1 rounded-lg text-[11px] font-black uppercase hover:bg-zinc-100 transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMedicine(medicine.id, medicine.name)}
                            className="bg-[#f43f5e] text-white border-2 border-[#18181b] px-2.5 py-1 rounded-lg text-[11px] font-black uppercase hover:bg-rose-600 transition-all cursor-pointer"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-[#18181b] shadow-[8px_8px_0px_#18181b] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#18181b]">
              <div>
                <h3 className="text-xl font-black text-[#18181b] uppercase tracking-tight">
                  {modalMode === "CREATE" ? "Tambah Obat Baru" : "Edit Data Obat"}
                </h3>
                <p className="text-xs font-bold text-[#71717a]">
                  Formulir katalog obat & tarif apotek
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f4f3ed] border-2 border-[#18181b] flex items-center justify-center hover:bg-rose-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3">
              {/* Nama Obat */}
              <div>
                <label className="block text-xs font-black text-[#18181b] uppercase mb-1">
                  Nama Obat *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Paracetamol 500mg"
                  className="w-full bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b] outline-none"
                />
              </div>

              {/* Harga Jual (Live Rupiah Formatting) & Stok */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#18181b] uppercase mb-1">
                    Harga Jual (Rp) *
                  </label>
                  <div className="flex items-center bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3 py-2.5">
                    <span className="text-xs font-black text-[#71717a] mr-1">Rp</span>
                    <input
                      type="text"
                      required
                      value={price}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="15.000"
                      className="w-full bg-transparent text-xs font-bold text-[#18181b] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#18181b] uppercase mb-1">
                    Stok Saat Ini *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="50"
                    className="w-full bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b] outline-none"
                  />
                </div>
              </div>

              {/* Satuan Obat (Common Units Pills) */}
              <div>
                <label className="block text-xs font-black text-[#18181b] uppercase mb-1.5">
                  Satuan Kemasan *
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {commonUnits.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`px-3 py-1 rounded-lg border-2 border-[#18181b] text-xs font-black uppercase transition-all cursor-pointer ${
                        unit === u
                          ? "bg-[#18181b] text-white shadow-[2px_2px_0px_#a3e635]"
                          : "bg-[#f4f3ed] text-[#18181b] hover:bg-white"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-white border-2 border-[#18181b] rounded-xl text-xs font-black uppercase hover:bg-zinc-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#a3e635] text-[#18181b] border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] rounded-xl text-xs font-black uppercase hover:bg-lime-400 cursor-pointer"
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
