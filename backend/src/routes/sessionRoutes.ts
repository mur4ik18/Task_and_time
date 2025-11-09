import { Router } from 'express';
import { 
  startSession, 
  getActiveSession, 
  endSession, 
  markTimeLimitReached,
  getSessionsByTask 
} from '../controllers/sessionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/start', startSession);
router.get('/active', getActiveSession);
router.put('/:id/end', endSession);
router.put('/:id/time-limit-reached', markTimeLimitReached);
router.get('/task/:taskId', getSessionsByTask);

export default router;

