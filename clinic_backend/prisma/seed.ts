import { Gender, VisitStatus, InvoiceStatus, PaymentMethod } from '@prisma/client';
import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

// --- DATA SEED INLINE ---
const PATIENTS_DATA = [
  {
    id: '1',
    no_rm: 'RM-2025-001',
    name: 'Budi Santoso',
    gender: 'Male',
    age: 28,
    phone: '0812-1111-2222',
    address: 'Jl. Merdeka No. 123, Jakarta Selatan',
  },
  {
    id: '2',
    no_rm: 'RM-2025-002',
    name: 'Siti Aisyah',
    gender: 'Female',
    age: 25,
    phone: '0813-2222-3333',
    address: 'Jl. Mawar No. 45, Bandung',
  },
  {
    id: '3',
    no_rm: 'RM-2025-003',
    name: 'Joko Widodo',
    gender: 'Male',
    age: 35,
    phone: '0814-3333-4444',
    address: 'Jl. Sudirman No. 88, Jakarta Pusat',
  },
  {
    id: '4',
    no_rm: 'RM-2025-004',
    name: 'Ahmad Rizky',
    gender: 'Male',
    age: 30,
    phone: '0815-4444-5555',
    address: 'Jl. Pemuda No. 12, Surabaya',
  },
  {
    id: '5',
    no_rm: 'RM-2025-005',
    name: 'Marina Putri',
    gender: 'Female',
    age: 22,
    phone: '0816-5555-6666',
    address: 'Jl. Pandanaran No. 9, Semarang',
  },
  {
    id: '6',
    no_rm: 'RM-2025-006',
    name: 'Eko Prasetyo',
    gender: 'Male',
    age: 42,
    phone: '0817-6666-7777',
    address: 'Jl. Malioboro No. 50, Yogyakarta',
  },
  {
    id: '7',
    no_rm: 'RM-2025-007',
    name: 'Dewi Lestari',
    gender: 'Female',
    age: 31,
    phone: '0818-7777-8888',
    address: 'Jl. Diponegoro No. 17, Malang',
  },
  {
    id: '8',
    no_rm: 'RM-2025-008',
    name: 'Agus Setiawan',
    gender: 'Male',
    age: 29,
    phone: '0819-8888-9999',
    address: 'Jl. Asia Afrika No. 34, Bandung',
  },
];

const DOCTORS_DATA = [
  { id: '1', name: 'Dr. Andri Wijaya', spesialis: 'Spesialis Penyakit Dalam', phone: '0811-0001-0001' },
  { id: '2', name: 'Dr. Budi Santoso', spesialis: 'Dokter Umum', phone: '0811-0002-0002' },
  { id: '3', name: 'Dr. Sarah Lestari', spesialis: 'Spesialis Gigi & Mulut', phone: '0811-0003-0003' },
  { id: '4', name: 'Dr. Hendra Gunawan', spesialis: 'Spesialis Tulang & Orthopedi', phone: '0811-0004-0004' },
  { id: '5', name: 'Dr. Maya Indah', spesialis: 'Spesialis Kulit & Kelamin', phone: '0811-0005-0005' },
  { id: '6', name: 'Dr. Rizky Alamsyah', spesialis: 'Spesialis Anak', phone: '0811-0006-0006' },
  { id: '7', name: 'Dr. Dewi Sartika', spesialis: 'Spesialis Mata', phone: '0811-0007-0007' },
];

const MEDICINES_DATA = [
  { id: '1', name: 'Paracetamol 500mg', price: 5000, stock: 100, unit: 'Strip' },
  { id: '2', name: 'Vitamin C 500mg', price: 3000, stock: 150, unit: 'Strip' },
  { id: '3', name: 'Amoxicillin 500mg (Antibiotik)', price: 8000, stock: 80, unit: 'Strip' },
  { id: '4', name: 'Antasida Doen (Obat Maag)', price: 4000, stock: 60, unit: 'Strip' },
  { id: '5', name: 'Ibuprofen 400mg (Anti Nyeri)', price: 6000, stock: 90, unit: 'Strip' },
  { id: '6', name: 'CTM 4mg (Obat Alergi)', price: 2500, stock: 120, unit: 'Strip' },
  { id: '7', name: 'OBH Sirup Batuk 100ml', price: 18000, stock: 45, unit: 'Botol' },
  { id: '8', name: 'Degirol Tablet Hisap Tenggorokan', price: 12000, stock: 70, unit: 'Strip' },
  { id: '9', name: 'Neurobion Forte (Vitamin Saraf)', price: 10000, stock: 85, unit: 'Strip' },
  { id: '10', name: 'Salep Acyclovir / Alergi Kulit 5g', price: 15000, stock: 35, unit: 'Tube' },
];

