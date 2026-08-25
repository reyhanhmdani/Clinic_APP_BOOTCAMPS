import React, { useState } from "react";
import { useInvoiceStore } from "../../stores/invoiceStore";
import { formatRupiah } from "../../utils/formatRupiah";

export const RevenueBanner: React.FC = () => {
  const [period, setPeriod] = useState<"TODAY" | "WEEK" | "MONTH" | "ALL">("TODAY");
  const invoices = useInvoiceStore((state) => state.invoices);

  const totalRevenue = invoices
    .filter((inv) => {
      if (inv.status !== "PAID") return false;
      if (period === "ALL") return true;

      const rawDate = inv.paidAt || inv.createdAt;
      if (!rawDate) return false;

      const date = new Date(rawDate);
      const now = new Date();

      if (period === "TODAY") return date.toDateString() === now.toDateString();
      if (period === "WEEK") return date >= new Date(now.getTime() - 7 * 86400000);
      if (period === "MONTH")
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      return true;
    })
    .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

  const periodLabel =
    period === "TODAY"
      ? "Hari Ini"
      : period === "WEEK"
      ? "7 Hari"
      : period === "MONTH"
      ? "Bulan Ini"
      : "Semua";

  return (
    <div className="bg-[#a3e635] border-3 border-[#18181b] shadow-[3px_3px_0px_#18181b] rounded-xl px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      {/* Left: Compact Revenue Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] rounded-xl flex items-center justify-center text-[#18181b] shrink-0">
          <span className="material-symbols-outlined text-[22px]">payments</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#18181b] uppercase tracking-wider">
              TOTAL PENDAPATAN ({periodLabel})
            </span>
            <span className="bg-[#18181b] text-[#a3e635] text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
              PAID
            </span>
          </div>
          <p className="text-2xl font-black text-[#18181b] tracking-tight leading-tight">
            {formatRupiah(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Right: 4 Compact Period Pill Buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { id: "TODAY", label: "Hari Ini" },
          { id: "WEEK", label: "7 Hari" },
          { id: "MONTH", label: "Bulan Ini" },
          { id: "ALL", label: "Semua" },
        ].map((p) => {
          const isActive = period === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id as any)}
              className={`px-3 py-1 rounded-lg border-2 border-[#18181b] text-xs font-black uppercase transition-all cursor-pointer ${
                isActive
                  ? "bg-[#18181b] text-white shadow-[2px_2px_0px_#a3e635]"
                  : "bg-white text-[#18181b] hover:bg-[#fef08a]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
