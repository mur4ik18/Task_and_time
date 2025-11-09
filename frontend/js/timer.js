/**
 * Timer functionality
 */

let timerInterval = null;
let startTime = null;
let elapsedSeconds = 0;
let limitReached = false;

function initTimer() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const breakBtn = document.getElementById('breakBtn');
    const currentTaskSelect = document.getElementById('currentTask');

    startBtn.addEventListener('click', startTimer);
    stopBtn.addEventListener('click', stopTimer);
    breakBtn.addEventListener('click', startBreak);

    // Load tasks into selector
    loadTasksIntoSelector();
}

async function loadTasksIntoSelector() {
    try {
        const tasks = await apiRequest('/tasks');
        state.tasks = tasks;

        const currentTaskSelect = document.getElementById('currentTask');
        currentTaskSelect.innerHTML = '<option value="">Select a task...</option>' +
            tasks.map(task => `<option value="${task.id}">${task.name}</option>`).join('');
    } catch (error) {
        console.error('Failed to load tasks:', error);
    }
}

async function checkActiveSession() {
    try {
        const session = await apiRequest('/sessions/active');
        
        if (session) {
            state.activeSession = session;
            startTime = new Date(session.start_time);
            
            // Find and select the task
            const task = state.tasks.find(t => t.id === session.task_id);
            if (task) {
                state.currentTask = task;
                document.getElementById('currentTask').value = task.id;
                updateTaskInfo();
            }

            // Resume timer display
            resumeTimer();
        }
    } catch (error) {
        console.error('Failed to check active session:', error);
    }
}

async function startTimer() {
    const currentTaskSelect = document.getElementById('currentTask');
    const taskId = parseInt(currentTaskSelect.value);

    if (!taskId) {
        alert('Please select a task first');
        return;
    }

    const task = state.tasks.find(t => t.id === taskId);
    if (!task) {
        alert('Task not found');
        return;
    }

    try {
        const session = await apiRequest('/sessions/start', {
            method: 'POST',
            body: JSON.stringify({ task_id: taskId, is_break: false })
        });

        state.activeSession = session;
        state.currentTask = task;
        startTime = new Date();
        elapsedSeconds = 0;
        limitReached = false;

        // Save to localStorage for persistence
        localStorage.setItem('activeTimer', JSON.stringify({
            sessionId: session.id,
            taskId: task.id,
            startTime: startTime.toISOString()
        }));

        updateTaskInfo();
        resumeTimer();
    } catch (error) {
        console.error('Failed to start timer:', error);
    }
}

async function stopTimer() {
    if (!state.activeSession) return;

    try {
        await apiRequest('/sessions/stop', {
            method: 'POST',
            body: JSON.stringify({ session_id: state.activeSession.id })
        });

        // Clear timer
        clearInterval(timerInterval);
        timerInterval = null;
        state.activeSession = null;
        state.currentTask = null;
        startTime = null;
        elapsedSeconds = 0;
        limitReached = false;

        // Clear localStorage
        localStorage.removeItem('activeTimer');

        // Update UI
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('breakBtn').disabled = false;
        document.getElementById('currentTask').disabled = false;
        document.getElementById('timerDisplay').textContent = '00:00:00';
        document.getElementById('limitWarning').style.display = 'none';
        document.getElementById('taskInfo').textContent = '';

        // Reload sessions
        loadRecentSessions();
    } catch (error) {
        console.error('Failed to stop timer:', error);
    }
}

async function startBreak() {
    try {
        const session = await apiRequest('/sessions/start', {
            method: 'POST',
            body: JSON.stringify({ task_id: 1, is_break: true }) // Use dummy task_id for breaks
        });

        state.activeSession = session;
        state.currentTask = { name: 'Break' };
        startTime = new Date();
        elapsedSeconds = 0;
        limitReached = false;

        localStorage.setItem('activeTimer', JSON.stringify({
            sessionId: session.id,
            isBreak: true,
            startTime: startTime.toISOString()
        }));

        document.getElementById('taskInfo').innerHTML = '<strong>☕ Break Time</strong>';
        resumeTimer();
    } catch (error) {
        console.error('Failed to start break:', error);
    }
}

function resumeTimer() {
    // Update UI
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('breakBtn').disabled = true;
    document.getElementById('currentTask').disabled = true;

    // Start interval
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    updateTimerDisplay();
    timerInterval = setInterval(updateTimerDisplay, 1000);
}

function updateTimerDisplay() {
    if (!startTime) return;

    const now = new Date();
    elapsedSeconds = Math.floor((now - startTime) / 1000);

    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    const displayText = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('timerDisplay').textContent = displayText;

    // Check time limit
    if (state.currentTask && state.currentTask.time_limit && !limitReached) {
        if (elapsedSeconds >= state.currentTask.time_limit) {
            limitReached = true;
            playNotificationSound();
            document.getElementById('limitWarning').style.display = 'block';
        }
    }
}

