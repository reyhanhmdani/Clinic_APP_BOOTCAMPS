import React, { useState } from 'react';

export const ConsultationPage: React.FC = () => {
  const [anamnesis, setAnamnesis] = useState('');
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [pulse, setPulse] = useState('80');
  const [temperature, setTemperature] = useState('36.5');
  const [weight, setWeight] = useState('65');

  const [icd10, setIcd10] = useState('J00 - Acute nasopharyngitis [common cold]');
  const [prescriptions, setPrescriptions] = useState([
    { id: '1', medicineName: 'Paracetamol 500mg', dose: '3x1', qty: '10 tablet' },
    { id: '2', medicineName: 'Vitamin C 500mg', dose: '1x1', qty: '10 tablet' },
  ]);

  return (
    <div className="organic-bg min-h-screen w-full p-4 sm:p-6 md:p-8 text-[#18181b] font-sans antialiased">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Navigation & Back Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="w-10 h-10 rounded-xl bg-white border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] flex items-center justify-center text-[#18181b] hover:bg-[#fde047] transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </a>
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

        {/* Patient Banner Card */}
        <div className="neubrutal-card p-5 bg-[#fef08a] border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#a3e635] border-2 border-[#18181b] text-[#18181b] font-black text-sm flex items-center justify-center shadow-[2px_2px_0px_#18181b]">
              BS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#18181b]">Budi Santoso</h2>
                <span className="bg-white text-[#18181b] border-2 border-[#18181b] text-[10px] font-black px-2 py-0.5 rounded-md">
                  Laki-Laki (35 Thn)
                </span>
              </div>
              <p className="text-xs font-bold text-[#52525b] mt-0.5">
                No RM: RM-2025-001 | Dokter Periksa: Dr. Andri Wijaya (Spesialis Penyakit Dalam)
              </p>
            </div>
          </div>

          <div className="text-xs font-black text-[#18181b] bg-white px-3 py-1.5 rounded-lg border-2 border-[#18181b]">
            Jam Masuk: 10:40 AM
          </div>
        </div>

        {/* Main Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Anamnesis & Vital Signs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Vital Signs (Tanda Vital) */}
            <div className="neubrutal-card p-6 bg-white border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b]">
              <h3 className="text-sm font-black text-[#18181b] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-rose-600">monitor_heart</span>
                <span>Pemeriksaan Fisik & Tanda Vital</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-[#52525b] mb-1">Tekanan Darah</label>
                  <input
                    type="text"
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                    placeholder="120/80"
                    className="w-full px-3 py-2 rounded-lg border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none shadow-[1px_1px_0px_#18181b]"
                  />
                  <span className="text-[10px] text-zinc-500 font-semibold mt-0.5 block">mmHg</span>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-[#52525b] mb-1">Denyut Nadi</label>
                  <input
                    type="text"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    placeholder="80"
                    className="w-full px-3 py-2 rounded-lg border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none shadow-[1px_1px_0px_#18181b]"
                  />
                  <span className="text-[10px] text-zinc-500 font-semibold mt-0.5 block">bpm</span>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-[#52525b] mb-1">Suhu Tubuh</label>
                  <input
                    type="text"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="36.5"
                    className="w-full px-3 py-2 rounded-lg border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none shadow-[1px_1px_0px_#18181b]"
                  />
                  <span className="text-[10px] text-zinc-500 font-semibold mt-0.5 block">°C</span>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-[#52525b] mb-1">Berat Badan</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="65"
                    className="w-full px-3 py-2 rounded-lg border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none shadow-[1px_1px_0px_#18181b]"
                  />
                  <span className="text-[10px] text-zinc-500 font-semibold mt-0.5 block">kg</span>
                </div>
              </div>
            </div>

            {/* Section 2: Anamnesis / Keluhan Utama */}
            <div className="neubrutal-card p-6 bg-white border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b]">
              <h3 className="text-sm font-black text-[#18181b] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600">notes</span>
                <span>Anamnesis & Keluhan Utama Pasien</span>
              </h3>
              <textarea
                rows={4}
                value={anamnesis}
                onChange={(e) => setAnamnesis(e.target.value)}
                placeholder="Tuliskan keluhan pasien, riwayat penyakit, alergi obat, dll..."
                className="w-full p-3 rounded-xl border-2 border-[#18181b] bg-white text-xs font-medium text-[#18181b] focus:outline-none shadow-[2px_2px_0px_#18181b]"
              />
            </div>
          </div>

          {/* Right Column: Diagnosis ICD-10 & Resep Obat (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Section 3: Diagnosis (ICD-10) */}
            <div className="neubrutal-card p-6 bg-white border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b]">
              <h3 className="text-sm font-black text-[#18181b] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">medical_services</span>
                <span>Diagnosis Medis (ICD-10)</span>
              </h3>
              <input
                type="text"
                value={icd10}
                onChange={(e) => setIcd10(e.target.value)}
                placeholder="Contoh: J00 - Common cold"
                className="w-full p-3 rounded-xl border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none shadow-[2px_2px_0px_#18181b]"
              />
            </div>

            {/* Section 4: Resep Obat */}
            <div className="neubrutal-card p-6 bg-white border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-black text-[#18181b] uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-amber-600">medication</span>
                  <span>Resep Obat & Tindakan</span>
                </h3>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-lg bg-[#a3e635] text-[#18181b] border-2 border-[#18181b] text-[10px] font-black shadow-[1px_1px_0px_#18181b] hover:bg-[#bbf7d0]"
                >
                  + Tambah Obat
                </button>
              </div>

              <div className="space-y-2.5">
                {prescriptions.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border-2 border-[#18181b] bg-[#fefcf8] shadow-[2px_2px_0px_#18181b] flex justify-between items-center"
                  >
                    <div>
                      <p className="text-xs font-black text-[#18181b]">{item.medicineName}</p>
                      <p className="text-[11px] font-semibold text-[#52525b]">
                        Dosis: {item.dose} | Jumlah: {item.qty}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-rose-600 cursor-pointer hover:scale-110">
                      delete
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="neubrutal-card p-5 bg-white border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b] flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl border-2 border-[#18181b] bg-white text-xs font-black text-[#18181b] hover:bg-zinc-100 transition-all shadow-[2px_2px_0px_#18181b] w-full sm:w-auto"
          >
            Simpan Draft Konsultasi
          </button>

          <button
            type="button"
            className="neubrutal-btn-primary px-6 py-3 rounded-xl text-xs font-black text-[#18181b] cursor-pointer shadow-[3px_3px_0px_#18181b] w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <span>Selesai Konsultasi & Buat Tagihan Kasir</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
