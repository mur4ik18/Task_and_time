import pool from '../config/database';
import { Task } from '../types';

export const createTask = async (
  userId: number,
  name: string,
  category?: string,
  color?: string
): Promise<Task> => {
  const result = await pool.query(
    'INSERT INTO tasks (user_id, name, category, color) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, name, category || null, color || '#3B82F6']
  );
  return result.rows[0];
};

export const getTasksByUser = async (userId: number, includeInactive = false): Promise<Task[]> => {
  const query = includeInactive
    ? 'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC'
    : 'SELECT * FROM tasks WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC';
  
  const result = await pool.query(query, [userId]);
  return result.rows;
};

export const getTaskById = async (taskId: number, userId: number): Promise<Task | null> => {
  const result = await pool.query(
    'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
    [taskId, userId]
  );
  return result.rows[0] || null;
};

export const updateTask = async (
  taskId: number,
  userId: number,
  updates: Partial<Task>
): Promise<Task | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramCount++}`);
    values.push(updates.name);
  }
  if (updates.category !== undefined) {
    fields.push(`category = $${paramCount++}`);
    values.push(updates.category);
  }
  if (updates.color !== undefined) {
    fields.push(`color = $${paramCount++}`);
    values.push(updates.color);
  }
  if (updates.is_active !== undefined) {
    fields.push(`is_active = $${paramCount++}`);
    values.push(updates.is_active);
  }

  if (fields.length === 0) {
    return null;
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(taskId, userId);

  const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramCount++} AND user_id = $${paramCount++} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const deleteTask = async (taskId: number, userId: number): Promise<boolean> => {
  const result = await pool.query(
    'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
    [taskId, userId]
  );
  return (result.rowCount ?? 0) > 0;
};

