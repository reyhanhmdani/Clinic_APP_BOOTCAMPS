import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router';
import type { Visit } from '../types/clinic';
import type { DashboardContextType } from '../types/clinic';

import { updateVisitService } from '../services/visitService';

// sub import
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { WorkflowGuide } from '../components/common/WorkflowGuide';
import { DoctorAvailability } from '../components/dashboard/DoctorAvailability';
import { HomeDashboard } from '../components/dashboard/HomeDashboard';

export const DashboardPage: React.FC = () => {
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<string>('ALL');

  const { doctors, visits, stats, isLoading, refreshData } = useOutletContext<DashboardContextType>();

  const navigate = useNavigate();
  const handleActionClick = async (visit: Visit, actionType: string) => {
    if (actionType === 'CALL_PATIENT') {
      try {
        await updateVisitService(visit.id, { status: 'IN_KONSULTASI' });
        await refreshData();
      } catch (err: any) {
        alert(`Gagal memanggil pasien: ${err?.response?.data?.message || err.message}`);
      }
    } else if (actionType === 'CONSULTATION') {
      navigate(`/dashboard/consultations?visitId=${visit.id}`);
    } else if (actionType === 'PROCESS_PAYMENT') {
      navigate(`/dashboard/invoices?visitId=${visit.id}`);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Workflow Guide Banner */}
      <WorkflowGuide activeTab={activeWorkflowTab} onTabChange={(tab) => setActiveWorkflowTab(tab)} />

      {/* Operational Stats Grid */}
      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start w-full">
        <div className="col-span-1 md:col-span-8">
          <HomeDashboard
            visits={visits}
            activeFilter={activeWorkflowTab}
            onFilterChange={(tab) => setActiveWorkflowTab(tab)}
            onActionClick={handleActionClick}
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
