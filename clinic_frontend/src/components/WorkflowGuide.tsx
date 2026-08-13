import React from 'react';

interface WorkflowGuideProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const WorkflowGuide: React.FC<WorkflowGuideProps> = ({ activeTab = 'ALL', onTabChange }) => {
  const steps = [
    {
      id: 'WAITING',
      step: '1',
      title: '1. Antrean Masuk',
      desc: 'Pasien Terdaftar & Menunggu',
      color: 'bg-[#fde047]',
      icon: 'hourglass_empty',
    },
    {
      id: 'IN_KONSULTASI',
      step: '2',
      title: '2. Konsultasi Dokter',
      desc: 'Pemeriksaan & Resep Obat',
      color: 'bg-[#38bdf8]',
      icon: 'stethoscope',
    },
    {
      id: 'UNPAID',
      step: '3',
      title: '3. Tagihan Kasir',
      desc: 'Proses Nota & Pembayaran',
      color: 'bg-[#f472b6]',
      icon: 'payments',
    },
    {
      id: 'COMPLETED',
      step: '4',
      title: '4. Selesai & Lunas',
      desc: 'Pelayanan Klinik Selesai',
      color: 'bg-[#4ade80]',
      icon: 'task_alt',
    },
  ];

  return (
    <div className="neubrutal-card p-6 bg-white border-2 border-[#18181b] shadow-[4px_4px_0px_#18181b] mb-6">
      {/* Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-4 border-b-2 border-[#18181b]/10">
        <div>
          <span className="inline-block bg-[#a3e635] text-[#18181b] text-[11px] font-black tracking-wider px-3 py-1 rounded-md border-2 border-[#18181b] shadow-[1px_1px_0px_#18181b] uppercase mb-1.5">
            Alur Pelayanan Rawat Jalan
          </span>
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-[#18181b]">
            Panduan Alur Pasien dari Pendaftaran hingga Pelunasan Kasir
          </h2>
        </div>
        <div className="text-xs text-[#18181b] font-bold flex items-center gap-1.5 shrink-0 bg-[#fef08a] px-3 py-1.5 rounded-lg border-2 border-[#18181b] shadow-[1px_1px_0px_#18181b]">
          <span className="material-symbols-outlined text-[16px]">touch_app</span>
          <span>Klik alur untuk beralih filter</span>
        </div>
      </div>

      {/* Workflow Step Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {steps.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange && onTabChange(item.id)}
              className={`p-3.5 rounded-xl border-2 border-[#18181b] text-left transition-all flex items-center gap-3 cursor-pointer ${
                isActive
                  ? `${item.color} text-[#18181b] shadow-[3px_3px_0px_#18181b] scale-[1.02]`
                  : 'bg-[#fefcf8] text-[#18181b] hover:bg-[#fef08a]/40 shadow-[2px_2px_0px_#18181b]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg border-2 border-[#18181b] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#18181b] ${
                  isActive ? 'bg-[#18181b] text-white' : `${item.color} text-[#18181b]`
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
              <div className="overflow-hidden">
                <h3 className="text-xs font-black truncate text-[#18181b]">
                  {item.title}
                </h3>
                <p className="text-[11px] font-semibold truncate text-[#52525b]">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
