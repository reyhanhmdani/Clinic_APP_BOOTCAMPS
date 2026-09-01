import express from 'express';
import authRoutes from './authRoute.js';
import patientRoutes from './patientRoute.js';
import doctorRoutes from './doctorRoute.js';
import medicineRoutes from './medicineRoute.js';
import visitRoutes from './visitRoute.js';
import invoiceRoutes from './invoiceRoute.js';
import consultationRoutes from './consultationRoute.js';
import customerRoutes from './customersRoute.js';
import pharmacyRoutes from './pharmacyRoute.js';
import { authentication } from '../middlewares/authentication.js';
import { handleMidtransNotificationController } from '../controllers/invoiceController.js';

const mainRouter = express.Router();

// Public route (Authentication)
mainRouter.use('/auth', authRoutes);

// Route publik untuk webhook Midtrans
mainRouter.post('/midtrans-webhook', handleMidtransNotificationController);

// Kita jaga semua route harus login dulu
mainRouter.use(authentication);

// Sub-routers, di dalam dalam tiap route terpasang authorization nya juga
mainRouter.use('/patients', patientRoutes);
mainRouter.use('/doctors', doctorRoutes);
mainRouter.use('/medicines', medicineRoutes);
mainRouter.use('/visits', visitRoutes);
mainRouter.use('/consultations', consultationRoutes);
mainRouter.use('/invoices', invoiceRoutes);
mainRouter.use('/pharmacy', pharmacyRoutes);

// customer
mainRouter.use('/customers', customerRoutes);

export default mainRouter;
