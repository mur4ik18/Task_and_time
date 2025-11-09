/**
 * Tasks management functionality
 */

let editingTaskId = null;

function initTasksPage() {
    const addTaskBtn = document.getElementById('addTaskBtn');
    const cancelTaskBtn = document.getElementById('cancelTaskBtn');
    const taskForm = document.getElementById('taskForm');
    const taskSound = document.getElementById('taskSound');

    addTaskBtn.addEventListener('click', showTaskForm);
    cancelTaskBtn.addEventListener('click', hideTaskForm);
    taskForm.addEventListener('submit', saveTask);
    taskSound.addEventListener('change', handleSoundUpload);
}

function showTaskForm(taskId = null) {
    const container = document.getElementById('taskFormContainer');
    const formTitle = document.getElementById('formTitle');
    const form = document.getElementById('taskForm');

    if (taskId) {
        // Edit mode
        editingTaskId = taskId;
        formTitle.textContent = 'Edit Task';
        
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            document.getElementById('taskName').value = task.name;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskTimeLimit').value = task.time_limit ? Math.floor(task.time_limit / 60) : '';
            
            if (task.sound_file) {
                document.getElementById('currentSound').textContent = `Current: ${task.sound_file}`;
            }
        }
    } else {
        // Add mode
        editingTaskId = null;
        formTitle.textContent = 'Add New Task';
        form.reset();
        document.getElementById('currentSound').textContent = '';
    }

    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
}

function hideTaskForm() {
    document.getElementById('taskFormContainer').style.display = 'none';
    document.getElementById('taskForm').reset();
    document.getElementById('currentSound').textContent = '';
    editingTaskId = null;
}

async function handleSoundUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE}/upload-sound`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const result = await response.json();
        document.getElementById('currentSound').textContent = `Uploaded: ${result.filename}`;
        
        // Store filename for form submission
        e.target.dataset.uploadedFile = result.filename;
    } catch (error) {
        console.error('Failed to upload sound:', error);
        alert('Failed to upload sound file');
    }
}

async function saveTask(e) {
    e.preventDefault();

    const name = document.getElementById('taskName').value;
    const description = document.getElementById('taskDescription').value;
    const timeLimitMinutes = document.getElementById('taskTimeLimit').value;
    const soundInput = document.getElementById('taskSound');
    
    const taskData = {
        name,
        description,
        time_limit: timeLimitMinutes ? parseInt(timeLimitMinutes) * 60 : null,
        sound_file: soundInput.dataset.uploadedFile || (editingTaskId ? state.tasks.find(t => t.id === editingTaskId)?.sound_file : null)
    };

    try {
        if (editingTaskId) {
            // Update existing task
            await apiRequest(`/tasks/${editingTaskId}`, {
                method: 'PUT',
                body: JSON.stringify(taskData)
            });
        } else {
            // Create new task
            await apiRequest('/tasks', {
                method: 'POST',
                body: JSON.stringify(taskData)
            });
        }

        hideTaskForm();
        await loadTasks();
        await loadTasksIntoSelector();
    } catch (error) {
        console.error('Failed to save task:', error);
    }
}

async function loadTasks() {
    try {
        const tasks = await apiRequest('/tasks');
        state.tasks = tasks;

        const tasksList = document.getElementById('tasksList');

        if (tasks.length === 0) {
            tasksList.innerHTML = '<div class="empty-state"><p>No tasks yet. Create your first task!</p></div>';
            return;
        }

        tasksList.innerHTML = tasks.map(task => {
            const limitText = task.time_limit 
                ? `⏱️ ${Math.floor(task.time_limit / 60)} min` 
                : 'No limit';
            
            const soundText = task.sound_file 
                ? `🔊 Custom sound` 
                : '';

            return `
                <div class="task-card">
                    <div class="task-card-header">
                        <div class="task-card-title">${task.name}</div>
                    </div>
                    ${task.description ? `<div class="task-card-description">${task.description}</div>` : ''}
                    <div class="task-card-meta">
                        <span class="task-badge">${limitText}</span>
                        ${soundText ? `<span class="task-badge">${soundText}</span>` : ''}
                    </div>
                    <div class="task-card-actions">
                        <button class="btn btn-primary" onclick="selectTaskForTimer(${task.id})">Select</button>
                        <button class="btn btn-secondary" onclick="editTask(${task.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteTask(${task.id})">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to load tasks:', error);
    }
}

function selectTaskForTimer(taskId) {
    // Switch to timer tab
    document.querySelector('[data-tab="timer"]').click();
    
    // Select the task
    document.getElementById('currentTask').value = taskId;
}

function editTask(taskId) {
    showTaskForm(taskId);
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task? All associated sessions will be removed.')) {
        return;
    }

    try {
        await apiRequest(`/tasks/${taskId}`, {
            method: 'DELETE'
        });

        await loadTasks();
        await loadTasksIntoSelector();
    } catch (error) {
        console.error('Failed to delete task:', error);
    }
}

