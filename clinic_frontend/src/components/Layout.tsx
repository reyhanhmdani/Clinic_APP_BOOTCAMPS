import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import { TopAppBar } from './TopAppBar';
import { ApiErrorCard } from './ApiErrorCard';
import { CreateVisitModal } from './CreateVisitModal';
import { useDashboardData } from '../hooks/useDashboardData';
import type { DashboardContextType } from '../types/clinic';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState<boolean>(false);
  const location = useLocation();

  const { doctors, patients, visits, stats, isLoading, apiError, refreshData } = useDashboardData();

  const contextValue: DashboardContextType = {
    doctors,
    patients,
    visits,
    stats,
    isLoading,
    apiError,
    refreshData,
    setIsVisitModalOpen,
  };

  return (
    <div className="organic-bg min-h-screen w-full flex text-[#1b1c19] font-sans antialiased selection:bg-[#50604f] selection:text-white">
      {/* 1. Global Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeRoute={location.pathname}
      />

      {/* 2. Global Modal Pendaftaran Pasien Baru/Lama */}
      <CreateVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        patients={patients}
        doctors={doctors}
      />

      {/* 3. Main Container Area */}
      <main className="flex-1 w-full ml-0 md:ml-20 p-4 sm:p-6 md:p-8 transition-all">
        {/* Global Top Header Bar */}
        <TopAppBar
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onAddPatientVisit={() => setIsVisitModalOpen(true)}
        />

        {/* Global API Error Banner */}
        {apiError && (
          <ApiErrorCard
            errorMessage={apiError}
            onRetry={() => refreshData()}
          />
        )}

        {/* 4. Child Route Content Area (Render Halaman Dashboard, Konsultasi, Invoice, dll.) */}
        <Outlet context={contextValue} />
      </main>
    </div>
  );
}
