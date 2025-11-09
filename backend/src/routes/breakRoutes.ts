import { Router } from 'express';
import { startBreak, getActiveBreak, endBreak } from '../controllers/breakController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/start', startBreak);
router.get('/active', getActiveBreak);
router.put('/:id/end', endBreak);

export default router;

