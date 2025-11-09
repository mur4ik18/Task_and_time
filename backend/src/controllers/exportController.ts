import { Response } from 'express';
import { AuthRequest } from '../types';
import pool from '../config/database';

export const exportData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Fetch all user data
    const [tasks, sessions, breaks, settings] = await Promise.all([
      pool.query('SELECT * FROM tasks WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM sessions WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM breaks WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM settings WHERE user_id = $1', [userId]),
    ]);

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      user: {
        id: req.user!.id,
        username: req.user!.username,
        email: req.user!.email,
      },
      tasks: tasks.rows,
      sessions: sessions.rows,
      breaks: breaks.rows,
      settings: settings.rows[0] || null,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=time-tracker-export-${Date.now()}.json`);
    res.json(exportData);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
};

export const importData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tasks, sessions, breaks, settings } = req.body;
    const userId = req.user!.id;

    let importedCount = {
      tasks: 0,
      sessions: 0,
      breaks: 0,
    };

    // Import tasks
    if (tasks && Array.isArray(tasks)) {
      for (const task of tasks) {
        await pool.query(
          'INSERT INTO tasks (user_id, name, category, color, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
          [userId, task.name, task.category, task.color, task.is_active, task.created_at]
        );
        importedCount.tasks++;
      }
    }

    // Import sessions (need to match task IDs)
    if (sessions && Array.isArray(sessions)) {
      // Get task ID mapping (old name -> new ID)
      const taskMapping: any = {};
      const userTasks = await pool.query('SELECT id, name FROM tasks WHERE user_id = $1', [userId]);
      userTasks.rows.forEach(task => {
        taskMapping[task.name] = task.id;
      });

      for (const session of sessions) {
        const taskId = taskMapping[session.task_name] || session.task_id;
        if (taskId) {
          await pool.query(
            'INSERT INTO sessions (task_id, user_id, start_time, end_time, duration, time_limit, time_limit_reached, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [taskId, userId, session.start_time, session.end_time, session.duration, session.time_limit, session.time_limit_reached, session.notes]
          );
          importedCount.sessions++;
        }
      }
    }

    // Import breaks
    if (breaks && Array.isArray(breaks)) {
      for (const breakRecord of breaks) {
        await pool.query(
          'INSERT INTO breaks (user_id, start_time, end_time, duration) VALUES ($1, $2, $3, $4)',
          [userId, breakRecord.start_time, breakRecord.end_time, breakRecord.duration]
        );
        importedCount.breaks++;
      }
    }

    // Import settings
    if (settings) {
      await pool.query(
        'UPDATE settings SET default_time_limit = $1, notification_sound_url = $2, theme = $3, enable_notifications = $4 WHERE user_id = $5',
        [settings.default_time_limit, settings.notification_sound_url, settings.theme, settings.enable_notifications, userId]
      );
    }

    res.json({
      message: 'Data imported successfully',
      imported: importedCount,
    });
  } catch (error) {
    console.error('Import data error:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
};

