import pool from '../config/database';

export class RefreshTokenModel {
  static async create(userId: number, token: string, expiresIn: string = '7d'): Promise<void> {
    const expiresAt = new Date();
    const days = parseInt(expiresIn.replace('d', ''));
    expiresAt.setDate(expiresAt.getDate() + days);

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );
  }

  static async findByToken(token: string): Promise<{ user_id: number; expires_at: Date } | null> {
    const result = await pool.query(
      'SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1',
      [token]
    );
    
    return result.rows[0] || null;
  }

  static async deleteByToken(token: string): Promise<void> {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  }

  static async deleteExpired(): Promise<void> {
    await pool.query('DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP');
  }

  static async deleteByUserId(userId: number): Promise<void> {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  }
}

