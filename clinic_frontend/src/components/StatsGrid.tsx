import React from 'react';
import type { DashboardStats } from '../types/clinic';

interface StatsGridProps {
  stats: DashboardStats;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const formattedRevenue = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(stats.todayEstimatedRevenue);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {/* Stat Card 1: Checked In */}
      <div className="neubrutal-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#d5e8d2] border border-black flex items-center justify-center text-[#18181b]">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              how_to_reg
            </span>
          </div>
          <span className="text-sm font-semibold text-[#18181b]">Total Checked In</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-extrabold text-[#18181b] tracking-tight">
            {stats.totalCheckedIn}
          </span>
          <div className="neubrutal-badge-green text-xs px-2 py-1 rounded-md flex items-center">
            <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +12%
          </div>
        </div>
      </div>

      {/* Stat Card 2: Currently Waiting */}
      <div className="neubrutal-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#fef08a] border border-black flex items-center justify-center text-[#18181b]">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              hourglass_empty
            </span>
          </div>
          <span className="text-sm font-semibold text-[#18181b]">Currently Waiting</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-extrabold text-[#18181b] tracking-tight">
            {stats.currentlyWaiting}
          </span>
          <div className="neubrutal-badge-yellow text-xs px-2.5 py-1 rounded-md font-extrabold">
            ~ {stats.avgWaitTimeMinutes ?? 15} Mnt Tunggu
          </div>
        </div>
      </div>

      {/* Stat Card 3: Payments & Revenue */}
      <div className="neubrutal-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#bfdbfe] border border-black flex items-center justify-center text-[#18181b]">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              payments
            </span>
          </div>
          <span className="text-sm font-semibold text-[#18181b]">Awaiting Payment</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-extrabold text-[#18181b] tracking-tight block">
              {stats.awaitingPayment}
            </span>
            <span className="text-xs font-bold text-[#166534]">
              {formattedRevenue}
            </span>
          </div>
          <div className="neubrutal-badge-blue text-xs px-2 py-1 rounded-md flex items-center">
            <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +5%
          </div>
        </div>
      </div>

      {/* Stat Card 4: Completed Visits (Lime Green Neubrutal Card) */}
      <div className="neubrutal-card p-6 bg-[#a3e635] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
        {/* Large Decorative Icon Background */}
        <div className="absolute -right-4 -top-4 opacity-15 pointer-events-none text-black">
          <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            task_alt
          </span>
        </div>

        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              done_all
            </span>
          </div>
          <span className="text-sm font-extrabold text-[#18181b]">Completed Visits</span>
        </div>
        <div className="flex items-end justify-between relative z-10">
          <span className="text-3xl font-black text-[#18181b] tracking-tight">
            {stats.completedVisits}
          </span>
          <span className="neubrutal-badge-green text-xs px-2 py-1 rounded-md">Total</span>
        </div>
      </div>
    </div>
  );
};
