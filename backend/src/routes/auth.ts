import express from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest, schemas } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', validateRequest(schemas.register), AuthController.register);
router.post('/login', validateRequest(schemas.login), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/me', authenticateToken, AuthController.me);

export default router;

