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
    // penanda boolean true / false, untuk cek status real dari setiap pasien
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
    <div className="neubrutal-card p-6 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#18181b] tracking-tight">Antrian Pendaftaran Pasien</h2>
          <p className="text-xs text-[#52525b] font-medium mt-0.5">
            Kelola dan pantau status alur pemeriksaan pasien secara real-time
          </p>
        </div>

        <div className="relative w-full sm:w-56 shrink-0">
          <input
            type="text"
            placeholder="Search patient or RM..."
            className="w-full pl-3.5 py-2.5 rounded-full border-2 border-[#18181b] bg-white text-xs font-semibold text-[#18181b] focus:outline-none shadow-[2px_2px_0px_#18181b] transition-all placeholder:text-[#747872]"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#18181b] text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#a3e635] hover:text-[#18181b] transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[13px]">search</span>
          </button>
        </div>
      </div>

      {/* Filter Tab sesuai status */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-[#18181b]/10">
        <button
          onClick={() => handleTabClick('ALL')}
          className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border-2 border-[#18181b] transition-all ${
            currentFilter === 'ALL'
              ? 'bg-[#18181b] text-white shadow-[2px_2px_0px_#18181b]'
              : 'bg-white text-[#18181b] hover:bg-zinc-100'
          }`}
        >
          Semua ({visits.length})
        </button>

        <button
          onClick={() => handleTabClick('WAITING')}
          className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border-2 border-[#18181b] transition-all ${
            currentFilter === 'WAITING'
              ? 'bg-[#fde047] text-[#18181b] shadow-[2px_2px_0px_#18181b]'
              : 'bg-white text-[#18181b] hover:bg-[#fde047]/30'
          }`}
        >
          Menunggu ({countWaiting})
        </button>

        <button
          onClick={() => handleTabClick('IN_KONSULTASI')}
          className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border-2 border-[#18181b] transition-all ${
            currentFilter === 'IN_KONSULTASI'
              ? 'bg-[#38bdf8] text-[#18181b] shadow-[2px_2px_0px_#18181b]'
              : 'bg-white text-[#18181b] hover:bg-[#38bdf8]/30'
          }`}
        >
          Dalam Konsultasi ({countConsulting})
        </button>

        <button
          onClick={() => handleTabClick('UNPAID')}
          className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border-2 border-[#18181b] transition-all ${
            currentFilter === 'UNPAID'
              ? 'bg-[#f472b6] text-[#18181b] shadow-[2px_2px_0px_#18181b]'
              : 'bg-white text-[#18181b] hover:bg-[#f472b6]/30'
          }`}
        >
          Belum Bayar ({countUnpaid})
        </button>

        <button
          onClick={() => handleTabClick('COMPLETED')}
          className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border-2 border-[#18181b] transition-all ${
            currentFilter === 'COMPLETED'
              ? 'bg-[#4ade80] text-[#18181b] shadow-[2px_2px_0px_#18181b]'
              : 'bg-white text-[#18181b] hover:bg-[#4ade80]/30'
          }`}
        >
          Selesai ({countCompleted})
        </button>
      </div>

      {/* Antrian */}
      <div className="overflow-x-auto">
        {displayedVisits.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-[#52525b] border-2 border-dashed border-[#18181b]/30 rounded-xl my-2">
            Tidak ada antrian yang cocok dengan filter atau kata kunci pencarian.
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="text-xs font-bold text-[#18181b] border-b-2 border-[#18181b] uppercase tracking-wider">
                <th className="pb-3 font-black">Nama Pasien</th>
                <th className="pb-3 font-black">Waktu & Dokter</th>
                <th className="pb-3 font-black">Status</th>
                <th className="pb-3 font-black text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm font-normal">
              {displayedVisits.map((item, index) => {
                const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                const isUnpaid =
                  item.invoice?.status === 'UNPAID' || (item.status === 'COMPLETED' && item.invoice?.status !== 'PAID');
                const isWaiting = item.status === 'WAITING';
                const isCancelled = item.status === 'CANCELLED';

                const formattedTime = item.createdAt
                  ? new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  : '08:00 AM';

                return (
                  <tr key={item.id} className="border-b border-[#18181b]/20 hover:bg-[#fef08a]/20 transition-colors">
                    {/* antrian pasien dan nama pasiennya */}
                    {/* liat BACKEND */}
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full bg-[#fde047] border-2 border-[#18181b] flex items-center justify-center text-[#18181b] font-black text-xs shrink-0 shadow-[1px_1px_0px_#18181b]"
                          title={`No. Antrian #${rowNumber}`}
                        >
                          {rowNumber}
                        </div>
                        <div>
                          <span className="text-[#18181b] font-extrabold text-sm block">{item.patient?.name}</span>
                          <span className="text-[11px] font-bold text-[#52525b]">
                            {item.patient?.gender === 'MALE' ? '👨 Laki-Laki' : '👩 Perempuan'} ({item.patient?.age}{' '}
                            thn)
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Arrival & Doctor */}
                    <td className="py-4 text-[#18181b]">
                      <div className="text-xs font-black text-[#18181b]">
                        {formattedTime} - {item.doctor?.name}
                      </div>
                      <div className="text-[11px] font-bold text-[#52525b] mt-0.5">{item.patient?.noRm}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4">
                      {isUnpaid ? (
                        <span className="bg-[#f472b6] text-[#18181b] border-2 border-[#18181b] font-black text-[11px] px-2.5 py-1 rounded-md shadow-[1px_1px_0px_#18181b]">
                          Belum Bayar
                        </span>
                      ) : isWaiting ? (
                        <span className="bg-[#fde047] text-[#18181b] border-2 border-[#18181b] font-black text-[11px] px-2.5 py-1 rounded-md shadow-[1px_1px_0px_#18181b]">
                          Waiting
                        </span>
                      ) : item.status === 'IN_KONSULTASI' ? (
                        <span className="bg-[#38bdf8] text-[#18181b] border-2 border-[#18181b] font-black text-[11px] px-2.5 py-1 rounded-md shadow-[1px_1px_0px_#18181b]">
                          In Session
                        </span>
                      ) : isCancelled ? (
                        <span className="bg-[#cbd5e1] text-[#52525b] border-2 border-[#18181b] font-extrabold text-[11px] px-2.5 py-1 rounded-md">
                          Cancelled
                        </span>
                      ) : (
                        <span className="bg-[#4ade80] text-[#18181b] border-2 border-[#18181b] font-black text-[11px] px-2.5 py-1 rounded-md shadow-[1px_1px_0px_#18181b]">
                          Completed
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-4 text-right">
                      {isUnpaid ? (
                        <button
                          onClick={() => onActionClick && onActionClick(item, 'PROCESS_PAYMENT')}
                          className="bg-[#f43f5e] text-white border-2 border-[#18181b] font-black text-xs px-3.5 py-1.5 rounded-lg shadow-[2px_2px_0px_#18181b] hover:bg-rose-600 transition-all cursor-pointer"
                        >
                          Proses Pembayaran
                        </button>
                      ) : isWaiting ? (
                        <button
                          onClick={() => onActionClick && onActionClick(item, 'CALL_PATIENT')}
                          className="neubrutal-btn-primary text-xs px-3.5 py-1.5 rounded-lg cursor-pointer"
                        >
                          Panggil Pasien
                        </button>
                      ) : item.status === 'IN_KONSULTASI' ? (
                        <button
                          onClick={() => onActionClick && onActionClick(item, 'CONSULTATION')}
                          className="bg-[#38bdf8] text-[#18181b] font-black text-xs px-3.5 py-1.5 rounded-lg border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] hover:bg-[#0284c7] hover:text-white transition-all cursor-pointer"
                        >
                          Diperiksa Dokter
                        </button>
                      ) : isCancelled ? (
                        <span className="bg-[#cbd5e1] text-[#52525b] border-2 border-[#18181b] font-extrabold text-xs px-3 py-1.5 rounded-lg inline-block">
                          Dibatalkan
                        </span>
                      ) : (
                        <span className="bg-[#4ade80] text-[#18181b] border-2 border-[#18181b] font-black text-xs px-3 py-1.5 rounded-lg inline-block shadow-[1px_1px_0px_#18181b]">
                          Lunas & Selesai
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

      {/* Pagination Controls Footer */}
      {filteredVisits.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 mt-4 border-t-2 border-[#18181b]/10 text-xs font-bold text-[#18181b]">
          <div>
            Menampilkan <span className="font-black">{filteredVisits.length === 0 ? 0 : startIndex + 1}</span> -{' '}
            <span className="font-black">{endIndex}</span> dari{' '}
            <span className="font-black">{filteredVisits.length}</span> antrian
          </div>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={validCurrentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border-2 border-[#18181b] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#fde047] transition-all cursor-pointer shadow-[1px_1px_0px_#18181b] flex items-center gap-1 font-black"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              <span>Prev</span>
            </button>

            {/* Page Number Badges */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg border-2 border-[#18181b] text-xs font-black transition-all cursor-pointer ${
                  validCurrentPage === pageNum
                    ? 'bg-[#a3e635] text-[#18181b] shadow-[2px_2px_0px_#18181b]'
                    : 'bg-white text-[#18181b] hover:bg-zinc-100 shadow-[1px_1px_0px_#18181b]'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={validCurrentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border-2 border-[#18181b] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#fde047] transition-all cursor-pointer shadow-[1px_1px_0px_#18181b] flex items-center gap-1 font-black"
            >
              <span>Next</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
