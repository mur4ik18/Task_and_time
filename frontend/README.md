# Task Time Tracker - Frontend

Beautiful React frontend for the Task Time Tracker application with TypeScript and Tailwind CSS.

## Features

- **Modern UI**: Clean, gradient-based design with dark mode support
- **Timer**: Circular progress timer with pause/resume functionality
- **Task Management**: Create, edit, archive, and delete tasks
- **Break Tracking**: Track breaks between work sessions
- **Reports**: Interactive charts for daily, weekly, and monthly analytics
- **Data Export/Import**: Portable data management
- **Real-time Sync**: WebSocket support for multi-device synchronization
- **Responsive**: Works on desktop, tablet, and mobile devices

## Tech Stack

- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Zustand for state management
- Recharts for data visualization
- React Router for navigation
- Axios for API calls
- React Hot Toast for notifications

## Prerequisites

- Node.js 18+ and npm

## Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will run on http://localhost:3000

## Build for Production

```bash
npm run build
```

The production files will be in the `dist` directory.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Layout.tsx
│   └── Timer.tsx
├── pages/           # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── TasksPage.tsx
│   ├── ReportsPage.tsx
│   └── SettingsPage.tsx
├── services/        # API service layer
│   ├── api.ts
│   ├── auth.ts
│   ├── tasks.ts
│   ├── sessions.ts
│   ├── breaks.ts
│   ├── reports.ts
│   ├── settings.ts
│   ├── export.ts
│   └── websocket.ts
├── store/           # Zustand state management
│   └── useStore.ts
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Features Guide

### Timer
- Select a task before starting
- Set optional time limit
- Pause/resume functionality
- Plays notification sound when time limit is reached
- Timer continues running after limit (until manually stopped)
- Persistent across page refreshes

### Tasks
- Color-coded for easy identification
- Categorize tasks
- Archive tasks when not in use
- Restore archived tasks
- Delete tasks permanently

### Reports
- Daily, weekly, and monthly views
- Interactive pie and bar charts
- Time trends visualization
- Detailed breakdown tables

### Settings
- Customize default time limit
- Upload custom notification sounds
- Toggle dark mode
- Export/import all data
- Enable/disable notifications

## Environment

The frontend expects the backend API to be available at:
- Development: `http://localhost:3001` (via Vite proxy)
- Production: Same origin as frontend

## Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:
- `primary`: Blue gradient
- `accent`: Teal gradient

### Theme

The app supports light and dark modes. Theme preference is stored in localStorage.

