"""Database operations for the time tracking application."""
import sys
import sqlite3
from datetime import datetime
from typing import List, Optional
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.models import Task, Session, UserSetting


class Database:
    """Handles all database operations."""
    
    def __init__(self, db_path: str = "data/tasks.db"):
        """Initialize database connection."""
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self._create_tables()
    
    def _get_connection(self):
        """Get database connection."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def _create_tables(self):
        """Create database tables if they don't exist."""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        # Tasks table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                time_limit INTEGER,
                sound_file TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER NOT NULL,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP,
                duration INTEGER,
                is_break INTEGER DEFAULT 0,
                FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
            )
        ''')
        
        # User settings table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    # Task operations
    def create_task(self, task: Task) -> int:
        """Create a new task."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO tasks (name, description, time_limit, sound_file, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (task.name, task.description, task.time_limit, task.sound_file, task.created_at))
        task_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return task_id
    
    def get_task(self, task_id: int) -> Optional[Task]:
        """Get a task by ID."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM tasks WHERE id = ?', (task_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return Task(
                id=row['id'],
                name=row['name'],
                description=row['description'],
                time_limit=row['time_limit'],
                sound_file=row['sound_file'],
                created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None
            )
        return None
    
    def get_all_tasks(self) -> List[Task]:
        """Get all tasks."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM tasks ORDER BY created_at DESC')
        rows = cursor.fetchall()
        conn.close()
        
        tasks = []
        for row in rows:
            tasks.append(Task(
                id=row['id'],
                name=row['name'],
                description=row['description'],
                time_limit=row['time_limit'],
                sound_file=row['sound_file'],
                created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None
            ))
        return tasks
    
    def update_task(self, task: Task) -> bool:
        """Update a task."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE tasks 
            SET name = ?, description = ?, time_limit = ?, sound_file = ?
            WHERE id = ?
        ''', (task.name, task.description, task.time_limit, task.sound_file, task.id))
        updated = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return updated
    
    def delete_task(self, task_id: int) -> bool:
        """Delete a task."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted
    
    # Session operations
    def create_session(self, session: Session) -> int:
        """Create a new session."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO sessions (task_id, start_time, end_time, duration, is_break)
            VALUES (?, ?, ?, ?, ?)
        ''', (session.task_id, session.start_time, session.end_time, 
              session.duration, 1 if session.is_break else 0))
        session_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return session_id
    
    def update_session(self, session: Session) -> bool:
        """Update a session."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE sessions 
            SET end_time = ?, duration = ?
            WHERE id = ?
        ''', (session.end_time, session.duration, session.id))
        updated = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return updated
    
    def get_sessions_by_task(self, task_id: int) -> List[Session]:
        """Get all sessions for a task."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM sessions 
            WHERE task_id = ? 
            ORDER BY start_time DESC
        ''', (task_id,))
        rows = cursor.fetchall()
        conn.close()
        
        sessions = []
        for row in rows:
            sessions.append(Session(
                id=row['id'],
                task_id=row['task_id'],
                start_time=datetime.fromisoformat(row['start_time']),
                end_time=datetime.fromisoformat(row['end_time']) if row['end_time'] else None,
                duration=row['duration'],
                is_break=bool(row['is_break'])
            ))
        return sessions
    
    def get_active_session(self) -> Optional[Session]:
        """Get the currently active session (if any)."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM sessions 
            WHERE end_time IS NULL 
            ORDER BY start_time DESC 
            LIMIT 1
        ''')
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return Session(
                id=row['id'],
                task_id=row['task_id'],
                start_time=datetime.fromisoformat(row['start_time']),
                end_time=None,
                duration=row['duration'],
                is_break=bool(row['is_break'])
            )
        return None
    
    def get_sessions_by_date_range(self, start_date: datetime, end_date: datetime) -> List[Session]:
        """Get sessions within a date range."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM sessions 
            WHERE start_time >= ? AND start_time <= ?
            ORDER BY start_time DESC
        ''', (start_date.isoformat(), end_date.isoformat()))
        rows = cursor.fetchall()
        conn.close()
        
        sessions = []
        for row in rows:
            sessions.append(Session(
                id=row['id'],
                task_id=row['task_id'],
                start_time=datetime.fromisoformat(row['start_time']),
                end_time=datetime.fromisoformat(row['end_time']) if row['end_time'] else None,
                duration=row['duration'],
                is_break=bool(row['is_break'])
            ))
        return sessions
    
    # Settings operations
    def set_setting(self, key: str, value: str):
        """Set a user setting."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO user_settings (key, value)
            VALUES (?, ?)
        ''', (key, value))
        conn.commit()
        conn.close()
    
    def get_setting(self, key: str) -> Optional[str]:
        """Get a user setting."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT value FROM user_settings WHERE key = ?', (key,))
        row = cursor.fetchone()
        conn.close()
        return row['value'] if row else None
    
    # Data export/import
    def export_all_data(self) -> dict:
        """Export all data as a dictionary."""
        tasks = self.get_all_tasks()
        
        all_sessions = []
        for task in tasks:
            sessions = self.get_sessions_by_task(task.id)
            all_sessions.extend(sessions)
        
        return {
            'tasks': [task.to_dict() for task in tasks],
            'sessions': [session.to_dict() for session in all_sessions],
            'export_date': datetime.now().isoformat()
        }
    
    def import_data(self, data: dict):
        """Import data from dictionary."""
        # Map old IDs to new IDs
        task_id_map = {}
        
        # Import tasks
        for task_data in data.get('tasks', []):
            old_id = task_data.get('id')
            task = Task.from_dict(task_data)
            task.id = None  # Let database assign new ID
            new_id = self.create_task(task)
            if old_id:
                task_id_map[old_id] = new_id
        
        # Import sessions
        for session_data in data.get('sessions', []):
            session = Session.from_dict(session_data)
            # Map old task_id to new task_id
            if session.task_id in task_id_map:
                session.task_id = task_id_map[session.task_id]
                session.id = None  # Let database assign new ID
                self.create_session(session)

