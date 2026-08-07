import express from 'express';
import authRoutes from './authRoute.js';
import patientRoutes from './patientRoute.js';
import { authentication } from '../middlewares/authentication.js';
import { authorization } from '../middlewares/authorization.js';

const mainRouter = express.Router();

// import sub router

mainRouter.use('/auth', authRoutes);
mainRouter.use('/patients', authentication, authorization("ADMIN"), patientRoutes);

export default mainRouter;
