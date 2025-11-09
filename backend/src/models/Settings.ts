import pool from '../config/database';
import { UserSettings } from '../types';

export class SettingsModel {
  static async create(userId: number): Promise<UserSettings> {
    const result = await pool.query(
      'INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *',
      [userId]
    );
    
    return result.rows[0];
  }

  static async findByUserId(userId: number): Promise<UserSettings | null> {
    const result = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return await this.create(userId);
    }
    
    return result.rows[0];
  }

  static async update(userId: number, updates: Partial<UserSettings>): Promise<UserSettings | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'user_id' && key !== 'created_at') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    const query = `UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    
    return result.rows[0] || null;
  }
}

