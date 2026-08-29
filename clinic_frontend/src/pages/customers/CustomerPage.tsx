import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Home,
  Bell,
  Stethoscope,
  FileText,
  User,
  Search,
  MapPin,
  ShoppingBag,
  Star,
  QrCode,
  X,
  LogOut,
  ShieldCheck,
  Phone,
  Calendar as CalendarIcon,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const CustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // State navigasi tab
  const [activeTab, setActiveTab] = useState<'home' | 'notification' | 'consult' | 'history' | 'profile'>('home');

  // State Pasien Digital: false = Belum ada data pasien (wajib regis awal), true = Terhubung
  const [isNikLinked, setIsNikLinked] = useState<boolean>(false);

  // State Modals
  const [showNikModal, setShowNikModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showQrisModal, setShowQrisModal] = useState(false);

  // State Form Lengkap Pendaftaran Pasien Awal
  const [nikInput, setNikInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [genderInput, setGenderInput] = useState<'MALE' | 'FEMALE'>('MALE');
  const [dobInput, setDobInput] = useState('');
  const [addressInput, setAddressInput] = useState('');

  // State Form Buat Kunjungan Dokter
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(1);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('09:00 WIB');
  const [complaintInput, setComplaintInput] = useState('');

  // Handle Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dummy placeholder handlers
  const handleRegisterPatientNik = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register NIK Pasien:', { nikInput, nameInput, phoneInput, genderInput, dobInput, addressInput });
    setIsNikLinked(true);
    setShowNikModal(false);
  };

  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNikLinked) {
      alert('Silakan daftarkan NIK Pasien terlebih dahulu sebelum membuat kunjungan.');
      setShowBookingModal(false);
      setShowNikModal(true);
      return;
    }
    console.log('Buat Kunjungan:', { selectedDoctorId, selectedTimeSlot, complaintInput });
    setShowBookingModal(false);
    alert('Nomor antrean berhasil dibuat!');
  };

  const handlePayInvoice = (invoiceId: number) => {
    console.log('Pay invoice:', invoiceId);
    setShowQrisModal(true);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] text-slate-900 font-sans antialiased pb-32 selection:bg-lime-200 selection:text-[#061e15]">
      
      {/* ============================================================ */}
      {/* 1. TOP BAR (Deep Forest Green & Electric Lime Accents)       */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 sm:px-6 pt-3 pb-2.5 border-b border-slate-100 shadow-2xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          
          {/* Brand & Location on Left */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#061e15] text-[#b4f105] flex items-center justify-center font-black text-lg shadow-xs shrink-0 select-none">
              <span>✱</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">
                Halo, {nameInput || user?.username || 'Pasien'} • Lokasi
              </span>
              <button
                type="button"
                className="text-xs sm:text-sm font-bold text-[#061e15] flex items-center gap-1 leading-tight hover:underline cursor-pointer"
              >
                <MapPin size={12} className="text-[#061e15]" />
                <span>ReyClinic Central, Jakarta</span>
                <span className="text-[9px] text-slate-400">▼</span>
              </button>
            </div>
          </div>

          {/* Cart Badge & Logout on Right */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert('Keranjang resep & antrean: 2 item')}
              className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center cursor-pointer relative transition-all active:scale-95 shadow-2xs"
              title="Keranjang & Notifikasi"
            >
              <ShoppingBag size={18} />
              <span className="w-4 h-4 rounded-full bg-[#061e15] text-[#b4f105] text-[9px] font-black flex items-center justify-center absolute -top-1 -right-1 ring-2 ring-white shadow-xs">
                2
              </span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-500 flex items-center justify-center cursor-pointer transition-all active:scale-95"
              title="Keluar Akun"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN CONTAINER                                             */}
      {/* ============================================================ */}
      <main className="max-w-md mx-auto px-4 sm:px-6 py-4 space-y-4">

        {/* 2.1 Search Bar */}
        <div className="rounded-2xl bg-white border border-slate-200/80 px-4 py-3 flex items-center gap-3 shadow-2xs">
          <Search size={18} className="text-[#061e15] shrink-0" />
          <input
            type="text"
            placeholder="Cari Dokter, Poli, atau Obat..."
            className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* ============================================================ */}
        {/* 2.2 FLOW ONBOARDING: KARTU NIK DIGITAL PASIEN                */}
        {/* ============================================================ */}
        {!isNikLinked ? (
          /* State 1: Belum Ada Data Pasien -> Onboarding Deep Forest Green Card */
          <div className="rounded-[26px] bg-[#061e15] p-5 text-white shadow-md relative overflow-hidden border border-[#092c1f] space-y-3">
            <div className="absolute right-0 -top-4 w-36 h-36 bg-[#b4f105]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -right-3 -bottom-6 select-none pointer-events-none text-[#b4f105]/20 text-[90px] font-black leading-none">
              ✱
            </div>

            <div className="flex items-center justify-between relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b4f105]/20 text-[#b4f105] text-[10px] font-black uppercase tracking-wider border border-[#b4f105]/30">
                <Sparkles size={12} />
                <span>Langkah 1 Wajib</span>
              </span>
              <span className="text-[10px] text-slate-300 font-medium">Profil Pasien</span>
            </div>

            <div className="space-y-1 relative z-10">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
                Daftarkan Data Pasien & NIK KTP
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Lengkapi identitas rekam medis Anda sekali di awal untuk dapat mengambil nomor antrean dokter dan tebus resep.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowNikModal(true)}
              className="w-full py-3 rounded-2xl bg-[#b4f105] hover:bg-[#a2db00] text-[#061e15] font-black text-xs uppercase tracking-wider shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 relative z-10 select-none"
            >
              <span>Lengkapi Data Pasien Sekarang</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          /* State 2: Sudah Terdaftar -> Kartu Digital E-Patient Mewah (Deep Forest Green + Lime) */
          <div className="rounded-[26px] bg-gradient-to-br from-[#061e15] via-[#092c1f] to-[#0d3827] p-5 text-white shadow-md relative overflow-hidden border border-[#0d3827] space-y-3">
            <div className="absolute right-2 -bottom-6 w-32 h-32 bg-[#b4f105]/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -right-3 -bottom-6 select-none pointer-events-none text-[#b4f105]/15 text-[90px] font-black leading-none">
              ✱
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <ShieldCheck size={16} className="text-[#b4f105]" />
                <span>Kartu Pasien Digital</span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#b4f105]/20 text-[#b4f105] font-extrabold border border-[#b4f105]/30">
                ✓ Terverifikasi
              </span>
            </div>

            <div className="pt-1 flex items-center justify-between relative z-10">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">Nama Pasien</span>
                <h3 className="text-base font-black text-white tracking-tight">{nameInput || user?.username || 'Pasien ReyClinic'}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">No. Rekam Medis</span>
                <span className="text-xs font-black text-[#b4f105]">RM-2026-0812</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300 relative z-10">
              <span>NIK: <strong>{nikInput || '3201************'}</strong></span>
              <button
                type="button"
                onClick={() => setShowNikModal(true)}
                className="text-xs font-bold text-[#b4f105] hover:underline cursor-pointer"
              >
                Edit Profil »
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2.3 TOMBOL AESTHETIC: BUAT KUNJUNGAN DOKTER                  */}
        {/* ============================================================ */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#b4f105] to-emerald-400 rounded-3xl blur-xs opacity-50 group-hover:opacity-100 transition duration-300 pointer-events-none" />
          
          <button
            type="button"
            onClick={() => setShowBookingModal(true)}
            className="relative w-full rounded-[24px] bg-[#061e15] hover:bg-[#0a2f21] p-4 text-white shadow-lg flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all border border-[#092c1f]"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#b4f105] shrink-0 shadow-inner group-hover:rotate-6 transition-transform">
                <Stethoscope size={24} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#b4f105] block">
                  Pendaftaran Mandiri
                </span>
                <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                  + Buat Kunjungan Dokter
                </h3>
                <p className="text-[11px] text-slate-300 font-normal">
                  Pilih dokter spesialis & ambil nomor antrean hari ini
                </p>
              </div>
            </div>

            <div className="w-9 h-9 rounded-xl bg-[#b4f105] text-[#061e15] flex items-center justify-center font-black shadow-xs shrink-0">
              <Plus size={18} strokeWidth={3} />
            </div>
          </button>
        </div>

        {/* ============================================================ */}
        {/* 2.4 LIVE ACTIVE QUEUE STATUS                                 */}
        {/* ============================================================ */}
        <div className="rounded-[22px] bg-white border border-slate-200/80 p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-lime-50 text-[#061e15] flex flex-col items-center justify-center font-bold border border-lime-200/80 shrink-0">
              <span className="text-[8px] uppercase tracking-wider leading-none text-[#061e15] font-semibold">No.</span>
              <span className="text-base font-black leading-none mt-0.5 text-[#061e15]">A-012</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#061e15] bg-lime-100/70 px-2 py-0.5 rounded-md border border-lime-200">
                  ● Sedang Berjalan
                </span>
                <span className="text-[10px] text-slate-400">Poli Umum</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 pt-0.5">dr. Budi Santoso, Sp.PD</h4>
              <p className="text-[10px] text-slate-500">Sisa di depan Anda: <strong className="text-[#061e15]">2 Pasien</strong></p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 block">Estimasi Panggil:</span>
            <span className="text-xs font-black text-slate-900">10:30 WIB</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2.5 2 CORE TILES (Diagnostics & Pharma in Clean Theme)       */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 gap-3.5">
          
          {/* Tile 1: Diagnostics Card */}
          <div
            onClick={() => setShowBookingModal(true)}
            className="rounded-[22px] bg-gradient-to-br from-[#eb7495] to-[#e45a80] p-4 text-white h-[125px] flex flex-col justify-between shadow-xs cursor-pointer hover:opacity-95 active:scale-98 transition-all relative overflow-hidden group"
          >
            <div className="self-end w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-all">
              🧪
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-white tracking-tight leading-tight">
                Diagnostics
              </h3>
              <p className="text-[10px] text-pink-100/90 font-medium leading-tight mt-0.5">
                Book Tests & Checkups
              </p>
            </div>
          </div>

          {/* Tile 2: Mint Pharma Card */}
          <div
            onClick={() => setActiveTab('history')}
            className="rounded-[22px] bg-gradient-to-br from-[#14b8a6] to-[#0d9488] p-4 text-white h-[125px] flex flex-col justify-between shadow-xs cursor-pointer hover:opacity-95 active:scale-98 transition-all relative overflow-hidden group"
          >
            <div className="self-end w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-all">
              💊
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-white tracking-tight leading-tight">
                Pharma
              </h3>
              <p className="text-[10px] text-teal-100/90 font-medium leading-tight mt-0.5">
                Medicines & health
              </p>
            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* 2.6 BANNER UPLOAD RESEP DOKTER                               */}
        {/* ============================================================ */}
        <div className="rounded-[22px] bg-[#061e15] p-4 text-white flex items-center justify-between shadow-xs border border-[#092c1f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-[#b4f105] font-bold text-lg shrink-0">
              📑
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                Upload Resep Dokter
              </h3>
              <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
                Pesan & tebus obat via foto resep resmi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowNikModal(true)}
            className="px-4 py-2 rounded-full bg-[#b4f105] hover:bg-[#a2db00] text-[#061e15] font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer shrink-0 select-none"
          >
            Upload
          </button>
        </div>

        {/* ============================================================ */}
        {/* 2.7 NEARBY PHARMACY & DOKTER (Horizontal Showcase)           */}
        {/* ============================================================ */}
        <section className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Dokter & Apotek Terdekat
            </h3>
            <button
              type="button"
              onClick={() => setShowBookingModal(true)}
              className="text-xs font-bold text-[#061e15] hover:underline cursor-pointer"
            >
              Lihat Semua »
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            
            {/* Card 1 */}
            <div className="w-[155px] sm:w-[170px] rounded-2xl bg-white border border-slate-200/80 p-3 shadow-xs shrink-0 space-y-2 hover:border-slate-300 transition-all">
              <div className="h-20 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center relative">
                <span className="text-3xl">👨‍⚕️</span>
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-white/95 text-slate-800 text-[9px] font-bold shadow-2xs border border-slate-100">
                  Tersedia
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 truncate">dr. Budi Santoso</h4>
                <p className="text-[10px] text-slate-400">Poli Umum • 08:00 - 14:00</p>
                <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold pt-1">
                  <Star size={11} fill="currentColor" />
                  <span>4.9 (120+ Ulasan)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBookingModal(true)}
                className="w-full py-1.5 rounded-lg bg-[#061e15] hover:bg-[#092c1f] text-[#b4f105] text-[10px] font-black transition-all cursor-pointer active:scale-95"
              >
                Ambil Antrean
              </button>
            </div>

            {/* Card 2 */}
            <div className="w-[155px] sm:w-[170px] rounded-2xl bg-white border border-slate-200/80 p-3 shadow-xs shrink-0 space-y-2 hover:border-slate-300 transition-all">
              <div className="h-20 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center relative">
                <span className="text-3xl">🦷</span>
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-white/95 text-slate-800 text-[9px] font-bold shadow-2xs border border-slate-100">
                  Praktek
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 truncate">drg. Ratna Kartika</h4>
                <p className="text-[10px] text-slate-400">Poli Gigi • 13:00 - 18:00</p>
                <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold pt-1">
                  <Star size={11} fill="currentColor" />
                  <span>5.0 (80+ Ulasan)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBookingModal(true)}
                className="w-full py-1.5 rounded-lg bg-[#061e15] hover:bg-[#092c1f] text-[#b4f105] text-[10px] font-black transition-all cursor-pointer active:scale-95"
              >
                Ambil Antrean
              </button>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* 2.8 RIWAYAT BEROBAT & TAGIHAN QRIS                           */}
        {/* ============================================================ */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Tagihan Obat & Konsultasi</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-bold">
              Belum Lunas
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[10px] text-slate-400 block">Total Tagihan:</span>
              <span className="text-sm font-black text-[#061e15]">Rp 85.000</span>
            </div>
            <button
              type="button"
              onClick={() => handlePayInvoice(101)}
              className="px-3.5 py-1.5 rounded-xl bg-[#061e15] hover:bg-[#092c1f] text-[#b4f105] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <QrCode size={13} />
              <span>Bayar QRIS</span>
            </button>
          </div>
        </div>

      </main>

      {/* ============================================================ */}
      {/* 3. LIVING BOTTOM NAVIGATION BAR (Themed to #061e15 & #b4f105) */}
      {/* ============================================================ */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-4 py-2 z-40 shadow-[0_-4px_25px_rgba(0,0,0,0.06)]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          
          {/* Nav 1: Home */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-90 ${
              activeTab === 'home' ? 'text-[#061e15]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'home' ? 'bg-slate-100' : ''}`}>
              <Home size={20} className={activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'} />
            </div>
            <span className={`text-[10px] ${activeTab === 'home' ? 'font-bold' : 'font-medium'}`}>Home</span>
            {activeTab === 'home' && <span className="w-1 h-1 rounded-full bg-[#061e15] -mt-0.5" />}
          </button>

          {/* Nav 2: Notification */}
          <button
            type="button"
            onClick={() => setActiveTab('notification')}
            className={`flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-90 ${
              activeTab === 'notification' ? 'text-[#061e15]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all relative ${activeTab === 'notification' ? 'bg-slate-100' : ''}`}>
              <Bell size={20} className={activeTab === 'notification' ? 'stroke-[2.5]' : 'stroke-2'} />
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 absolute top-1 right-1 ring-1 ring-white" />
            </div>
            <span className={`text-[10px] ${activeTab === 'notification' ? 'font-bold' : 'font-medium'}`}>Notif</span>
            {activeTab === 'notification' && <span className="w-1 h-1 rounded-full bg-[#061e15] -mt-0.5" />}
          </button>

          {/* Nav 3: Raised Center Action Button (#061e15 + #b4f105 Stethoscope) */}
          <div className="flex-1 flex justify-center -mt-6">
            <button
              type="button"
              onClick={() => setShowBookingModal(true)}
              className="w-13 h-13 rounded-full bg-[#061e15] text-[#b4f105] flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(6,30,21,0.5)] border-4 border-white cursor-pointer active:scale-90 hover:scale-105 transition-all relative group"
              title="Buat Kunjungan Dokter"
            >
              <Stethoscope size={24} className="group-hover:rotate-6 transition-transform" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#b4f105] animate-ping pointer-events-none" />
            </button>
          </div>

          {/* Nav 4: History */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-90 ${
              activeTab === 'history' ? 'text-[#061e15]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'history' ? 'bg-slate-100' : ''}`}>
              <FileText size={20} className={activeTab === 'history' ? 'stroke-[2.5]' : 'stroke-2'} />
            </div>
            <span className={`text-[10px] ${activeTab === 'history' ? 'font-bold' : 'font-medium'}`}>History</span>
            {activeTab === 'history' && <span className="w-1 h-1 rounded-full bg-[#061e15] -mt-0.5" />}
          </button>

          {/* Nav 5: Profile */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-90 ${
              activeTab === 'profile' ? 'text-[#061e15]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-slate-100' : ''}`}>
              <User size={20} className={activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'} />
            </div>
            <span className={`text-[10px] ${activeTab === 'profile' ? 'font-bold' : 'font-medium'}`}>Profile</span>
            {activeTab === 'profile' && <span className="w-1 h-1 rounded-full bg-[#061e15] -mt-0.5" />}
          </button>

        </div>
      </nav>

      {/* ============================================================ */}
      {/* 4. MODAL: FORM LENGKAP PENDAFTARAN PASIEN AWAL & NIK         */}
      {/* ============================================================ */}
      {showNikModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-scale-in max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#061e15] text-[#b4f105] flex items-center justify-center font-bold text-base">
                  🪪
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">Pendaftaran Pasien Digital</h3>
                  <span className="text-[10px] text-slate-400 font-medium">Lengkapi profil untuk rekam medis</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNikModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Pendaftaran Pasien */}
            <form onSubmit={handleRegisterPatientNik} className="space-y-3 pt-1">
              
              {/* Field 1: 16-Digit NIK */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 ml-1 block">
                  16-Digit NIK KTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  placeholder="Contoh: 3201123456789012"
                  value={nikInput}
                  onChange={(e) => setNikInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] focus:ring-1 focus:ring-[#061e15] transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Field 2: Nama Lengkap */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 ml-1 block">
                  Nama Lengkap Pasien <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Fajar Pratama"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] focus:ring-1 focus:ring-[#061e15] transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Field 3: Jenis Kelamin */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 ml-1 block">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGenderInput('MALE')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      genderInput === 'MALE'
                        ? 'bg-[#061e15] border-[#061e15] text-[#b4f105]'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    👨 Laki-Laki
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenderInput('FEMALE')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      genderInput === 'FEMALE'
                        ? 'bg-[#061e15] border-[#061e15] text-[#b4f105]'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    👩 Perempuan
                  </button>
                </div>
              </div>

              {/* Field 4: No. WhatsApp / HP */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 ml-1 block">
                  No. WhatsApp Aktif <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Phone size={14} className="absolute left-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] focus:ring-1 focus:ring-[#061e15] transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Field 5: Tanggal Lahir */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 ml-1 block">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <CalendarIcon size={14} className="absolute left-3 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={dobInput}
                    onChange={(e) => setDobInput(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] focus:ring-1 focus:ring-[#061e15] transition-all"
                  />
                </div>
              </div>

              {/* Field 6: Alamat Domisili */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 ml-1 block">
                  Alamat Domisili Lengkap
                </label>
                <textarea
                  rows={2}
                  placeholder="Jl. Mawar No. 12, Jakarta..."
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] focus:ring-1 focus:ring-[#061e15] transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNikModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#061e15] hover:bg-[#0a2f21] text-[#b4f105] text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Simpan & Daftarkan NIK
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. MODAL: BUAT KUNJUNGAN / BOOKING ANTREAN DOKTER             */}
      {/* ============================================================ */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-scale-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#061e15] text-[#b4f105] flex items-center justify-center font-bold text-base">
                  🩺
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">Buat Kunjungan Dokter</h3>
                  <span className="text-[10px] text-slate-400 font-medium">Ambil nomor antrean poli hari ini</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Buat Kunjungan */}
            <form onSubmit={handleCreateVisit} className="space-y-3.5 pt-1">
              
              {/* Pilih Dokter */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 ml-1 block">
                  Pilih Dokter Spesialis
                </label>
                <div className="space-y-2">
                  <div
                    onClick={() => setSelectedDoctorId(1)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedDoctorId === 1
                        ? 'border-[#061e15] bg-slate-50 ring-1 ring-[#061e15]'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">👨‍⚕️</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">dr. Budi Santoso, Sp.PD</h4>
                        <p className="text-[10px] text-[#061e15] font-semibold">Poli Umum • 08:00 - 14:00 WIB</p>
                      </div>
                    </div>
                    {selectedDoctorId === 1 && <span className="text-[#061e15] text-xs font-black">✓</span>}
                  </div>

                  <div
                    onClick={() => setSelectedDoctorId(2)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedDoctorId === 2
                        ? 'border-[#061e15] bg-slate-50 ring-1 ring-[#061e15]'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">👩‍⚕️</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">drg. Ratna Kartika</h4>
                        <p className="text-[10px] text-[#061e15] font-semibold">Poli Gigi • 13:00 - 18:00 WIB</p>
                      </div>
                    </div>
                    {selectedDoctorId === 2 && <span className="text-[#061e15] text-xs font-black">✓</span>}
                  </div>
                </div>
              </div>

              {/* Pilih Slot Jam */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 ml-1 block">
                  Pilih Jam Kedatangan
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {['08:30 WIB', '09:15 WIB', '10:00 WIB', '11:00 WIB', '13:30 WIB'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold shrink-0 border transition-all cursor-pointer ${
                        selectedTimeSlot === slot
                          ? 'bg-[#061e15] border-[#061e15] text-[#b4f105]'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keluhan Pasien */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 ml-1 block">
                  Keluhan Singkat (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Misal: Demam 2 hari, batuk pilek..."
                  value={complaintInput}
                  onChange={(e) => setComplaintInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#061e15] hover:bg-[#0a2f21] text-[#b4f105] text-xs font-black transition-all cursor-pointer shadow-md active:scale-95"
                >
                  Ambil Antrean
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. MODAL: PEMBAYARAN MANDIRI QRIS                            */}
      {/* ============================================================ */}
      {showQrisModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full space-y-4 shadow-2xl text-slate-900 text-center border border-slate-100 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5">
                <QrCode size={18} className="text-[#061e15]" />
                <h3 className="text-sm font-bold text-slate-900">Pembayaran QRIS</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQrisModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-normal">Total Tagihan Konsultasi & Obat:</span>
              <div className="text-2xl font-black text-[#061e15]">Rp 85.000</div>
            </div>

            {/* QRIS Code Mock */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center space-y-2">
              <div className="w-40 h-40 bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center shadow-2xs">
                <QrCode size={130} className="text-slate-900" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                BCA • Gopay • OVO • Dana • ShopeePay
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowQrisModal(false)}
              className="w-full py-3 rounded-xl bg-[#061e15] hover:bg-[#0a2f21] text-[#b4f105] font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              Tutup QRIS
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
