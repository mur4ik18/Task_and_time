import pool from '../config/database';
import { Break } from '../types';

export class BreakModel {
  static async create(userId: number): Promise<Break> {
    const result = await pool.query(
      'INSERT INTO breaks (user_id, start_time) VALUES ($1, CURRENT_TIMESTAMP) RETURNING *',
      [userId]
    );
    
    return result.rows[0];
  }

  static async findById(id: number): Promise<Break | null> {
    const result = await pool.query('SELECT * FROM breaks WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findActiveBreak(userId: number): Promise<Break | null> {
    const result = await pool.query(
      'SELECT * FROM breaks WHERE user_id = $1 AND end_time IS NULL ORDER BY start_time DESC LIMIT 1',
      [userId]
    );
    
    return result.rows[0] || null;
  }

  static async findByUserId(userId: number, limit: number = 50): Promise<Break[]> {
    const result = await pool.query(
      'SELECT * FROM breaks WHERE user_id = $1 ORDER BY start_time DESC LIMIT $2',
      [userId, limit]
    );
    
    return result.rows;
  }

  static async endBreak(id: number): Promise<Break | null> {
    const breakRecord = await this.findById(id);
    if (!breakRecord || breakRecord.end_time) return null;

    const duration = Math.floor((Date.now() - new Date(breakRecord.start_time).getTime()) / 1000);

    const result = await pool.query(
      'UPDATE breaks SET end_time = CURRENT_TIMESTAMP, duration = $1 WHERE id = $2 RETURNING *',
      [duration, id]
    );
    
    return result.rows[0] || null;
  }

  static async getBreaksInDateRange(userId: number, startDate: Date, endDate: Date): Promise<Break[]> {
    const result = await pool.query(
      'SELECT * FROM breaks WHERE user_id = $1 AND start_time >= $2 AND start_time <= $3 ORDER BY start_time ASC',
      [userId, startDate, endDate]
    );
    
    return result.rows;
  }
}

