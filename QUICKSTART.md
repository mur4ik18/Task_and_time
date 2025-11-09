# Quick Start Guide

Get your Task Time Tracker up and running in 5 minutes!

## Step 1: Start PostgreSQL

```bash
# From the project root directory
docker-compose up -d
```

Wait about 10 seconds for PostgreSQL to initialize.

## Step 2: Set up the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run database migrations
npm run migrate

# Start the backend server
npm run dev
```

The backend will start on http://localhost:3001

## Step 3: Set up the Frontend

Open a **new terminal** window:

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will start on http://localhost:3000

## Step 4: Use the Application

1. Open your browser and go to http://localhost:3000
2. Click **"Register here"** to create a new account
3. Fill in your details:
   - Username: Your choice (min 3 characters)
   - Email: Your email address
   - Password: Your password (min 6 characters)
4. Click **"Create Account"**

You'll be automatically logged in and redirected to the dashboard!

## First Steps

### Create Your First Task
1. Go to **"Tasks"** in the sidebar
2. Click **"New Task"**
3. Enter task details:
   - Name: e.g., "Study TypeScript"
   - Category: e.g., "Learning" (optional)
   - Color: Pick a color for visual identification
4. Click **"Create"**

### Start Tracking Time
1. Go back to **"Dashboard"**
2. Select your task from the dropdown
3. Set a time limit (in seconds) or leave as 0 for no limit
   - Example: 1800 = 30 minutes, 3600 = 1 hour
4. Click **"Start"**
5. Work on your task!
6. Click **"Stop"** when done

### Upload a Notification Sound (Optional)
1. Go to **"Settings"**
2. Under **"Notification Sound"**
3. Click **"Choose File"** and select an audio file (MP3, WAV, etc.)
4. Click **"Upload"**
5. Click **"Test Sound"** to hear it
6. Don't forget to click **"Save Settings"** if you changed other settings

### View Your Reports
1. Go to **"Reports"**
2. Switch between Daily, Weekly, and Monthly views
3. Use the date picker to view different periods
4. See your productivity in beautiful charts!

## Tips

- **Timer Persistence**: The timer will keep running even if you close the browser tab
- **Pause Feature**: Click "Pause" to temporarily stop the timer without ending the session
- **Break Tracking**: Click "Start Break" on the dashboard when taking breaks
- **Dark Mode**: Toggle in Settings for a beautiful dark theme
- **Data Export**: Regularly export your data from Settings as a backup

## Troubleshooting

### Backend won't start
- Make sure PostgreSQL is running: `docker-compose ps`
- Check if port 3001 is available
- Verify .env file exists in backend directory

### Frontend won't start
- Make sure backend is running first
- Check if port 3000 is available
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Database connection errors
- Restart PostgreSQL: `docker-compose restart`
- Check PostgreSQL logs: `docker-compose logs postgres`

### Can't register/login
- Check backend console for errors
- Verify database migrations ran successfully
- Try restarting the backend server

## Stopping the Application

1. Press `Ctrl+C` in both terminal windows (frontend and backend)
2. Stop PostgreSQL (optional):
```bash
docker-compose stop
```

## Restarting Later

```bash
# Start PostgreSQL (if stopped)
docker-compose start

# In one terminal - Backend
cd backend
npm run dev

# In another terminal - Frontend
cd frontend
npm run dev
```

That's it! Enjoy tracking your time and boosting your productivity! 🚀

