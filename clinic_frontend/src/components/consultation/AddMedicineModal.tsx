import React, { useState } from 'react';
import { Pill, X, AlertCircle, Check, Search } from 'lucide-react';
import type { Medicine } from '../../types/clinic';
import type { PrescriptionItem } from './Prescription';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: Medicine[];
  onAddMedicine: (item: PrescriptionItem) => void;
  alreadySelectedIds?: number[];
}

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  medicines,
  onAddMedicine,
  alreadySelectedIds = [],
}) => {
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [qty, setQty] = useState<string>('1');
  const [dose, setDose] = useState<string>('3x1 tablet sesudah makan');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase().trim()),
  );

  const selectedMed = medicines.find((m) => m.id === Number(selectedMedicineId));

  const handleCloseModal = () => {
    setError(null);
    setSearchQuery('');
    setSelectedMedicineId('');
    onClose();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedMedicineId) {
      setError('Silakan pilih obat dari daftar!');
      return;
    }

    const numQty = Number(qty);
    if (isNaN(numQty) || numQty <= 0) {
      setError('Jumlah obat minimal 1!');
      return;
    }

    if (selectedMed && numQty > selectedMed.stock) {
      setError(`Stok obat ${selectedMed.name} tidak cukup! (Sisa stok: ${selectedMed.stock})`);
      return;
    }

    if (!dose.trim()) {
      setError('Instruksi / Dosis wajib diisi!');
      return;
    }

    if (selectedMed) {
      onAddMedicine({
        medicineId: selectedMed.id,
        medicineName: selectedMed.name,
        qty: numQty,
        dose: dose.trim(),
        price: selectedMed.price,
      });
    }

    // Reset Form & Close
    setSelectedMedicineId('');
    setSearchQuery('');
    setQty('1');
    setDose('3x1 tablet sesudah makan');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="bg-[#051c12] p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Pill size={20} className="text-[#b4f105]" />
            <h3 className="text-base font-bold text-white">Pilih Resep Obat</h3>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="w-8 h-8 rounded-xl bg-[#072f1f] text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Pilih Obat dari Database */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Daftar Obat Apotek <span className="text-rose-500">*</span>
              </label>
              {searchQuery && (
                <span className="text-[11px] text-slate-400 font-medium">
                  {filteredMedicines.length} ditemukan
                </span>
              )}
            </div>

            {/* Input Search Minimalis Cepat */}
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setError(null);
                }}
                placeholder="Cari obat cepat (cth: Paracetamol)..."
                className="w-full pl-8.5 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#051c12] placeholder:text-slate-400 transition-colors"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Quick-select chips saat pencarian aktif */}
            {searchQuery.trim() && filteredMedicines.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {filteredMedicines.slice(0, 4).map((med) => {
                  const isOutOfStock = med.stock <= 0;
                  const isAlready = alreadySelectedIds.includes(med.id);
                  const disabled = isOutOfStock || isAlready;
                  const isSelected = String(med.id) === selectedMedicineId;
                  return (
                    <button
                      key={med.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setSelectedMedicineId(String(med.id));
                        setError(null);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#051c12] text-[#b4f105] border-[#051c12] font-bold shadow-xs'
                          : disabled
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 font-medium'
                      }`}
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{med.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Dropdown Select */}
            <select
              value={selectedMedicineId}
              onChange={(e) => {
                setSelectedMedicineId(e.target.value);
                setError(null);
              }}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#051c12] cursor-pointer"
            >
              <option value="">
                {filteredMedicines.length === 0
                  ? '-- Obat tidak ditemukan --'
                  : '-- Pilih Obat Tersedia --'}
              </option>
              {filteredMedicines.map((med) => {
                const isAlready = alreadySelectedIds.includes(med.id);
                const isOutOfStock = med.stock <= 0;
                return (
                  <option key={med.id} value={med.id} disabled={isOutOfStock || isAlready}>
                    {med.name} (Stok: {med.stock}) - Rp {med.price.toLocaleString('id-ID')}
                    {isOutOfStock ? ' [HABIS]' : isAlready ? ' [SUDAH DITAMBAHKAN]' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sisa Stok & Harga Info */}
          {selectedMed && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-medium text-slate-600 flex justify-between items-center">
              <span>Sisa Stok: <b className="text-slate-900">{selectedMed.stock} unit</b></span>
              <span>Harga Satuan: <b className="text-emerald-700">Rp {selectedMed.price.toLocaleString('id-ID')}</b></span>
            </div>
          )}

          {/* 2. Jumlah / Qty */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Jumlah (Qty) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={selectedMed ? selectedMed.stock : 999}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Contoh: 10"
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#051c12]"
            />
          </div>

          {/* 3. Dosis / Aturan Pakai */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Instruksi / Dosis Aturan Pakai <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="Contoh: 3x1 tablet sesudah makan"
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#051c12]"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-lime px-5 py-2.5 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check size={16} strokeWidth={2.5} />
              <span>Tambahkan Resep</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
