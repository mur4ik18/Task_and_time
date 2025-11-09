"""Main Flask application."""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from flask import Flask, send_from_directory
from flask_cors import CORS
from backend.routes import api
import os

app = Flask(__name__, static_folder=None)
CORS(app)

# Register API blueprints FIRST (important for routing priority)
app.register_blueprint(api, url_prefix='/api')

# Serve sound files
@app.route('/sounds/<path:filename>')
def serve_sound(filename):
    """Serve sound files."""
    return send_from_directory('../static/sounds', filename)

# Serve CSS files
@app.route('/css/<path:filename>')
def serve_css(filename):
    """Serve CSS files."""
    return send_from_directory('../frontend/css', filename)

# Serve JS files
@app.route('/js/<path:filename>')
def serve_js(filename):
    """Serve JS files."""
    return send_from_directory('../frontend/js', filename)

# Serve index.html for root only
@app.route('/')
def serve_index():
    """Serve the main page."""
    return send_from_directory('../frontend', 'index.html')

if __name__ == '__main__':
    # Ensure directories exist
    os.makedirs('data', exist_ok=True)
    os.makedirs('static/sounds', exist_ok=True)
    
    print("Starting Time Tracker application...")
    print("Open your browser and navigate to: http://localhost:5010")
    app.run(debug=True, host='0.0.0.0', port=5010)

