import React from 'react';

export interface PrescriptionItem {
  medicineId: number;
  medicineName: string;
  qty: number;
  dose: string;
  price?: number;
}

interface PrescriptionProps {
  prescriptions: PrescriptionItem[];
  onOpenAddModal: () => void;
  onRemovePrescription: (medicineId: number) => void;
}

export const Prescription: React.FC<PrescriptionProps> = ({
  prescriptions,
  onOpenAddModal,
  onRemovePrescription,
}) => {
  return (
    <div className="neubrutal-card p-6 bg-white border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b]">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-black text-[#18181b] uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-amber-600">medication</span>
          <span>Resep Obat & Tindakan</span>
        </h3>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-3 py-1.5 rounded-lg bg-[#a3e635] text-[#18181b] border-2 border-[#18181b] text-xs font-black shadow-[2px_2px_0px_#18181b] hover:bg-[#bbf7d0] hover:scale-105 transition-all flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Tambah Obat</span>
        </button>
      </div>

      {/* Prescription List */}
      {prescriptions.length === 0 ? (
        <div className="p-6 rounded-xl border-2 border-dashed border-[#18181b]/30 text-center text-xs font-bold text-[#52525b] bg-[#fefcf8]">
          <span className="material-symbols-outlined text-3xl text-zinc-400 block mb-1">prescriptions</span>
          Belum ada resep obat yang ditambahkan. Klik <b className="text-[#18181b]">+ Tambah Obat</b> untuk memilih dari apotek.
        </div>
      ) : (
        <div className="space-y-2.5">
          {prescriptions.map((item) => (
            <div
              key={item.medicineId}
              className="p-3.5 rounded-xl border-2 border-[#18181b] bg-[#fefcf8] shadow-[2px_2px_0px_#18181b] flex justify-between items-center group hover:bg-yellow-50 transition-colors"
            >
              <div>
                <p className="text-xs font-black text-[#18181b] flex items-center gap-1.5">
                  <span>{item.medicineName}</span>
                  {item.price && (
                    <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-300">
                      @Rp {item.price.toLocaleString('id-ID')}
                    </span>
                  )}
                </p>
                <p className="text-[11px] font-semibold text-[#52525b] mt-0.5">
                  Instruksi/Dosis: <b className="text-[#18181b]">{item.dose}</b> | Jumlah: <b className="text-[#18181b]">{item.qty}</b>
                </p>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => onRemovePrescription(item.medicineId)}
                title="Hapus Resep"
                className="w-8 h-8 rounded-lg border-2 border-[#18181b] bg-white flex items-center justify-center text-rose-600 hover:bg-rose-100 shadow-[1px_1px_0px_#18181b] active:translate-y-0.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
