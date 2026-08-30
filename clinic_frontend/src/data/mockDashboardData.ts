import type { DashboardStats, Doctor, QueueItemDTO } from '../types/clinic';

// 1. Data Ringkasan Operasional Hari Ini (Stats Grid)
export const MOCK_STATS: DashboardStats = {
  totalCheckedIn: 32,
  currentlyWaiting: 8,
  awaitingPayment: 5,
  completedVisits: 15,
  todayEstimatedRevenue: 4250000,
};

// 2. Data Dokter Jaga Hari Ini (Doctor Availability)
export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Andri',
    gender: 'MALE',
    spesialis: 'Dokter Umum',
    fee: 50000,
    isActive: true,
    room: 'Room 1',
    currentVisitStatus: 'IN_KONSULTASI',
  },
  {
    id: 2,
    name: 'Dr. Budi',
    gender: 'MALE',
    spesialis: 'Spesialis Anak',
    fee: 75000,
    isActive: true,
    room: 'Room 2',
    currentVisitStatus: 'WAITING',
  },
  {
    id: 3,
    name: 'Dr. Sarah',
    gender: 'FEMALE',
    spesialis: 'Spesialis Gigi',
    fee: 100000,
    isActive: true,
    room: 'Room 3',
    currentVisitStatus: 'WAITING',
  },
];

// 3. Data Tabel Antrean Front Desk (Queue Items)
export const MOCK_QUEUE_ITEMS: QueueItemDTO[] = [
  {
    visitId: 101,
    queueToken: 'A-12',
    noRm: 'RM-001',
    patientName: 'Budi Santoso',
    arrivalTime: '08:30 AM',
    visitStatus: 'WAITING',
    doctorName: 'Dr. Andri',
    doctorInitials: 'DA',
    actionType: 'CALL_PATIENT',
  },
  {
    visitId: 102,
    queueToken: 'B-05',
    noRm: 'RM-002',
    patientName: 'Siti Aisyah',
    arrivalTime: '08:45 AM',
    visitStatus: 'WAITING',
    doctorName: 'Dr. Andri',
    doctorInitials: 'DA',
    actionType: 'CALL_PATIENT',
  },
  {
    visitId: 103,
    queueToken: 'C-08',
    noRm: 'RM-003',
    patientName: 'John Doe',
    arrivalTime: '09:00 AM',
    visitStatus: 'COMPLETED',
    invoiceStatus: 'UNPAID',
    doctorName: 'Dr. Budi',
    doctorInitials: 'DB',
    actionType: 'PROCESS_PAYMENT',
  },
  {
    visitId: 104,
    queueToken: 'D-15',
    noRm: 'RM-004',
    patientName: 'Ahmad Rizky',
    arrivalTime: '09:15 AM',
    visitStatus: 'WAITING',
    doctorName: 'Dr. Sarah',
    doctorInitials: 'DS',
    actionType: 'CALL_PATIENT',
  },
  {
    visitId: 105,
    queueToken: 'E-02',
    noRm: 'RM-005',
    patientName: 'Marina Putri',
    arrivalTime: '09:30 AM',
    visitStatus: 'CANCELLED',
    doctorName: 'Dr. Sarah',
    doctorInitials: 'DS',
    actionType: 'CHECK_IN',
  },
];
