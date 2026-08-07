import { Router } from 'express';
import { validateZod } from '../middlewares/validateZod.js';
import {
  createPatientController,
  deletePatienController,
  getAllPatientsController,
  getPatientByIdController,
  updatePatientController,
} from '../controllers/patientControllers.js';
import { createPatientSchema, updatePatientSchema } from '../validation/patientSchema.js';

const router = Router();

router.get('/', getAllPatientsController);
router.get('/:idPatient', getPatientByIdController);
router.post('/', validateZod(createPatientSchema), createPatientController);
router.patch('/:idPatient', validateZod(updatePatientSchema), updatePatientController);
router.delete('/:idPatient', deletePatienController);

export default router;
