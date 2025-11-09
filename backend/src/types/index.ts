import { Request } from 'express';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: number;
  user_id: number;
  name: string;
  category?: string;
  color: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface Session {
  id: number;
  task_id: number;
  user_id: number;
  start_time: Date;
  end_time?: Date;
  duration: number;
  time_limit?: number;
  time_limit_reached: boolean;
  notes?: string;
  created_at: Date;
}

export interface Break {
  id: number;
  user_id: number;
  start_time: Date;
  end_time?: Date;
  duration: number;
  created_at: Date;
}

export interface Settings {
  user_id: number;
  default_time_limit: number;
  notification_sound_url?: string;
  theme: string;
  enable_notifications: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface JWTPayload {
  id: number;
  username: string;
  email: string;
}
