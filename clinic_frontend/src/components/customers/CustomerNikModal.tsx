import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, CheckCircle2, AlertCircle, UserPlus, Phone, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { checkNikCustomerService, type CheckNikResult } from '../../services/customerService';
import type { Patient } from '../../types/clinic';

interface CustomerNikModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (patient: Patient) => void;
  initialPatient?: Patient | null;
  onRegisterPatient: (data: Partial<Patient>) => Promise<Patient>;
}

export const CustomerNikModal: React.FC<CustomerNikModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  initialPatient,
  onRegisterPatient,
}) => {
  const [nikInput, setNikInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [genderInput, setGenderInput] = useState<'MALE' | 'FEMALE'>('MALE');
  const [dobInput, setDobInput] = useState<string>('');
  const [addressInput, setAddressInput] = useState<string>('');
  const [nikChecking, setNikChecking] = useState<boolean>(false);
  const [nikCheckResult, setNikCheckResult] = useState<CheckNikResult | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Sync state whenever modal opens or initialPatient changes
  useEffect(() => {
    if (isOpen) {
      if (initialPatient) {
        setNikInput(initialPatient.nik || '');
        setNameInput(initialPatient.name || '');
        setPhoneInput(initialPatient.phone || '');
        setGenderInput(initialPatient.gender || 'MALE');
        setAddressInput(initialPatient.address || '');
        if (initialPatient.age) {
          const approxYear = new Date().getFullYear() - initialPatient.age;
          setDobInput(`${approxYear}-01-01`);
        } else {
          setDobInput('');
        }
      } else {
        setNikInput('');
        setNameInput('');
        setPhoneInput('');
        setGenderInput('MALE');
        setDobInput('');
        setAddressInput('');
      }
      setNikCheckResult(null);
    }
  }, [isOpen, initialPatient]);

  if (!isOpen) return null;

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 25;
    const birth = new Date(dobString);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const handleNikChange = async (val: string) => {
    setNikInput(val);
    // Jika NIK sama persis dengan NIK pasien yang sedang diedit, tidak perlu cek link akun lain
    if (initialPatient?.nik && val === initialPatient.nik) {
      setNikCheckResult(null);
      return;
    }

    if (val.length === 16) {
      setNikChecking(true);
      try {
        const result = await checkNikCustomerService(val);
        setNikCheckResult(result);
        if (result.exists && result.data && !result.isLinked) {
          setNameInput(result.data.name || '');
          setGenderInput(result.data.gender || 'MALE');
          setPhoneInput(result.data.phone || '');
          setAddressInput(result.data.address || '');
          const approxYear = new Date().getFullYear() - (result.data.age || 25);
          setDobInput(`${approxYear}-01-01`);
        }
      } catch (err: any) {
        console.error('Gagal mengecek NIK:', err);
      } finally {
        setNikChecking(false);
      }
    } else {
      setNikCheckResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const savedPatient = await onRegisterPatient({
        nik: nikInput,
        name: nameInput,
        phone: phoneInput,
        gender: genderInput,
        age: dobInput ? calculateAge(dobInput) : (initialPatient?.age || 25),
        address: addressInput,
      });
      alert('Data profil pasien berhasil disimpan!');
      onSaveSuccess(savedPatient);
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menyimpan profil pasien');
    } finally {
      setSubmitting(false);
    }
  };

  const isEditMode = Boolean(initialPatient?.id);
  const isNikConflict = Boolean(nikCheckResult?.isLinked && nikInput !== initialPatient?.nik);

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
                maxLength={16}
                required
                placeholder="3201123456789012"
                value={nikInput}
                onChange={(e) => handleNikChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] focus:ring-1 focus:ring-[#061e15] transition-all font-mono tracking-wider"
              />
              {nikChecking && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Loader2 size={13} className="animate-spin text-[#061e15]" />
                  <span>Cek NIK...</span>
                </div>
              )}
            </div>

            {/* Feedback Card Hasil Cek NIK */}
            {nikCheckResult?.exists && !nikCheckResult.isLinked && nikCheckResult.data && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>Data Rekam Medis Ditemukan!</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  Ditemukan atas nama <strong>{nikCheckResult.data.name}</strong> (No. RM:{' '}
                  <span className="font-mono font-bold">{nikCheckResult.data.noRm}</span>). Data form telah terisi
                  otomatis.
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
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
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
                onClick={() => setGenderInput('MALE')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  genderInput === 'MALE'
                    ? 'bg-[#061e15] border-[#061e15] text-[#b4f105]'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Laki-Laki
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
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
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
                required
                value={dobInput}
                onChange={(e) => setDobInput(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#061e15] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 ml-1 block">Alamat Domisili</label>
            <textarea
              rows={2}
              placeholder="Alamat tempat tinggal saat ini..."
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
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
              disabled={isNikConflict || nikChecking || submitting}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
                isNikConflict || submitting
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#061e15] hover:bg-[#0a2f21] text-[#b4f105] cursor-pointer'
              }`}
            >
              {submitting
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
