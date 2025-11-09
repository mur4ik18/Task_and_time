"""Main Flask application."""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from flask import Flask, send_from_directory
from flask_cors import CORS
from backend.routes import api
import os

app = Flask(__name__)
CORS(app)

# Register blueprints FIRST (important for routing priority)
app.register_blueprint(api, url_prefix='/api')

# Serve static files
@app.route('/')
def index():
    """Serve the main page."""
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files."""
    # Check if it's a static file request
    if filename.startswith('css/') or filename.startswith('js/'):
        return send_from_directory('../frontend', filename)
    # Otherwise serve index.html (for SPA routing)
    return send_from_directory('../frontend', 'index.html')

@app.route('/sounds/<path:filename>')
def serve_sound(filename):
    """Serve sound files."""
    return send_from_directory('../static/sounds', filename)

if __name__ == '__main__':
    # Ensure directories exist
    os.makedirs('data', exist_ok=True)
    os.makedirs('static/sounds', exist_ok=True)
    
    print("Starting Time Tracker application...")
    print("Open your browser and navigate to: http://localhost:5010")
    app.run(debug=True, host='0.0.0.0', port=5010)

