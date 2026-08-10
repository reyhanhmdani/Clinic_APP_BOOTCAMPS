import express from 'express';
import authRoutes from './authRoute.js';
import patientRoutes from './patientRoute.js';
import doctorRoutes from './doctorRoute.js';
import medicineRoutes from './medicineRoute.js';
import visitRoutes from './visitRoute.js';
import consultationRoutes from './consultationRoute.js';
import { authentication } from '../middlewares/authentication.js';
import { authorization } from '../middlewares/authorization.js';

const mainRouter = express.Router();

// import sub router

mainRouter.use('/auth', authRoutes);
mainRouter.use('/patients', authentication, authorization('ADMIN'), patientRoutes);
mainRouter.use('/doctors', authentication, authorization('ADMIN'), doctorRoutes);
mainRouter.use('/medicines', authentication, authorization('ADMIN'), medicineRoutes);
mainRouter.use('/visits', authentication, authorization('ADMIN'), visitRoutes);
mainRouter.use('/consultations', authentication, authorization('ADMIN'), consultationRoutes);

export default mainRouter;
