import React, { useState } from "react";
import type { DashboardStats } from "../../types/clinic";
import { useInvoiceStore } from "../../stores/invoiceStore";
import { formatRupiah } from "../../utils/formatRupiah";

interface StatsGridProps {
  stats: DashboardStats;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-2">
      {/* Stat 1: Total Checked In */}
      <div className="p-4 bg-white border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#71717a]">
            Total Antrean
          </span>
          <div className="w-7 h-7 bg-[#d9f99d] border border-[#18181b] rounded-lg flex items-center justify-center text-[#18181b]">
            <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-[#18181b]">{stats.totalCheckedIn}</span>
          <span className="text-[11px] font-bold text-[#71717a]">Pasien</span>
        </div>
      </div>

      {/* Stat 2: Currently Waiting */}
      <div className="p-4 bg-white border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#71717a]">
            Menunggu Dokter
          </span>
          <div className="w-7 h-7 bg-[#fef08a] border border-[#18181b] rounded-lg flex items-center justify-center text-[#18181b]">
            <span className="material-symbols-outlined text-[16px]">hourglass_empty</span>
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-[#18181b]">{stats.currentlyWaiting}</span>
          <span className="text-[11px] font-bold text-[#71717a]">Pasien</span>
        </div>
      </div>

      {/* Stat 3: Awaiting Payment */}
      <div className="p-4 bg-white border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#71717a]">
            Menunggu Kasir
          </span>
          <div className="w-7 h-7 bg-[#bae6fd] border border-[#18181b] rounded-lg flex items-center justify-center text-[#18181b]">
            <span className="material-symbols-outlined text-[16px]">pending_actions</span>
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-[#18181b]">{stats.awaitingPayment}</span>
          <span className="text-[11px] font-bold text-[#71717a]">Pasien</span>
        </div>
      </div>

      {/* Stat 4: Combined Total Revenue with Micro Pill Filter */}
      <div className="p-4 bg-[#a3e635] border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#18181b]">
            Total Pendapatan
          </span>
          {/* Micro Period Buttons */}
          <div className="flex items-center gap-0.5 bg-white/70 p-0.5 rounded-md border border-[#18181b]">
            {[
              { id: "TODAY", label: "Hari" },
              { id: "WEEK", label: "7H" },
              { id: "MONTH", label: "Bln" },
              { id: "ALL", label: "Semua" },
            ].map((p) => {
              const isActive = period === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id as any)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#18181b] text-white shadow-xs"
                      : "text-[#18181b] hover:bg-white"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <span className="text-lg font-black text-[#18181b] tracking-tight block truncate">
            {formatRupiah(totalRevenue)}
          </span>
        </div>
      </div>
    </div>
  );
};
