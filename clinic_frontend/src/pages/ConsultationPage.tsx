import React, { useState, useEffect } from 'react';
import { useSearchParams, useOutletContext, useNavigate, Link } from 'react-router';
import type { DashboardContextType, Medicine } from '../types/clinic';
import { getMedicineService } from '../services/medicineService';
import { createConsultationService } from '../services/consulService';
import { createInvoiceService } from '../services/invoiceService';

// Sub-components
import { PatientBannerCard } from '../components/consultation/PatientBannerCard';
import { Prescription, type PrescriptionItem } from '../components/consultation/Prescription';
import { AddMedicineModal } from '../components/consultation/AddMedicineModal';

export const ConsultationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const visitId = searchParams.get('visitId');

  const navigate = useNavigate();
  const { visits, isLoading, refreshData } = useOutletContext<DashboardContextType>();

  // Form State
  const [complaint, setComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);

  // Modal & Medicine State
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState<boolean>(false);
  const [availableMedicines, setAvailableMedicines] = useState<Medicine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cari data visit yang ID nya sama dengan visitId dari URL
  const activeVisit = visits.find((v) => v.id === Number(visitId));

  // 1. Fetch available medicines from backend
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const data = await getMedicineService();
        setAvailableMedicines(data);
      } catch (err) {
        console.error('Gagal mengambil data obat:', err);
      }
    };
    fetchMedicines();
  }, []);

  // 2. Prescription Handlers
  const handleAddMedicine = (item: PrescriptionItem) => {
    setPrescriptions((prev) => [...prev, item]);
  };

  const handleRemoveMedicine = (medicineId: number) => {
    setPrescriptions((prev) => prev.filter((item) => item.medicineId !== medicineId));
  };

  // 3. Form Submission
  const handleSubmitConsultation = async () => {
    if (!visitId) {
      return alert('Id Kunjungan tidak valid');
    }

    // validasi form
    if (!complaint.trim() || !diagnosis.trim()) {
      return alert('Keluhan dan Diagnosis Medis wajib diisi!');
    }

    setIsSubmitting(true);
    try {
      // 1. Simpan Data Konsultasi & Resep Obat (Status Visit otomatis jadi COMPLETED)
      await createConsultationService({
        visitId: Number(visitId),
        complaint: complaint.trim(),
        diagnosis: diagnosis.trim(),
        notes: notes.trim() || undefined,
        medicine: prescriptions.map((p) => ({
          medicineId: p.medicineId,
          qty: p.qty,
          instructions: p.dose,
        })),
      });

      // 2. Terbitkan Nota Kasir (Invoice UNPAID)
      await createInvoiceService({ visitId: Number(visitId) });

      // 3. Refresh State Global & Kembali ke Dashboard
      await refreshData();
      alert('Konsultasi berhasil disimpan & Tagihan kasir telah diterbitkan!');
      navigate('/dashboard');
    } catch (error: any) {
      alert(`Gagal menyimpan konsultasi: ${error?.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="organic-bg min-h-screen w-full p-4 sm:p-6 md:p-8 text-[#18181b] font-sans antialiased">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 1. Header & Status Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="w-10 h-10 rounded-xl bg-white border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] flex items-center justify-center text-[#18181b] hover:bg-[#fde047] active:translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-[#18181b] tracking-tight">
                Form Pemeriksaan & Konsultasi Dokter
              </h1>
              <p className="text-xs font-semibold text-[#52525b]">
                Input Anamnesis, Diagnosis ICD-10, dan Resep Obat Pasien
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-[#38bdf8] text-[#18181b] border-2 border-[#18181b] font-black text-xs px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_#18181b]">
              Status: In Session (Sedang Diperiksa)
            </span>
          </div>
        </div>

        {/* 2. Patient Banner Info Card */}
        <PatientBannerCard activeVisit={activeVisit} isLoading={isLoading} />

        {/* 3. Main Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Keluhan Utama & Catatan Dokter (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col">
            {/* Keluhan Utama Pasien */}
            <div className="neubrutal-card p-6 bg-white border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b] flex-1 flex flex-col">
              <h3 className="text-sm font-black text-[#18181b] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600">notes</span>
                <span>Keluhan Utama Pasien (Anamnesis) <span className="text-rose-500">*</span></span>
              </h3>

              <textarea
                rows={6}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Tuliskan keluhan pasien, riwayat penyakit, gejala, dan hasil pemeriksaan..."
                className="w-full flex-1 p-3.5 rounded-xl border-2 border-[#18181b] bg-white text-xs font-medium text-[#18181b] focus:outline-none shadow-[2px_2px_0px_#18181b] min-h-[140px]"
              />
            </div>

            {/* Catatan / Saran Medis Dokter */}
            <div className="neubrutal-card p-6 bg-white border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b]">
              <h3 className="text-sm font-black text-[#18181b] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-purple-600">edit_note</span>
                <span>Catatan & Instruksi Khusus (Opsional)</span>
              </h3>

              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Istirahat cukup, hindari makanan pedas, kontrol ulang 3 hari..."
                className="w-full p-3 rounded-xl border-2 border-[#18181b] bg-white text-xs font-medium text-[#18181b] focus:outline-none shadow-[2px_2px_0px_#18181b]"
              />
            </div>
          </div>

          {/* Right Column: Diagnosis ICD-10 & Resep Obat (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Diagnosis (ICD-10) */}
            <div className="neubrutal-card p-6 bg-white border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b]">
              <h3 className="text-sm font-black text-[#18181b] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">medical_services</span>
                <span>Diagnosis Medis (ICD-10) <span className="text-rose-500">*</span></span>
              </h3>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Contoh: J00 - Acute Common Cold"
                className="w-full p-3 rounded-xl border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none shadow-[2px_2px_0px_#18181b]"
              />
            </div>

            {/* Resep Obat Component */}
            <Prescription
              prescriptions={prescriptions}
              onOpenAddModal={() => setIsMedicineModalOpen(true)}
              onRemovePrescription={handleRemoveMedicine}
            />
          </div>
        </div>

        {/* 4. Action Submit Button */}
        <div className="flex justify-center w-full pt-4">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmitConsultation}
            className="neubrutal-btn-primary px-8 py-3.5 rounded-xl text-xs font-black text-[#18181b] cursor-pointer shadow-[4px_4px_0px_#18181b] hover:scale-105 active:translate-y-1 transition-all w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Menyimpan Konsultasi...' : 'Selesai Konsultasi & Buat Tagihan Kasir'}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* 5. Add Medicine Modal Popup */}
      <AddMedicineModal
        isOpen={isMedicineModalOpen}
        onClose={() => setIsMedicineModalOpen(false)}
        medicines={availableMedicines}
        alreadySelectedIds={prescriptions.map((p) => p.medicineId)}
        onAddMedicine={handleAddMedicine}
      />
    </div>
  );
};
