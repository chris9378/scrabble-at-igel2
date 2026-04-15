# 🚀 Setup Guide

## Prerequisites

### Required Software
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm 9+** - Included with Node.js
- **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
- **Redis 7+** - [Download](https://redis.io/download) or use Docker

### Optional Tools
- **Git** - For version control
- **Visual Studio Code** - Recommended IDE
- **Postman** - For API testing
- **Docker** - For containerized databases

## Installation Steps

### 1. Clone Repository & Navigate

```bash
cd X:\scrabble-at-igel
```

### 2. Install Root Dependencies

```bash
npm install
```

This will install dependencies for all workspaces (backend, frontend, shared).

### 3. Setup Environment Variables

Copy the example environment file:

```bash
# Windows PowerShell
Copy-Item .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
BACKEND_HOST=localhost
BACKEND_PORT=3000
FRONTEND_PORT=4200
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=scrabble
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Setup Database

#### PostgreSQL Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE scrabble;

# Connect to database
\c scrabble

# Create tables (to be implemented)
-- Run migration scripts when available
```

#### Redis Setup (Option A: Direct Installation)

```bash
# If Redis is installed locally
redis-server
```

#### Redis Setup (Option B: Docker)

```bash
# Run Redis in Docker
docker run --name redis7 -d -p 6379:6379 redis:7
```

### 5. Start Development Servers

#### Terminal 1 - Backend

```bash
npm run dev:backend
```

Backend will run on `http://localhost:3000`

#### Terminal 2 - Frontend (new terminal)

```bash
npm run dev:frontend
```

Frontend will run on `http://localhost:4200`

### 6. Verify Setup

Open browser and visit:
- Frontend: `http://localhost:4200`
- Backend Health Check: `http://localhost:3000/api/health`

Expected health check response:
```json
{
  "status": "ok",
  "timestamp": "2024-04-15T10:00:00.000Z",
  "environment": "development"
}
```

## Development Commands

### Workspace Commands

```bash
# Install dependencies for all workspaces
npm install

# Build all applications
npm run build

# Build only frontend
npm run build:frontend

# Build only backend
npm run build:backend

# Lint all code
npm run lint

# Format all code
npm run format

# Run all tests
npm run test
```

### Backend Commands

```bash
cd backend

# Start development server with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Format code
npm run format

# Run tests
npm test
```

### Frontend Commands

```bash
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" error:

```bash
# Windows - Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# For port 4200
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

### Database Connection Error

Ensure PostgreSQL is running:

```bash
# Windows - Check if PostgreSQL service is running
Get-Service postgresql*

# Start PostgreSQL if stopped
Start-Service postgresql-x64-15
```

### Redis Connection Error

Ensure Redis is running:

```bash
# If using Docker
docker ps

# If Redis container is not running
docker start redis7

# Or start Redis directly (if installed)
redis-server
```

### npm Install Issues

Clear cache and reinstall:

```bash
npm cache clean --force
rm -r node_modules
npm install
```

## IDE Setup (Visual Studio Code)

### Recommended Extensions

1. **Angular Language Service** - Official Angular support
2. **ESLint** - Code linting
3. **Prettier** - Code formatting
4. **Thunder Client** - API testing
5. **NgRx DevTools** - State management debugging
6. **REST Client** - HTTP request testing

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    }
  },
  "angular.enable-strict-mode-prompt": false,
  "editor.tabSize": 2,
  "editor.insertSpaces": true
}
```

### Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Backend Debug",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/node_modules/.bin/ts-node-dev",
      "args": ["--respawn", "src/app.ts"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## Production Deployment

### Build Production Bundles

```bash
# Build all applications
npm run build

# Output locations:
# Frontend: frontend/dist/browser/
# Backend: backend/dist/
```

### Environment Variables for Production

Update `.env` for production:

```env
NODE_ENV=production
BACKEND_HOST=0.0.0.0
BACKEND_PORT=3000
DB_HOST=prod-db-server
DB_PORT=5432
DB_USER=prod_user
DB_PASSWORD=secure_password
DB_NAME=scrabble_prod
REDIS_HOST=prod-redis-server
REDIS_PORT=6379
```

### Running Production Server

```bash
# Backend
npm run start

# Frontend is served as static files from backend
# Configure your web server (nginx, Apache) to serve frontend/dist/browser/
```

## Next Steps

1. Read the [FRONTEND.md](./FRONTEND.md) guide for UI development
2. Read the [BACKEND.md](./BACKEND.md) guide for API development
3. Check [SCRABBLE_BLUEPRINT.md](../SCRABBLE_BLUEPRINT.md) for project overview
4. Start implementing game components and features

## Support

For issues or questions:
1. Check existing documentation
2. Review code comments
3. Check console errors in browser/terminal
4. Verify all services are running (Backend, Database, Redis)

