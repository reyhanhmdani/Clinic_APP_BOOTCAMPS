import React, { useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Receipt, Inbox, Smartphone, Building2 } from 'lucide-react';
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
      const nik = item.patient?.nik?.toLowerCase() || '';
      const doctorName = item.doctor?.name?.toLowerCase() || '';
      return patientName.includes(q) || noRm.includes(q) || nik.includes(q) || doctorName.includes(q);
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
    <div
      id="antrean-table"
      className="p-5 sm:p-7 bg-white border border-slate-100 shadow-sm rounded-[24px] flex flex-col space-y-5 sm:space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Daftar Antrean Pasien</h2>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Pantau dan kelola alur pemeriksaan pasien secara real-time
          </p>
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pasien / RM / dokter..."
            className="w-full pl-10 pr-8 py-2 border border-slate-200/80 rounded-full bg-slate-50/50 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-[#061e15] transition-all placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'ALL', label: 'Semua', count: visits.length },
          { id: 'WAITING', label: 'Menunggu', count: countWaiting },
          { id: 'IN_KONSULTASI', label: 'Diperiksa', count: countConsulting },
          { id: 'UNPAID', label: 'Belum Bayar', count: countUnpaid },
          { id: 'COMPLETED', label: 'Selesai', count: countCompleted },
        ].map((tab) => {
          const isActive = currentFilter === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#061e15] text-white shadow-xs font-bold'
                  : 'bg-slate-100/70 hover:bg-slate-200/60 text-slate-600'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-[#b4f105] text-[#061e15]' : 'bg-white text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        {displayedVisits.length === 0 ? (
          <div className="py-14 text-center text-xs font-medium text-slate-400 space-y-2 bg-white flex flex-col items-center justify-center">
            <Inbox size={32} className="text-slate-300 stroke-[1.5]" />
            <p>Tidak ada antrian yang cocok dengan filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[700px] bg-white">
            <thead>
              <tr className="bg-slate-50/60 text-[11px] font-semibold tracking-wider text-slate-400 uppercase border-b border-slate-100">
                <th className="py-3 px-4">Antrean</th>
                <th className="py-3 px-4">Pasien</th>
                <th className="py-3 px-4">Dokter Bertugas</th>
                <th className="py-3 px-4">Waktu Masuk</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              {displayedVisits.map((item) => {
                const isWaiting = item.status === 'WAITING';
                const isCancelled = item.status === 'CANCELLED';
                const isUnpaid =
                  item.invoice?.status === 'UNPAID' || (item.status === 'COMPLETED' && item.invoice?.status !== 'PAID');

                const formattedQueue = `A-${String(item.queueNumber).padStart(3, '0')}`;

                const vDate = new Date(item.visitDate);
                const now = new Date();
                const isToday =
                  vDate.getDate() === now.getDate() &&
                  vDate.getMonth() === now.getMonth() &&
                  vDate.getFullYear() === now.getFullYear();

                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                const isYesterday =
                  vDate.getDate() === yesterday.getDate() &&
                  vDate.getMonth() === yesterday.getMonth() &&
                  vDate.getFullYear() === yesterday.getFullYear();

                const dayLabel = isToday
                  ? 'Hari Ini'
                  : isYesterday
                  ? 'Kemarin'
                  : vDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

                const timeStr = vDate.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Nomor Antrian */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono bg-slate-100 text-slate-800 px-3 py-1 rounded-full font-bold text-xs">
                        {formattedQueue}
                      </span>
                    </td>

                    {/* Info Pasien */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 capitalize">{item.patient?.name}</span>
                        {item.patient?.userId ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#061e15] text-[#b4f105] shadow-2xs">
                            <Smartphone size={10} className="stroke-[2.5]" />
                            <span>Akun Online</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            <Building2 size={10} className="text-slate-400" />
                            <span>Loket Offline</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span>{item.patient?.noRm}</span>
                        <span>•</span>
                        <span>
                          {item.patient?.gender === 'MALE' ? 'L' : 'P'} ({item.patient?.age} th)
                        </span>
                        {item.patient?.nik && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500 font-semibold">NIK: {item.patient.nik}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Dokter */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{item.doctor?.name}</div>
                      <div className="text-[11px] text-slate-400">{item.doctor?.spesialis}</div>
                    </td>

                    {/* Waktu & Tanggal Masuk */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span
                          className={`text-[10px] font-bold font-mono ${
                            isToday ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {dayLabel}
                        </span>
                        <span className="font-mono font-medium text-slate-600 text-xs">{timeStr}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {isWaiting ? (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[10px] px-3 py-0.5 rounded-full">
                          Menunggu
                        </span>
                      ) : item.status === 'IN_KONSULTASI' ? (
                        <span className="bg-sky-50 text-sky-800 border border-sky-200 font-semibold text-[10px] px-3 py-0.5 rounded-full">
                          Diperiksa
                        </span>
                      ) : isUnpaid ? (
                        <span className="bg-rose-50 text-rose-800 border border-rose-200 font-semibold text-[10px] px-3 py-0.5 rounded-full">
                          Belum Bayar
                        </span>
                      ) : isCancelled ? (
                        <span className="bg-slate-100 text-slate-500 border border-slate-200 font-medium text-[10px] px-3 py-0.5 rounded-full">
                          Dibatalkan
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[10px] px-3 py-0.5 rounded-full">
                          Selesai
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      {isUnpaid ? (
                        <button
                          type="button"
                          onClick={() => onActionClick && onActionClick(item, 'PROCESS_PAYMENT')}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-xs transition-all cursor-pointer tracking-wide"
                        >
                          Proses Bayar
                        </button>
                      ) : isWaiting ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onActionClick && onActionClick(item, 'CALL_PATIENT')}
                            className="btn-lime text-xs px-3.5 py-1.5 rounded-full shadow-xs cursor-pointer tracking-wide"
                          >
                            Panggil Pasien
                          </button>
                          <button
                            type="button"
                            onClick={() => onActionClick && onActionClick(item, 'CANCEL_VISIT')}
                            className="p-1.5 border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-full shadow-xs cursor-pointer transition-all"
                            title="Batalkan Antrean"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ) : item.status === 'IN_KONSULTASI' ? (
                        <button
                          type="button"
                          onClick={() => onActionClick && onActionClick(item, 'CONSULTATION')}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-xs transition-all cursor-pointer tracking-wide"
                        >
                          Periksa Dokter
                        </button>
                      ) : isCancelled ? (
                        <span className="bg-slate-100 text-slate-500 font-medium text-xs px-3 py-1 rounded-full inline-block">
                          Batal
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="bg-emerald-100 text-emerald-800 font-semibold text-xs px-3 py-1 rounded-full inline-block">
                            Lunas
                          </span>
                          <button
                            type="button"
                            onClick={() => onActionClick && onActionClick(item, 'PRINT_RECEIPT')}
                            className="p-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-full shadow-xs cursor-pointer font-bold flex items-center justify-center transition-all"
                            title="Lihat & Cetak Struk Nota"
                          >
                            <Receipt size={15} />
                          </button>
                        </div>
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-1 text-xs font-medium text-slate-500">
          <div>
            Menampilkan <span className="font-bold text-slate-800">{startIndex + 1}</span> -{' '}
            <span className="font-bold text-slate-800">{endIndex}</span> dari{' '}
            <span className="font-bold text-slate-800">{filteredVisits.length}</span> antrian
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={validCurrentPage === 1}
              className="p-1.5 border border-slate-200 rounded-full bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white shadow-xs cursor-pointer flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-3.5 py-1 bg-[#061e15] text-white font-bold text-xs rounded-full shadow-xs">
              {validCurrentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-full bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white shadow-xs cursor-pointer flex items-center justify-center"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
