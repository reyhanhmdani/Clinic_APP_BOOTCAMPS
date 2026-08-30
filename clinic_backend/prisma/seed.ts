import { Gender, Role, VisitStatus, InvoiceStatus, PaymentMethod } from "@prisma/client";
import prisma from "../src/config/prisma.js";
import bcrypt from "bcryptjs";

// Helper waktu untuk membuat riwayat tanggal mundur
const getDaysAgo = (days: number, hour = 9, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const today = new Date();
const todayStr = today.toISOString().split("T")[0];

// --- 1. DATA USER CUSTOMER (15 Akun) & ADMIN (1 Akun) ---
const USERS_DATA = [
  { username: "budi", email: "budi@gmail.com", pass: "budi123", role: Role.CUSTOMER },
  { username: "siti", email: "siti@gmail.com", pass: "siti123", role: Role.CUSTOMER },
  { username: "ahmad", email: "ahmad@gmail.com", pass: "ahmad123", role: Role.CUSTOMER },
  { username: "marina", email: "marina@gmail.com", pass: "marina123", role: Role.CUSTOMER },
  { username: "eko", email: "eko@gmail.com", pass: "eko123", role: Role.CUSTOMER },
  { username: "dewi", email: "dewi@gmail.com", pass: "dewi123", role: Role.CUSTOMER },
  { username: "agus", email: "agus@gmail.com", pass: "agus123", role: Role.CUSTOMER },
  { username: "rian", email: "rian@gmail.com", pass: "rian123", role: Role.CUSTOMER },
  { username: "fajar", email: "fajar@gmail.com", pass: "fajar123", role: Role.CUSTOMER },
  { username: "gita", email: "gita@gmail.com", pass: "gita123", role: Role.CUSTOMER },
  { username: "hana", email: "hana@gmail.com", pass: "hana123", role: Role.CUSTOMER },
  { username: "indra", email: "indra@gmail.com", pass: "indra123", role: Role.CUSTOMER },
  { username: "jessica", email: "jessica@gmail.com", pass: "jessica123", role: Role.CUSTOMER },
  { username: "kevin", email: "kevin@gmail.com", pass: "kevin123", role: Role.CUSTOMER },
  { username: "laras", email: "laras@gmail.com", pass: "laras123", role: Role.CUSTOMER },
];

// --- 2. DATA PATIENTS (8 Online Linked + 5 Offline Loket) ---
const PATIENTS_DATA = [
  // --- SKENARIO 1: Pasien Online (Terhubung ke User 1 - 8) ---
  {
    id: "1",
    userEmail: "budi@gmail.com",
    nik: "3201011504950001",
    no_rm: "RM-2025-001",
    name: "Budi Santoso",
    gender: "Male",
    age: 28,
    phone: "0812-1111-2222",
    address: "Jl. Merdeka No. 123, Jakarta Selatan",
  },
  {
    id: "2",
    userEmail: "siti@gmail.com",
    nik: "3201014508980002",
    no_rm: "RM-2025-002",
    name: "Siti Aisyah",
    gender: "Female",
    age: 25,
    phone: "0813-2222-3333",
    address: "Jl. Mawar No. 45, Bandung",
  },
  {
    id: "3",
    userEmail: "ahmad@gmail.com",
    nik: "3201011201940003",
    no_rm: "RM-2025-004",
    name: "Ahmad Rizky",
    gender: "Male",
    age: 30,
    phone: "0815-4444-5555",
    address: "Jl. Pemuda No. 12, Surabaya",
  },
  {
    id: "4",
    userEmail: "marina@gmail.com",
    nik: "3201016010010004",
    no_rm: "RM-2025-005",
    name: "Marina Putri",
    gender: "Female",
    age: 22,
    phone: "0816-5555-6666",
    address: "Jl. Pandanaran No. 9, Semarang",
  },
  {
    id: "5",
    userEmail: "eko@gmail.com",
    nik: "3201012006820005",
    no_rm: "RM-2025-006",
    name: "Eko Prasetyo",
    gender: "Male",
    age: 42,
    phone: "0817-6666-7777",
    address: "Jl. Malioboro No. 50, Yogyakarta",
  },
  {
    id: "6",
    userEmail: "dewi@gmail.com",
    nik: "3201015509920006",
    no_rm: "RM-2025-007",
    name: "Dewi Lestari",
    gender: "Female",
    age: 31,
    phone: "0818-7777-8888",
    address: "Jl. Diponegoro No. 17, Malang",
  },
  {
    id: "7",
    userEmail: "agus@gmail.com",
    nik: "3201011803960007",
    no_rm: "RM-2025-008",
    name: "Agus Setiawan",
    gender: "Male",
    age: 29,
    phone: "0819-8888-9999",
    address: "Jl. Asia Afrika No. 34, Bandung",
  },
  {
    id: "8",
    userEmail: "rian@gmail.com",
    nik: "3201012211970008",
    no_rm: "RM-2025-009",
    name: "Rian Pratama",
    gender: "Male",
    age: 27,
    phone: "0812-3456-7890",
    address: "Jl. Gajah Mada No. 10, Jakarta Barat",
  },

  // --- SKENARIO 2: Pasien Offline Loket (userId: null, Belum Punya Akun) ---
  {
    id: "9",
    userEmail: null,
    nik: "3201012106610009",
    no_rm: "RM-2025-003",
    name: "Joko Widodo",
    gender: "Male",
    age: 35,
    phone: "0814-3333-4444",
    address: "Jl. Sudirman No. 88, Jakarta Pusat",
  },
  {
    id: "10",
    userEmail: null,
    nik: "3201011003780010",
    no_rm: "RM-2025-010",
    name: "Hendra Wijaya",
    gender: "Male",
    age: 46,
    phone: "0812-7777-1111",
    address: "Jl. Tebet Raya No. 14, Jakarta Selatan",
  },
  {
    id: "11",
    userEmail: null,
    nik: "3201015011850011",
    no_rm: "RM-2025-011",
    name: "Ratna Sari",
    gender: "Female",
    age: 39,
    phone: "0813-8888-2222",
    address: "Jl. Cikini Raya No. 25, Jakarta Pusat",
  },
  {
    id: "12",
    userEmail: null,
    nik: "3201011006800012",
    no_rm: "RM-2025-012",
    name: "Bambang Pamungkas",
    gender: "Male",
    age: 44,
    phone: "0815-9999-3333",
    address: "Jl. Fatmawati No. 80, Jakarta Selatan",
  },
  {
    id: "13",
    userEmail: null,
    nik: "3201012512750013",
    no_rm: "RM-2025-013",
    name: "Slamet Riyadi",
    gender: "Male",
    age: 49,
    phone: "0816-1111-4444",
    address: "Jl. Pajajaran No. 3, Bogor",
  },
];

// --- 3. DATA DOCTORS (8 Dokter) ---
const DOCTORS_DATA = [
  { id: "1", name: "Dr. Andri Wijaya", gender: Gender.MALE, spesialis: "Spesialis Penyakit Dalam", phone: "0811-0001-0001", fee: 150000, isActive: true },
  { id: "2", name: "Dr. Budi Santoso", gender: Gender.MALE, spesialis: "Dokter Umum", phone: "0811-0002-0002", fee: 50000, isActive: true },
  { id: "3", name: "Dr. Sarah Lestari", gender: Gender.FEMALE, spesialis: "Spesialis Gigi & Mulut", phone: "0811-0003-0003", fee: 100000, isActive: true },
  { id: "4", name: "Dr. Hendra Gunawan", gender: Gender.MALE, spesialis: "Spesialis Tulang & Orthopedi", phone: "0811-0004-0004", fee: 200000, isActive: true },
  { id: "5", name: "Dr. Maya Indah", gender: Gender.FEMALE, spesialis: "Spesialis Kulit & Kelamin", phone: "0811-0005-0005", fee: 120000, isActive: true },
  { id: "6", name: "Dr. Rizky Alamsyah", gender: Gender.MALE, spesialis: "Spesialis Anak", phone: "0811-0006-0006", fee: 130000, isActive: true },
  { id: "7", name: "Dr. Dewi Sartika", gender: Gender.FEMALE, spesialis: "Spesialis Mata", phone: "0811-0007-0007", fee: 110000, isActive: true },
  { id: "8", name: "Dr. Fulanah", gender: Gender.FEMALE, spesialis: "Dokter Umum", phone: "0811-0008-0008", fee: 50000, isActive: false },
];

// --- 4. DATA MEDICINES (10 Obat) ---
const MEDICINES_DATA = [
  { id: "1", name: "Paracetamol 500mg", price: 5000, stock: 100, unit: "Strip" },
  { id: "2", name: "Vitamin C 500mg", price: 3000, stock: 150, unit: "Strip" },
  { id: "3", name: "Amoxicillin 500mg (Antibiotik)", price: 8000, stock: 80, unit: "Strip" },
  { id: "4", name: "Antasida Doen (Obat Maag)", price: 4000, stock: 60, unit: "Strip" },
  { id: "5", name: "Ibuprofen 400mg (Anti Nyeri)", price: 6000, stock: 90, unit: "Strip" },
  { id: "6", name: "CTM 4mg (Obat Alergi)", price: 2500, stock: 120, unit: "Strip" },
  { id: "7", name: "OBH Sirup Batuk 100ml", price: 18000, stock: 45, unit: "Botol" },
  { id: "8", name: "Degirol Tablet Hisap Tenggorokan", price: 12000, stock: 70, unit: "Strip" },
  { id: "9", name: "Neurobion Forte (Vitamin Saraf)", price: 10000, stock: 85, unit: "Strip" },
  { id: "10", name: "Salep Acyclovir / Alergi Kulit 5g", price: 15000, stock: 35, unit: "Tube" },
];

// --- 5. VISITS DATA (17 Kunjungan Riwayat 7 Hari + 10 Kunjungan Hari Ini) ---
const VISITS_DATA = [
  // === H-6 (6 Hari Lalu): 2 Pasien Selesai ===
  {
    id: "VH6_1",
    patient_id: "1", // Budi
    doctor_id: "1",  // Dr. Andri
    queue_number: 1,
    status: "COMPLETED",
    visitDate: getDaysAgo(6, 8, 30),
    checkInTime: getDaysAgo(6, 8, 30),
  },
  {
    id: "VH6_2",
    patient_id: "2", // Siti
    doctor_id: "3",  // Dr. Sarah
    queue_number: 2,
    status: "COMPLETED",
    visitDate: getDaysAgo(6, 10, 0),
    checkInTime: getDaysAgo(6, 10, 0),
  },

  // === H-5 (5 Hari Lalu): 3 Pasien Selesai ===
  {
    id: "VH5_1",
    patient_id: "3", // Ahmad
    doctor_id: "6",  // Dr. Rizky
    queue_number: 1,
    status: "COMPLETED",
    visitDate: getDaysAgo(5, 9, 15),
    checkInTime: getDaysAgo(5, 9, 15),
  },
  {
    id: "VH5_2",
    patient_id: "4", // Marina
    doctor_id: "5",  // Dr. Maya
    queue_number: 2,
    status: "COMPLETED",
    visitDate: getDaysAgo(5, 11, 0),
    checkInTime: getDaysAgo(5, 11, 0),
  },
  {
    id: "VH5_3",
    patient_id: "9", // Joko (Offline)
    doctor_id: "4",  // Dr. Hendra
    queue_number: 3,
    status: "COMPLETED",
    visitDate: getDaysAgo(5, 14, 20),
    checkInTime: getDaysAgo(5, 14, 20),
  },

  // === H-4 (4 Hari Lalu): 2 Pasien Selesai ===
  {
    id: "VH4_1",
    patient_id: "5", // Eko
    doctor_id: "7",  // Dr. Dewi Sartika
    queue_number: 1,
    status: "COMPLETED",
    visitDate: getDaysAgo(4, 9, 30),
    checkInTime: getDaysAgo(4, 9, 30),
  },
  {
    id: "VH4_2",
    patient_id: "10", // Hendra (Offline)
    doctor_id: "1",   // Dr. Andri
    queue_number: 2,
    status: "COMPLETED",
    visitDate: getDaysAgo(4, 15, 0),
    checkInTime: getDaysAgo(4, 15, 0),
  },

  // === H-3 (3 Hari Lalu - LONJAKAN PEAK / RAMAI): 4 Pasien Selesai ===
  {
    id: "VH3_1",
    patient_id: "11", // Ratna (Offline)
    doctor_id: "4",   // Dr. Hendra
    queue_number: 1,
    status: "COMPLETED",
    visitDate: getDaysAgo(3, 8, 30),
    checkInTime: getDaysAgo(3, 8, 30),
  },
  {
    id: "VH3_2",
    patient_id: "6",  // Dewi Lestari
    doctor_id: "5",   // Dr. Maya
    queue_number: 2,
    status: "COMPLETED",
    visitDate: getDaysAgo(3, 10, 15),
    checkInTime: getDaysAgo(3, 10, 15),
  },
  {
    id: "VH3_3",
    patient_id: "12", // Bambang (Offline)
    doctor_id: "1",   // Dr. Andri
    queue_number: 3,
    status: "COMPLETED",
    visitDate: getDaysAgo(3, 13, 30),
    checkInTime: getDaysAgo(3, 13, 30),
  },
  {
    id: "VH3_4",
    patient_id: "13", // Slamet (Offline)
    doctor_id: "6",   // Dr. Rizky
    queue_number: 4,
    status: "COMPLETED",
    visitDate: getDaysAgo(3, 16, 0),
    checkInTime: getDaysAgo(3, 16, 0),
  },

  // === H-2 (2 Hari Lalu): 3 Pasien Selesai ===
  {
    id: "VH2_1",
    patient_id: "7", // Agus
    doctor_id: "2",  // Dr. Budi
    queue_number: 1,
    status: "COMPLETED",
    visitDate: getDaysAgo(2, 9, 0),
    checkInTime: getDaysAgo(2, 9, 0),
  },
  {
    id: "VH2_2",
    patient_id: "8", // Rian
    doctor_id: "4",  // Dr. Hendra
    queue_number: 2,
    status: "COMPLETED",
    visitDate: getDaysAgo(2, 11, 30),
    checkInTime: getDaysAgo(2, 11, 30),
  },
  {
    id: "VH2_3",
    patient_id: "2", // Siti
    doctor_id: "5",  // Dr. Maya
    queue_number: 3,
    status: "COMPLETED",
    visitDate: getDaysAgo(2, 14, 0),
    checkInTime: getDaysAgo(2, 14, 0),
  },

  // === H-1 (Kemarin): 3 Pasien Selesai ===
  {
    id: "VH1_1",
    patient_id: "1", // Budi
    doctor_id: "2",  // Dr. Budi
    queue_number: 1,
    status: "COMPLETED",
    visitDate: getDaysAgo(1, 8, 45),
    checkInTime: getDaysAgo(1, 8, 45),
  },
  {
    id: "VH1_2",
    patient_id: "9", // Joko (Offline)
    doctor_id: "1",  // Dr. Andri
    queue_number: 2,
    status: "COMPLETED",
    visitDate: getDaysAgo(1, 10, 30),
    checkInTime: getDaysAgo(1, 10, 30),
  },
  {
    id: "VH1_3",
    patient_id: "4", // Marina
    doctor_id: "3",  // Dr. Sarah
    queue_number: 3,
    status: "COMPLETED",
    visitDate: getDaysAgo(1, 15, 0),
    checkInTime: getDaysAgo(1, 15, 0),
  },

  // === H-0 (HARI INI - 10 Kunjungan Live) ===
  // 6x COMPLETED (4 Lunas, 2 Belum Lunas) - Datang Pagi Terlebih Dahulu
  {
    id: "V1",
    patient_id: "3", // Ahmad Rizky (Online)
    doctor_id: "4",  // Dr. Hendra
    queue_number: 1,
    status: "COMPLETED",
    visitDate: new Date(`${todayStr}T07:30:00`),
    checkInTime: new Date(`${todayStr}T07:30:00`),
  },
  {
    id: "V2",
    patient_id: "4", // Marina Putri (Online)
    doctor_id: "5",  // Dr. Maya
    queue_number: 2,
    status: "COMPLETED",
    visitDate: new Date(`${todayStr}T07:45:00`),
    checkInTime: new Date(`${todayStr}T07:45:00`),
  },
  {
    id: "V3",
    patient_id: "5", // Eko Prasetyo (Online)
    doctor_id: "6",  // Dr. Rizky
    queue_number: 3,
    status: "COMPLETED",
    visitDate: new Date(`${todayStr}T08:00:00`),
    checkInTime: new Date(`${todayStr}T08:00:00`),
  },
  {
    id: "V4",
    patient_id: "1", // Budi Santoso (Online)
    doctor_id: "5",  // Dr. Maya
    queue_number: 4,
    status: "COMPLETED",
    visitDate: new Date(`${todayStr}T08:15:00`),
    checkInTime: new Date(`${todayStr}T08:15:00`),
  },
  {
    id: "V5",
    patient_id: "9", // Joko Widodo (Offline loket)
    doctor_id: "1",  // Dr. Andri
    queue_number: 5,
    status: "COMPLETED",
    visitDate: new Date(`${todayStr}T08:30:00`),
    checkInTime: new Date(`${todayStr}T08:30:00`),
  },
  {
    id: "V6",
    patient_id: "6", // Dewi Lestari (Online)
    doctor_id: "7",  // Dr. Dewi Sartika
    queue_number: 6,
    status: "COMPLETED",
    visitDate: new Date(`${todayStr}T08:45:00`),
    checkInTime: new Date(`${todayStr}T08:45:00`),
  },

  // 2x IN_KONSULTASI - Sedang Diperiksa di Poli
  {
    id: "V7",
    patient_id: "10", // Hendra (Offline loket)
    doctor_id: "2",   // Dr. Budi
    queue_number: 7,
    status: "IN_KONSULTASI",
    visitDate: new Date(`${todayStr}T09:15:00`),
    checkInTime: new Date(`${todayStr}T09:15:00`),
  },
  {
    id: "V8",
    patient_id: "2", // Siti Aisyah (Online)
    doctor_id: "3",  // Dr. Sarah
    queue_number: 8,
    status: "IN_KONSULTASI",
    visitDate: new Date(`${todayStr}T09:30:00`),
    checkInTime: new Date(`${todayStr}T09:30:00`),
  },

  // 2x WAITING - Pasien Baru Mendaftar di Antrean
  {
    id: "V9",
    patient_id: "7", // Agus (Online)
    doctor_id: "1",  // Dr. Andri
    queue_number: 9,
    status: "WAITING",
    visitDate: new Date(`${todayStr}T10:00:00`),
    checkInTime: null,
  },
  {
    id: "V10",
    patient_id: "8", // Rian (Online)
    doctor_id: "4",  // Dr. Hendra
    queue_number: 10,
    status: "WAITING",
    visitDate: new Date(`${todayStr}T10:15:00`),
    checkInTime: null,
  },
];

// --- 6. CONSULTATIONS & MEDICINES ---
const CONSULTATIONS_DATA = [
  // --- H-6 ---
  {
    visit_id: "VH6_1",
    complaint: "Nyeri lambung dan perut kembung setelah makan pedas.",
    diagnosis: "Dispepsia Fungsional (K30)",
    notes: "Hindari makanan pedas dan asam selama 1 minggu.",
    consultation_fee: 150000,
    prescribed_medicines: [{ medicine_id: "4", qty: 2, price: 4000 }], // Antasida x2
  },
  {
    visit_id: "VH6_2",
    complaint: "Gusi berdarah saat menyikat gigi.",
    diagnosis: "Gingivitis Kronis (K05.1)",
    notes: "Pembersihan karang gigi selesai. Gunakan sikat gigi berbulu halus.",
    consultation_fee: 100000,
    prescribed_medicines: [{ medicine_id: "8", qty: 1, price: 12000 }], // Degirol x1
  },

  // --- H-5 ---
  {
    visit_id: "VH5_1",
    complaint: "Anak batuk berdahak dan hidung tersumbat 3 hari.",
    diagnosis: "ISPA Ringan (J06.9)",
    notes: "Banyak minum air hangat dan istirahat.",
    consultation_fee: 130000,
    prescribed_medicines: [
      { medicine_id: "1", qty: 1, price: 5000 },
      { medicine_id: "7", qty: 1, price: 18000 },
    ],
  },
  {
    visit_id: "VH5_2",
    complaint: "Muncul bruntusan kemerahan di area pipi.",
    diagnosis: "Acne Vulgaris Papular (L70.0)",
    notes: "Gunakan salep tipis-tipis di malam hari.",
    consultation_fee: 120000,
    prescribed_medicines: [{ medicine_id: "10", qty: 1, price: 15000 }],
  },
  {
    visit_id: "VH5_3",
    complaint: "Nyeri sendi lutut kanan saat berjalan jauh.",
    diagnosis: "Osteoarthritis Genu (M17.9)",
    notes: "Hindari mengangkat beban berat.",
    consultation_fee: 200000,
    prescribed_medicines: [
      { medicine_id: "5", qty: 2, price: 6000 },
      { medicine_id: "9", qty: 1, price: 10000 },
    ],
  },

  // --- H-4 ---
  {
    visit_id: "VH4_1",
    complaint: "Mata merah, perih, dan berair sejak kemarin.",
    diagnosis: "Konjungtivitis Bakterial (H10.9)",
    notes: "Jaga kebersihan tangan, jangan kucek mata.",
    consultation_fee: 110000,
    prescribed_medicines: [{ medicine_id: "2", qty: 2, price: 3000 }],
  },
  {
    visit_id: "VH4_2",
    complaint: "Badan lemas, meriang, dan sakit tenggorokan.",
    diagnosis: "Faringitis Akut (J02.9)",
    notes: "Habiskan antibiotik sesuai aturan pakai.",
    consultation_fee: 150000,
    prescribed_medicines: [
      { medicine_id: "3", qty: 2, price: 8000 },
      { medicine_id: "9", qty: 1, price: 10000 },
    ],
  },

  // --- H-3 (LONJAKAN PEAK) ---
  {
    visit_id: "VH3_1",
    complaint: "Nyeri punggung bawah setelah mengangkat barang.",
    diagnosis: "Low Back Pain Akut (M54.5)",
    notes: "Kompres hangat dan fisioterapi bertahap.",
    consultation_fee: 200000,
    prescribed_medicines: [
      { medicine_id: "5", qty: 1, price: 6000 },
      { medicine_id: "9", qty: 2, price: 10000 },
    ],
  },
  {
    visit_id: "VH3_2",
    complaint: "Alergi debu dan gatal seluruh badan.",
    diagnosis: "Urtikaria Akut (L50.0)",
    notes: "Hindari kontak debu.",
    consultation_fee: 120000,
    prescribed_medicines: [
      { medicine_id: "6", qty: 3, price: 2500 },
      { medicine_id: "2", qty: 2, price: 3000 },
    ],
  },
  {
    visit_id: "VH3_3",
    complaint: "Tekanan darah tinggi dan pusing berputar.",
    diagnosis: "Hipertensi Grade 1 (I10)",
    notes: "Kurangi konsumsi garam dan pantau tensi rutin.",
    consultation_fee: 150000,
    prescribed_medicines: [
      { medicine_id: "1", qty: 2, price: 5000 },
      { medicine_id: "9", qty: 1, price: 10000 },
    ],
  },
  {
    visit_id: "VH3_4",
    complaint: "Demam naik turun hari ke-2 pada balita.",
    diagnosis: "Observasi Febris e.c Viral (R50.9)",
    notes: "Kompres air hangat dan berikan cairan cukup.",
    consultation_fee: 130000,
    prescribed_medicines: [
      { medicine_id: "1", qty: 2, price: 5000 },
      { medicine_id: "2", qty: 1, price: 3000 },
    ],
  },

  // --- H-2 ---
  {
    visit_id: "VH2_1",
    complaint: "Pusing kepala ringan dan flu.",
    diagnosis: "Common Cold (J00)",
    notes: "Istirahat cukup.",
    consultation_fee: 50000,
    prescribed_medicines: [
      { medicine_id: "1", qty: 2, price: 5000 },
      { medicine_id: "2", qty: 1, price: 3000 },
    ],
  },
  {
    visit_id: "VH2_2",
    complaint: "Cidera otot bahu setelah olahraga berat.",
    diagnosis: "Muscle Strain Deltoid (M62.6)",
    notes: "Oleskan gel pereda nyeri.",
    consultation_fee: 200000,
    prescribed_medicines: [{ medicine_id: "5", qty: 1, price: 6000 }],
  },
  {
    visit_id: "VH2_3",
    complaint: "Kulit tangan bersisik dan mengelupas.",
    diagnosis: "Dermatitis Kontak Alergi (L23.9)",
    notes: "Gunakan sabun lembut.",
    consultation_fee: 120000,
    prescribed_medicines: [{ medicine_id: "10", qty: 1, price: 15000 }],
  },

  // --- H-1 ---
  {
    visit_id: "VH1_1",
    complaint: "Badan pegal linu dan sakit kepala.",
    diagnosis: "Myalgia e.c Kelelahan (M79.1)",
    notes: "Istirahat cukup 8 jam.",
    consultation_fee: 50000,
    prescribed_medicines: [
      { medicine_id: "1", qty: 2, price: 5000 },
      { medicine_id: "9", qty: 1, price: 10000 },
    ],
  },
  {
    visit_id: "VH1_2",
    complaint: "Lambung terasa panas dan mual.",
    diagnosis: "GERD (K21.9)",
    notes: "Jangan langsung berbaring setelah makan.",
    consultation_fee: 150000,
    prescribed_medicines: [
      { medicine_id: "4", qty: 2, price: 4000 },
      { medicine_id: "2", qty: 1, price: 3000 },
    ],
  },
  {
    visit_id: "VH1_3",
    complaint: "Gigi ngilu saat minum air dingin.",
    diagnosis: "Hipersensitivitas Dentin (K03.8)",
    notes: "Gunakan pasta gigi khusus gigi sensitif.",
    consultation_fee: 100000,
    prescribed_medicines: [{ medicine_id: "8", qty: 2, price: 12000 }],
  },

  // --- H-0 (Hari Ini): 6 Pasien Selesai Konsultasi ---
  {
    visit_id: "V1",
    complaint: "Nyeri pada pergelangan kaki setelah terkilir saat bermain futsal.",
    diagnosis: "Sprain Ankle Grade 1 (S93.4)",
    notes: "Istirahat total 3 hari, kompres es 15 menit tiap 4 jam. Kontrol minggu depan.",
    consultation_fee: 200000,
    prescribed_medicines: [
      { medicine_id: "5", qty: 2, price: 6000 },
      { medicine_id: "9", qty: 1, price: 10000 },
    ],
  },
  {
    visit_id: "V2",
    complaint: "Alergi gatal kemerahan pada kulit tangan dan leher sejak 2 hari lalu.",
    diagnosis: "Dermatitis Alergika (L23.9)",
    notes: "Hindari pemicu alergi (seafood, debu). Oleskan salep 2x sehari pagi & malam.",
    consultation_fee: 120000,
    prescribed_medicines: [
      { medicine_id: "6", qty: 2, price: 2500 },
      { medicine_id: "10", qty: 1, price: 15000 },
    ],
  },
  {
    visit_id: "V3",
    complaint: "Demam tinggi sudah 3 hari disertai mual dan badan lemas.",
    diagnosis: "Demam Dengue / Viral Infection (A90)",
    notes: "Minum banyak cairan (air putih, jus), cek lab darah lengkap besok pagi.",
    consultation_fee: 130000,
    prescribed_medicines: [
      { medicine_id: "1", qty: 3, price: 5000 },
      { medicine_id: "2", qty: 2, price: 3000 },
    ],
  },
  {
    visit_id: "V4",
    complaint: "Gatal-gatal di area punggung dan perut sejak seminggu terakhir.",
    diagnosis: "Urticaria / Biduran (L50.9)",
    notes: "Mandi air hangat, hindari garuk. Kontrol jika tidak membaik dalam 5 hari.",
    consultation_fee: 120000,
    prescribed_medicines: [
      { medicine_id: "6", qty: 3, price: 2500 },
      { medicine_id: "10", qty: 1, price: 15000 },
    ],
  },
  {
    visit_id: "V5",
    complaint: "Batuk berdahak dan dada sesak di malam hari.",
    diagnosis: "Bronkitis Akut (J20.9)",
    notes: "Hindari udara dingin dan asap rokok. Habiskan obat sesuai anjuran.",
    consultation_fee: 150000,
    prescribed_medicines: [
      { medicine_id: "3", qty: 2, price: 8000 },
      { medicine_id: "7", qty: 1, price: 18000 },
    ],
  },
  {
    visit_id: "V6",
    complaint: "Mata merah, berair, dan terasa perih silau.",
    diagnosis: "Konjungtivitis Akut (H10.9)",
    notes: "Gunakan tetes mata teratur. Jangan menggosok mata dengan tangan kotor.",
    consultation_fee: 110000,
    prescribed_medicines: [
      { medicine_id: "6", qty: 2, price: 2500 },
      { medicine_id: "2", qty: 1, price: 3000 },
    ],
  },
];

// --- 7. INVOICES DATA (Distribusi Riwayat Pembayaran Nyata & Dinamis) ---
const INVOICES_DATA = [
  // --- H-6: Rp 270.000 ---
  {
    visit_id: "VH6_1",
    invoice_no: "INV-2025-0001",
    status: "PAID",
    consultation_fee: 150000,
    medicine_fee: 8000,
    total: 158000,
    payment_method: "CASH",
    paidAt: getDaysAgo(6, 9, 15),
  },
  {
    visit_id: "VH6_2",
    invoice_no: "INV-2025-0002",
    status: "PAID",
    consultation_fee: 100000,
    medicine_fee: 12000,
    total: 112000,
    payment_method: "QRIS",
    paidAt: getDaysAgo(6, 10, 45),
  },

  // --- H-5: Rp 510.000 ---
  {
    visit_id: "VH5_1",
    invoice_no: "INV-2025-0003",
    status: "PAID",
    consultation_fee: 130000,
    medicine_fee: 23000,
    total: 153000,
    payment_method: "QRIS",
    paidAt: getDaysAgo(5, 10, 0),
  },
  {
    visit_id: "VH5_2",
    invoice_no: "INV-2025-0004",
    status: "PAID",
    consultation_fee: 120000,
    medicine_fee: 15000,
    total: 135000,
    payment_method: "CASH",
    paidAt: getDaysAgo(5, 11, 45),
  },
  {
    visit_id: "VH5_3",
    invoice_no: "INV-2025-0005",
    status: "PAID",
    consultation_fee: 200000,
    medicine_fee: 22000,
    total: 222000,
    payment_method: "TRANSFER",
    paidAt: getDaysAgo(5, 15, 0),
  },

  // --- H-4: Rp 292.000 ---
  {
    visit_id: "VH4_1",
    invoice_no: "INV-2025-0006",
    status: "PAID",
    consultation_fee: 110000,
    medicine_fee: 6000,
    total: 116000,
    payment_method: "CASH",
    paidAt: getDaysAgo(4, 10, 15),
  },
  {
    visit_id: "VH4_2",
    invoice_no: "INV-2025-0007",
    status: "PAID",
    consultation_fee: 150000,
    medicine_fee: 26000,
    total: 176000,
    payment_method: "QRIS",
    paidAt: getDaysAgo(4, 15, 45),
  },

  // --- H-3 (LONJAKAN PEAK): Rp 705.500 ---
  {
    visit_id: "VH3_1",
    invoice_no: "INV-2025-0008",
    status: "PAID",
    consultation_fee: 200000,
    medicine_fee: 26000,
    total: 226000,
    payment_method: "QRIS",
    paidAt: getDaysAgo(3, 9, 15),
  },
  {
    visit_id: "VH3_2",
    invoice_no: "INV-2025-0009",
    status: "PAID",
    consultation_fee: 120000,
    medicine_fee: 13500,
    total: 133500,
    payment_method: "CARD",
    paidAt: getDaysAgo(3, 11, 0),
  },
  {
    visit_id: "VH3_3",
    invoice_no: "INV-2025-0010",
    status: "PAID",
    consultation_fee: 150000,
    medicine_fee: 20000,
    total: 170000,
    payment_method: "CASH",
    paidAt: getDaysAgo(3, 14, 20),
  },
  {
    visit_id: "VH3_4",
    invoice_no: "INV-2025-0011",
    status: "PAID",
    consultation_fee: 130000,
    medicine_fee: 13000,
    total: 143000,
    payment_method: "QRIS",
    paidAt: getDaysAgo(3, 16, 45),
  },

  // --- H-2: Rp 433.500 ---
  {
    visit_id: "VH2_1",
    invoice_no: "INV-2025-0012",
    status: "PAID",
    consultation_fee: 50000,
    medicine_fee: 13000,
    total: 63000,
    payment_method: "CASH",
    paidAt: getDaysAgo(2, 9, 45),
  },
  {
    visit_id: "VH2_2",
    invoice_no: "INV-2025-0013",
    status: "PAID",
    consultation_fee: 200000,
    medicine_fee: 6000,
    total: 206000,
    payment_method: "QRIS",
    paidAt: getDaysAgo(2, 12, 15),
  },
  {
    visit_id: "VH2_3",
    invoice_no: "INV-2025-0014",
    status: "PAID",
    consultation_fee: 120000,
    medicine_fee: 15000,
    total: 135000,
    payment_method: "QRIS",
    paidAt: getDaysAgo(2, 14, 45),
  },

  // --- H-1: Rp 378.000 ---
  {
    visit_id: "VH1_1",
    invoice_no: "INV-2025-0015",
    status: "PAID",
    consultation_fee: 50000,
    medicine_fee: 20000,
    total: 70000,
    payment_method: "CASH",
    paidAt: getDaysAgo(1, 9, 30),
  },
  {
    visit_id: "VH1_2",
    invoice_no: "INV-2025-0016",
    status: "PAID",
    consultation_fee: 150000,
    medicine_fee: 11000,
    total: 161000,
    payment_method: "TRANSFER",
    paidAt: getDaysAgo(1, 11, 15),
  },
  {
    visit_id: "VH1_3",
    invoice_no: "INV-2025-0017",
    status: "PAID",
    consultation_fee: 100000,
    medicine_fee: 24000,
    total: 124000,
    payment_method: "QRIS",
    paidAt: getDaysAgo(1, 15, 45),
  },

  // --- H-0 (HARI INI): 4 Lunas, 2 Unpaid ---
  {
    visit_id: "V1",
    invoice_no: "INV-2025-0018",
    status: "PAID",
    consultation_fee: 200000,
    medicine_fee: 22000,
    total: 222000,
    payment_method: "QRIS",
    paidAt: new Date(`${todayStr}T08:00:00`),
  },
  {
    visit_id: "V2",
    invoice_no: "INV-2025-0019",
    status: "PAID",
    consultation_fee: 120000,
    medicine_fee: 20000,
    total: 140000,
    payment_method: "QRIS",
    paidAt: new Date(`${todayStr}T08:15:00`),
  },
  {
    visit_id: "V3",
    invoice_no: "INV-2025-0020",
    status: "PAID",
    consultation_fee: 130000,
    medicine_fee: 21000,
    total: 151000,
    payment_method: "CASH",
    paidAt: new Date(`${todayStr}T08:30:00`),
  },
  {
    visit_id: "V4",
    invoice_no: "INV-2025-0021",
    status: "UNPAID",
    consultation_fee: 120000,
    medicine_fee: 22500,
    total: 142500,
    payment_method: "CASH",
    paidAt: null,
  },
  {
    visit_id: "V5",
    invoice_no: "INV-2025-0022",
    status: "UNPAID",
    consultation_fee: 150000,
    medicine_fee: 34000,
    total: 184000,
    payment_method: "CASH",
    paidAt: null,
  },
  {
    visit_id: "V6",
    invoice_no: "INV-2025-0023",
    status: "PAID",
    consultation_fee: 110000,
    medicine_fee: 8000,
    total: 118000,
    payment_method: "QRIS",
    paidAt: new Date(`${todayStr}T09:15:00`),
  },
];

async function main() {
  console.log("🌱 Start seeding database with dynamic revenue & visit history...");

  // 1. Bersihkan database lama secara berurutan
  await prisma.invoice.deleteMany();
  await prisma.consultationMedicine.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing database records.");

  // 2. Seed User Admin (1 Akun)
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "admin@gmail.com",
      username: "admin",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log("✅ Admin User seeded (admin@gmail.com / admin123).");

  // 3. Seed Users Customer (15 Akun)
  const userMap = new Map<string, number>();
  for (const u of USERS_DATA) {
    const hashedPassword = await bcrypt.hash(u.pass, 10);
    const createdUser = await prisma.user.create({
      data: {
        email: u.email,
        username: u.username,
        password: hashedPassword,
        role: u.role,
      },
    });
    userMap.set(u.email, createdUser.id);
  }
  console.log("✅ 15 Customer Users seeded (email: [nama]@gmail.com, pass: [nama]123).");

  // 4. Seed Patients (8 Online Linked + 5 Offline Loket)
  const patientIdMap = new Map<string, number>();
  for (const p of PATIENTS_DATA) {
    const linkedUserId = p.userEmail ? userMap.get(p.userEmail) : null;

    const createdPatient = await prisma.patient.create({
      data: {
        userId: linkedUserId,
        nik: p.nik,
        noRm: p.no_rm,
        name: p.name,
        gender: p.gender.toUpperCase() as Gender,
        age: p.age,
        phone: p.phone,
        address: p.address,
      },
    });
    patientIdMap.set(p.id, createdPatient.id);
  }
  console.log("✅ Patients seeded (13 pasien: 8 linked akun, 5 offline loket dengan NIK).");

  // 5. Seed Doctors (8 Dokter)
  const doctorIdMap = new Map<string, number>();
  for (const d of DOCTORS_DATA) {
    const createdDoctor = await prisma.doctor.create({
      data: {
        name: d.name,
        gender: d.gender,
        spesialis: d.spesialis,
        phone: d.phone,
        fee: d.fee,
        isActive: d.isActive,
      },
    });
    doctorIdMap.set(d.id, createdDoctor.id);
  }
  console.log("✅ Doctors seeded (7 aktif + 1 non-aktif).");

  // 6. Seed Medicines (10 Obat)
  const medicineIdMap = new Map<string, number>();
  let medIdx = 0;
  for (const m of MEDICINES_DATA) {
    medIdx++;
    const createdMedicine = await prisma.medicine.create({
      data: {
        code: `MED-${String(medIdx).padStart(3, "0")}`,
        name: m.name,
        price: m.price,
        stock: m.stock,
        unit: m.unit,
      },
    });
    medicineIdMap.set(m.id, createdMedicine.id);
  }
  console.log("✅ Medicines seeded (10 katalog obat).");

  // 7. Seed Visits (27 Total: 17 Riwayat 7 Hari + 10 Hari Ini)
  const visitIdMap = new Map<string, number>();

  for (const v of VISITS_DATA) {
    const statusEnum = VisitStatus[v.status as keyof typeof VisitStatus];

    const realPatientId = patientIdMap.get(v.patient_id);
    const realDoctorId = doctorIdMap.get(v.doctor_id);

    if (!realPatientId || !realDoctorId) continue;

    const createdVisit = await prisma.visit.create({
      data: {
        patientId: realPatientId,
        doctorId: realDoctorId,
        queueNumber: v.queue_number,
        visitDate: v.visitDate,
        status: statusEnum,
        checkInTime: v.checkInTime,
        createdAt: v.visitDate,
        updatedAt: v.visitDate,
      },
    });

    visitIdMap.set(v.id, createdVisit.id);
  }
  console.log("✅ Visits seeded (27 kunjungan: distribusi dinamis 7 hari terakhir + live hari ini).");

  // 8. Seed Consultations & ConsultationMedicines
  for (const c of CONSULTATIONS_DATA) {
    const realVisitId = visitIdMap.get(c.visit_id);
    if (!realVisitId) continue;

    const createdConsultation = await prisma.consultation.create({
      data: {
        visitId: realVisitId,
        complaint: c.complaint,
        diagnosis: c.diagnosis,
        notes: c.notes,
        consultationFee: c.consultation_fee,
      },
    });

    if (c.prescribed_medicines) {
      for (const item of c.prescribed_medicines) {
        const realMedicineId = medicineIdMap.get(item.medicine_id);
        if (!realMedicineId) continue;

        await prisma.consultationMedicine.create({
          data: {
            consultationId: createdConsultation.id,
            medicineId: realMedicineId,
            qty: item.qty,
            price: item.price,
            subTotal: item.qty * item.price,
          },
        });
      }
    }
  }
  console.log("✅ Consultations seeded (21 konsultasi + resep obat historis).");

  // 9. Seed Invoices (19 PAID dengan tanggal bayar bertahap + 2 UNPAID)
  for (const inv of INVOICES_DATA) {
    const realVisitId = visitIdMap.get(inv.visit_id);
    if (!realVisitId) continue;

    await prisma.invoice.create({
      data: {
        visitId: realVisitId,
        invoiceNo: inv.invoice_no,
        totalConsultationFee: inv.consultation_fee,
        totalMedicineFee: inv.medicine_fee,
        totalAmount: inv.total,
        status: inv.status as InvoiceStatus,
        paymentMethod: inv.payment_method as PaymentMethod,
        paidAt: inv.paidAt,
        createdAt: inv.paidAt || today,
        updatedAt: inv.paidAt || today,
      },
    });
  }
  console.log("✅ Invoices seeded (19 invoice lunas bertahap H-6 s/d H-0 + 2 invoice unpaid).");

  console.log("🎉 Seeding with dynamic timeline data completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error Seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
