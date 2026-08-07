import { Router } from 'express';
import { loginController } from '../controllers/authControllers.js';
import { validateZod } from '../middlewares/validateZod.js';
import { loginSchema } from '../validation/userSchema.js';

const router = Router();

router.post('/login', validateZod(loginSchema), loginController);

export default router;
