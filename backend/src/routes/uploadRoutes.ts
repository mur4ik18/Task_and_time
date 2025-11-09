import { Router, Response } from 'express';
import { upload } from '../middleware/upload';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.use(authenticate);

router.post('/sound', upload.single('sound'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: 'File uploaded successfully',
    url: fileUrl,
    filename: req.file.filename,
  });
});

export default router;

