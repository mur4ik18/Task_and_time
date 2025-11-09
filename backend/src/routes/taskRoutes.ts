import { Router } from 'express';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { validateTask } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', validateTask, createTask);
router.put('/:id', validateTask, updateTask);
router.delete('/:id', deleteTask);

export default router;

