import React from "react";

export const WorkflowGuide: React.FC = () => {
  const steps = [
    { num: "1", title: "Antrean Masuk", color: "bg-[#fde047]" },
    { num: "2", title: "Konsultasi Dokter", color: "bg-[#38bdf8]" },
    { num: "3", title: "Tagihan Kasir", color: "bg-[#f472b6]" },
    { num: "4", title: "Selesai & Lunas", color: "bg-[#4ade80]" },
  ];

  return (
    <div className="bg-white border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] rounded-xl px-4 py-2.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="bg-[#18181b] text-[#a3e635] text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase tracking-wider">
          ALUR RAWAT JALAN
        </span>
        <span className="text-xs font-bold text-[#52525b]">
          Standar Operasional Pelayanan Pasien
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {steps.map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-1.5 bg-[#f4f3ed] border border-[#18181b] px-2.5 py-1 rounded-lg">
              <span
                className={`w-4 h-4 rounded-full ${s.color} border border-[#18181b] text-[10px] font-black flex items-center justify-center text-[#18181b]`}
              >
                {s.num}
              </span>
              <span className="text-[11px] font-black text-[#18181b] uppercase">
                {s.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <span className="text-[#a1a1aa] font-black text-xs">➔</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
