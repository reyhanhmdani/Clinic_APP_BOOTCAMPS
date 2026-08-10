import { Router } from 'express';
import { getAllConsultationController } from '../controllers/consultationController.js';

const router = Router();

router.get('/', getAllConsultationController);

export default router;
