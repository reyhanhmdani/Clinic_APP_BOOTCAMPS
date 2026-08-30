import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useOutletContext } from 'react-router';
import { Home, Bell, Stethoscope, FileText, User, MapPin, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import {
  getCustomerProfileService,
  registerCustomerProfileService,
  getActiveDoctorsCustomerService,
  bookCustomerVisitService,
  getActiveCustomerVisitService,
  getCustomerHistoryService,
  payCustomerInvoiceService,
  type ActiveCustomerVisitData,
  type CustomerHistoryData,
} from '../services/customerService';
import type { Patient, Doctor } from '../types/clinic';
import { socket } from '../services/socket';

// Modals
import { CustomerNikModal } from '../components/customers/CustomerNikModal';
import { CustomerBookingModal } from '../components/customers/CustomerBookingModal';
import { CustomerQrisModal } from '../components/customers/CustomerQrisModal';

import { cancelVisitService } from '../services/visitService';

export interface CustomerContextType {
  patient: Patient | null;
  setPatient: React.Dispatch<React.SetStateAction<Patient | null>>;
  doctors: Doctor[];
  activeVisit: ActiveCustomerVisitData | null;
  setActiveVisit: React.Dispatch<React.SetStateAction<ActiveCustomerVisitData | null>>;
  history: CustomerHistoryData | null;
  setHistory: React.Dispatch<React.SetStateAction<CustomerHistoryData | null>>;
  loading: boolean;
  isNikLinked: boolean;
  setIsNikLinked: React.Dispatch<React.SetStateAction<boolean>>;
  openBookingModal: (doctorId?: number) => void;
  openNikModal: () => void;
  openQrisModal: () => void;
  payInvoice: (invoiceId: number) => Promise<void>;
  cancelActiveVisit: (visitId: number) => Promise<void>;
  refreshAllData: () => Promise<void>;
}

export const useCustomerContext = () => useOutletContext<CustomerContextType>();

export const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Domain data states
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeVisit, setActiveVisit] = useState<ActiveCustomerVisitData | null>(null);
  const [history, setHistory] = useState<CustomerHistoryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Status & Modals
  const [isNikLinked, setIsNikLinked] = useState<boolean>(false);
  const [showNikModal, setShowNikModal] = useState<boolean>(false);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [showQrisModal, setShowQrisModal] = useState<boolean>(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(1);

  // 1. Data Fetching & Lifecycle
  const loadData = async () => {
    try {
      const [profileRes, doctorsRes, visitRes, historyRes] = await Promise.allSettled([
        getCustomerProfileService(),
        getActiveDoctorsCustomerService(),
        getActiveCustomerVisitService(),
        getCustomerHistoryService(),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setPatient(profileRes.value);
        setIsNikLinked(true);
      } else {
        setShowNikModal(true);
      }

      if (doctorsRes.status === 'fulfilled' && doctorsRes.value) {
        setDoctors(doctorsRes.value);
        if (doctorsRes.value.length > 0) {
          setSelectedDoctorId(doctorsRes.value[0].id);
        }
      }

      if (visitRes.status === 'fulfilled') {
        setActiveVisit(visitRes.value);
      }

      if (historyRes.status === 'fulfilled') {
        setHistory(historyRes.value);
      }
    } catch (error) {
      console.error('Gagal memuat data portal customer:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // tangkap sinyal real time
    socket.on('QUEUE_UPDATED', () => {
      console.log('Sinyal antrian real time di terima');
      loadData();
    });

    return () => {
      socket.off('QUEUE_UPDATED')
    }
  }, []);

  // 2. Action Handlers
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenBookingModal = (doctorId?: number) => {
    if (!isNikLinked) {
      setShowNikModal(true);
      return;
    }
    if (doctorId) {
      setSelectedDoctorId(doctorId);
    }
    setShowBookingModal(true);
  };

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookCustomerVisitService(selectedDoctorId);
      setShowBookingModal(false);
      alert('Nomor antrean berhasil diterbitkan!');
      setActiveVisit(await getActiveCustomerVisitService());
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal membuat kunjungan dokter');
    }
  };

  const handlePayInvoice = async (invoiceId: number) => {
    try {
      await payCustomerInvoiceService(invoiceId, 'QRIS');
      setShowQrisModal(true);
      setHistory(await getCustomerHistoryService());
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal memproses pembayaran');
    }
  };

  const handleCancelVisit = async (visitId: number) => {
    try {
      setLoading(true);
      await cancelVisitService(visitId);
      alert('Tiket antrean berhasil dibatalkan');
      setActiveVisit(null);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal membatalkan antrean');
    } finally {
      setLoading(false);
    }
  };

  const contextValue: CustomerContextType = {
    patient,
    setPatient,
    doctors,
    activeVisit,
    setActiveVisit,
    history,
    setHistory,
    loading,
    isNikLinked,
    setIsNikLinked,
    openBookingModal: handleOpenBookingModal,
    openNikModal: () => setShowNikModal(true),
    openQrisModal: () => setShowQrisModal(true),
    payInvoice: handlePayInvoice,
    cancelActiveVisit: handleCancelVisit,
    refreshAllData: loadData,
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#fbfbfa] text-[#111111] font-sans antialiased pb-28 selection:bg-[#b4f105] selection:text-[#061e15]">
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-40 bg-[#fbfbfa]/90 backdrop-blur-md px-4 sm:px-6 pt-3 pb-2.5 border-b border-slate-200/60">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#061e15] text-[#b4f105] flex items-center justify-center font-black text-lg shadow-2xs shrink-0 select-none">
              <span>✱</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-slate-400">
                  {patient?.name || user?.username || 'Pasien'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <button
                type="button"
                className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1 leading-tight hover:text-[#061e15] transition-colors cursor-pointer"
              >
                <MapPin size={12} className="text-[#061e15]" />
                <span>ReyClinic Central Jakarta</span>
                <span className="text-[9px] text-slate-400">▼</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => navigate('/customers/notifications')}
              className="w-9 h-9 rounded-full bg-white border border-slate-200/80 text-slate-700 hover:text-slate-900 flex items-center justify-center cursor-pointer relative transition-all active:scale-95 shadow-2xs"
              title="Pemberitahuan"
            >
              <Bell size={16} />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-2 right-2 ring-1 ring-white" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-9 h-9 rounded-full bg-white border border-slate-200/80 text-slate-500 hover:text-rose-600 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-2xs"
              title="Keluar"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Nested Sub-Page Content */}
      <main className="max-w-md mx-auto px-4 sm:px-6 py-4 space-y-4">
        {loading && (
          <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-xs text-slate-500 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Memperbarui data antrean & profil...</span>
          </div>
        )}

        <Outlet context={contextValue} />
      </main>

      {/* 3. Floating Bottom Dock Navigation */}
      <nav className="fixed bottom-3 inset-x-4 max-w-md mx-auto bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-full px-4 py-2 z-40 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between">
          <NavLink
            to="/customers"
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-90 ${
                isActive ? 'text-[#061e15]' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-slate-100' : ''}`}>
                  <Home size={19} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                </div>
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>Beranda</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-[#061e15] -mt-0.5" />}
              </>
            )}
          </NavLink>

          <NavLink
            to="/customers/notifications"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-90 ${
                isActive ? 'text-[#061e15]' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all relative ${isActive ? 'bg-slate-100' : ''}`}>
                  <Bell size={19} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1 ring-1 ring-white" />
                </div>
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>Notif</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-[#061e15] -mt-0.5" />}
              </>
            )}
          </NavLink>

          <div className="flex-1 flex justify-center -mt-6">
            <button
              type="button"
              onClick={() => handleOpenBookingModal()}
              className="w-13 h-13 rounded-full bg-[#061e15] text-[#b4f105] flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(6,30,21,0.45)] border-4 border-white cursor-pointer active:scale-90 hover:scale-105 transition-all relative group"
              title="Buat Kunjungan Dokter"
            >
              <Stethoscope size={23} className="group-hover:rotate-6 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#b4f105] animate-ping pointer-events-none" />
            </button>
          </div>

          <NavLink
            to="/customers/history"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-90 ${
                isActive ? 'text-[#061e15]' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-slate-100' : ''}`}>
                  <FileText size={19} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                </div>
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>Riwayat</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-[#061e15] -mt-0.5" />}
              </>
            )}
          </NavLink>

          <NavLink
            to="/customers/profile"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-90 ${
                isActive ? 'text-[#061e15]' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-slate-100' : ''}`}>
                  <User size={19} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                </div>
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>Profil</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-[#061e15] -mt-0.5" />}
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* 4. Modals */}
      <CustomerNikModal
        isOpen={showNikModal}
        onClose={() => setShowNikModal(false)}
        onSaveSuccess={(newPatient) => {
          setPatient(newPatient);
          setIsNikLinked(true);
        }}
        initialPatient={patient}
        onRegisterPatient={registerCustomerProfileService}
      />

      <CustomerBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        doctors={doctors}
        selectedDoctorId={selectedDoctorId}
        onSelectDoctor={setSelectedDoctorId}
        onSubmitBooking={handleCreateVisit}
      />

      <CustomerQrisModal isOpen={showQrisModal} onClose={() => setShowQrisModal(false)} />
    </div>
  );
};
