import React, { useState } from 'react';
import type { Visit } from '../../types/clinic';

interface HomeDashboardProps {
  visits: Visit[];
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  onActionClick?: (visit: Visit, actionType: string) => void;
  onViewAll?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  visits,
  activeFilter = 'ALL',
  onFilterChange,
  onActionClick,
}) => {
  const [internalFilter, setInternalFilter] = useState<'ALL' | 'WAITING' | 'IN_KONSULTASI' | 'UNPAID' | 'COMPLETED'>(
    'ALL',
  );

  // fungsi buat searching
  const [search, setSearch] = useState('');

  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const currentFilter = onFilterChange ? activeFilter : internalFilter;
  const handleTabClick = (filter: any) => {
    setCurrentPage(1); // reset ke halaman 1 saat tab berubah
    if (onFilterChange) {
      onFilterChange(filter);
    } else {
      setInternalFilter(filter);
    }
  };

  // Filter Data berdasarkan Search & Status Tab
  const filteredVisits = visits.filter((item) => {
    const isUnpaid =
      item.invoice?.status === 'UNPAID' || (item.status === 'COMPLETED' && item.invoice?.status !== 'PAID');
    const isWaiting = item.status === 'WAITING';
    const isConsulting = item.status === 'IN_KONSULTASI';
    const isCompleted = item.status === 'COMPLETED' && item.invoice?.status === 'PAID';

    // Tab Filter Logic
    if (currentFilter === 'WAITING' && !isWaiting) return false;
    if (currentFilter === 'IN_KONSULTASI' && !isConsulting) return false;
    if (currentFilter === 'UNPAID' && !isUnpaid) return false;
    if (currentFilter === 'COMPLETED' && !isCompleted) return false;

    // Search Query Filter Logic (Nama Pasien / RM / Dokter)
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      const patientName = item.patient?.name?.toLowerCase() || '';
      const noRm = item.patient?.noRm?.toLowerCase() || '';
      const doctorName = item.doctor?.name?.toLowerCase() || '';
      return patientName.includes(q) || noRm.includes(q) || doctorName.includes(q);
    }

    return true;
  });

  // Calculate Pagination Values
  const totalPages = Math.max(1, Math.ceil(filteredVisits.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredVisits.length);
  const displayedVisits = filteredVisits.slice(startIndex, endIndex);

  // Tab Badge Counter
  const countWaiting = visits.filter((v) => v.status === 'WAITING' && v.invoice?.status !== 'UNPAID').length;
  const countConsulting = visits.filter((v) => v.status === 'IN_KONSULTASI').length;
  const countUnpaid = visits.filter(
    (v) => v.invoice?.status === 'UNPAID' || (v.status === 'COMPLETED' && v.invoice?.status !== 'PAID'),
  ).length;
  const countCompleted = visits.filter((v) => v.status === 'COMPLETED' && v.invoice?.status === 'PAID').length;

  return (
    <div className="p-6 bg-white border-3 border-[#18181b] shadow-[5px_5px_0px_#18181b] flex flex-col space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-[#18181b]/10">
        <div>
          <div className="inline-block bg-[#a3e635] text-[#18181b] text-[9px] font-black tracking-wider px-2 py-0.5 border-2 border-[#18181b] shadow-[1px_1px_0px_#18181b] uppercase mb-1">
            ANTREAN KLINIK
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#18181b] tracking-tight uppercase">
            DAFTAR ANTREAN PASIEN HARI INI
          </h2>
          <p className="text-xs text-[#52525b] font-bold">
            Kelola dan pantau status alur pemeriksaan pasien secara real-time
          </p>
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#71717a]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari pasien / RM / dokter..."
            className="w-full pl-9 pr-3.5 py-2 border-2 border-[#18181b] bg-white text-xs font-bold text-[#18181b] focus:outline-none focus:bg-[#fef9c3] shadow-[2px_2px_0px_#18181b] transition-all placeholder:text-[#747872]"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Filter Tabs (Neubrutalism Tabs) */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {[
          { id: 'ALL', label: 'SEMUA', count: visits.length },
          { id: 'WAITING', label: 'MENUNGGU', count: countWaiting },
          { id: 'IN_KONSULTASI', label: 'DIPERIKSA', count: countConsulting },
          { id: 'UNPAID', label: 'BELUM BAYAR', count: countUnpaid },
          { id: 'COMPLETED', label: 'SELESAI', count: countCompleted },
        ].map((tab) => {
          const isActive = currentFilter === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-3 py-1.5 text-xs font-black border-2 border-[#18181b] transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#18181b] text-white shadow-[2px_2px_0px_#a3e635]'
                  : 'bg-white text-[#18181b] hover:bg-[#fde047]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 font-black border border-[#18181b] ${
                  isActive ? 'bg-white text-[#18181b]' : 'bg-[#f4f4f5] text-[#18181b]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b]">
        {displayedVisits.length === 0 ? (
          <div className="py-12 text-center text-xs font-black text-[#71717a] space-y-2 bg-white">
            <span className="material-symbols-outlined text-[36px]">hourglass_empty</span>
            <p>Tidak ada antrian yang cocok dengan filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[700px] bg-white">
            <thead>
              <tr className="border-b-2 border-[#18181b] bg-[#f8fafc] text-[11px] font-black uppercase tracking-wider text-[#18181b]">
                <th className="py-3 px-3">Antrean</th>
                <th className="py-3 px-3">Pasien</th>
                <th className="py-3 px-3">Dokter Bertugas</th>
                <th className="py-3 px-3">Waktu Masuk</th>
                <th className="py-3 px-3 text-center">Status Alur</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18181b]/10 text-xs font-bold text-[#18181b]">
              {displayedVisits.map((item, index) => {
                const isWaiting = item.status === 'WAITING';
                const isCancelled = item.status === 'CANCELLED';
                const isUnpaid =
                  item.invoice?.status === 'UNPAID' || (item.status === 'COMPLETED' && item.invoice?.status !== 'PAID');

                const sequentialQueueNumber = (validCurrentPage - 1) * itemsPerPage + index + 1;
                const formattedQueue = `A-${String(sequentialQueueNumber).padStart(3, '0')}`;

                return (
                  <tr key={item.id} className="hover:bg-[#fef9c3]/30 transition-colors">
                    {/* Nomor Antrian */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono bg-[#f4f4f5] px-2 py-1 border border-[#18181b] font-black text-xs">
                        {formattedQueue}
                      </span>
                    </td>

                    {/* Info Pasien */}
                    <td className="py-3.5 px-3">
                      <div className="font-black text-sm uppercase">{item.patient?.name}</div>
                      <div className="text-[11px] text-[#52525b] font-mono font-bold">
                        {item.patient?.noRm} • {item.patient?.gender === 'MALE' ? 'L' : 'P'} ({item.patient?.age} th)
                      </div>
                    </td>

                    {/* Dokter */}
                    <td className="py-3.5 px-3">
                      <div className="font-black uppercase">{item.doctor?.name}</div>
                      <div className="text-[11px] text-[#52525b] font-semibold">{item.doctor?.spesialis}</div>
                    </td>

                    {/* Waktu Masuk */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-[#52525b]">
                        {item.checkInTime
                          ? new Date(item.checkInTime).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Baru Terdaftar'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3 text-center">
                      {isWaiting ? (
                        <span className="bg-[#fde047] text-[#18181b] border-2 border-[#18181b] font-black text-[10px] px-2.5 py-0.5 shadow-[1px_1px_0px_#18181b] uppercase">
                          Menunggu
                        </span>
                      ) : item.status === 'IN_KONSULTASI' ? (
                        <span className="bg-[#38bdf8] text-[#18181b] border-2 border-[#18181b] font-black text-[10px] px-2.5 py-0.5 shadow-[1px_1px_0px_#18181b] uppercase">
                          Diperiksa
                        </span>
                      ) : isUnpaid ? (
                        <span className="bg-[#f472b6] text-[#18181b] border-2 border-[#18181b] font-black text-[10px] px-2.5 py-0.5 shadow-[1px_1px_0px_#18181b] uppercase">
                          Belum Bayar
                        </span>
                      ) : isCancelled ? (
                        <span className="bg-zinc-200 text-[#52525b] border-2 border-[#18181b] font-black text-[10px] px-2.5 py-0.5 uppercase">
                          Dibatalkan
                        </span>
                      ) : (
                        <span className="bg-[#4ade80] text-[#18181b] border-2 border-[#18181b] font-black text-[10px] px-2.5 py-0.5 shadow-[1px_1px_0px_#18181b] uppercase">
                          Selesai
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-3 text-right">
                      {isUnpaid ? (
                        <button
                          type="button"
                          onClick={() => onActionClick && onActionClick(item, 'PROCESS_PAYMENT')}
                          className="bg-[#f43f5e] text-white border-2 border-[#18181b] font-black text-xs px-3.5 py-1.5 shadow-[2px_2px_0px_#18181b] hover:bg-rose-600 transition-all cursor-pointer uppercase tracking-wider"
                        >
                          Proses Bayar
                        </button>
                      ) : isWaiting ? (
                        <button
                          type="button"
                          onClick={() => onActionClick && onActionClick(item, 'CALL_PATIENT')}
                          className="bg-[#a3e635] text-[#18181b] border-2 border-[#18181b] font-black text-xs px-3.5 py-1.5 shadow-[2px_2px_0px_#18181b] hover:scale-102 transition-all cursor-pointer uppercase tracking-wider"
                        >
                          Panggil Pasien
                        </button>
                      ) : item.status === 'IN_KONSULTASI' ? (
                        <button
                          type="button"
                          onClick={() => onActionClick && onActionClick(item, 'CONSULTATION')}
                          className="bg-[#38bdf8] text-[#18181b] font-black text-xs px-3.5 py-1.5 border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] hover:bg-[#0284c7] hover:text-white transition-all cursor-pointer uppercase tracking-wider"
                        >
                          Periksa Dokter
                        </button>
                      ) : isCancelled ? (
                        <span className="bg-[#cbd5e1] text-[#52525b] border border-[#18181b] font-extrabold text-xs px-3 py-1 inline-block uppercase">
                          Batal
                        </span>
                      ) : (
                        <span className="bg-[#4ade80] text-[#18181b] border border-[#18181b] font-black text-xs px-3 py-1 inline-block shadow-[1px_1px_0px_#18181b] uppercase">
                          Lunas
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {filteredVisits.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs font-bold text-[#18181b]">
          <div>
            Menampilkan <span className="font-black">{startIndex + 1}</span> -{' '}
            <span className="font-black">{endIndex}</span> dari{' '}
            <span className="font-black">{filteredVisits.length}</span> antrian
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={validCurrentPage === 1}
              className="p-1.5 border-2 border-[#18181b] bg-white text-[#18181b] hover:bg-[#fde047] disabled:opacity-40 disabled:hover:bg-white shadow-[2px_2px_0px_#18181b] cursor-pointer flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            <span className="px-3 py-1 border-2 border-[#18181b] bg-[#18181b] text-white font-black text-xs shadow-[2px_2px_0px_#a3e635]">
              {validCurrentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 border-2 border-[#18181b] bg-white text-[#18181b] hover:bg-[#fde047] disabled:opacity-40 disabled:hover:bg-white shadow-[2px_2px_0px_#18181b] cursor-pointer flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
