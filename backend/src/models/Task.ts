import pool from '../config/database';
import { Task } from '../types';

export class TaskModel {
  static async create(userId: number, name: string, category?: string, color?: string): Promise<Task> {
    const result = await pool.query(
      'INSERT INTO tasks (user_id, name, category, color) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, name, category || null, color || '#3B82F6']
    );
    
    return result.rows[0];
  }

  static async findById(id: number): Promise<Task | null> {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId: number, activeOnly: boolean = false): Promise<Task[]> {
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    if (activeOnly) {
      query += ' AND is_active = TRUE';
    }
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async update(id: number, updates: Partial<Task>): Promise<Task | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'user_id' && key !== 'created_at') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async toggleActive(id: number): Promise<Task | null> {
    const result = await pool.query(
      'UPDATE tasks SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    
    return result.rows[0] || null;
  }
}

