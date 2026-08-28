import { Router } from 'express';
import { getUserControler, loginController, registerController } from '../controllers/authController.js';
import { validateZod } from '../middlewares/validateZod.js';
import { loginSchema, registerSchema } from '../validation/userSchema.js';

const router = Router();

router.get('/users', getUserControler);
router.post('/login', validateZod(loginSchema), loginController);
router.post('/register', validateZod(registerSchema), registerController);

export default router;
