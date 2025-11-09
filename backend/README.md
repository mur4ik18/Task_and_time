# Task Time Tracker - Backend

TypeScript/Node.js backend for the Task Time Tracker application.

## Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Task Management**: Create, read, update, and delete tasks
- **Time Tracking**: Start/stop timer sessions with time limits
- **Break Tracking**: Monitor breaks between work sessions
- **Reports**: Daily, weekly, and monthly statistics
- **Data Export/Import**: Portable JSON format for data migration
- **File Upload**: Custom notification sound support
- **WebSocket**: Real-time timer synchronization across devices

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Docker (optional, for running PostgreSQL)

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration (especially JWT secrets for production)

4. Start PostgreSQL (using Docker):
```bash
cd ..
docker-compose up -d
```

5. Run database migrations:
```bash
npm run migrate
```

6. Start development server:
```bash
npm run dev
```

The server will run on http://localhost:3001

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Sessions
- `POST /api/sessions/start` - Start timer session
- `GET /api/sessions/active` - Get active session
- `PUT /api/sessions/:id/end` - End session
- `PUT /api/sessions/:id/time-limit-reached` - Mark time limit reached
- `GET /api/sessions/task/:taskId` - Get sessions by task

### Breaks
- `POST /api/breaks/start` - Start break
- `GET /api/breaks/active` - Get active break
- `PUT /api/breaks/:id/end` - End break

### Reports
- `GET /api/reports/daily?date=YYYY-MM-DD` - Daily report
- `GET /api/reports/weekly?date=YYYY-MM-DD` - Weekly report
- `GET /api/reports/monthly?date=YYYY-MM-DD` - Monthly report

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings

### Export/Import
- `GET /api/export` - Export all data as JSON
- `POST /api/export/import` - Import data from JSON

### Upload
- `POST /api/upload/sound` - Upload notification sound

### WebSocket
- `ws://localhost:3001/ws` - WebSocket connection for real-time updates

## Database Schema

See `src/database/schema.sql` for complete schema.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Run database migrations

## Environment Variables

See `.env.example` for all available configuration options.

