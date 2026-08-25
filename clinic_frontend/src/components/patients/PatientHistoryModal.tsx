import React, { useEffect, useState } from "react";
import type { Patient, Visit } from "../../types/clinic";
import { getPatientHistoryService } from "../../services/patientService";
import type { PatientHistoryResponse } from "../../services/patientService";

interface PatientHistoryModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
}

export const PatientHistoryModal: React.FC<PatientHistoryModalProps> = ({
  isOpen,
  patient,
  onClose,
}) => {
  const [historyData, setHistoryData] = useState<PatientHistoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedVisitIds, setExpandedVisitIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (isOpen && patient) {
      setSearchQuery("");
      fetchHistory(patient.id);
    } else {
      setHistoryData(null);
      setExpandedVisitIds([]);
      setSearchQuery("");
    }
  }, [isOpen, patient]);

  const fetchHistory = async (id: number) => {
    setLoading(true);
    try {
      const data = await getPatientHistoryService(id);
      setHistoryData(data);
      if (data.visits && data.visits.length > 0) {
        setExpandedVisitIds([data.visits[0].id]);
      } else {
        setExpandedVisitIds([]);
      }
    } catch (error) {
      console.error("Error fetching patient history:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisitExpand = (visitId: number) => {
    setExpandedVisitIds((prev) =>
      prev.includes(visitId) ? prev.filter((id) => id !== visitId) : [...prev, visitId]
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const filteredVisits = (historyData?.visits || []).filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const doctorName = v.doctor?.name?.toLowerCase() || "";
    const complaint = v.consultation?.complaint?.toLowerCase() || "";
    const diagnosis = v.consultation?.diagnosis?.toLowerCase() || "";
    const notes = v.consultation?.notes?.toLowerCase() || "";
    const medicines = (v.consultation?.consultationMedicines || [])
      .map((m) => m.medicine?.name?.toLowerCase() || "")
      .join(" ");

    return (
      doctorName.includes(q) ||
      complaint.includes(q) ||
      diagnosis.includes(q) ||
      notes.includes(q) ||
      medicines.includes(q)
    );
  });

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border-4 border-[#18181b] shadow-[8px_8px_0px_#18181b] rounded-3xl p-6 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b-3 border-[#18181b]">
          <div>
            <div className="inline-block bg-[#bae6fd] border-2 border-[#18181b] px-2.5 py-0.5 rounded text-[10px] font-black text-[#18181b] uppercase tracking-wider mb-1">
              ELECTRONIC HEALTH RECORD
            </div>
            <h2 className="text-xl md:text-2xl font-black text-[#18181b] uppercase tracking-tight">
              RIWAYAT REKAM MEDIS
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 bg-[#f4f3ed] border-2 border-[#18181b] rounded-full flex items-center justify-center text-[#18181b] hover:bg-rose-100 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Patient Summary Card */}
        <div className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-2xl p-4 mb-4 shadow-[2px_2px_0px_#18181b] shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
            <h3 className="text-base md:text-lg font-black text-[#18181b] uppercase">
              {patient.name}
            </h3>
            <span className="bg-[#a3e635] border-2 border-[#18181b] px-2.5 py-0.5 rounded text-xs font-black text-[#18181b]">
              {patient.noRm}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#52525b]">
            <span>{patient.gender === "MALE" ? "Laki-laki" : "Perempuan"}</span>
            <span>•</span>
            <span>{patient.age} Tahun</span>
            <span>•</span>
            <span className="text-[#059669] font-black">
              Total {historyData?.totalVisits || 0} Kunjungan Terdaftar
            </span>
          </div>
        </div>

        {/* Mini Search Bar (Only shown if > 1 visit) */}
        {historyData && historyData.visits.length > 1 && (
          <div className="mb-4 shrink-0">
            <div className="flex items-center bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2">
              <span className="material-symbols-outlined text-[18px] text-[#71717a] mr-2">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari diagnosa, keluhan, obat, atau dokter..."
                className="w-full bg-transparent text-xs font-bold text-[#18181b] outline-none placeholder:text-[#a1a1aa]"
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-[#71717a] hover:text-[#18181b] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {loading ? (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-[36px] text-[#18181b] animate-spin mb-2">
                sync
              </span>
              <p className="text-xs font-black text-[#71717a] uppercase">
                Memuat riwayat rekam medis...
              </p>
            </div>
          ) : !historyData || historyData.visits.length === 0 ? (
            <div className="py-12 text-center bg-[#f4f3ed] border-2 border-dashed border-[#18181b]/30 rounded-2xl p-6">
              <span className="material-symbols-outlined text-[42px] text-[#71717a] mb-2">
                description
              </span>
              <h4 className="text-sm font-black text-[#18181b] uppercase">
                Belum Ada Riwayat Kunjungan
              </h4>
              <p className="text-xs font-medium text-[#71717a] mt-1">
                Pasien ini belum pernah menyelesaikan sesi konsultasi dokter di klinik.
              </p>
            </div>
          ) : filteredVisits.length === 0 ? (
            <div className="py-10 text-center bg-[#f4f3ed] border-2 border-dashed border-[#18181b]/30 rounded-2xl p-4">
              <span className="material-symbols-outlined text-[32px] text-[#71717a] mb-1">
                search_off
              </span>
              <h4 className="text-xs font-black text-[#18181b] uppercase">Tidak Ditemukan</h4>
              <p className="text-[11px] font-medium text-[#71717a] mt-0.5">
                Tidak ada rekam medis yang cocok dengan "{searchQuery}"
              </p>
            </div>
          ) : (
            filteredVisits.map((visit: Visit, idx: number) => {
              const isExpanded = expandedVisitIds.includes(visit.id);
              const consultation = visit.consultation;
              const medicines = consultation?.consultationMedicines || [];

              return (
                <div
                  key={visit.id}
                  className="bg-white border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] rounded-2xl p-4 transition-all"
                >
                  {/* Card Header Accordion Trigger */}
                  <div
                    onClick={() => toggleVisitExpand(visit.id)}
                    className={`flex items-center justify-between cursor-pointer select-none ${
                      isExpanded ? "pb-3 mb-3 border-b border-zinc-200" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 mr-2 overflow-hidden">
                      <span className="bg-[#fef08a] border border-[#18181b] px-2 py-0.5 rounded text-[10px] font-black text-[#18181b] shrink-0">
                        #{historyData.visits.length - idx}
                      </span>
                      <span className="text-xs font-black text-[#18181b] shrink-0">
                        {formatDate(visit.visitDate)}
                      </span>
                      {!isExpanded && (
                        <span className="text-xs font-medium text-[#71717a] truncate">
                          • {consultation?.diagnosis || visit.doctor?.name}
                        </span>
                      )}
                    </div>

                    <div className="w-7 h-7 rounded-full bg-[#f4f3ed] border border-[#18181b] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-[#18181b]">
                        {isExpanded ? "expand_less" : "expand_more"}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Body Content */}
                  {isExpanded && (
                    <div className="space-y-3 pt-1">
                      {/* Doctor Info */}
                      <div className="flex items-center gap-2 bg-[#f4f3ed] p-2.5 rounded-xl border border-zinc-200">
                        <span className="material-symbols-outlined text-[18px] text-[#18181b]">
                          stethoscope
                        </span>
                        <span className="text-xs font-black text-[#18181b]">
                          {visit.doctor?.name}{" "}
                          <span className="font-bold text-[#71717a]">
                            (Poli {visit.doctor?.spesialis || "Umum"})
                          </span>
                        </span>
                      </div>

                      {/* Keluhan & Diagnosa */}
                      <div className="space-y-2">
                        <div>
                          <p className="text-[10px] font-black text-[#71717a] uppercase tracking-wider">
                            Keluhan Utama:
                          </p>
                          <p className="text-xs font-bold text-[#18181b]">
                            {consultation?.complaint || "Tidak ada catatan keluhan"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-black text-[#71717a] uppercase tracking-wider">
                            Diagnosa Medis:
                          </p>
                          <p className="text-xs font-black text-[#0284c7]">
                            {consultation?.diagnosis || "Belum ada diagnosa"}
                          </p>
                        </div>

                        {consultation?.notes && (
                          <div>
                            <p className="text-[10px] font-black text-[#71717a] uppercase tracking-wider">
                              Catatan Dokter:
                            </p>
                            <p className="text-xs font-medium text-[#52525b]">
                              {consultation.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Prescribed Medicines Box */}
                      {medicines.length > 0 && (
                        <div className="bg-[#ecfdf5] border border-[#059669]/30 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="material-symbols-outlined text-[16px] text-[#059669]">
                              medication
                            </span>
                            <span className="text-[10px] font-black text-[#059669] uppercase tracking-wider">
                              Resep Obat Diberikan ({medicines.length}):
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {medicines.map((m: any, mIdx: number) => (
                              <div
                                key={m.id || mIdx}
                                className="flex flex-col sm:flex-row justify-between sm:items-center text-xs"
                              >
                                <span className="font-bold text-[#18181b]">
                                  • {m.medicine?.name}{" "}
                                  <span className="font-normal text-[#52525b]">
                                    ({m.qty} {m.medicine?.unit})
                                  </span>
                                </span>
                                {m.instructions && (
                                  <span className="text-[11px] font-bold text-[#059669] mt-0.5 sm:mt-0">
                                    {m.instructions}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Close Button */}
        <div className="pt-4 border-t-2 border-[#18181b] mt-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-[#18181b] text-white border-2 border-[#18181b] shadow-[2px_2px_0px_#000] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-zinc-800 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
