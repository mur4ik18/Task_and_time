import pool from '../config/database';
import { Break } from '../types';

export const createBreak = async (userId: number): Promise<Break> => {
  const result = await pool.query(
    'INSERT INTO breaks (user_id, start_time) VALUES ($1, NOW()) RETURNING *',
    [userId]
  );
  return result.rows[0];
};

export const getActiveBreak = async (userId: number): Promise<Break | null> => {
  const result = await pool.query(
    'SELECT * FROM breaks WHERE user_id = $1 AND end_time IS NULL ORDER BY start_time DESC LIMIT 1',
    [userId]
  );
  return result.rows[0] || null;
};

export const endBreak = async (breakId: number, userId: number): Promise<Break | null> => {
  const result = await pool.query(
    `UPDATE breaks 
     SET end_time = NOW(), 
         duration = EXTRACT(EPOCH FROM (NOW() - start_time))::INTEGER
     WHERE id = $1 AND user_id = $2 AND end_time IS NULL 
     RETURNING *`,
    [breakId, userId]
  );
  return result.rows[0] || null;
};

export const getBreaksByDateRange = async (
  userId: number,
  startDate: Date,
  endDate: Date
): Promise<Break[]> => {
  const result = await pool.query(
    'SELECT * FROM breaks WHERE user_id = $1 AND start_time >= $2 AND start_time <= $3 ORDER BY start_time DESC',
    [userId, startDate, endDate]
  );
  return result.rows;
};

