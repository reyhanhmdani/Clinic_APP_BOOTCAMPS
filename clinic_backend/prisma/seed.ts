import { Gender, VisitStatus, InvoiceStatus, PaymentMethod, Role } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Start seeding database...');

  // 1. Baca file db.json
  const dbPath = path.join(process.cwd(), 'db.json');
  const rawData = fs.readFileSync(dbPath, 'utf-8');
  const db = JSON.parse(rawData);

  //  Bersihkan database lama (Opsional)
  await prisma.invoice.deleteMany();
  await prisma.consultationMedicine.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // 2. Seed User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      username: 'admin',
      password: hashedPassword,
    },
  });

  // 3. Seed Patients
  for (const p of db.patients) {
    await prisma.patient.create({
      data: {
        // id: parseInt(p.id),
        noRm: p.no_rm,
        name: p.name,
        gender: p.gender.toUpperCase() as Gender,
        age: p.age,
        phone: p.phone,
        address: p.address,
      },
    });
  }
  console.log('✅ Patients seeded.');

  // 4. Seed Doctors
  for (const d of db.doctors) {
    await prisma.doctor.create({
      data: {
        // id: parseInt(d.id),
        name: d.name,
        spesialis: d.spesialis,
        phone: d.phone,
      },
    });
  }
  console.log('✅ Doctors seeded.');

  // 5. Seed Medicines
  for (let index = 0; index < db.medicines.length; index++) {
    const m = db.medicines[index];
    await prisma.medicine.create({
      data: {
        // id: parseInt(m.id),
        code: `MED-00${index + 1}`,
        name: m.name,
        price: m.price,
        stock: m.stock,
        unit: m.unit,
      },
    });
  }
  console.log('✅ Medicines seeded.');

  // 6. Seed Visits
  const visitIdMap = new Map<string, number>();

  for (let index = 0; index < db.visits.length; index++) {
    const v = db.visits[index];
    let statusEnum = VisitStatus.WAITING;

    if (v.status === 'in_consultation') {
      statusEnum = VisitStatus.IN_KONSULTASI;
    } else if (v.status === 'completed') {
      statusEnum = VisitStatus.COMPLETED;
    }

    const createdVisit = await prisma.visit.create({
      data: {
        patientId: parseInt(v.patient_id),
        doctorID: parseInt(v.doctor_id),
        queueNumber: v.queue_number,
        visitDate: new Date(v.visit_date),
        status: statusEnum,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Simpan pemetaan ID String di db.json ke ID Int di Database
    visitIdMap.set(v.id, createdVisit.id);
  }
  console.log('✅ Visits seeded.');

  // 7. Seed Consultations & ConsultationMedicines
  for (const c of db.consultations) {
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
        await prisma.consultationMedicine.create({
          data: {
            consultationId: createdConsultation.id,
            medicineId: parseInt(item.medicine_id),
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
  for (const inv of db.invoices) {
    const realVisitId = visitIdMap.get(inv.visit_id);
    if (!realVisitId) continue;

    await prisma.invoice.create({
      data: {
        visitId: realVisitId,
        invoiceNo: inv.invoice_no,
        totalConsultationFee: 30000,
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
