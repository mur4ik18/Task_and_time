"""Data models for the time tracking application."""
from datetime import datetime
from typing import Optional


class Task:
    """Represents a task to track time for."""
    
    def __init__(self, id: Optional[int], name: str, description: str = "", 
                 time_limit: Optional[int] = None, sound_file: Optional[str] = None,
                 created_at: Optional[datetime] = None):
        self.id = id
        self.name = name
        self.description = description
        self.time_limit = time_limit  # in seconds
        self.sound_file = sound_file
        self.created_at = created_at or datetime.now()
    
    def to_dict(self):
        """Convert task to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'time_limit': self.time_limit,
            'sound_file': self.sound_file,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @staticmethod
    def from_dict(data: dict):
        """Create task from dictionary."""
        created_at = None
        if data.get('created_at'):
            created_at = datetime.fromisoformat(data['created_at'])
        
        return Task(
            id=data.get('id'),
            name=data['name'],
            description=data.get('description', ''),
            time_limit=data.get('time_limit'),
            sound_file=data.get('sound_file'),
            created_at=created_at
        )


class Session:
    """Represents a time tracking session for a task."""
    
    def __init__(self, id: Optional[int], task_id: int, start_time: datetime,
                 end_time: Optional[datetime] = None, duration: Optional[int] = None,
                 is_break: bool = False):
        self.id = id
        self.task_id = task_id
        self.start_time = start_time
        self.end_time = end_time
        self.duration = duration  # in seconds
        self.is_break = is_break
    
    def to_dict(self):
        """Convert session to dictionary."""
        return {
            'id': self.id,
            'task_id': self.task_id,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration': self.duration,
            'is_break': self.is_break
        }
    
    @staticmethod
    def from_dict(data: dict):
        """Create session from dictionary."""
        start_time = datetime.fromisoformat(data['start_time']) if data.get('start_time') else datetime.now()
        end_time = datetime.fromisoformat(data['end_time']) if data.get('end_time') else None
        
        return Session(
            id=data.get('id'),
            task_id=data['task_id'],
            start_time=start_time,
            end_time=end_time,
            duration=data.get('duration'),
            is_break=data.get('is_break', False)
        )


class UserSetting:
    """Represents a user setting."""
    
    def __init__(self, id: Optional[int], key: str, value: str):
        self.id = id
        self.key = key
        self.value = value
    
    def to_dict(self):
        """Convert setting to dictionary."""
        return {
            'id': self.id,
            'key': self.key,
            'value': self.value
        }

