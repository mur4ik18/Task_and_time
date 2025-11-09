# Task and Time Tracker

A web-based time tracking application for monitoring time spent on tasks with customizable limits and audio notifications.

## Features

- **Stopwatch Timer**: Track time spent on tasks with persistent storage
- **Task Management**: Create, edit, and delete tasks with custom time limits
- **Audio Notifications**: Upload custom sounds that play when time limits are reached
- **Break Tracking**: Monitor breaks between tasks
- **Comprehensive Reports**: Daily, weekly, and monthly statistics
- **Data Export/Import**: Transfer your data between accounts easily
- **Session Persistence**: Timer continues even if browser is closed

## Setup

1. Install dependencies using Pixi:
```bash
pixi install
```

2. Run the development server:
```bash
pixi run dev
```

3. Open your browser and navigate to `http://localhost:5000`

## Technology Stack

- **Backend**: Python + Flask
- **Database**: SQLite
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Package Manager**: Pixi

## Usage

1. Create a new task with a name and optional time limit
2. Upload a custom audio file for notifications (optional)
3. Click "Start" to begin tracking time
4. When the time limit is reached, you'll hear the notification sound
5. Click "Stop" to end the session
6. View your reports to see time spent on different tasks

## Data Portability

Export your data as JSON to transfer between devices or backup your progress.

