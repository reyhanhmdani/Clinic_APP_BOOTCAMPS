import React, { useState } from 'react';
import { Pill, X, AlertCircle, Check } from 'lucide-react';
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
  const [qty, setQty] = useState<string>('1');
  const [dose, setDose] = useState<string>('3x1 tablet sesudah makan');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedMed = medicines.find((m) => m.id === Number(selectedMedicineId));

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
            onClick={onClose}
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
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Daftar Obat Apotek <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedMedicineId}
              onChange={(e) => {
                setSelectedMedicineId(e.target.value);
                setError(null);
              }}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#051c12] cursor-pointer"
            >
              <option value="">-- Pilih Obat Tersedia --</option>
              {medicines.map((med) => {
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
              onClick={onClose}
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
