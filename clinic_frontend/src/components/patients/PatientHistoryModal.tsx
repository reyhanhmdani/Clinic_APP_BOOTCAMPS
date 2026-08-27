import React, { useEffect, useState } from "react";
import { FileText, X, Search, Stethoscope, Pill, ChevronDown, ChevronUp, Loader2, SearchX } from "lucide-react";
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 sm:p-7 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="inline-block bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-sky-800 uppercase tracking-wider mb-1">
              Electronic Health Record
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Riwayat Rekam Medis Pasien
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Patient Summary Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-4 shadow-xs shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
            <h3 className="text-base font-bold text-slate-900 capitalize">
              {patient.name}
            </h3>
            <span className="bg-lime-100 border border-lime-200 px-2.5 py-0.5 rounded-md text-xs font-bold text-lime-900 font-mono">
              {patient.noRm}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span>{patient.gender === "MALE" ? "Laki-laki" : "Perempuan"}</span>
            <span>•</span>
            <span>{patient.age} Tahun</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">
              Total {historyData?.totalVisits || 0} Kunjungan Terdaftar
            </span>
          </div>
        </div>

        {/* Mini Search Bar (Only shown if > 1 visit) */}
        {historyData && historyData.visits.length > 1 && (
          <div className="mb-4 shrink-0">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
              <Search size={16} className="text-slate-400 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari diagnosa, keluhan, obat, atau dokter..."
                className="w-full bg-transparent text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {loading ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <Loader2 size={32} className="text-slate-700 animate-spin mb-2" />
              <p className="text-xs font-bold text-slate-500">
                Memuat riwayat rekam medis...
              </p>
            </div>
          ) : !historyData || historyData.visits.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center">
              <FileText size={38} className="text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">
                Belum Ada Riwayat Kunjungan
              </h4>
              <p className="text-xs font-medium text-slate-400 mt-1">
                Pasien ini belum pernah menyelesaikan sesi konsultasi dokter di klinik.
              </p>
            </div>
          ) : filteredVisits.length === 0 ? (
            <div className="py-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center">
              <SearchX size={32} className="text-slate-300 mb-1" />
              <h4 className="text-xs font-bold text-slate-800">Tidak Ditemukan</h4>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
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
                  className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-4 transition-all"
                >
                  {/* Card Header Accordion Trigger */}
                  <div
                    onClick={() => toggleVisitExpand(visit.id)}
                    className={`flex items-center justify-between cursor-pointer select-none ${
                      isExpanded ? "pb-3 mb-3 border-b border-slate-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 mr-2 overflow-hidden">
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold shrink-0">
                        #{historyData.visits.length - idx}
                      </span>
                      <span className="text-xs font-bold text-slate-800 shrink-0">
                        {formatDate(visit.visitDate)}
                      </span>
                      {!isExpanded && (
                        <span className="text-xs font-medium text-slate-500 truncate">
                          • {consultation?.diagnosis || visit.doctor?.name}
                        </span>
                      )}
                    </div>

                    <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      {isExpanded ? <ChevronUp size={16} className="text-slate-600" /> : <ChevronDown size={16} className="text-slate-600" />}
                    </div>
                  </div>

                  {/* Expanded Body Content */}
                  {isExpanded && (
                    <div className="space-y-3 pt-1">
                      {/* Doctor Info */}
                      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <Stethoscope size={16} className="text-slate-600" />
                        <span className="text-xs font-bold text-slate-800">
                          {visit.doctor?.name}{" "}
                          <span className="font-medium text-slate-500">
                            (Poli {visit.doctor?.spesialis || "Umum"})
                          </span>
                        </span>
                      </div>

                      {/* Keluhan & Diagnosa */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Keluhan Utama:
                          </p>
                          <p className="font-medium text-slate-800">
                            {consultation?.complaint || "Tidak ada catatan keluhan"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Diagnosa Medis:
                          </p>
                          <p className="font-bold text-sky-700">
                            {consultation?.diagnosis || "Belum ada diagnosa"}
                          </p>
                        </div>

                        {consultation?.notes && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Catatan Dokter:
                            </p>
                            <p className="font-medium text-slate-600">
                              {consultation.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Prescribed Medicines Box */}
                      {medicines.length > 0 && (
                        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Pill size={15} className="text-emerald-700" />
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                              Resep Obat Diberikan ({medicines.length}):
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {medicines.map((m: any, mIdx: number) => (
                              <div
                                key={m.id || mIdx}
                                className="flex flex-col sm:flex-row justify-between sm:items-center text-xs"
                              >
                                <span className="font-semibold text-slate-800">
                                  • {m.medicine?.name}{" "}
                                  <span className="font-normal text-slate-500">
                                    ({m.qty} {m.medicine?.unit})
                                  </span>
                                </span>
                                {m.instructions && (
                                  <span className="text-[11px] font-medium text-emerald-700 mt-0.5 sm:mt-0">
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
        <div className="pt-4 border-t border-slate-100 mt-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
