/**
 * Main application logic and initialization
 */

const API_BASE = '/api';

// Global state
const state = {
    tasks: [],
    currentTask: null,
    activeSession: null,
    currentTab: 'timer'
};

// API Helper functions
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        alert(`Error: ${error.message}`);
        throw error;
    }
}

// Tab navigation
function initTabs() {
    const tabButtons = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabName}-tab`).classList.add('active');

            state.currentTab = tabName;

            // Load tab-specific data
            if (tabName === 'tasks') {
                loadTasks();
            } else if (tabName === 'reports') {
                loadReport();
            } else if (tabName === 'timer') {
                loadRecentSessions();
            }
        });
    });
}

// Export/Import functionality
function initDataManagement() {
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');

    exportBtn.addEventListener('click', async () => {
        try {
            const data = await apiRequest('/export');
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `time-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        }
    });

    importBtn.addEventListener('click', () => {
        importFile.click();
    });

    importFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (confirm('This will import data and may create duplicate tasks. Continue?')) {
                await apiRequest('/import', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                alert('Data imported successfully!');
                loadTasks();
                loadRecentSessions();
            }
        } catch (error) {
            console.error('Import failed:', error);
            alert('Import failed. Please check the file format.');
        }

        importFile.value = '';
    });
}

// Load recent sessions for display
async function loadRecentSessions() {
    try {
        const tasks = await apiRequest('/tasks');
        const sessionList = document.getElementById('sessionList');
        
        // Get sessions from all tasks
        const allSessions = [];
        for (const task of tasks) {
            const sessions = await apiRequest(`/sessions/task/${task.id}`);
            sessions.forEach(session => {
                session.taskName = task.name;
                allSessions.push(session);
            });
        }

        // Sort by start time
        allSessions.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

        // Display last 10 sessions
        const recentSessions = allSessions.slice(0, 10);

        if (recentSessions.length === 0) {
            sessionList.innerHTML = '<div class="empty-state"><p>No sessions yet</p></div>';
            return;
        }

        sessionList.innerHTML = recentSessions.map(session => {
            const duration = session.duration || 0;
            const hours = Math.floor(duration / 3600);
            const minutes = Math.floor((duration % 3600) / 60);
            const seconds = duration % 60;
            const durationStr = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            const startTime = new Date(session.start_time);
            const timeStr = startTime.toLocaleString();

            return `
                <div class="session-item ${session.is_break ? 'break' : ''}">
                    <div class="session-info">
                        <div class="session-task">${session.is_break ? '☕ Break' : session.taskName}</div>
                        <div class="session-time">${timeStr}</div>
                    </div>
                    <div class="session-duration">${durationStr}</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to load sessions:', error);
    }
}

// Utility: Format time
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Utility: Format duration for display
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initDataManagement();
    initTimer();
    initTasksPage();
    initReports();
    
    // Load initial data
    loadTasks();
    loadRecentSessions();
    checkActiveSession();
});