function updateTaskInfo() {
    if (!state.currentTask) return;

    let info = `<strong>${state.currentTask.name}</strong>`;
    
    if (state.currentTask.time_limit) {
        const limitMinutes = Math.floor(state.currentTask.time_limit / 60);
        info += ` - Limit: ${limitMinutes} minutes`;
    }

    document.getElementById('taskInfo').innerHTML = info;
}

function playNotificationSound() {
    const audio = document.getElementById('notificationSound');
    
    if (state.currentTask && state.currentTask.sound_file) {
        audio.src = `/sounds/${state.currentTask.sound_file}`;
    } else {
        // Use default notification sound (browser beep or custom)
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCiJ0fPTgjMGHm7A7+OZRQ0PVajf8LRiHQU2jdXvz3kqBSR1xe7ekD8KE1yw5+unVRQKRp7f8r1tIAQnidHy04MzBh5uwO7jmUUND1Wn3+i0Yh0FNo3V7895KgUkdcXu3pA/ChNbr+frplUUCkae3/K9bSAEJ4nR8tODMwYebr/u45lFDQ9Vp9/otGIdBTaN1e7PeSoFJHXF7t6QPwoTW6/n66VVFApGnt/yvW0gBCeJ0fLTgzMGHm6/7uOZRQ0PVajf6LRiHQU2jdXuz3kqBSR1xe7ekD8KE1uv5+ukVRQKRp7f8r1tIAQnidHy04MzBh5uv+7jmUUND1Wo3+i0Yh0FNo3V7s95KgUkdcXu3pA/ChNbr+fro1UUCkae3/K9bSAEJ4nR8tODMwYebr/u45lFDQ9VqN/otGIdBTaN1e7PeSoFJHXF7t6QPwoTW6/n66JVFApGnt/yvW0gBCeJ0fLTgzMGHm6/7uOZRQ0PVajf6LRiHQU2jdXuz3kqBSR1xe7ekD8KE1uv5+uiVRQKRp7f8r1tIAQnidHy04MzBh5uv+7jmUUND1Wo3+i0Yh0FNo3V7s95KgUkdcXu3pA/ChNbr+frolUUCkae3/K9bSAEJ4nR8tODMwYebr/u45lFDQ9VqN/otGIdBTaN1e7PeSoFJHXF7t6QPwoTW6/n66NVFApGnt/yvW0gBCeJ0fLTgzMGHm6/7uOZRQ0PVajf6LRiHQU2jdXuz3kqBSR1xe7ekD8KE1uv5+uiVRQKRp7f8r1tIAQnidHy04MzBh5uv+7jmUUND1Wo3+i0Yh0FNo3V7s95KgUkdcXu3pA/ChNbr+fro1UUCkae3/K9bSAEJ4nR8tODMwYebr/u45lFDQ9VqN/otGIdBTaN1e7PeSoFJHXF7t6QPwoTW6/n66JVFApGnt/yvW0gBCeJ0fLTgzMGHm6/7uOZRQ0PVajf6LRiHQU2jdXuz3kqBSR1xe7ekD8KE1uv5+ujVRQKRp7f8r1tIAQnidHy04MzBh5uv+7jmUUND1Wo3+i0Yh0FNo3V7s95KgUkdcXu3pA/ChNbr+frolUUCkae3/K9bSAEJ4nR8tODMwYebr/u45lFDQ9VqN/otGIdBTaN1e7PeSoFJHXF7t6QPwoTW6/n66NVFApGnt/yvW0gBCeJ0fLTgzMGHm6/7uOZRQ0PVajf6LRiHQU2jdXuz3kqBSR1xe7ekD8KE1uv5+uiVRQKRp7f8r1tIAQnidHy04MzBh5uv+7jmUUND1Wo3+i0Yh0FNo3V7s95KgUkdcXu3pA/ChNbr+fro1UUCkae3/K9bSAEJ4nR8tODMwYebr/u45lFDQ9VqN/otGIdBTaN1e7PeSoFJHXF7t6QPwoTW6/n66JVFApGnt/yvW0gBCeJ0fLTgzMGHm6/7uOZRQ0PVajf6LRiHQU2jdXuz3kqBSR1xe7ekD8KE1uv5+ujVRQKRp7f8r1tIAQnidHy04MzBh5uv+7jmUUND1Wo3+i0Yh0FNo3V7s95KgUkdcXu3pA/ChNbr+frolUUCkae3/K9bSAEJ4nR8tODMwYebr/u45lFDQ9VqN/otGIdBTaN1e7PeSoFJHXF7t6QPwoTW6/n66NVFApGnt/yvW0gBCeJ0A';
    }
    
    audio.play().catch(err => console.log('Audio play failed:', err));
}

// Check for active timer on load
window.addEventListener('load', () => {
    const saved = localStorage.getItem('activeTimer');
    if (saved) {
        const data = JSON.parse(saved);
        startTime = new Date(data.startTime);
        
        // Verify with backend
        checkActiveSession();
    }
});

