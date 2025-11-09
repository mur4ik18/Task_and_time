# Task Time Tracker

A full-stack web application for tracking time spent on tasks with comprehensive reporting and analytics.

## Features

### Core Functionality
- ⏱️ **Smart Timer**: Circular progress timer with pause/resume and time limits
- 📋 **Task Management**: Create, organize, and archive tasks with categories and colors
- ☕ **Break Tracking**: Monitor breaks between work sessions
- 📊 **Analytics**: Daily, weekly, and monthly reports with interactive charts
- 🔔 **Notifications**: Custom sound alerts when time limits are reached
- 💾 **Data Export/Import**: Portable JSON format for easy data migration
- 🔄 **Real-time Sync**: WebSocket support for multi-device synchronization
- 🌙 **Dark Mode**: Beautiful dark theme support

### Technical Features
- JWT authentication with refresh tokens
- RESTful API with TypeScript
- PostgreSQL database
- Responsive design for all devices
- Local storage persistence for timer state
- Modern gradient-based UI

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL
- JWT authentication
- WebSocket (ws)
- Multer for file uploads

### Frontend
- React 18 with TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Recharts (charts)
- React Router
- Axios

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Docker (optional, for PostgreSQL)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Task_and_time
```

2. Start PostgreSQL:
```bash
docker-compose up -d
```

3. Set up backend:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run migrate
npm run dev
```

4. Set up frontend (in a new terminal):
```bash
cd frontend
npm install
npm run dev
```

5. Open your browser:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Default Credentials

Create a new account using the registration page.

## Project Structure

```
Task_and_time/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── controllers/ # Request handlers
│   │   ├── database/    # Migrations and schema
│   │   ├── middleware/  # Auth & validation
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── types/       # TypeScript types
│   │   ├── utils/       # Utilities
│   │   ├── websocket/   # WebSocket server
│   │   └── app.ts       # Express app
│   └── package.json
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── store/       # State management
│   │   └── App.tsx
│   └── package.json
└── docker-compose.yml   # PostgreSQL setup
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Sessions
- `POST /api/sessions/start` - Start timer
- `GET /api/sessions/active` - Get active session
- `PUT /api/sessions/:id/end` - Stop timer

### Breaks
- `POST /api/breaks/start` - Start break
- `PUT /api/breaks/:id/end` - End break

### Reports
- `GET /api/reports/daily` - Daily report
- `GET /api/reports/weekly` - Weekly report
- `GET /api/reports/monthly` - Monthly report

### Settings & Export
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `POST /api/upload/sound` - Upload notification sound
- `GET /api/export` - Export all data
- `POST /api/export/import` - Import data

## Usage Guide

### Getting Started
1. Register an account
2. Create your first task
3. Start the timer and begin working
4. Take breaks when needed
5. View reports to track your productivity

### Timer Features
- **Time Limits**: Set optional time limits to stay focused
- **Persistence**: Timer state is saved even if you close the browser
- **Notifications**: Get notified when time limit is reached
- **Multiple Sessions**: Track multiple work sessions per task

### Task Organization
- **Categories**: Organize tasks by project or type
- **Colors**: Visual identification with custom colors
- **Archive**: Hide completed tasks without deleting them

### Reports & Analytics
- **Daily View**: Detailed breakdown of today's work
- **Weekly Trends**: See patterns across the week
- **Monthly Overview**: Track long-term productivity
- **Charts**: Visual representation with pie and bar charts

### Data Management
- **Export**: Download all your data as JSON
- **Import**: Transfer data between accounts or devices
- **Backup**: Regular exports recommended for safety

## Development

### Backend Development
```bash
cd backend
npm run dev        # Start with hot reload
npm run migrate    # Run database migrations
npm run build      # Build for production
```

### Frontend Development
```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## Deployment

### Backend
1. Set environment variables
2. Run migrations: `npm run migrate`
3. Build: `npm run build`
4. Start: `npm start`

### Frontend
1. Build: `npm run build`
2. Serve the `dist` directory with any static file server

### Environment Variables
See `backend/.env.example` for required configuration.

## Security

- Passwords are hashed using bcrypt
- JWT tokens with refresh token rotation
- SQL injection prevention with parameterized queries
- CORS configuration for production
- File upload validation and limits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub.

## Roadmap

Future enhancements:
- Mobile apps (React Native)
- Team collaboration features
- Pomodoro technique integration
- Goal setting and tracking
- Calendar integration
- Advanced analytics and insights
- Browser extension

## Acknowledgments

Built with modern web technologies and best practices for a smooth user experience.

