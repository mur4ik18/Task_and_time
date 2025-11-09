import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: 'Username, email, and password are required' });
    return;
  }

  if (username.length < 3 || username.length > 50) {
    res.status(400).json({ error: 'Username must be between 3 and 50 characters' });
    return;
  }

  if (!validator.isEmail(email)) {
    res.status(400).json({ error: 'Invalid email format' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long' });
    return;
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  if (!validator.isEmail(email)) {
    res.status(400).json({ error: 'Invalid email format' });
    return;
  }

  next();
};

export const validateTask = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name } = req.body;

  if (!name || name.trim().length === 0) {
    res.status(400).json({ error: 'Task name is required' });
    return;
  }

  if (name.length > 255) {
    res.status(400).json({ error: 'Task name must be less than 255 characters' });
    return;
  }

  next();
};
