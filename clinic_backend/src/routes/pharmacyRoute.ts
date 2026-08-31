import { Router } from 'express';
import { getPharmacyQueueController, dispenseMedicineController } from '../controllers/pharmacyController.js';
import { authorization } from '../middlewares/authorization.js';

const router = Router();

// Khusus Admin / Petugas Apotek
router.use(authorization('ADMIN'));

router.get('/queue', getPharmacyQueueController);
router.patch('/:consultationId/dispense', dispenseMedicineController);

export default router;
