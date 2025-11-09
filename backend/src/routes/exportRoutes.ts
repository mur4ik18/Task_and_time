import { Router } from 'express';
import { exportData, importData } from '../controllers/exportController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', exportData);
router.post('/import', importData);

export default router;

