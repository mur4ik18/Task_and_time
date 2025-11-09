import pool from '../config/database';
import { Session } from '../types';

export const createSession = async (
  taskId: number,
  userId: number,
  timeLimit?: number
): Promise<Session> => {
  const result = await pool.query(
    'INSERT INTO sessions (task_id, user_id, start_time, time_limit) VALUES ($1, $2, NOW(), $3) RETURNING *',
    [taskId, userId, timeLimit || null]
  );
  return result.rows[0];
};

export const getActiveSession = async (userId: number): Promise<Session | null> => {
  const result = await pool.query(
    'SELECT s.*, t.name as task_name, t.category, t.color FROM sessions s JOIN tasks t ON s.task_id = t.id WHERE s.user_id = $1 AND s.end_time IS NULL ORDER BY s.start_time DESC LIMIT 1',
    [userId]
  );
  return result.rows[0] || null;
};

export const endSession = async (
  sessionId: number,
  userId: number,
  notes?: string
): Promise<Session | null> => {
  const result = await pool.query(
    `UPDATE sessions 
     SET end_time = NOW(), 
         duration = EXTRACT(EPOCH FROM (NOW() - start_time))::INTEGER,
         notes = $3
     WHERE id = $1 AND user_id = $2 AND end_time IS NULL 
     RETURNING *`,
    [sessionId, userId, notes || null]
  );
  return result.rows[0] || null;
};

export const updateSessionTimeLimitReached = async (
  sessionId: number,
  userId: number
): Promise<void> => {
  await pool.query(
    'UPDATE sessions SET time_limit_reached = true WHERE id = $1 AND user_id = $2',
    [sessionId, userId]
  );
};

export const getSessionsByTask = async (
  taskId: number,
  userId: number,
  limit?: number
): Promise<Session[]> => {
  const query = limit
    ? 'SELECT * FROM sessions WHERE task_id = $1 AND user_id = $2 ORDER BY start_time DESC LIMIT $3'
    : 'SELECT * FROM sessions WHERE task_id = $1 AND user_id = $2 ORDER BY start_time DESC';
  
  const params = limit ? [taskId, userId, limit] : [taskId, userId];
  const result = await pool.query(query, params);
  return result.rows;
};

export const getSessionsByDateRange = async (
  userId: number,
  startDate: Date,
  endDate: Date
): Promise<Session[]> => {
  const result = await pool.query(
    `SELECT s.*, t.name as task_name, t.category, t.color 
     FROM sessions s 
     JOIN tasks t ON s.task_id = t.id 
     WHERE s.user_id = $1 AND s.start_time >= $2 AND s.start_time <= $3 
     ORDER BY s.start_time DESC`,
    [userId, startDate, endDate]
  );
  return result.rows;
};

