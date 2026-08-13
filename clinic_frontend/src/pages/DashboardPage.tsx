import React, { useState } from 'react';
import { useOutletContext } from 'react-router';
import { StatsGrid } from '../components/StatsGrid';
import { DoctorAvailability } from '../components/DoctorAvailability';
import { HomeDashboard } from '../components/HomeDashboard';
import { WorkflowGuide } from '../components/WorkflowGuide';
import type { DashboardContextType } from '../types/clinic';

export const DashboardPage: React.FC = () => {
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<string>('ALL');

  const { doctors, visits, stats, isLoading } = useOutletContext<DashboardContextType>();

  return (
    <div className="space-y-6 w-full">
      {/* Workflow Guide Banner */}
      <WorkflowGuide
        activeTab={activeWorkflowTab}
        onTabChange={(tab) => setActiveWorkflowTab(tab)}
      />

      {/* Operational Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Bento Columns: Queue Table (8 cols) + Doctor Availability (4 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start w-full">
        <div className="col-span-1 md:col-span-8">
          <HomeDashboard
            visits={visits}
            activeFilter={activeWorkflowTab}
            onFilterChange={(tab) => setActiveWorkflowTab(tab)}
          />
        </div>
        <div className="col-span-1 md:col-span-4">
          {isLoading ? (
            <div className="neubrutal-card p-6 text-center text-xs font-bold text-[#18181b] animate-pulse flex flex-col items-center justify-center gap-3 min-h-[220px]">
              <span className="material-symbols-outlined text-[32px] text-[#18181b] animate-spin">sync</span>
              <p className="font-extrabold text-sm">Memuat Data Dokter...</p>
              <p className="text-[11px] font-semibold text-[#52525b]">Menghubungkan ke API Backend ReyClinic</p>
            </div>
          ) : (
            <DoctorAvailability doctors={doctors} />
          )}
        </div>
      </div>
    </div>
  );
};
