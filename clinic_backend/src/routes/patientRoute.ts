import { Router } from 'express';
import { validateZod } from '../middlewares/validateZod.js';
import {
  createPatientController,
  deletePatienController,
  getAllPatientsController,
  getPatientByIdController,
  updatePatientController,
} from '../controllers/patientController.js';
import { createPatientSchema, updatePatientSchema } from '../validation/patientSchema.js';

const router = Router();

router.get('/', getAllPatientsController);
router.post('/', validateZod(createPatientSchema), createPatientController);
router.get('/:idPatient', getPatientByIdController);
router.patch('/:idPatient', validateZod(updatePatientSchema), updatePatientController);
router.delete('/:idPatient', deletePatienController);

export default router;
