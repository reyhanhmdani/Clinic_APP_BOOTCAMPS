import express from 'express';
import authRoutes from './authRoute.js';
import patientRoutes from './patientRoute.js';
import doctorRoutes from './doctorRoute.js';
import medicineRoutes from './medicineRoute.js';
import { authentication } from '../middlewares/authentication.js';
import { authorization } from '../middlewares/authorization.js';

const mainRouter = express.Router();

// import sub router

mainRouter.use('/auth', authRoutes);
mainRouter.use('/patients', authentication, authorization('ADMIN'), patientRoutes);
mainRouter.use('/doctors', authentication, authorization('ADMIN'), doctorRoutes);
mainRouter.use('/medicines', authentication, authorization('ADMIN'), medicineRoutes);

export default mainRouter;
