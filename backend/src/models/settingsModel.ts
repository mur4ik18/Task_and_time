import pool from '../config/database';
import { Settings } from '../types';

export const getSettings = async (userId: number): Promise<Settings | null> => {
  const result = await pool.query(
    'SELECT * FROM settings WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
};

export const updateSettings = async (
  userId: number,
  updates: Partial<Settings>
): Promise<Settings | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.default_time_limit !== undefined) {
    fields.push(`default_time_limit = $${paramCount++}`);
    values.push(updates.default_time_limit);
  }
  if (updates.notification_sound_url !== undefined) {
    fields.push(`notification_sound_url = $${paramCount++}`);
    values.push(updates.notification_sound_url);
  }
  if (updates.theme !== undefined) {
    fields.push(`theme = $${paramCount++}`);
    values.push(updates.theme);
  }
  if (updates.enable_notifications !== undefined) {
    fields.push(`enable_notifications = $${paramCount++}`);
    values.push(updates.enable_notifications);
  }

  if (fields.length === 0) {
    return null;
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const query = `UPDATE settings SET ${fields.join(', ')} WHERE user_id = $${paramCount++} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