const VISITS_DATA = [
  {
    id: 'VIS-2025-000123',
    patient_id: '1',
    doctor_id: '1',
    queue_number: 1,
    visit_date: '2025-05-21',
    status: 'waiting',
  },
  {
    id: 'VIS-2025-000124',
    patient_id: '2',
    doctor_id: '3',
    queue_number: 2,
    visit_date: '2025-05-21',
    status: 'waiting',
  },
  {
    id: 'VIS-2025-000125',
    patient_id: '3',
    doctor_id: '2',
    queue_number: 3,
    visit_date: '2025-05-21',
    status: 'in_consultation',
  },
  {
    id: 'VIS-2025-000126',
    patient_id: '4',
    doctor_id: '4',
    queue_number: 4,
    visit_date: '2025-05-21',
    status: 'waiting',
  },
  {
    id: 'VIS-2025-000127',
    patient_id: '5',
    doctor_id: '5',
    queue_number: 5,
    visit_date: '2025-05-21',
    status: 'waiting',
  },
  {
    id: 'VIS-2025-000128',
    patient_id: '6',
    doctor_id: '6',
    queue_number: 6,
    visit_date: '2025-05-21',
    status: 'completed',
  },
];

const CONSULTATIONS_DATA = [
  {
    id: '1',
    visit_id: 'VIS-2025-000123',
    patient_id: '1',
    doctor_id: '1',
    complaint: 'Demam, badan pegal, dan sakit kepala sejak 2 hari yang lalu.',
    diagnosis: 'Flu & Batuk Pilek (Common Cold - J00)',
    treatment: 'Konsultasi Dokter Spesialis',
    consultation_fee: 75000,
    notes: 'Istirahat cukup minimal 8 jam, perbanyak minum air hangat.',
    prescribed_medicines: [
      { medicine_id: '1', name: 'Paracetamol 500mg', qty: 1, price: 5000, amount: 5000 },
      { medicine_id: '2', name: 'Vitamin C 500mg', qty: 1, price: 3000, amount: 3000 },
    ],
  },
];

const INVOICES_DATA = [
  {
    id: '1',
    invoice_no: 'INV-2025-000123',
    visit_id: 'VIS-2025-000123',
    status: 'unpaid',
    total: 83000,
  },
];

async function main() {
  console.log('🌱 Start seeding database...');

  // 1. Bersihkan database lama secara berurutan
  await prisma.invoice.deleteMany();
  await prisma.consultationMedicine.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // 2. Seed User Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      username: 'admin',
      password: hashedPassword,
    },
  });

  // 3. Seed Patients
  const patientIdMap = new Map<string, number>();
  for (const p of PATIENTS_DATA) {
    const createdPatient = await prisma.patient.create({
      data: {
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
  console.log('✅ Patients seeded.');

  // 4. Seed Doctors
  const doctorIdMap = new Map<string, number>();
  for (const d of DOCTORS_DATA) {
    const createdDoctor = await prisma.doctor.create({
      data: {
        name: d.name,
        spesialis: d.spesialis,
        phone: d.phone,
      },
    });
    doctorIdMap.set(d.id, createdDoctor.id);
  }
  console.log('✅ Doctors seeded.');

  // 5. Seed Medicines
  const medicineIdMap = new Map<string, number>();
  let medIdx = 0;
  for (const m of MEDICINES_DATA) {
    medIdx++;
    const createdMedicine = await prisma.medicine.create({
      data: {
        code: `MED-${String(medIdx).padStart(3, '0')}`,
        name: m.name,
        price: m.price,
        stock: m.stock,
        unit: m.unit,
      },
    });
    medicineIdMap.set(m.id, createdMedicine.id);
  }
  console.log('✅ Medicines seeded.');

  // 6. Seed Visits
  const visitIdMap = new Map<string, number>();

  for (const v of VISITS_DATA) {
    let statusEnum: VisitStatus = VisitStatus.WAITING;

    if (v.status === 'in_consultation') {
      statusEnum = VisitStatus.IN_KONSULTASI;
    } else if (v.status === 'completed') {
      statusEnum = VisitStatus.COMPLETED;
    }

    const realPatientId = patientIdMap.get(v.patient_id);
    const realDoctorId = doctorIdMap.get(v.doctor_id);

    if (!realPatientId || !realDoctorId) continue;

    const createdVisit = await prisma.visit.create({
      data: {
        patientId: realPatientId,
        doctorId: realDoctorId,
        queueNumber: v.queue_number,
        visitDate: new Date(v.visit_date),
        status: statusEnum,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    visitIdMap.set(v.id, createdVisit.id);
  }
  console.log('✅ Visits seeded.');

  // 7. Seed Consultations & ConsultationMedicines
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
            subTotal: item.amount,
          },
        });
      }
    }
  }
  console.log('✅ Consultations seeded.');

  // 8. Seed Invoices
  for (const inv of INVOICES_DATA) {
    const realVisitId = visitIdMap.get(inv.visit_id);
    if (!realVisitId) continue;

    await prisma.invoice.create({
      data: {
        visitId: realVisitId,
        invoiceNo: inv.invoice_no,
        totalConsultationFee: 75000,
        totalMedicineFee: 8000,
        totalAmount: inv.total,
        status: inv.status.toUpperCase() as InvoiceStatus,
        paymentMethod: PaymentMethod.CASH,
      },
    });
  }
  console.log('✅ Invoices seeded.');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
