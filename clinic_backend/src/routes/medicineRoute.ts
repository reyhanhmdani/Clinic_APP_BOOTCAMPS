import {
  createMedicineController,
  deletemedicineController,
  getAllMedicineController,
  getMedicineByIdController,
  updateMedicineController,
} from '../controllers/medicineController.js';
import { validateZod } from '../middlewares/validateZod.js';
import { createMedicineSchema, updateMedicineSchema } from '../validation/medicineSchema.js';
import { Router } from 'express';

const router = Router();

router.get('/', getAllMedicineController);
router.post('/', validateZod(createMedicineSchema), createMedicineController);
router.get('/:idMedicine', getMedicineByIdController);
router.patch('/:idMedicine', validateZod(updateMedicineSchema), updateMedicineController);
router.delete('/:idMedicine', deletemedicineController);

export default router;
