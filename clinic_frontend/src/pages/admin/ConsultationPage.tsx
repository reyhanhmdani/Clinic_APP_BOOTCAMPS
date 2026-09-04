import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, ArrowRight, FileText, Edit3, Stethoscope } from 'lucide-react';
import { useVisitStore } from '../../stores/visitStore';
import { useMedicineStore } from '../../stores/medicineStore';
import { createConsultationService } from '../../services/consulService';
import { createInvoiceService } from '../../services/invoiceService';
import { X } from 'lucide-react';
import { cancelVisitService } from '../../services/visitService';
import { toast } from 'sonner';
import { confirmDialog } from '../../stores/confirmStore';

// Sub-components
import { PatientBannerCard } from '../../components/consultation/PatientBannerCard';
import { Prescription, type PrescriptionItem } from '../../components/consultation/Prescription';
import { AddMedicineModal } from '../../components/consultation/AddMedicineModal';

export const ConsultationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const visitId = searchParams.get('visitId');

  const navigate = useNavigate();
  const { visits, loading: isLoading, fetchVisits } = useVisitStore();
  const { medicines, fetchMedicines } = useMedicineStore();

  // Strict Route Guard: Harus ada visitId
  useEffect(() => {
    if (!visitId) {
      toast.warning('Halaman konsultasi hanya dapat diakses melalui antrean pasien di Dashboard.');
      navigate('/dashboard', { replace: true });
      return;
    }
    fetchVisits();
    fetchMedicines();
  }, [visitId]);

  // Form State
  const [complaint, setComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);

  // Modal & Submitting State
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cari data visit yang ID nya sama dengan visitId dari URL
  const activeVisit = visits.find((v) => v.id === Number(visitId));

  // Prescription Handlers
  const handleAddMedicine = (item: PrescriptionItem) => {
    setPrescriptions((prev) => [...prev, item]);
  };

  const handleRemoveMedicine = (medicineId: number) => {
    setPrescriptions((prev) => prev.filter((item) => item.medicineId !== medicineId));
  };

  // Form Submission
  const handleSubmitConsultation = async () => {
    if (!visitId) {
      toast.error('ID Kunjungan tidak valid!');
      return;
    }

    if (!complaint.trim() || !diagnosis.trim()) {
      toast.error('Keluhan dan Diagnosis Medis wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Simpan Data Konsultasi & Resep Obat
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
      await fetchVisits();
      toast.success('Konsultasi berhasil disimpan & Tagihan kasir telah diterbitkan!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(`Gagal menyimpan konsultasi: ${error?.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelConsul = async () => {
    if (!visitId) return;

    const isConfirmed = await confirmDialog({
      title: 'Batalkan Kunjungan Pasien',
      description: 'Apakah Anda yakin ingin membatalkan kunjungan pasien ini? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Batalkan Kunjungan',
      cancelText: 'Kembali',
      variant: 'danger',
    });
    if (!isConfirmed) return;

    setIsSubmitting(true);
    try {
      await cancelVisitService(Number(visitId));
      fetchVisits();
      toast.success('Kunjungan pasien ini telah dibatalkan');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(`Gagal membatalkan kunjungan: ${error?.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visitId) {
    return null;
  }

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header & Status Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5">
        <div className="flex items-center gap-3.5">
          <Link
            to="/dashboard"
            className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="inline-block bg-lime-100 text-lime-900 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-lime-200 uppercase tracking-wider mb-1">
              Examination Suite
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Pemeriksaan Dokter</h1>
            <p className="text-xs text-slate-500 font-medium">
              Input Anamnesis, Diagnosis Medis, dan Resep Obat Pasien (Kunjungan #{visitId})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-sky-50 text-sky-800 border border-sky-200 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            Status: Sedang Diperiksa
          </span>
        </div>
      </div>

      {/* Patient Banner Info Card */}
      <PatientBannerCard activeVisit={activeVisit} isLoading={isLoading} />

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Keluhan Utama & Catatan Dokter (7 Cols) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col">
          {/* Keluhan Utama Pasien */}
          <div className="p-6 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex-1 flex flex-col space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              <span>
                Keluhan Utama Pasien (Anamnesis) <span className="text-rose-500">*</span>
              </span>
            </h3>

            <textarea
              rows={6}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Tuliskan keluhan pasien, riwayat penyakit, gejala, dan hasil pemeriksaan fisik..."
              className="w-full flex-1 p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#051c12] min-h-[140px] transition-all"
            />
          </div>

          {/* Catatan / Saran Medis Dokter */}
          <div className="p-6 bg-white border border-slate-200/80 shadow-sm rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Edit3 size={16} className="text-purple-600" />
              <span>Catatan & Instruksi Khusus (Opsional)</span>
            </h3>

            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Istirahat cukup, hindari makanan pedas, kontrol ulang 3 hari..."
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#051c12] transition-all"
            />
          </div>
        </div>

        {/* Right Column: Diagnosis ICD-10 & Resep Obat (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Diagnosis */}
          <div className="p-6 bg-white border border-slate-200/80 shadow-sm rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Stethoscope size={16} className="text-emerald-600" />
              <span>
                Diagnosis Medis (ICD-10) <span className="text-rose-500">*</span>
              </span>
            </h3>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Contoh: J00 - Acute Common Cold (ISPA)"
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#051c12] transition-all"
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

      {/* Action Submit Button */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-4">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleCancelConsul}
          className="px-6 py-3 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full text-xs font-bold transition-all cursor-pointer w-full sm:w-auto flex items-center justify-center gap-1.5"
        >
          <X size={16} />
          <span>Batalkan Kunjungan</span>
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmitConsultation}
          className="btn-forest px-8 py-3.5 text-xs font-bold rounded-full hover:shadow-lg transition-all w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50 tracking-wide cursor-pointer"
        >
          <span>{isSubmitting ? 'Menyimpan Konsultasi...' : 'Selesai Konsultasi & Buat Tagihan Kasir'}</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Add Medicine Modal Popup */}
      <AddMedicineModal
        isOpen={isMedicineModalOpen}
        onClose={() => setIsMedicineModalOpen(false)}
        medicines={medicines}
        alreadySelectedIds={prescriptions.map((p) => p.medicineId)}
        onAddMedicine={handleAddMedicine}
      />
    </div>
  );
};
