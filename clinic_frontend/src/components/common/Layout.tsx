import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { TopAppBar } from "./TopAppBar";
import { CreateVisitModal } from "../dashboard/CreateVisitModal";
import { usePatientStore } from "../../stores/patientStore";
import { useDoctorStore } from "../../stores/doctorStore";

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState<boolean>(false);

  const { patients, fetchPatients } = usePatientStore();
  const { doctors, fetchDoctors } = useDoctorStore();

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  return (
    <div className="bg-[#f8f9fa] min-h-screen w-full flex text-[#191c1d] font-sans antialiased">
      {/* 1. Global Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* 2. Global Modal Pendaftaran Antrian Pasien */}
      <CreateVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        patients={patients}
        doctors={doctors}
      />

      {/* 3. Main Container Area */}
      <main className="flex-1 w-full min-w-0 ml-0 md:ml-20 lg:ml-24 p-3.5 sm:p-5 md:p-6 lg:p-8 min-h-screen transition-all overflow-x-hidden">
        {/* Global Top Header Bar */}
        <TopAppBar
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onAddPatientVisit={() => setIsVisitModalOpen(true)}
        />

        {/* 4. Child Route Content Area */}
        <Outlet />
      </main>
    </div>
  );
}
