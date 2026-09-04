import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Stethoscope,
  Search,
  SlidersHorizontal,
  Heart,
  ChevronRight,
  FileText,
  QrCode,
  User,
  X,
  PackageCheck,
  CreditCard,
  Check,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCustomerContext } from '../../layouts/CustomerLayout';
import { confirmDialog } from '../../stores/confirmStore';

interface HealthArticle {
  id: number;
  category: string;
  readTime: string;
  title: string;
  summary: string;
  content: string[];
  icon: string;
  tagColor: string;
}

const HEALTH_ARTICLES: HealthArticle[] = [
  {
    id: 1,
    category: 'Gaya Hidup',
    readTime: '2 mnt baca',
    title: '5 Kebiasaan Sederhana Menjaga Imunitas Tubuh',
    summary: 'Langkah praktis yang terbukti klinis memperkuat daya tahan tubuh setiap hari.',
    content: [
      'Tidur Berkualitas 7-8 Jam: Sel darah putih dan sitokin diproduksi optimal saat fase tidur lelap (deep sleep).',
      'Cukupi Hidrasi 2 Liter Air: Membantu sirkulasi cairan limfatik untuk mengeliminasi toksin dan bakteri.',
      'Asupan Vitamin C & Zinc: Sumber alami dari buah jeruk, jambu biji, kiwi, dan kacang-kacangan.',
      'Aktivitas Fisik Ringan: Jalan kaki 20 menit per hari efektif menurunkan hormon stres kortisol.',
    ],
    icon: '🌿',
    tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 2,
    category: 'Farmasi & Resep',
    readTime: '3 mnt baca',
    title: 'Kenapa Antibiotik Harus Dihabiskan Sesuai Resep?',
    summary: 'Memahami bahaya resistensi bakteri dan cara bijak mengonsumsi obat medis.',
    content: [
      'Mencegah Resistensi Bakteri: Menghentikan obat saat gejala mereda membuat bakteri sisa menjadi kebal.',
      'Jadwal Konsisten: Minum antibiotik pada interval jam yang sama untuk menjaga kadar obat dalam darah.',
      'Patuhi Dosis Dokter: Jangan menggandakan dosis jika terlewat, dan jangan membagikan obat ke orang lain.',
    ],
    icon: '💊',
    tagColor: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  {
    id: 3,
    category: 'Pemeriksaan Rutin',
    readTime: '2 mnt baca',
    title: 'Kapan Waktu Terbaik Cek Tekanan & Gula Darah?',
    summary: 'Deteksi dini faktor risiko kardiovaskular sejak usia produktif.',
    content: [
      'Tekanan Darah: Ukur saat tubuh dalam kondisi rileks di pagi hari sebelum beraktivitas berat atau minum kafein.',
      'Gula Darah Puasa: Dilakukan setelah puasa makan 8-10 jam (hanya boleh minum air putih).',
      'Skrining Berkala: Usia di atas 25 tahun disarankan cek profil lipid & metabolik minimal 1 kali per tahun.',
    ],
    icon: '🩺',
    tagColor: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  {
    id: 4,
    category: 'Kesehatan Gigi',
    readTime: '3 mnt baca',
    title: 'Pentingnya Scaling Karang Gigi Tiap 6 Bulan',
    summary: 'Karang gigi yang mengeras tidak bisa hilang hanya dengan menyikat gigi biasa.',
    content: [
      'Mencegah Gingivitis: Plak yang mengeras dapat memicu peradangan gusi, berdarah, dan bau mulut.',
      'Melindungi Tulang Penyangga: Karang gigi menumpuk dapat merusak jaringan periodontal penyangga gigi.',
      'Deteksi Dini: Dokter gigi dapat mengidentifikasi lubang mikro sebelum terasa ngilu atau infeksi.',
    ],
    icon: '🦷',
    tagColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
];

export const CustomerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    isNikLinked,
    patient,
    activeVisit,
    history,
    doctors,
    openBookingModal,
    openNikModal,
    payInvoice,
    cancelActiveVisit,
  } = useCustomerContext();

  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [activeArticle, setActiveArticle] = useState<HealthArticle | null>(null);

  const toggleFavorite = (e: React.MouseEvent, docId: number) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const isUnpaid = activeVisit?.visit?.invoice?.status === 'UNPAID';
  const isWaitingPharmacy =
    activeVisit?.visit?.invoice?.status === 'PAID' &&
    !!activeVisit?.visit?.consultation?.consultationMedicines?.length &&
    !activeVisit?.visit?.consultation?.isDispensed;

  const unpaidVisit =
    isUnpaid
      ? activeVisit?.visit
      : history?.visits?.find((v) => v.invoice && v.invoice.status === 'UNPAID');

  // Kalkulasi Step Progress Pasien:
  let currentStep = 1;
  if (!activeVisit?.visit) {
    currentStep = isNikLinked ? 1 : 0;
  } else if (
    activeVisit.visit.status === 'WAITING' ||
    activeVisit.visit.status === 'IN_KONSULTASI'
  ) {
    currentStep = 2;
  } else if (isUnpaid) {
    currentStep = 3;
  } else if (isWaitingPharmacy) {
    currentStep = 4;
  } else if (activeVisit.visit.status === 'COMPLETED') {
    currentStep = 5;
  }

  const handleCancelTicket = async () => {
    if (!activeVisit?.visit) return;
    const isConfirmed = await confirmDialog({
      title: 'Batalkan Antrean?',
      description: `Apakah Anda yakin ingin membatalkan antrean dengan dokter ${activeVisit.visit.doctor?.name || 'ini'}?`,
      confirmText: 'Ya, Batalkan',
      variant: 'danger',
    });
    if (isConfirmed) {
      await cancelActiveVisit(activeVisit.visit.id);
    }
  };

  // Ekstrak daftar spesialisasi unik untuk live filter tab
  const uniqueSpecialties = [
    'ALL',
    ...Array.from(new Set(doctors.map((d) => d.spesialis).filter(Boolean))),
  ];

  const filteredDoctors =
    selectedSpecialty === 'ALL'
      ? doctors
      : doctors.filter((d) => d.spesialis === selectedSpecialty);

  return (
    <div className="space-y-6 animate-fade-in text-[#12241E] pb-6">
      {/* 1. Header Widget Block (Airy Light Frosted Glass) */}
      <div className="relative">
        <div className="bg-gradient-to-br from-emerald-50/95 via-teal-50/60 to-white/95 backdrop-blur-xl rounded-3xl p-6 pt-7 pb-10 shadow-[0_10px_32px_rgba(5,150,105,0.06)] border border-emerald-200/80 relative overflow-hidden space-y-4">
          <div className="absolute -top-16 -right-16 w-52 h-52 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#059669] border border-emerald-200/80 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Layanan Siaga Terpadu
            </span>
            <span className="text-[11px] font-mono text-[#059669] font-bold bg-white/80 px-2.5 py-0.5 rounded-full border border-emerald-200/70 shadow-2xs">
              08:00 – 20:00 WIB
            </span>
          </div>

          <div className="space-y-1.5 relative z-10 pt-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#064E3B] leading-snug">
              Kesehatan Anda, <br />
              <span className="text-[#059669]">Prioritas Utama Kami.</span>
            </h1>
            <p className="text-xs text-[#065F46]/80 font-medium leading-relaxed max-w-xs">
              Temukan dokter spesialis terpercaya dan pantau antrean rawat jalan secara real-time.
            </p>
          </div>
        </div>

        {/* Floating Capsule Search Bar (Frosted Glass) */}
        <div className="-mt-6 px-3 relative z-20">
          <div
            onClick={() => openBookingModal()}
            className="bg-white/95 backdrop-blur-xl rounded-full p-2 pl-4.5 pr-2.5 border border-emerald-200/80 shadow-[0_8px_24px_rgba(5,150,105,0.08)] hover:shadow-[0_12px_32px_rgba(5,150,105,0.14)] flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Search size={16} className="text-[#059669] shrink-0 stroke-[2.5]" />
              <span className="text-xs font-semibold text-[#5A6E65] truncate">
                Cari nama dokter, spesialisasi, atau jadwal...
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] shrink-0 hover:bg-emerald-100 transition-colors">
              <SlidersHorizontal size={14} className="stroke-[2.2]" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Patient Progress Journey Tracker / Interactive Guide */}
      <section className="bg-white/85 backdrop-blur-xl rounded-3xl p-4.5 border border-white/90 shadow-[0_4px_20px_rgba(5,150,105,0.04)] space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#12241E]">
              {activeVisit?.visit ? 'Progress Kunjungan Anda' : 'Panduan Alur Pelayanan'}
            </h2>
            <p className="text-[11px] text-[#5A6E65] font-medium">
              {activeVisit?.visit
                ? isWaitingPharmacy
                  ? 'Obat sedang disiapkan di loket Farmasi'
                  : isUnpaid
                  ? 'Menunggu penyelesaian pembayaran di Kasir'
                  : activeVisit.visit.status === 'IN_KONSULTASI'
                  ? 'Sedang berlangsung pemeriksaan dokter'
                  : `Antrean A-${String(activeVisit.visit.queueNumber).padStart(3, '0')} sedang menunggu giliran`
                : '4 langkah praktis rawat jalan di ReyClinic'}
            </p>
          </div>

          <span
            className={`text-[10px] font-extrabold px-2.5 py-0.8 rounded-full border ${
              activeVisit?.visit
                ? 'bg-emerald-50 text-[#059669] border-emerald-200'
                : 'bg-[#F6F8F6] text-[#5A6E65] border-emerald-950/10'
            }`}
          >
            {activeVisit?.visit
              ? isWaitingPharmacy
                ? 'Tahap 4/4'
                : isUnpaid
                ? 'Tahap 3/4'
                : 'Tahap 2/4'
              : isNikLinked
              ? 'Siap Booking'
              : 'Tahap 1/4'}
          </span>
        </div>

        {/* Circular Stepper Progress Bar */}
        <div className="relative pt-2 pb-1">
          <div className="absolute top-7 inset-x-7 h-0.5 bg-emerald-950/10 -z-0" />
          <div
            className="absolute top-7 left-7 h-0.5 bg-[#059669] transition-all duration-500 -z-0"
            style={{
              width:
                currentStep >= 4
                  ? 'calc(100% - 3.5rem)'
                  : currentStep === 3
                  ? 'calc(66% - 1.5rem)'
                  : currentStep === 2
                  ? 'calc(33% - 0.5rem)'
                  : '0%',
            }}
          />

          <div className="grid grid-cols-4 gap-2 relative z-10 text-center">
            {/* Step 1 */}
            <div
              onClick={() => !isNikLinked && openNikModal()}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  currentStep > 1 || (isNikLinked && !activeVisit?.visit)
                    ? 'bg-[#059669] text-white shadow-xs'
                    : currentStep === 1
                    ? 'bg-emerald-50 text-[#059669] border-2 border-[#059669] ring-4 ring-emerald-100'
                    : 'bg-[#F6F8F6] text-[#5A6E65] border border-emerald-950/10'
                }`}
              >
                {currentStep > 1 || (isNikLinked && !activeVisit?.visit) ? (
                  <Check size={16} className="stroke-[3]" />
                ) : (
                  <User size={16} />
                )}
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-[#12241E] block leading-tight">
                  1. NIK & Profil
                </span>
                <span className="text-[9px] text-[#5A6E65] font-medium block">
                  {isNikLinked ? 'Terverifikasi' : 'Input NIK'}
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => !activeVisit?.visit && openBookingModal()}
              className={`flex flex-col items-center gap-1.5 ${
                !activeVisit?.visit ? 'cursor-pointer' : ''
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  currentStep > 2
                    ? 'bg-[#059669] text-white shadow-xs'
                    : currentStep === 2
                    ? 'bg-emerald-50 text-[#059669] border-2 border-[#059669] ring-4 ring-emerald-100 animate-pulse'
                    : 'bg-[#F6F8F6] text-[#5A6E65] border border-emerald-950/10'
                }`}
              >
                {currentStep > 2 ? (
                  <Check size={16} className="stroke-[3]" />
                ) : (
                  <Stethoscope size={16} />
                )}
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-[#12241E] block leading-tight">
                  2. Poli Dokter
                </span>
                <span className="text-[9px] text-[#5A6E65] font-medium block">
                  {currentStep === 2
                    ? activeVisit?.visit?.status === 'IN_KONSULTASI'
                      ? 'Diperiksa'
                      : `A-${String(activeVisit?.visit?.queueNumber).padStart(3, '0')}`
                    : currentStep > 2
                    ? 'Selesai'
                    : 'Pilih Dokter'}
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div
              onClick={() =>
                isUnpaid && activeVisit?.visit?.invoice && payInvoice(activeVisit.visit.invoice.id)
              }
              className={`flex flex-col items-center gap-1.5 ${isUnpaid ? 'cursor-pointer' : ''}`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  currentStep > 3
                    ? 'bg-[#059669] text-white shadow-xs'
                    : currentStep === 3
                    ? 'bg-rose-50 text-[#FF4D6D] border-2 border-[#FF4D6D] ring-4 ring-rose-100 animate-pulse'
                    : 'bg-[#F6F8F6] text-[#5A6E65] border border-emerald-950/10'
                }`}
              >
                {currentStep > 3 ? (
                  <Check size={16} className="stroke-[3]" />
                ) : (
                  <CreditCard size={16} />
                )}
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-[#12241E] block leading-tight">
                  3. Kasir & Bayar
                </span>
                <span className="text-[9px] text-[#5A6E65] font-medium block">
                  {currentStep === 3
                    ? 'Bayar QRIS'
                    : currentStep > 3
                    ? 'Lunas'
                    : 'Tagihan'}
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  currentStep > 4
                    ? 'bg-[#059669] text-white shadow-xs'
                    : currentStep === 4
                    ? 'bg-emerald-50 text-[#059669] border-2 border-[#059669] ring-4 ring-emerald-100 animate-pulse'
                    : 'bg-[#F6F8F6] text-[#5A6E65] border border-emerald-950/10'
                }`}
              >
                {currentStep > 4 ? (
                  <Check size={16} className="stroke-[3]" />
                ) : (
                  <PackageCheck size={16} />
                )}
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-[#12241E] block leading-tight">
                  4. Farmasi
                </span>
                <span className="text-[9px] text-[#5A6E65] font-medium block">
                  {currentStep === 4 ? 'Meracik' : currentStep > 4 ? 'Diterima' : 'Ambil Obat'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Active Reservation Ticket (If Any) */}
      {activeVisit?.visit && (
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-5 border border-white/90 shadow-[0_6px_25px_rgba(5,150,105,0.06)] space-y-3.5 animate-scale-in">
          <div className="flex items-center justify-between border-b border-emerald-950/6 pb-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  isWaitingPharmacy
                    ? 'bg-amber-500 ring-4 ring-amber-100'
                    : isUnpaid
                    ? 'bg-[#FF4D6D] ring-4 ring-rose-100'
                    : 'bg-[#059669] ring-4 ring-emerald-100'
                }`}
              />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#12241E]">
                {isWaitingPharmacy
                  ? 'Pengambilan Obat Farmasi'
                  : isUnpaid
                  ? 'Konfirmasi Pembayaran Kasir'
                  : 'Antrean Rawat Jalan Aktif'}
              </span>
            </div>

            <span
              className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                isWaitingPharmacy
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : isUnpaid
                  ? 'bg-rose-50 text-[#FF4D6D] border-rose-200'
                  : activeVisit.visit.status === 'IN_KONSULTASI'
                  ? 'bg-emerald-50 text-[#059669] border-emerald-200'
                  : 'bg-[#F6F8F6] text-[#12241E] border-emerald-950/10'
              }`}
            >
              {isWaitingPharmacy
                ? 'Menyiapkan Obat'
                : isUnpaid
                ? 'Menunggu Pembayaran'
                : activeVisit.visit.status === 'IN_KONSULTASI'
                ? 'Sedang Diperiksa'
                : 'Dalam Antrean'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[11px] text-[#5A6E65] block font-medium">Nomor Antrean Anda</span>
              <span className="text-3xl sm:text-4xl font-black text-[#059669] tracking-tight font-mono">
                A-{String(activeVisit.visit.queueNumber).padStart(3, '0')}
              </span>
            </div>
            <div className="text-right">
              {isWaitingPharmacy ? (
                <div>
                  <span className="text-[11px] text-[#5A6E65] block font-medium">Status Apotek</span>
                  <span className="text-xs font-extrabold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block mt-0.5">
                    Sedang Diracik 💊
                  </span>
                </div>
              ) : isUnpaid ? (
                <div>
                  <span className="text-[11px] text-[#5A6E65] block font-medium">Total Tagihan</span>
                  <span className="text-base font-black text-[#FF4D6D] font-mono">
                    Rp {Number(activeVisit.visit.invoice?.totalAmount || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-[11px] text-[#5A6E65] block font-medium">Sisa di Depan Anda</span>
                  <span className="text-2xl font-black text-[#12241E] font-mono">
                    {activeVisit.queueAhead} Pasien
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2.5 border-t border-emerald-950/6 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#12241E] font-bold">
              <Stethoscope size={15} className="text-[#059669]" />
              <span>{activeVisit.visit.doctor?.name}</span>
            </div>
            <span className="text-[11px] text-[#5A6E65] font-mono">
              {new Date(activeVisit.visit.visitDate).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              WIB
            </span>
          </div>

          {/* Banner Menunggu Kasir */}
          {isUnpaid && activeVisit.visit.invoice && (
            <div className="bg-rose-50/80 rounded-2xl p-4 space-y-3 border border-rose-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-950 font-extrabold text-xs">
                  <CreditCard size={16} className="text-[#FF4D6D] shrink-0" />
                  <span>Selesaikan Pembayaran Tagihan</span>
                </div>
                <span className="text-sm font-black text-[#FF4D6D] font-mono">
                  Rp {Number(activeVisit.visit.invoice.totalAmount).toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-xs text-rose-900 leading-relaxed font-medium">
                Pemeriksaan dokter selesai. Silakan bayar tagihan via QRIS / Bank Transfer untuk mengambil obat di Farmasi.
              </p>
              <button
                type="button"
                onClick={() => payInvoice(activeVisit.visit.invoice!.id)}
                className="w-full py-2.5 bg-[#FF4D6D] hover:bg-[#E00B41] text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
              >
                <QrCode size={15} />
                <span>Bayar Sekarang (Midtrans)</span>
              </button>
            </div>
          )}

          {/* Tombol Batalkan */}
          {activeVisit.visit.status === 'WAITING' && (
            <div className="pt-2 border-t border-emerald-950/6 flex items-center justify-between">
              <span className="text-[11px] text-[#5A6E65] font-medium">Berhalangan hadir hari ini?</span>
              <button
                type="button"
                onClick={handleCancelTicket}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 px-3 py-1 rounded-full border border-rose-200 transition-all cursor-pointer flex items-center gap-1"
              >
                <X size={12} className="stroke-[2.5]" />
                <span>Batalkan Antrean</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. Jadwal Praktik Dokter & Live Specialty Filter Tabs */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-extrabold text-[#12241E] tracking-tight">Jadwal Praktik Hari Ini</h2>
            <p className="text-[11px] text-[#5A6E65]">Pilih dokter untuk konsultasi dan pendaftaran antrean</p>
          </div>
          <button
            type="button"
            onClick={() => openBookingModal()}
            className="text-xs font-bold text-[#059669] hover:underline cursor-pointer"
          >
            Lihat semua ({doctors.length})
          </button>
        </div>

        {/* Live Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
          {uniqueSpecialties.map((spec) => {
            const isSelected = selectedSpecialty === spec;
            const label = spec === 'ALL' ? 'Semua Poli' : spec;

            return (
              <button
                key={spec}
                type="button"
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#059669] text-white border-[#059669] shadow-xs scale-[1.02]'
                    : 'bg-white/85 backdrop-blur-md text-[#5A6E65] border-emerald-950/10 hover:border-[#059669] hover:text-[#059669]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Grid List Dokter */}
        <div className="grid grid-cols-2 gap-3.5">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.slice(0, 4).map((doc) => {
              const initials = doc.name
                .split(' ')
                .map((n) => n[0])
                .filter((_, i) => i < 2)
                .join('')
                .toUpperCase();

              const isFav = favorites.includes(doc.id);

              return (
                <div
                  key={doc.id}
                  className="bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-3.5 flex flex-col justify-between space-y-3 shadow-[0_4px_20px_rgba(5,150,105,0.04)] hover:border-emerald-300/80 hover:shadow-[0_8px_25px_rgba(5,150,105,0.08)] transition-all group relative"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs border shadow-xs ${
                          doc.gender === 'FEMALE'
                            ? 'bg-rose-50 border-rose-100 text-rose-700'
                            : 'bg-emerald-50 border-emerald-200 text-[#059669]'
                        }`}
                      >
                        {initials || <User size={16} />}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(e, doc.id)}
                        className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-[#5A6E65] hover:text-[#FF4D6D] transition-all cursor-pointer shadow-2xs"
                        title="Simpan Dokter"
                      >
                        <Heart
                          size={16}
                          className={isFav ? 'fill-[#FF4D6D] text-[#FF4D6D]' : 'stroke-[2]'}
                        />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs sm:text-sm font-extrabold text-[#12241E] truncate leading-tight group-hover:text-[#059669] transition-colors">
                        {doc.name}
                      </h3>
                      <p className="text-[11px] text-[#5A6E65] font-medium truncate">
                        {doc.spesialis}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-[#12241E] font-semibold">
                        <span className="text-amber-500">★</span>
                        <span>4.98</span>
                        <span className="text-[#5A6E65] font-normal">• {doc.room || 'Poli Siaga'}</span>
                      </div>
                      <div className="pt-1">
                        <span className="text-xs font-extrabold text-[#12241E]">
                          Rp {Number(doc.fee).toLocaleString('id-ID')}
                        </span>{' '}
                        <span className="text-[10px] text-[#5A6E65] font-normal">/ kunjungan</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openBookingModal(doc.id)}
                    className="w-full py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-bold transition-all cursor-pointer active:scale-95 shadow-xs flex items-center justify-center gap-1"
                  >
                    <span>Daftar Antrean</span>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center p-6 bg-white/80 backdrop-blur-md rounded-3xl border border-emerald-950/10 text-xs text-[#5A6E65]">
              Tidak ada dokter di spesialisasi "{selectedSpecialty}".
            </div>
          )}
        </div>
      </section>

      {/* 5. Health Digest & Tips Sehat Harian */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-extrabold text-[#12241E] tracking-tight">Pojok Edukasi Sehat</h2>
            <p className="text-[11px] text-[#5A6E65]">Tips medis praktis & panduan gaya hidup sehat</p>
          </div>
          <span className="text-[10px] font-extrabold text-[#059669] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Update Tiap Hari
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {HEALTH_ARTICLES.map((art) => (
            <div
              key={art.id}
              onClick={() => setActiveArticle(art)}
              className="bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-4 flex flex-col justify-between space-y-2.5 shadow-[0_4px_20px_rgba(5,150,105,0.04)] hover:border-emerald-300/80 hover:shadow-[0_8px_25px_rgba(5,150,105,0.08)] transition-all cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl">{art.icon}</span>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${art.tagColor}`}>
                    {art.category}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#12241E] group-hover:text-[#059669] transition-colors leading-snug line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-[10px] text-[#5A6E65] line-clamp-2 leading-relaxed font-medium">
                  {art.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-emerald-950/6 flex items-center justify-between text-[10px] font-bold text-[#059669]">
                <span>{art.readTime}</span>
                <span className="group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Baca <ChevronRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Baca Artikel Tips Kesehatan */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 max-w-md w-full space-y-4 shadow-[0_20px_50px_rgba(5,150,105,0.2)] border border-white/90 animate-scale-in text-[#12241E]">
            <div className="flex items-center justify-between border-b border-emerald-950/6 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeArticle.icon}</span>
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#059669] block">
                    {activeArticle.category} • {activeArticle.readTime}
                  </span>
                  <h3 className="text-sm font-extrabold text-[#12241E] leading-tight">
                    {activeArticle.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="w-7 h-7 rounded-full bg-[#F6F8F6] text-[#5A6E65] hover:text-[#12241E] flex items-center justify-center cursor-pointer transition-all active:scale-90"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-[#5A6E65] font-medium leading-relaxed bg-[#F6F8F6] p-3 rounded-2xl border border-emerald-950/8">
              {activeArticle.summary}
            </p>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              <span className="text-[11px] font-extrabold text-[#12241E] block uppercase tracking-wider">
                Poin Penting & Rekomendasi Medis:
              </span>
              {activeArticle.content.map((point, idx) => (
                <div
                  key={idx}
                  className="text-xs text-[#12241E] font-medium flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-emerald-950/6"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{point}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveArticle(null)}
              className="w-full py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              Tutup Catatan Sehat
            </button>
          </div>
        </div>
      )}

      {/* 6. Rekam Medis & Profil Pasien Card (Bento Frosted Glass) */}
      <section className="grid grid-cols-2 gap-3">
        <div
          onClick={() => !isNikLinked && openNikModal()}
          className={`p-4.5 rounded-3xl border flex flex-col justify-between transition-all ${
            isNikLinked
              ? 'bg-white/85 backdrop-blur-xl border-white/90 shadow-[0_4px_20px_rgba(5,150,105,0.04)]'
              : 'bg-[#FFFDF5] border-amber-200 cursor-pointer hover:bg-amber-50'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#5A6E65]">
                REKAM MEDIS
              </span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  isNikLinked ? 'bg-emerald-50 text-[#059669] border border-emerald-200' : 'bg-amber-100 text-amber-900'
                }`}
              >
                {isNikLinked ? 'Terverifikasi' : 'Wajib NIK'}
              </span>
            </div>
            <h4 className="text-xs font-bold text-[#12241E] mt-2 leading-tight truncate">
              {patient?.name || user?.username || 'Pasien Baru'}
            </h4>
            <p className="text-[10px] font-mono text-[#5A6E65] mt-0.5">
              {patient?.noRm ? `No. RM: ${patient.noRm}` : 'Lengkapi identitas'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openNikModal()}
            className="text-xs font-extrabold text-[#059669] flex items-center gap-1 hover:underline cursor-pointer pt-2"
          >
            <span>{isNikLinked ? 'Lihat Profil' : 'Lengkapi NIK'}</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-4.5 flex flex-col justify-between shadow-[0_4px_20px_rgba(5,150,105,0.04)]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#5A6E65]">
                KASIR DIGITAL
              </span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  unpaidVisit
                    ? 'bg-rose-50 text-[#FF4D6D] border border-rose-200'
                    : 'bg-emerald-50 text-[#059669] border border-emerald-200'
                }`}
              >
                {unpaidVisit ? 'Tagihan Aktif' : 'Bebas Tagihan'}
              </span>
            </div>
            <h4 className="text-xs font-bold text-[#12241E] mt-2 leading-tight font-mono">
              {unpaidVisit?.invoice
                ? `Rp ${Number(unpaidVisit.invoice.totalAmount).toLocaleString('id-ID')}`
                : 'Rp 0'}
            </h4>
            <p className="text-[10px] text-[#5A6E65] mt-0.5">
              {unpaidVisit ? 'Menunggu pembayaran' : 'Semua transaksi lunas'}
            </p>
          </div>
          {unpaidVisit?.invoice ? (
            <button
              type="button"
              onClick={() => payInvoice(unpaidVisit.invoice!.id)}
              className="text-xs font-black text-[#FF4D6D] flex items-center gap-1 hover:underline cursor-pointer pt-2"
            >
              <span>Bayar Tagihan</span>
              <ChevronRight size={13} />
            </button>
          ) : (
            <span className="text-[11px] font-bold text-[#059669] pt-2 block">✓ Lunas</span>
          )}
        </div>
      </section>

      {/* 7. Riwayat Pemeriksaan Terakhir */}
      <section className="bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-5 shadow-[0_4px_20px_rgba(5,150,105,0.04)] space-y-3">
        <div className="flex items-center justify-between border-b border-emerald-950/6 pb-2.5">
          <div>
            <h2 className="text-sm font-extrabold text-[#12241E]">Riwayat Kunjungan</h2>
            <p className="text-[11px] text-[#5A6E65]">Catatan konsultasi & resep obat Anda</p>
          </div>
          {history?.visits && history.visits.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/customers/history')}
              className="text-xs font-bold text-[#059669] underline cursor-pointer flex items-center gap-0.5"
            >
              <span>Lihat Semua ({history.visits.length})</span>
              <ChevronRight size={13} />
            </button>
          )}
        </div>

        {history?.visits && history.visits.length > 0 ? (
          <div className="space-y-2.5">
            {history.visits.slice(0, 2).map((v) => {
              const formattedDate = new Date(v.visitDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const isPaid = v.invoice?.status === 'PAID';
              const isUnpaid = v.invoice?.status === 'UNPAID';

              return (
                <div
                  key={v.id}
                  className="p-3.5 rounded-2xl bg-[#F6F8F6]/80 border border-emerald-950/6 flex items-center justify-between gap-3 hover:bg-[#F6F8F6] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-emerald-950/8 flex items-center justify-center font-bold text-xs shrink-0 text-[#059669] shadow-2xs">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-[#12241E] truncate leading-tight">
                          {v.doctor?.name || 'Dokter Jaga'}
                        </h4>
                        <span className="text-[10px] text-[#5A6E65] font-mono shrink-0">• {formattedDate}</span>
                      </div>
                      <p className="text-[11px] text-[#5A6E65] truncate mt-0.5 font-medium">
                        {v.consultation?.diagnosis || v.doctor?.spesialis || 'Pemeriksaan Rutin'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border block ${
                        isPaid
                          ? 'bg-emerald-50 text-[#059669] border-emerald-200'
                          : isUnpaid
                          ? 'bg-rose-50 text-[#FF4D6D] border-rose-200'
                          : 'bg-white text-[#5A6E65] border-emerald-950/10'
                      }`}
                    >
                      {isPaid ? 'Lunas' : isUnpaid ? 'Belum Bayar' : 'Selesai'}
                    </span>
                    {v.invoice?.totalAmount ? (
                      <span className="text-[10px] font-mono text-[#5A6E65] font-bold mt-0.5 block">
                        Rp {Number(v.invoice.totalAmount).toLocaleString('id-ID')}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-[#5A6E65]">
            Belum ada catatan riwayat rekam medis. Ambil antrean untuk memulai konsultasi dokter.
          </div>
        )}
      </section>
    </div>
  );
};
