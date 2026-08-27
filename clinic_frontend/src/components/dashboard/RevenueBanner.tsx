import React, { useState } from "react";
import { Wallet } from "lucide-react";
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
    <div className="bg-[#051c12] text-white border border-[#072f1f] shadow-md rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Left: Compact Revenue Info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#072f1f] border border-[#b4f105]/20 rounded-2xl flex items-center justify-center text-[#b4f105] shrink-0">
          <Wallet size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              TOTAL PENDAPATAN ({periodLabel})
            </span>
            <span className="bg-[#b4f105] text-[#051c12] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
              PAID
            </span>
          </div>
          <p className="text-2xl font-black text-white tracking-tight leading-tight">
            {formatRupiah(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Right: 4 Compact Period Pill Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#072f1f] p-1 rounded-xl border border-white/10">
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                isActive
                  ? "bg-[#b4f105] text-[#051c12] shadow-xs font-extrabold"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
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
