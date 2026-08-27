import React from "react";
import { Stethoscope, MoreHorizontal } from "lucide-react";
import type { Doctor } from "../../types/clinic";

interface DoctorAvailabilityProps {
  doctors: Doctor[];
}

export const DoctorAvailability: React.FC<DoctorAvailabilityProps> = ({ doctors }) => {
  const activeDoctors = doctors.filter((doc) => doc.isActive);
  const inactiveDoctors = doctors.filter((doc) => !doc.isActive);

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Stethoscope size={18} className="text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Status Praktek Dokter
          </h3>
        </div>
        <MoreHorizontal size={18} className="text-slate-400 cursor-pointer hover:text-slate-700" />
      </div>

      {/* Summary Counts */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="bg-emerald-50 border border-emerald-200/80 p-2.5 rounded-xl">
          <p className="text-[10px] font-bold text-emerald-800 uppercase">Aktif Bertugas</p>
          <p className="text-lg font-black text-emerald-900">{activeDoctors.length}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Libur / Off</p>
          <p className="text-lg font-black text-slate-700">{inactiveDoctors.length}</p>
        </div>
      </div>

      {/* List of Active Doctors */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  doc.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                }`}
              />
              <div>
                <p className="font-bold text-slate-800">{doc.name}</p>
                <p className="text-[10px] text-slate-400">{doc.spesialis} • {doc.room || "Poli 1"}</p>
              </div>
            </div>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                doc.isActive
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-slate-100 text-slate-400 border-slate-200"
              }`}
            >
              {doc.isActive ? "Praktek" : "Off"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
