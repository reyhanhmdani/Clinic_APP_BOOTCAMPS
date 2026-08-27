import React from "react";

export const WorkflowGuide: React.FC = () => {
  const steps = [
    { num: "1", shortTitle: "Antrean", fullTitle: "Antrean Masuk", color: "bg-amber-100 text-amber-900 border-amber-200" },
    { num: "2", shortTitle: "Dokter", fullTitle: "Konsultasi Dokter", color: "bg-sky-100 text-sky-900 border-sky-200" },
    { num: "3", shortTitle: "Kasir", fullTitle: "Tagihan Kasir", color: "bg-rose-100 text-rose-900 border-rose-200" },
    { num: "4", shortTitle: "Selesai", fullTitle: "Selesai & Lunas", color: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  ];

  return (
    <div className="bg-white border border-slate-100 shadow-xs rounded-[20px] sm:rounded-[24px] p-3.5 sm:px-5 sm:py-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 text-xs">
      {/* Header Info */}
      <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="bg-[#061e15] text-[#b4f105] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Alur Pelayanan
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400">
            Standar Operasional Pasien
          </span>
        </div>
      </div>

      {/* Responsive Step Tracker: 100% Fit on Mobile without Any Truncation / Overflow */}
      <div className="grid grid-cols-4 sm:flex sm:items-center gap-1 sm:gap-1.5 w-full md:w-auto">
        {steps.map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 bg-slate-50 border border-slate-200/80 px-1.5 sm:px-2.5 py-1.5 rounded-xl sm:rounded-full min-w-0">
              <span
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ${s.color} border text-[8px] sm:text-[9px] font-bold flex items-center justify-center shrink-0`}
              >
                {s.num}
              </span>
              {/* Short title on small mobile (<640px), Full title on larger screens */}
              <span className="text-[9px] sm:text-[11px] font-bold text-slate-700 truncate">
                <span className="sm:hidden">{s.shortTitle}</span>
                <span className="hidden sm:inline">{s.fullTitle}</span>
              </span>
            </div>
            {idx < steps.length - 1 && (
              <span className="hidden sm:inline text-slate-300 font-bold text-[10px] shrink-0">➔</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
