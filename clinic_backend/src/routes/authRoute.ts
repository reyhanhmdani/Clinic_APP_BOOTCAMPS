import { Router } from 'express';
import {
  getUserControler,
  loginController,
  registerController,
  googleAuthController,
  linkGoogleController,
} from '../controllers/authController.js';
import { validateZod } from '../middlewares/validateZod.js';
import { authentication } from '../middlewares/authentication.js';
import { loginSchema, registerSchema } from '../validation/userSchema.js';

const router = Router();

router.get('/users', getUserControler);
router.post('/login', validateZod(loginSchema), loginController);
router.post('/register', validateZod(registerSchema), registerController);
router.post('/google', googleAuthController);
router.post('/link-google', authentication, linkGoogleController);

export default router;
