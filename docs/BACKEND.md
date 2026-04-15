# 🛠️ Backend Setup & Architecture

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── middleware/       # Custom middleware
│   ├── routes/           # API routes
│   ├── sockets/          # Socket.io event handlers
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Helper functions
│   ├── db/               # Database connections & migrations
│   └── app.ts            # Express app setup
├── tests/                # Unit & integration tests
├── .env.example          # Environment variables template
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## Key Features

### 1. Express Server
- RESTful API endpoints for game management
- CORS and security headers with Helmet
- Request validation with Joi
- Error handling middleware

### 2. Socket.io Integration
- Real-time game state updates
- Live player communication
- Turn management events
- Game completion notifications

### 3. Database Integration
- **PostgreSQL 15**: Dictionary storage, configuration, user sessions
- **Redis**: Active game states, player sessions, real-time cache

### 4. Game Logic
- **GameController**: Manages game creation, joining, starting
- **MoveService**: Validates and processes player moves
- **AIService**: Implements AI opponent logic (Easy, Medium, Hard)
- **DictionaryService**: Word validation for EN/DE

## API Endpoints

### Games
- `POST /api/games` - Create new game
- `GET /api/games/:gameId` - Get game state
- `POST /api/games/:gameId/join` - Join existing game
- `POST /api/games/:gameId/start` - Start game
- `DELETE /api/games/:gameId` - Leave/end game

### Dictionary
- `GET /api/dictionary/validate/:word` - Validate word
- `GET /api/dictionary/words/:language` - Get word list

### Health
- `GET /api/health` - Server health check

## Socket.io Events

### Emit (Client → Server)
```
game:create        Create new game
game:join          Join existing game
game:start         Start the game
game:move          Make a move (place tiles)
game:pass          Pass turn
game:exchange      Exchange tiles
game:leave         Leave game
chat:send          Send chat message
```

### Receive (Server → Client)
```
game:created       Game successfully created
game:joined        Player joined game
game:started       Game has started
game:player-moved  Another player made a move
game:turn-changed  Current player's turn changed
game:finished      Game has finished
game:error         Error occurred
chat:message       Receive chat message
```

## Development

### Running the Backend

```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

### Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
NODE_ENV=development
BACKEND_PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=scrabble
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Database Setup

### PostgreSQL

```bash
# Create database
createdb scrabble

# Run migrations (future)
npm run db:migrate
```

### Redis

```bash
# Start Redis locally (if installed)
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:7
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/services/game.service.test.ts
```

## Security Considerations

1. **Input Validation**: All inputs validated with Joi
2. **CORS**: Restricted to frontend origin
3. **Helmet**: Security headers enabled
4. **Error Messages**: Generic error messages in production
5. **Rate Limiting**: To be implemented
6. **WebSocket Authentication**: To be implemented

## Future Enhancements

- [ ] User authentication and persistent profiles
- [ ] Game history and statistics
- [ ] Leaderboards
- [ ] Advanced AI strategies
- [ ] Game replay functionality
- [ ] Mobile app support
- [ ] Rate limiting
- [ ] Comprehensive logging with Winston
- [ ] Database query optimization

