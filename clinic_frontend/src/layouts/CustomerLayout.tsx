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
    payInvoice: handlePayInvoice,
    cancelActiveVisit: handleCancelVisit,
    refreshAllData: loadData,
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#F6F8F6] text-[#12241E] font-sans antialiased pb-28 selection:bg-emerald-100 selection:text-[#0F4C3A]">
      {/* 1. Header Bar (Nordic Frosted Glass) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-4 sm:px-6 pt-3.5 pb-3 border-b border-emerald-950/6 print:hidden shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center font-black text-base shadow-2xs shrink-0 select-none border border-emerald-200">
              <span>🩺</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#5A6E65]">
                  {patient?.name || user?.username || 'Pasien'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 animate-pulse" />
              </div>
              <button
                type="button"
                className="text-xs sm:text-sm font-extrabold text-[#12241E] flex items-center gap-1 leading-tight hover:text-[#059669] transition-colors cursor-pointer"
              >
                <MapPin size={12} className="text-[#059669]" />
                <span>ReyClinic Central</span>
                <span className="text-[9px] text-[#5A6E65]">▼</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/customers/notifications')}
              className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-emerald-950/10 text-[#12241E] hover:bg-emerald-50/60 flex items-center justify-center cursor-pointer relative transition-all active:scale-95 shadow-2xs"
              title="Pemberitahuan"
            >
              <Bell size={16} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] absolute top-2 right-2 ring-2 ring-white" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-emerald-950/10 text-[#5A6E65] hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-2xs"
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
          <div className="bg-white/80 backdrop-blur-md border border-emerald-950/8 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-xs text-[#5A6E65] animate-pulse shadow-2xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>Memperbarui data antrean & rekam medis...</span>
          </div>
        )}

        <Outlet context={contextValue} />
      </main>

      {/* 3. Floating Bottom Dock Navigation (Frosted Nordic Glass) */}
      <nav className="fixed bottom-3 inset-x-4 max-w-md mx-auto bg-white/85 backdrop-blur-2xl border border-white/80 rounded-full px-4 py-2 z-40 shadow-[0_12px_36px_rgba(5,150,105,0.08)] print:hidden">
        <div className="flex items-center justify-between">
          <NavLink
            to="/customers"
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-90 ${
                isActive ? 'text-[#059669]' : 'text-[#5A6E65] hover:text-[#12241E]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-50' : ''}`}>
                  <Home size={19} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                </div>
                <span className={`text-[10px] ${isActive ? 'font-extrabold' : 'font-semibold'}`}>Beranda</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-[#059669] -mt-0.5" />}
              </>
            )}
          </NavLink>

          <NavLink
            to="/customers/notifications"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-90 ${
                isActive ? 'text-[#059669]' : 'text-[#5A6E65] hover:text-[#12241E]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all relative ${isActive ? 'bg-emerald-50' : ''}`}>
                  <Bell size={19} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] absolute top-1 right-1 ring-1 ring-white" />
                </div>
                <span className={`text-[10px] ${isActive ? 'font-extrabold' : 'font-semibold'}`}>Notif</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-[#059669] -mt-0.5" />}
              </>
            )}
          </NavLink>

          <div className="flex-1 flex justify-center -mt-6">
            <button
              type="button"
              onClick={() => handleOpenBookingModal()}
              className="w-13 h-13 rounded-full bg-[#059669] hover:bg-[#047857] text-white flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(5,150,105,0.45)] border-4 border-white cursor-pointer active:scale-90 hover:scale-105 transition-all relative group"
              title="Buat Kunjungan Dokter"
            >
              <Stethoscope size={22} className="stroke-[2.5] group-hover:rotate-6 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping pointer-events-none" />
            </button>
          </div>

          <NavLink
            to="/customers/history"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-90 ${
                isActive ? 'text-[#059669]' : 'text-[#5A6E65] hover:text-[#12241E]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-50' : ''}`}>
                  <FileText size={19} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                </div>
                <span className={`text-[10px] ${isActive ? 'font-extrabold' : 'font-semibold'}`}>Riwayat</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-[#059669] -mt-0.5" />}
              </>
            )}
          </NavLink>

          <NavLink
            to="/customers/profile"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-90 ${
                isActive ? 'text-[#059669]' : 'text-[#5A6E65] hover:text-[#12241E]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-50' : ''}`}>
                  <User size={19} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                </div>
                <span className={`text-[10px] ${isActive ? 'font-extrabold' : 'font-semibold'}`}>Profil</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-[#059669] -mt-0.5" />}
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
