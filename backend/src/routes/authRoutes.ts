import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/authController';
import { validateRegistration, validateLogin } from '../middleware/validation';

const router = Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;

