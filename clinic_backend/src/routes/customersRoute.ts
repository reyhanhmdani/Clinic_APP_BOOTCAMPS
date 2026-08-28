import { Router } from 'express';
import { authorization } from '../middlewares/authorization.js';
import { validateZod } from '../middlewares/validateZod.js';
import { createPatientSchema } from '../validation/patientSchema.js';
import {
  checkNikController,
  getCustomerHistoryController,
  getMyProfileController,
  registerPatientProfileController,
} from '../controllers/patientController.js';
import { getActiveDoctorsController } from '../controllers/doctorController.js';
import { bookCustomerVisitController, getActiveCustomerVisitController } from '../controllers/visitController.js';
import { payCustomerInvoiceController } from '../controllers/invoiceController.js';

const router = Router();

router.use(authorization('CUSTOMER'));

router.get('/check-nik/:nik', checkNikController);
router.post('/profile', validateZod(createPatientSchema), registerPatientProfileController);

// profile pasien sendiri
router.get('/profile', getMyProfileController);

// daftar dokter yang aktif
router.get('/doctors', getActiveDoctorsController);

// Ambil nomor antrian dokter mandiri
router.post('/book-visit', bookCustomerVisitController);

// Pantau antrian aktif realtime (live-tracker)
router.get('/active-visit', getActiveCustomerVisitController);

// Riwayat kunjungan, diagnosa, resep obat
router.get('/history', getCustomerHistoryController);

// Pembayaran mandiri (QRIS - self payment)
router.post('/pay-invoice', payCustomerInvoiceController);
export default router;
