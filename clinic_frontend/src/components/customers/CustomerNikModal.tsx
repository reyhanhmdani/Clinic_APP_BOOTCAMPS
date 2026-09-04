import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, CheckCircle2, AlertCircle, UserPlus, Phone, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { checkNikCustomerService, type CheckNikResult } from '../../services/customerService';
import type { Patient } from '../../types/clinic';
import { toast } from 'sonner';

interface CustomerNikModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (patient: Patient) => void;
  initialPatient?: Patient | null;
  onRegisterPatient: (data: Partial<Patient>) => Promise<Patient>;
}

interface FormState {
  nik: string;
  name: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  dob: string;
  address: string;
}

const INITIAL_FORM: FormState = {
  nik: '',
  name: '',
  phone: '',
  gender: 'MALE',
  dob: '',
  address: '',
};

// Pure utility untuk menghitung umur akurat dari tanggal lahir
const calculateAgeFromDob = (dobString: string): number | undefined => {
  if (!dobString) return undefined;
  const birth = new Date(dobString);
  if (isNaN(birth.getTime())) return undefined;

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
};

export const CustomerNikModal: React.FC<CustomerNikModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  initialPatient,
  onRegisterPatient,
}) => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isCheckingNik, setIsCheckingNik] = useState<boolean>(false);
  const [nikCheckResult, setNikCheckResult] = useState<CheckNikResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sinkronisasi form saat modal dibuka atau initialPatient berubah
  useEffect(() => {
    if (!isOpen) return;

    if (initialPatient) {
      setForm({
        nik: initialPatient.nik || '',
        name: initialPatient.name || '',
        phone: initialPatient.phone || '',
        gender: initialPatient.gender || 'MALE',
        address: initialPatient.address || '',
        dob: '',
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setNikCheckResult(null);
  }, [isOpen, initialPatient]);

  if (!isOpen) return null;

  const handleNikInput = async (rawVal: string) => {
    // Sanitasi: Hanya izinkan digit angka 0-9 dan maksimal 16 digit
    const digitsOnly = rawVal.replace(/\D/g, '').slice(0, 16);
    setForm((prev) => ({ ...prev, nik: digitsOnly }));

    // Lewati cek jika NIK sama dengan data awal pasien yang sedang diedit
    if (initialPatient?.nik && digitsOnly === initialPatient.nik) {
      setNikCheckResult(null);
      return;
    }

    if (digitsOnly.length === 16) {
      setIsCheckingNik(true);
      try {
        const result = await checkNikCustomerService(digitsOnly);
        setNikCheckResult(result);

        // Autofill data rekam medis yang ditemukan
        if (result.exists && result.data && !result.isLinked) {
          setForm((prev) => ({
            ...prev,
            name: result.data?.name || prev.name,
            gender: result.data?.gender || prev.gender,
            phone: result.data?.phone || prev.phone,
            address: result.data?.address || prev.address,
          }));
          toast.info(`Data rekam medis ditemukan atas nama ${result.data.name}`);
        }
      } catch (err: any) {
        toast.error('Gagal memverifikasi NIK ke server. Periksa koneksi Anda.');
        setNikCheckResult(null);
      } finally {
        setIsCheckingNik(false);
      }
    } else {
      setNikCheckResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (form.nik.length !== 16) {
      toast.error('NIK KTP harus tepat 16 digit angka!');
      return;
    }

    const calculatedAge = calculateAgeFromDob(form.dob) ?? initialPatient?.age;
    if (calculatedAge === undefined) {
      toast.error('Tanggal lahir pasien wajib diisi!');
      return;
    }

    try {
      setIsSubmitting(true);
      const savedPatient = await onRegisterPatient({
        nik: form.nik,
        name: form.name.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        age: calculatedAge,
        address: form.address.trim() || undefined,
      });

      toast.success('Data profil pasien berhasil disimpan!');
      onSaveSuccess(savedPatient);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan profil pasien');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = Boolean(initialPatient?.id);
  const isNikConflict = Boolean(nikCheckResult?.isLinked && form.nik !== initialPatient?.nik);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#061e15] text-[#b4f105] flex items-center justify-center font-bold text-base shadow-2xs">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {isEditMode ? 'Edit Data Pasien' : 'Data Pasien & NIK'}
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">
                {isEditMode ? `No. RM: ${initialPatient?.noRm || '-'}` : 'Sinkronisasi identitas rekam medis'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-all active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Pasien */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 ml-1 block">
              16-Digit NIK KTP <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="3201123456789012"
                value={form.nik}
                onChange={(e) => handleNikInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] focus:ring-1 focus:ring-[#061e15] transition-all font-mono tracking-wider"
              />
              {isCheckingNik && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Loader2 size={13} className="animate-spin text-[#061e15]" />
                  <span>Cek NIK...</span>
                </div>
              )}
            </div>

            {/* Hasil Verifikasi NIK */}
            {nikCheckResult?.exists && !nikCheckResult.isLinked && nikCheckResult.data && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>Data Rekam Medis Ditemukan!</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  Ditemukan atas nama <strong>{nikCheckResult.data.name}</strong> (No. RM:{' '}
                  <span className="font-mono font-bold">{nikCheckResult.data.noRm}</span>). Data form telah terisi otomatis.
                </p>
              </div>
            )}

            {isNikConflict && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-rose-800">
                  <AlertCircle size={14} className="text-rose-600 shrink-0" />
                  <span>NIK Sudah Terdaftar</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-snug">
                  NIK ini sudah terhubung ke akun pasien lain. Silakan periksa kembali nomor NIK KTP Anda.
                </p>
              </div>
            )}

            {nikCheckResult && !nikCheckResult.exists && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <UserPlus size={14} className="text-[#061e15] shrink-0" />
                  <span>Pasien Baru</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  NIK belum pernah berobat di klinik. Lengkapi data untuk menerbitkan No. Rekam Medis baru.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 ml-1 block">
              Nama Lengkap Sesuai KTP <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Fajar Pratama"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 ml-1 block">
              Jenis Kelamin <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, gender: 'MALE' }))}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  form.gender === 'MALE'
                    ? 'bg-[#061e15] border-[#061e15] text-[#b4f105]'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Laki-Laki
              </button>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, gender: 'FEMALE' }))}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  form.gender === 'FEMALE'
                    ? 'bg-[#061e15] border-[#061e15] text-[#b4f105]'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Perempuan
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 ml-1 block">
              No. WhatsApp Aktif <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Phone size={14} className="absolute left-3 text-slate-400" />
              <input
                type="tel"
                required
                placeholder="081234567890"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 ml-1 block">
              Tanggal Lahir <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <CalendarIcon size={14} className="absolute left-3 text-slate-400" />
              <input
                type="date"
                required={!isEditMode}
                value={form.dob}
                onChange={(e) => setForm((prev) => ({ ...prev, dob: e.target.value }))}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 ml-1 block">Alamat Domisili</label>
            <textarea
              rows={2}
              placeholder="Alamat tempat tinggal saat ini..."
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] transition-all resize-none"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isNikConflict || isCheckingNik || isSubmitting}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
                isNikConflict || isSubmitting || isCheckingNik
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#061e15] hover:bg-[#0a2f21] text-[#b4f105] cursor-pointer'
              }`}
            >
              {isSubmitting
                ? 'Menyimpan...'
                : isEditMode
                ? 'Simpan Perubahan'
                : nikCheckResult?.exists && !nikCheckResult.isLinked
                ? 'Klaim & Hubungkan Akun'
                : 'Simpan & Daftarkan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
