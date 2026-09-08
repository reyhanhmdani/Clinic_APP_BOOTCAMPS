import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useOutletContext } from 'react-router';
import { Home, FileText, User, MapPin, LogOut, Stethoscope } from 'lucide-react';
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
import { CustomerAiChatModal } from '../components/customers/CustomerAiChatModal';

import { cancelVisitService } from '../services/visitService';
import { getMidtransSnapTokenService } from '../services/invoiceService';
import { toast } from 'sonner';

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
  openAiModal?: () => void;
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
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
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
      socket.off('QUEUE_UPDATED');
    };
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
      toast.success('Nomor antrean berhasil diterbitkan!');
      setActiveVisit(await getActiveCustomerVisitService());
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat kunjungan dokter');
    }
  };

  const mapPaymentMethod = (paymentType?: string): 'QRIS' | 'TRANSFER' | 'CARD' => {
    if (!paymentType) return 'QRIS';
    const type = paymentType.toLowerCase();
    if (type.includes('qris') || type.includes('gopay') || type.includes('shopeepay')) {
      return 'QRIS';
    }
    if (type.includes('card')) {
      return 'CARD';
    }
    return 'TRANSFER';
  };

  const handlePayInvoice = async (invoiceId: number) => {
    try {
      // 1. Minta token Snap ke backend
      const snapData = await getMidtransSnapTokenService(invoiceId);

      // 2. Munculkan Modal Pop-up Snap Midtrans (QRIS, VA, Card)
      if (window.snap) {
        window.snap.pay(snapData.token, {
          onSuccess: async function (result: any) {
            console.log('Payment success result:', result);

            // Deteksi metode bayar yang dipilih pasien
            const chosenMethod = mapPaymentMethod(result?.payment_type);

            try {
              await payCustomerInvoiceService(invoiceId, chosenMethod);
            } catch (e) {
              console.log('Invoice already marked paid:', e);
            }

            const paymentTypeName = (result?.payment_type || 'Pembayaran').toUpperCase();
            toast.success(`Pembayaran Berhasil via ${paymentTypeName}! Tagihan Anda telah LUNAS.`);
            await loadData(); // Auto reload agar status pindah ke Loket Farmasi
          },
          onPending: function (result: any) {
            console.log('Payment pending:', result);
            toast.info('Menunggu penyelesaian pembayaran QRIS / Virtual Account...');
          },
          onError: function (result: any) {
            console.error('Payment error:', result);
            toast.error('Pembayaran gagal atau dibatalkan.');
          },
          onClose: function () {
            console.log('Customer menutup popup pembayaran');
          },
        });
      } else {
        // Fallback jika script snap belum termuat
        window.open(snapData.redirectUrl, '_blank');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memproses pembayaran Midtrans');
    }
  };

  const handleCancelVisit = async (visitId: number) => {
    try {
      setLoading(true);
      await cancelVisitService(visitId);
      toast.success('Tiket antrean berhasil dibatalkan');
      setActiveVisit(null);
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membatalkan antrean');
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
    openAiModal: () => setShowAiModal(true),
    payInvoice: handlePayInvoice,
    cancelActiveVisit: handleCancelVisit,
    refreshAllData: loadData,
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#F8FAFC] text-[#0F172A] font-sans antialiased pb-28 selection:bg-[#2EC4B6]/20 selection:text-[#0E5A59]">
      {/* 1. Header Bar (Clinical Frosted Glass) */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl px-4 sm:px-6 pt-3.5 pb-3 border-b border-[#E2E8F0] print:hidden shadow-[0_4px_20px_-2px_rgba(14,90,89,0.03)]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#F0FAF9] text-[#0E5A59] flex items-center justify-center font-black text-base shadow-2xs shrink-0 select-none border border-[#CCEBE9]">
              <span>🩺</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#64748B]">
                  {patient?.name || user?.username || 'Pasien'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#2EC4B6] ring-2 ring-[#2EC4B6]/20 animate-pulse" />
              </div>
              <button
                type="button"
                className="text-xs sm:text-sm font-extrabold text-[#0F172A] flex items-center gap-1 leading-tight hover:text-[#0E5A59] transition-colors cursor-pointer"
              >
                <MapPin size={12} className="text-[#0E5A59]" />
                <span>ReyClinic Central</span>
                <span className="text-[9px] text-[#64748B]">▼</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-[#E2E8F0] text-[#64748B] hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-2xs"
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
          <div className="bg-white/85 backdrop-blur-md border border-[#E2E8F0] rounded-2xl p-2.5 flex items-center justify-center gap-2 text-xs text-[#64748B] animate-pulse shadow-2xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#2EC4B6] animate-ping" />
            <span>Memperbarui data antrean & rekam medis...</span>
          </div>
        )}

        <Outlet context={contextValue} />
      </main>

      {/* 3. Floating Pill Capsule Dock + Detached Action Button (ReyClinic Glassmorphism) */}
      <div className="fixed bottom-5 inset-x-4 max-w-md mx-auto flex items-center gap-2.5 z-40 print:hidden">
        {/* Kapsul Putih Navigasi (Icon + Label Teks Cantik) */}
        <nav className="flex-1 h-[60px] bg-white/90 backdrop-blur-2xl border border-white/80 rounded-full px-2 py-1 shadow-[0_12px_32px_rgba(14,90,89,0.08),0_2px_8px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,0.95)] flex items-center justify-around">
          {/* 1. Home */}
          <NavLink
            to="/customers"
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-0.5 transition-all cursor-pointer group active:scale-95 ${
                isActive ? 'text-[#0E5A59]' : 'text-[#64748B] hover:text-[#0E5A59]'
              }`
            }
            title="Home"
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-9 h-6 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-gradient-to-tr from-[#0E5A59] via-[#004140] to-[#0E5A59] text-white shadow-[0_2px_8px_rgba(14,90,89,0.3)]'
                      : 'text-[#64748B] group-hover:text-[#0E5A59] group-hover:bg-[#F0FAF9]'
                  }`}
                >
                  <Home size={16} className={isActive ? 'stroke-[2.4]' : 'stroke-[1.9]'} />
                </div>
                <span
                  className={`text-[10px] tracking-tight transition-colors mt-0.5 ${
                    isActive ? 'font-bold text-[#0E5A59]' : 'font-medium text-[#64748B]'
                  }`}
                >
                  Home
                </span>
              </>
            )}
          </NavLink>

          {/* 2. Riwayat */}
          <NavLink
            to="/customers/history"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-0.5 transition-all cursor-pointer group active:scale-95 ${
                isActive ? 'text-[#0E5A59]' : 'text-[#64748B] hover:text-[#0E5A59]'
              }`
            }
            title="Riwayat"
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-9 h-6 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-gradient-to-tr from-[#0E5A59] via-[#004140] to-[#0E5A59] text-white shadow-[0_2px_8px_rgba(14,90,89,0.3)]'
                      : 'text-[#64748B] group-hover:text-[#0E5A59] group-hover:bg-[#F0FAF9]'
                  }`}
                >
                  <FileText size={16} className={isActive ? 'stroke-[2.4]' : 'stroke-[1.9]'} />
                </div>
                <span
                  className={`text-[10px] tracking-tight transition-colors mt-0.5 ${
                    isActive ? 'font-bold text-[#0E5A59]' : 'font-medium text-[#64748B]'
                  }`}
                >
                  Riwayat
                </span>
              </>
            )}
          </NavLink>

          {/* 3. Profile */}
          <NavLink
            to="/customers/profile"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-0.5 transition-all cursor-pointer group active:scale-95 ${
                isActive ? 'text-[#0E5A59]' : 'text-[#64748B] hover:text-[#0E5A59]'
              }`
            }
            title="Profile"
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-9 h-6 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-gradient-to-tr from-[#0E5A59] via-[#004140] to-[#0E5A59] text-white shadow-[0_2px_8px_rgba(14,90,89,0.3)]'
                      : 'text-[#64748B] group-hover:text-[#0E5A59] group-hover:bg-[#F0FAF9]'
                  }`}
                >
                  <User size={16} className={isActive ? 'stroke-[2.4]' : 'stroke-[1.9]'} />
                </div>
                <span
                  className={`text-[10px] tracking-tight transition-colors mt-0.5 ${
                    isActive ? 'font-bold text-[#0E5A59]' : 'font-medium text-[#64748B]'
                  }`}
                >
                  Profile
                </span>
              </>
            )}
          </NavLink>
        </nav>

        {/* Tombol Bulat Floating Terpisah di Kanan (Tanya ReyAI Health Assistant - Symmetrical 60px Glass Ring) */}
        <button
          type="button"
          onClick={() => setShowAiModal(true)}
          className="w-[60px] h-[60px] rounded-full bg-gradient-to-tr from-[#0E5A59] via-[#004140] to-[#2EC4B6] text-white flex items-center justify-center shadow-[0_10px_28px_rgba(14,90,89,0.35),0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/50 ring-4 ring-white/80 backdrop-blur-xl hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 group relative"
          title="Tanya ReyAI (Asisten Kesehatan)"
        >
          <Stethoscope size={23} className="stroke-[2.4] group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-[#2EC4B6] ring-2 ring-white shadow-xs animate-pulse" />
        </button>
      </div>

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

      <CustomerAiChatModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        patientName={patient?.name || user?.username}
        doctors={doctors}
        onOpenBooking={() => handleOpenBookingModal()}
      />
    </div>
  );
};
