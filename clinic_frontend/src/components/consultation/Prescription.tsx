import React from 'react';
import { Pill, Plus, Trash2 } from 'lucide-react';

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
    <div className="p-6 bg-white border border-slate-200/80 shadow-sm rounded-2xl space-y-4">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Pill size={16} className="text-amber-600" />
          <span>Resep Obat Apotek</span>
        </h3>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="btn-lime px-3 py-1.5 text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1 cursor-pointer tracking-wider"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>+ Tambah Obat</span>
        </button>
      </div>

      {/* Prescription List */}
      {prescriptions.length === 0 ? (
        <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-xs font-medium text-slate-400 bg-slate-50/50 flex flex-col items-center justify-center space-y-1">
          <Pill size={28} className="text-slate-300 stroke-[1.5] mb-1" />
          <p>Belum ada resep obat. Klik <b className="text-slate-700">+ Tambah Obat</b> untuk memilih dari apotek.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {prescriptions.map((item) => (
            <div
              key={item.medicineId}
              className="p-3.5 border border-slate-200/80 rounded-xl bg-slate-50/50 flex justify-between items-center hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-2 capitalize">
                  <span>{item.medicineName}</span>
                  {item.price && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      @Rp {item.price.toLocaleString('id-ID')}
                    </span>
                  )}
                </p>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Dosis: <b className="text-slate-800">{item.dose}</b> | Jumlah: <b className="text-slate-800">{item.qty}</b>
                </p>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => onRemovePrescription(item.medicineId)}
                title="Hapus Resep"
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 shadow-xs active:translate-y-0.5 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
