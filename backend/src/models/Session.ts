import pool from '../config/database';
import { Session } from '../types';

export class SessionModel {
  static async create(userId: number, taskId: number, timeLimit?: number): Promise<Session> {
    const result = await pool.query(
      'INSERT INTO sessions (user_id, task_id, start_time, time_limit) VALUES ($1, $2, CURRENT_TIMESTAMP, $3) RETURNING *',
      [userId, taskId, timeLimit || null]
    );
    
    return result.rows[0];
  }

  static async findById(id: number): Promise<Session | null> {
    const result = await pool.query('SELECT * FROM sessions WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findActiveSession(userId: number): Promise<Session | null> {
    const result = await pool.query(
      'SELECT * FROM sessions WHERE user_id = $1 AND end_time IS NULL ORDER BY start_time DESC LIMIT 1',
      [userId]
    );
    
    return result.rows[0] || null;
  }

  static async findByUserId(userId: number, limit: number = 50): Promise<Session[]> {
    const result = await pool.query(
      'SELECT s.*, t.name as task_name, t.category, t.color FROM sessions s JOIN tasks t ON s.task_id = t.id WHERE s.user_id = $1 ORDER BY s.start_time DESC LIMIT $2',
      [userId, limit]
    );
    
    return result.rows;
  }

  static async findByTaskId(taskId: number, limit: number = 50): Promise<Session[]> {
    const result = await pool.query(
      'SELECT * FROM sessions WHERE task_id = $1 ORDER BY start_time DESC LIMIT $2',
      [taskId, limit]
    );
    
    return result.rows;
  }

  static async endSession(id: number, notes?: string): Promise<Session | null> {
    const session = await this.findById(id);
    if (!session || session.end_time) return null;

    const duration = Math.floor((Date.now() - new Date(session.start_time).getTime()) / 1000);
    const timeLimitReached = session.time_limit ? duration >= session.time_limit : false;

    const result = await pool.query(
      'UPDATE sessions SET end_time = CURRENT_TIMESTAMP, duration = $1, time_limit_reached = $2, notes = $3 WHERE id = $4 RETURNING *',
      [duration, timeLimitReached, notes || null, id]
    );
    
    return result.rows[0] || null;
  }

  static async updateDuration(id: number): Promise<Session | null> {
    const session = await this.findById(id);
    if (!session) return null;

    const endTime = session.end_time ? new Date(session.end_time) : new Date();
    const duration = Math.floor((endTime.getTime() - new Date(session.start_time).getTime()) / 1000);

    const result = await pool.query(
      'UPDATE sessions SET duration = $1 WHERE id = $2 RETURNING *',
      [duration, id]
    );
    
    return result.rows[0] || null;
  }

  static async getSessionsInDateRange(userId: number, startDate: Date, endDate: Date): Promise<Session[]> {
    const result = await pool.query(
      `SELECT s.*, t.name as task_name, t.category, t.color 
       FROM sessions s 
       JOIN tasks t ON s.task_id = t.id 
       WHERE s.user_id = $1 AND s.start_time >= $2 AND s.start_time <= $3 
       ORDER BY s.start_time ASC`,
      [userId, startDate, endDate]
    );
    
    return result.rows;
  }
}

