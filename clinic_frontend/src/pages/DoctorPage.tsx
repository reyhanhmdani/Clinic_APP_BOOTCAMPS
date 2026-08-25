import React, { useState, useEffect } from "react";
import type { Doctor } from "../types/clinic";
import { useDoctorStore } from "../stores/doctorStore";
import {
  createDoctorService,
  updateDoctorService,
  deleteDoctorService,
} from "../services/doctorService";
import { formatRupiah } from "../utils/formatRupiah";

export const DoctorPage: React.FC = () => {
  const { doctors, loading: isLoading, fetchDoctors } = useDoctorStore();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [spesialis, setSpesialis] = useState("Dokter Umum");
  const [phone, setPhone] = useState("");
  const [fee, setFee] = useState("");
  const [room, setRoom] = useState("");
  const [isActive, setIsActive] = useState(true);

  const commonSpecialists = [
    "Dokter Umum",
    "Spesialis Anak",
    "Spesialis Penyakit Dalam",
    "Spesialis Kandungan (Obgyn)",
    "Spesialis Gigi",
    "Spesialis Kulit",
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const openCreateModal = () => {
    setModalMode("CREATE");
    setSelectedDoctor(null);
    setName("");
    setSpesialis("Dokter Umum");
    setPhone("");
    setFee("100.000");
    setRoom("Ruang Poli 1");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (doc: Doctor) => {
    setModalMode("EDIT");
    setSelectedDoctor(doc);
    setName(doc.name);
    setSpesialis(doc.spesialis);
    setPhone(doc.phone || "");
    setFee(new Intl.NumberFormat("id-ID").format(Number(doc.fee)));
    setRoom(doc.room || "");
    setIsActive(doc.isActive);
    setIsModalOpen(true);
  };

  const handleFeeChange = (text: string) => {
    const cleanNumber = text.replace(/\D/g, "");
    if (!cleanNumber) {
      setFee("");
      return;
    }
    const formatted = new Intl.NumberFormat("id-ID").format(Number(cleanNumber));
    setFee(formatted);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama dokter wajib diisi!");
      return;
    }

    const cleanFee = Number(fee.replace(/\D/g, ""));
    if (!fee.trim() || isNaN(cleanFee) || cleanFee <= 0) {
      alert("Tarif konsultasi dokter harus berupa nominal angka valid!");
      return;
    }

    const payload = {
      name: name.trim(),
      spesialis: spesialis.trim(),
      phone: phone.trim() || undefined,
      fee: cleanFee,
      room: room.trim() || undefined,
      isActive: isActive,
    };

    try {
      if (modalMode === "CREATE") {
        await createDoctorService(payload);
        alert("Dokter baru berhasil ditambahkan!");
      } else if (modalMode === "EDIT" && selectedDoctor) {
        await updateDoctorService(selectedDoctor.id, payload);
        alert("Data dokter berhasil diperbarui!");
      }
      setIsModalOpen(false);
      fetchDoctors();
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || "Gagal menyimpan data dokter";
      alert(message);
    }
  };

  const handleDeleteDoctor = async (id: number, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data dokter ${name}?`)) {
      try {
        await deleteDoctorService(id);
        alert(`Data dokter ${name} berhasil dihapus`);
        fetchDoctors();
      } catch (err: any) {
        const message = err?.response?.data?.message || err.message || "Gagal menghapus dokter";
        alert(message);
      }
    }
  };

  // Filter Logic
  const filteredDoctors = doctors.filter((doc) => {
    if (statusFilter === "ACTIVE" && !doc.isActive) return false;
    if (statusFilter === "INACTIVE" && doc.isActive) return false;

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.spesialis.toLowerCase().includes(q) ||
        (doc.phone && doc.phone.includes(q)) ||
        (doc.room && doc.room.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] rounded-2xl p-5">
        <div>
          <div className="inline-block bg-[#a3e635] text-[#18181b] text-[10px] font-black tracking-wider px-2 py-0.5 border-2 border-[#18181b] shadow-[1px_1px_0px_#18181b] uppercase mb-1">
            TIM MEDIS
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#18181b] tracking-tight uppercase">
            DATA DOKTER & JASA MEDIS
          </h1>
          <p className="text-xs md:text-sm text-[#52525b] font-bold">
            Total {doctors.length} tenaga medis dan dokter spesialis klinik
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="neubrutal-btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer uppercase tracking-wider text-xs font-black"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>+ Tambah Dokter Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white border-3 border-[#18181b] shadow-[3px_3px_0px_#18181b] rounded-2xl p-4">
        {/* Search Bar */}
        <div className="flex-1 flex items-center bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2">
          <span className="material-symbols-outlined text-[18px] text-[#71717a] mr-2">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama dokter, spesialisasi, atau ruangan..."
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

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { id: "ALL", label: "Semua" },
            { id: "ACTIVE", label: "Aktif Jaga" },
            { id: "INACTIVE", label: "Non-Aktif" },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStatusFilter(s.id as any)}
              className={`px-3 py-1.5 rounded-xl border-2 border-[#18181b] text-xs font-black uppercase transition-all ${
                statusFilter === s.id
                  ? "bg-[#18181b] text-white shadow-[2px_2px_0px_#a3e635]"
                  : "bg-white text-[#18181b] hover:bg-[#fef08a]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {isLoading ? (
        <div className="py-20 text-center bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] rounded-2xl p-6">
          <span className="material-symbols-outlined text-[36px] text-[#18181b] animate-spin mb-2">
            sync
          </span>
          <p className="font-black text-sm uppercase">Memuat Data Dokter...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="py-16 text-center bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] rounded-2xl p-6 space-y-2">
          <span className="material-symbols-outlined text-[48px] text-[#71717a]">
            person_off
          </span>
          <h3 className="text-base font-black uppercase text-[#18181b]">Tidak Ada Data Dokter</h3>
          <p className="text-xs text-[#71717a] font-medium max-w-sm mx-auto">
            {searchTerm
              ? `Tidak ada dokter yang cocok dengan pencarian "${searchTerm}"`
              : "Belum ada dokter yang didaftarkan ke sistem klinik."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] rounded-2xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full border border-black ${
                        doc.isActive ? "bg-[#a3e635]" : "bg-zinc-400"
                      }`}
                    />
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black border border-[#18181b] ${
                        doc.isActive ? "bg-[#d9f99d] text-[#166534]" : "bg-zinc-200 text-zinc-600"
                      }`}
                    >
                      {doc.isActive ? "AKTIF BERTUGAS" : "TIDAK AKTIF"}
                    </span>
                  </div>
                  <span className="bg-[#bae6fd] border border-[#18181b] px-2 py-0.5 rounded text-[10px] font-black text-[#18181b]">
                    {doc.room || "Poli 1"}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-[#a3e635] border-2 border-[#18181b] flex items-center justify-center text-[#18181b] font-black text-sm shadow-[2px_2px_0px_#18181b] shrink-0">
                    {doc.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#18181b] uppercase leading-tight">
                      {doc.name}
                    </h3>
                    <p className="text-xs font-bold text-[#0284c7]">{doc.spesialis}</p>
                  </div>
                </div>

                <div className="bg-[#f4f3ed] p-3 rounded-xl border border-zinc-200 text-xs space-y-1.5 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#71717a] font-bold">Tarif Jasa Medis:</span>
                    <span className="font-black text-[#059669] text-sm">
                      {formatRupiah(doc.fee)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#71717a] font-bold">Kontak / Telepon:</span>
                    <span className="font-bold text-[#18181b]">{doc.phone || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-zinc-200">
                <button
                  type="button"
                  onClick={() => openEditModal(doc)}
                  className="flex-1 py-1.5 bg-white border-2 border-[#18181b] rounded-lg text-xs font-black uppercase hover:bg-zinc-100 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                  className="py-1.5 px-3 bg-[#f43f5e] text-white border-2 border-[#18181b] rounded-lg text-xs font-black uppercase hover:bg-rose-600 cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah / Edit Dokter */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-[#18181b] shadow-[8px_8px_0px_#18181b] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#18181b]">
              <div>
                <h3 className="text-xl font-black text-[#18181b] uppercase tracking-tight">
                  {modalMode === "CREATE" ? "Tambah Dokter Baru" : "Edit Data Dokter"}
                </h3>
                <p className="text-xs font-bold text-[#71717a]">
                  Formulir data tenaga medis & spesialisasi
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
              {/* Nama Dokter */}
              <div>
                <label className="block text-xs font-black text-[#18181b] uppercase mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: dr. Amanda Sari, Sp.A"
                  className="w-full bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b] outline-none"
                />
              </div>

              {/* Spesialisasi Pills */}
              <div>
                <label className="block text-xs font-black text-[#18181b] uppercase mb-1.5">
                  Poli / Spesialisasi *
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {commonSpecialists.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpesialis(s)}
                      className={`px-2.5 py-1 rounded-lg border-2 border-[#18181b] text-[11px] font-black uppercase transition-all cursor-pointer ${
                        spesialis === s
                          ? "bg-[#18181b] text-white shadow-[2px_2px_0px_#a3e635]"
                          : "bg-[#f4f3ed] text-[#18181b] hover:bg-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={spesialis}
                  onChange={(e) => setSpesialis(e.target.value)}
                  placeholder="Atau ketik spesialisasi lain..."
                  className="w-full bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2 text-xs font-bold text-[#18181b] outline-none"
                />
              </div>

              {/* Tarif Jasa Medis & Ruangan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#18181b] uppercase mb-1">
                    Tarif Jasa Medis (Rp) *
                  </label>
                  <div className="flex items-center bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3 py-2.5">
                    <span className="text-xs font-black text-[#71717a] mr-1">Rp</span>
                    <input
                      type="text"
                      required
                      value={fee}
                      onChange={(e) => handleFeeChange(e.target.value)}
                      placeholder="100.000"
                      className="w-full bg-transparent text-xs font-bold text-[#18181b] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#18181b] uppercase mb-1">
                    Ruang Praktek
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="Poli 1"
                    className="w-full bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b] outline-none"
                  />
                </div>
              </div>

              {/* Telepon */}
              <div>
                <label className="block text-xs font-black text-[#18181b] uppercase mb-1">
                  Nomor HP Dokter
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="w-full bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b] outline-none"
                />
              </div>

              {/* Status Aktif Switch */}
              <div className="flex items-center justify-between p-3 bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl">
                <div>
                  <p className="text-xs font-black text-[#18181b] uppercase">Status Kehadiran</p>
                  <p className="text-[10px] font-bold text-[#71717a]">
                    Dokter aktif dapat dipilih pada antrean pasien
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`px-3 py-1 rounded-lg border-2 border-[#18181b] text-xs font-black uppercase transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#a3e635] text-[#18181b] shadow-[2px_2px_0px_#18181b]"
                      : "bg-zinc-300 text-zinc-700"
                  }`}
                >
                  {isActive ? "AKTIF" : "LIBUR"}
                </button>
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
                  {modalMode === "CREATE" ? "Simpan Dokter" : "Update Dokter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
