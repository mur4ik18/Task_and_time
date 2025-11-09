"""Main Flask application."""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from flask import Flask, send_from_directory
from flask_cors import CORS
from backend.routes import api
import os

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# Register blueprints
app.register_blueprint(api, url_prefix='/api')

# Serve static files
@app.route('/')
def index():
    """Serve the main page."""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/sounds/<path:filename>')
def serve_sound(filename):
    """Serve sound files."""
    return send_from_directory('../static/sounds', filename)

if __name__ == '__main__':
    # Ensure directories exist
    os.makedirs('data', exist_ok=True)
    os.makedirs('static/sounds', exist_ok=True)
    
    print("Starting Time Tracker application...")
    print("Open your browser and navigate to: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)

