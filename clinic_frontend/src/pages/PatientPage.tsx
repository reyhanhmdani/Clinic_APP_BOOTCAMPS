import React, { useState, useEffect } from "react";
import type { Patient } from "../types/clinic";
import { usePatientStore } from "../stores/patientStore";
import {
  createPatientService,
  updatePatientService,
  deletePatientService,
} from "../services/patientService";
import { PatientHistoryModal } from "../components/patients/PatientHistoryModal";

export const PatientPage: React.FC = () => {
  const { patients, loading: isLoading, fetchPatients } = usePatientStore();

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState<"ALL" | "MALE" | "FEMALE">("ALL");
  const [viewMode, setViewMode] = useState<"TABLE" | "GRID">("TABLE");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Rekam Medis Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [patientForHistory, setPatientForHistory] = useState<Patient | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    gender: "MALE" as "MALE" | "FEMALE",
    age: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const openCreateModal = () => {
    setModalMode("CREATE");
    setSelectedPatient(null);
    setFormData({
      name: "",
      gender: "MALE",
      age: "",
      phone: "",
      address: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (patient: Patient) => {
    setModalMode("EDIT");
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      gender: patient.gender,
      age: String(patient.age),
      phone: patient.phone || "",
      address: patient.address || "",
    });
    setIsModalOpen(true);
  };

  const openHistoryModal = (patient: Patient) => {
    setPatientForHistory(patient);
    setIsHistoryModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Nama pasien wajib diisi!");
      return;
    }
    const numAge = Number(formData.age);
    if (!formData.age || isNaN(numAge) || numAge <= 0) {
      alert("Usia pasien harus berupa angka valid!");
      return;
    }

    try {
      if (modalMode === "CREATE") {
        await createPatientService({
          name: formData.name.trim(),
          gender: formData.gender,
          age: numAge,
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim() || undefined,
        });
        alert("Pasien baru berhasil didaftarkan!");
      } else if (modalMode === "EDIT" && selectedPatient) {
        await updatePatientService(selectedPatient.id, {
          name: formData.name.trim(),
          gender: formData.gender,
          age: numAge,
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim() || undefined,
        });
        alert("Data pasien berhasil diperbarui!");
      }
      setIsModalOpen(false);
      fetchPatients();
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || "Gagal menyimpan data pasien";
      alert(message);
    }
  };

  const handleDeletePatient = async (id: number, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data pasien ${name}?`)) {
      try {
        await deletePatientService(id);
        alert(`Data pasien ${name} berhasil dihapus`);
        fetchPatients();
      } catch (err: any) {
        const message = err?.response?.data?.message || err.message || "Gagal menghapus pasien";
        alert(message);
      }
    }
  };

  // Filter Logic
  const filteredPatients = patients.filter((patient) => {
    if (selectedGender !== "ALL" && patient.gender !== selectedGender) return false;
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      return (
        patient.name.toLowerCase().includes(q) ||
        patient.noRm.toLowerCase().includes(q) ||
        (patient.phone && patient.phone.includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] rounded-2xl p-5">
        <div>
          <div className="inline-block bg-[#fde047] text-[#18181b] text-[10px] font-black tracking-wider px-2 py-0.5 border-2 border-[#18181b] shadow-[1px_1px_0px_#18181b] uppercase mb-1">
            MASTER DATA
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#18181b] tracking-tight uppercase">
            DATA PASIEN
          </h1>
          <p className="text-xs md:text-sm text-[#52525b] font-bold">
            Total {patients.length} pasien terdaftar dalam database klinik
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="neubrutal-btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer uppercase tracking-wider text-xs font-black"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>+ Tambah Pasien Baru</span>
        </button>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white border-3 border-[#18181b] shadow-[3px_3px_0px_#18181b] rounded-2xl p-4">
        {/* Search Bar */}
        <div className="flex-1 flex items-center bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2">
          <span className="material-symbols-outlined text-[18px] text-[#71717a] mr-2">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama, No. RM, atau nomor HP..."
            className="w-full bg-transparent text-xs font-bold text-[#18181b] outline-none placeholder:text-[#a1a1aa]"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-[#71717a] hover:text-[#18181b]"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
        </div>

        {/* Gender Filter Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { id: "ALL", label: "Semua" },
            { id: "MALE", label: "Laki-laki" },
            { id: "FEMALE", label: "Perempuan" },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedGender(g.id as any)}
              className={`px-3 py-1.5 rounded-xl border-2 border-[#18181b] text-xs font-black uppercase transition-all ${
                selectedGender === g.id
                  ? "bg-[#18181b] text-white shadow-[2px_2px_0px_#a3e635]"
                  : "bg-white text-[#18181b] hover:bg-[#fef08a]"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle (Table / Grid) */}
        <div className="flex items-center gap-1 bg-[#f4f3ed] p-1 border-2 border-[#18181b] rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("TABLE")}
            className={`p-1.5 rounded-lg border border-transparent transition-all ${
              viewMode === "TABLE" ? "bg-white border-[#18181b] shadow-xs" : "text-[#71717a]"
            }`}
            title="Tampilan Tabel"
          >
            <span className="material-symbols-outlined text-[18px]">table_rows</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("GRID")}
            className={`p-1.5 rounded-lg border border-transparent transition-all ${
              viewMode === "GRID" ? "bg-white border-[#18181b] shadow-xs" : "text-[#71717a]"
            }`}
            title="Tampilan Grid Kartu"
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 text-center bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] rounded-2xl p-6">
          <span className="material-symbols-outlined text-[36px] text-[#18181b] animate-spin mb-2">
            sync
          </span>
          <p className="font-black text-sm uppercase">Memuat Data Pasien...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="py-16 text-center bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] rounded-2xl p-6 space-y-2">
          <span className="material-symbols-outlined text-[48px] text-[#71717a]">
            person_off
          </span>
          <h3 className="text-base font-black uppercase text-[#18181b]">
            Tidak Ada Data Pasien
          </h3>
          <p className="text-xs text-[#71717a] font-medium max-w-sm mx-auto">
            {searchTerm
              ? `Tidak ada pasien yang cocok dengan pencarian "${searchTerm}"`
              : "Belum ada pasien yang didaftarkan ke sistem."}
          </p>
        </div>
      ) : viewMode === "TABLE" ? (
        /* TABLE VIEW */
        <div className="bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#18181b] text-white uppercase font-black text-[11px] tracking-wider border-b-3 border-[#18181b]">
                  <th className="p-3.5">No. RM</th>
                  <th className="p-3.5">Nama Pasien</th>
                  <th className="p-3.5">Gender / Usia</th>
                  <th className="p-3.5">Kontak & Alamat</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-zinc-200 font-bold text-[#18181b]">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-[#f4f3ed] transition-colors">
                    <td className="p-3.5">
                      <span className="bg-[#a3e635] border border-[#18181b] px-2 py-0.5 rounded text-[11px] font-black">
                        {patient.noRm}
                      </span>
                    </td>
                    <td className="p-3.5 font-black text-sm uppercase">{patient.name}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black border border-[#18181b] ${
                            patient.gender === "MALE" ? "bg-[#bae6fd]" : "bg-[#fbcfe8]"
                          }`}
                        >
                          {patient.gender === "MALE" ? "L" : "P"}
                        </span>
                        <span>{patient.age} Th</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold">{patient.phone || "-"}</p>
                      <p className="text-[10px] text-[#71717a] truncate max-w-xs">
                        {patient.address || "Belum ada alamat"}
                      </p>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Tombol Rekam Medis */}
                        <button
                          type="button"
                          onClick={() => openHistoryModal(patient)}
                          className="bg-[#bae6fd] border-2 border-[#18181b] px-2.5 py-1 rounded-lg text-[11px] font-black uppercase hover:bg-sky-300 transition-all flex items-center gap-1 cursor-pointer"
                          title="Lihat Riwayat Rekam Medis"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            description
                          </span>
                          <span>Rekam Medis</span>
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => openEditModal(patient)}
                          className="bg-white border-2 border-[#18181b] px-2.5 py-1 rounded-lg text-[11px] font-black uppercase hover:bg-zinc-100 transition-all cursor-pointer"
                        >
                          Edit
                        </button>

                        {/* Hapus */}
                        <button
                          type="button"
                          onClick={() => handleDeletePatient(patient.id, patient.name)}
                          className="bg-[#f43f5e] text-white border-2 border-[#18181b] px-2.5 py-1 rounded-lg text-[11px] font-black uppercase hover:bg-rose-600 transition-all cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] rounded-2xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-[#a3e635] border-2 border-[#18181b] px-2 py-0.5 rounded text-xs font-black">
                    {patient.noRm}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black border border-[#18181b] ${
                      patient.gender === "MALE" ? "bg-[#bae6fd]" : "bg-[#fbcfe8]"
                    }`}
                  >
                    {patient.gender === "MALE" ? "Laki-laki" : "Perempuan"} • {patient.age} Th
                  </span>
                </div>
                <h3 className="text-base font-black text-[#18181b] uppercase mb-2">
                  {patient.name}
                </h3>
                <div className="bg-[#f4f3ed] p-2.5 rounded-xl border border-zinc-200 text-xs space-y-1 mb-4">
                  <p className="font-bold text-[#18181b] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">call</span>
                    {patient.phone || "Tidak ada nomor HP"}
                  </p>
                  <p className="text-[11px] text-[#52525b] flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-[14px] shrink-0 mt-0.5">
                      location_on
                    </span>
                    <span className="truncate">{patient.address || "Alamat belum diisi"}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-1.5 pt-3 border-t-2 border-zinc-200">
                <button
                  type="button"
                  onClick={() => openHistoryModal(patient)}
                  className="flex-1 bg-[#bae6fd] border-2 border-[#18181b] py-1.5 rounded-lg text-xs font-black uppercase hover:bg-sky-300 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  <span>Rekam Medis</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(patient)}
                  className="bg-white border-2 border-[#18181b] px-3 py-1.5 rounded-lg text-xs font-black uppercase hover:bg-zinc-100 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePatient(patient.id, patient.name)}
                  className="bg-[#f43f5e] text-white border-2 border-[#18181b] px-3 py-1.5 rounded-lg text-xs font-black uppercase hover:bg-rose-600 cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah / Edit Pasien */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-[#18181b] shadow-[8px_8px_0px_#18181b] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#18181b]">
              <div>
                <h3 className="text-xl font-black text-[#18181b] uppercase tracking-tight">
                  {modalMode === "CREATE" ? "Tambah Pasien Baru" : "Edit Data Pasien"}
                </h3>
                <p className="text-xs font-bold text-[#71717a]">
                  Formulir pendaftaran rekam medis klinik
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f4f3ed] border-2 border-[#18181b] flex items-center justify-center hover:bg-rose-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3">
              {/* Nama Pasien */}
              <div>
                <label className="block text-xs font-black text-[#18181b] uppercase mb-1">
                  Nama Lengkap Pasien *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b] outline-none"
                />
              </div>

              {/* Gender & Usia */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#18181b] uppercase mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value as any })
                    }
                    className="w-full bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3 py-2.5 text-xs font-bold text-[#18181b] outline-none"
                  >
                    <option value="MALE">Laki-laki</option>
                    <option value="FEMALE">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-[#18181b] uppercase mb-1">
                    Usia (Tahun) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Contoh: 30"
                    className="w-full bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b] outline-none"
                  />
                </div>
              </div>

              {/* Nomor HP */}
              <div>
                <label className="block text-xs font-black text-[#18181b] uppercase mb-1">
                  Nomor HP / WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b] outline-none"
                />
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-xs font-black text-[#18181b] uppercase mb-1">
                  Alamat Tinggal
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Contoh: Jl. Sudirman No. 10, Jakarta Pusat"
                  className="w-full bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2 text-xs font-bold text-[#18181b] outline-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-white border-2 border-[#18181b] rounded-xl text-xs font-black uppercase hover:bg-zinc-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#a3e635] text-[#18181b] border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] rounded-xl text-xs font-black uppercase hover:bg-lime-400 cursor-pointer"
                >
                  {modalMode === "CREATE" ? "Simpan Pasien" : "Update Pasien"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Riwayat Rekam Medis Pasien */}
      <PatientHistoryModal
        isOpen={isHistoryModalOpen}
        patient={patientForHistory}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  );
};
