"""API routes for the time tracking application."""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from flask import Blueprint, request, jsonify, send_from_directory
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import os
from backend.database import Database
from backend.models import Task, Session

api = Blueprint('api', __name__)
db = Database()

UPLOAD_FOLDER = 'static/sounds'
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg'}

def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# Task endpoints
@api.route('/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks."""
    tasks = db.get_all_tasks()
    return jsonify([task.to_dict() for task in tasks])


@api.route('/tasks', methods=['POST'])
def create_task():
    """Create a new task."""
    data = request.json
    
    if not data.get('name'):
        return jsonify({'error': 'Task name is required'}), 400
    
    task = Task(
        id=None,
        name=data['name'],
        description=data.get('description', ''),
        time_limit=data.get('time_limit'),
        sound_file=data.get('sound_file')
    )
    
    task_id = db.create_task(task)
    task.id = task_id
    
    return jsonify(task.to_dict()), 201


@api.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get a specific task."""
    task = db.get_task(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify(task.to_dict())


@api.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task."""
    data = request.json
    
    task = db.get_task(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    task.name = data.get('name', task.name)
    task.description = data.get('description', task.description)
    task.time_limit = data.get('time_limit', task.time_limit)
    task.sound_file = data.get('sound_file', task.sound_file)
    
    db.update_task(task)
    return jsonify(task.to_dict())


@api.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task."""
    if db.delete_task(task_id):
        return jsonify({'message': 'Task deleted'}), 200
    return jsonify({'error': 'Task not found'}), 404


# Session endpoints
@api.route('/sessions/start', methods=['POST'])
def start_session():
    """Start a new session."""
    data = request.json
    
    if not data.get('task_id'):
        return jsonify({'error': 'task_id is required'}), 400
    
    # Check if there's an active session
    active_session = db.get_active_session()
    if active_session:
        return jsonify({'error': 'There is already an active session. Stop it first.'}), 400
    
    session = Session(
        id=None,
        task_id=data['task_id'],
        start_time=datetime.now(),
        is_break=data.get('is_break', False)
    )
    
    session_id = db.create_session(session)
    session.id = session_id
    
    return jsonify(session.to_dict()), 201


@api.route('/sessions/stop', methods=['POST'])
def stop_session():
    """Stop the active session."""
    data = request.json
    
    session_id = data.get('session_id')
    if not session_id:
        # Try to find active session
        session = db.get_active_session()
        if not session:
            return jsonify({'error': 'No active session found'}), 404
    else:
        # Get specific session (not implemented in db yet, use active)
        session = db.get_active_session()
        if not session or session.id != session_id:
            return jsonify({'error': 'Session not found'}), 404
    
    session.end_time = datetime.now()
    session.duration = int((session.end_time - session.start_time).total_seconds())
    
    db.update_session(session)
    return jsonify(session.to_dict())


@api.route('/sessions/active', methods=['GET'])
def get_active_session():
    """Get the currently active session."""
    session = db.get_active_session()
    if session:
        return jsonify(session.to_dict())
    return jsonify(None)


@api.route('/sessions/task/<int:task_id>', methods=['GET'])
def get_task_sessions(task_id):
    """Get all sessions for a task."""
    sessions = db.get_sessions_by_task(task_id)
    return jsonify([session.to_dict() for session in sessions])


@api.route('/sessions/all', methods=['GET'])
def get_all_sessions():
    """Get all sessions with gap information."""
    sessions = db.get_all_sessions()
    
    result = []
    for i, session in enumerate(sessions):
        session_dict = session.to_dict()
        
        # Calculate gap from previous session
        if i < len(sessions) - 1 and session.start_time and sessions[i + 1].end_time:
            previous_session = sessions[i + 1]
            gap_seconds = int((session.start_time - previous_session.end_time).total_seconds())
            session_dict['gap_before'] = gap_seconds if gap_seconds > 0 else 0
        else:
            session_dict['gap_before'] = None
        
        result.append(session_dict)
    
    return jsonify(result)


# Reports endpoints
@api.route('/reports/daily/<date>', methods=['GET'])
def get_daily_report(date):
    """Get daily report."""
    try:
        report_date = datetime.fromisoformat(date)
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    start_of_day = report_date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = start_of_day + timedelta(days=1)
    
    sessions = db.get_sessions_by_date_range(start_of_day, end_of_day)
    
    # Group by task
    task_stats = {}
    total_time = 0
    break_time = 0
    
    for session in sessions:
        if session.duration:
            if session.is_break:
                break_time += session.duration
            else:
                total_time += session.duration
                
                if session.task_id not in task_stats:
                    task = db.get_task(session.task_id)
                    task_stats[session.task_id] = {
                        'task_name': task.name if task else 'Unknown',
                        'total_time': 0,
                        'session_count': 0
                    }
                
                task_stats[session.task_id]['total_time'] += session.duration
                task_stats[session.task_id]['session_count'] += 1
    
    return jsonify({
        'date': date,
        'total_time': total_time,
        'break_time': break_time,
        'tasks': list(task_stats.values())
    })


@api.route('/reports/weekly/<week>', methods=['GET'])
def get_weekly_report(week):
    """Get weekly report. Week format: YYYY-WW"""
    try:
        year, week_num = week.split('-W')
        year = int(year)
        week_num = int(week_num)
        
        # Get Monday of the week
        jan_4 = datetime(year, 1, 4)
        week_start = jan_4 + timedelta(days=-jan_4.weekday(), weeks=week_num-1)
        week_end = week_start + timedelta(days=7)
    except (ValueError, AttributeError):
        return jsonify({'error': 'Invalid week format. Use YYYY-WNN'}), 400
    
    sessions = db.get_sessions_by_date_range(week_start, week_end)
    
    # Group by task and day
    task_stats = {}
    daily_stats = {}
    total_time = 0
    
    for session in sessions:
        if session.duration and not session.is_break:
            total_time += session.duration
            
            # Task stats
            if session.task_id not in task_stats:
                task = db.get_task(session.task_id)
                task_stats[session.task_id] = {
                    'task_name': task.name if task else 'Unknown',
                    'total_time': 0,
                    'session_count': 0
                }
            
            task_stats[session.task_id]['total_time'] += session.duration
            task_stats[session.task_id]['session_count'] += 1
            
            # Daily stats
            day_key = session.start_time.strftime('%Y-%m-%d')
            if day_key not in daily_stats:
                daily_stats[day_key] = 0
            daily_stats[day_key] += session.duration
    
    return jsonify({
        'week': week,
        'total_time': total_time,
        'tasks': list(task_stats.values()),
        'daily': daily_stats
    })


@api.route('/reports/monthly/<month>', methods=['GET'])
def get_monthly_report(month):
    """Get monthly report. Month format: YYYY-MM"""
    try:
        year, month_num = month.split('-')
        year = int(year)
        month_num = int(month_num)
        
        month_start = datetime(year, month_num, 1)
        if month_num == 12:
            month_end = datetime(year + 1, 1, 1)
        else:
            month_end = datetime(year, month_num + 1, 1)
    except (ValueError, AttributeError):
        return jsonify({'error': 'Invalid month format. Use YYYY-MM'}), 400
    
    sessions = db.get_sessions_by_date_range(month_start, month_end)
    
    # Group by task
    task_stats = {}
    total_time = 0
    total_sessions = 0
    
    for session in sessions:
        if session.duration and not session.is_break:
            total_time += session.duration
            total_sessions += 1
            
            if session.task_id not in task_stats:
                task = db.get_task(session.task_id)
                task_stats[session.task_id] = {
                    'task_name': task.name if task else 'Unknown',
                    'total_time': 0,
                    'session_count': 0
                }
            
            task_stats[session.task_id]['total_time'] += session.duration
            task_stats[session.task_id]['session_count'] += 1
    
    return jsonify({
        'month': month,
        'total_time': total_time,
        'total_sessions': total_sessions,
        'tasks': list(task_stats.values())
    })


# File upload endpoint
@api.route('/upload-sound', methods=['POST'])
def upload_sound():
    """Upload a sound file."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Add timestamp to avoid conflicts
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        name, ext = os.path.splitext(filename)
        filename = f"{name}_{timestamp}{ext}"
        
        Path(UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        return jsonify({'filename': filename, 'path': f'/sounds/{filename}'}), 201
    
    return jsonify({'error': 'Invalid file type. Allowed: mp3, wav, ogg'}), 400


# Data export/import endpoints
@api.route('/export', methods=['GET'])
def export_data():
    """Export all data."""
    data = db.export_all_data()
    return jsonify(data)


@api.route('/import', methods=['POST'])
def import_data():
    """Import data."""
    data = request.json
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        db.import_data(data)
        return jsonify({'message': 'Data imported successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Import failed: {str(e)}'}), 400

