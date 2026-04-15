# Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Angular 18 SPA (Browser)                            │   │
│  │  ├─ Components (Home, Game, Board, Chat)             │   │
│  │  ├─ NgRx State Management                            │   │
│  │  ├─ Socket.io Client                                 │   │
│  │  └─ Axios HTTP Client                                │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP + WebSocket
┌────────────────────────▼────────────────────────────────────┐
│                   API LAYER (Express.js)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  REST API Endpoints                                  │   │
│  │  ├─ /api/games                                       │   │
│  │  ├─ /api/dictionary                                  │   │
│  │  └─ /api/health                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Socket.io Server                                    │   │
│  │  ├─ Game Events                                      │   │
│  │  ├─ Chat Events                                      │   │
│  │  └─ Real-time Updates                                │   │
│  └──────────────────────────────────────────────────────┘   │
└────────┬────────────────────────────────────────────────┬───┘
         │                                                │
    ┌────▼──────┐                              ┌──────────▼────┐
    │ PostgreSQL │                              │     Redis     │
    │    (DB)    │◄────────────────────────────►│   (Cache)     │
    └────────────┘                              └───────────────┘
```

## Layered Architecture

### Presentation Layer (Frontend)
- **Technology**: Angular 18 + TypeScript
- **Responsibility**: User interface, user interactions, client-side state
- **Key Components**:
  - Page Components (Home, Game)
  - Reusable UI Components
  - State Management (NgRx)
  - Services (Socket, API, Game)

### Business Logic Layer (Backend)
- **Technology**: Express.js + Node.js + TypeScript
- **Responsibility**: Game logic, validation, AI, user management
- **Key Modules**:
  - Controllers: HTTP request handling
  - Services: Business logic implementation
  - Socket Handlers: Real-time event processing
  - Middleware: Authentication, validation, error handling

### Data Layer
- **PostgreSQL**: Persistent storage
  - Dictionary words
  - User profiles (future)
  - Game history (future)
- **Redis**: Session & state cache
  - Active game states
  - Player sessions
  - Real-time game updates

## Data Flow

### Game Creation Flow

```
1. User submits form (Frontend)
   ↓
2. Store dispatches action (NgRx)
   ↓
3. Effect calls GameService
   ↓
4. Socket.emit('game:create', data)
   ↓
5. Backend receives and validates
   ↓
6. Creates game in Redis
   ↓
7. Emits 'game:created' back to client
   ↓
8. Frontend receives and updates store
   ↓
9. Component renders updated state
```

### Game Move Flow

```
1. User drags tiles on board (Frontend)
   ↓
2. Validates move locally
   ↓
3. Emits 'game:move' via Socket.io
   ↓
4. Backend validates move
   ↓
5. Checks words in dictionary (PostgreSQL)
   ↓
6. Calculates score
   ↓
7. Updates game state (Redis)
   ↓
8. Broadcasts 'game:player-moved' to all players
   ↓
9. All clients update their state
```

## State Management (NgRx)

```
Store
├── Game State
│   ├── currentGame
│   ├── players
│   ├── board
│   ├── scores
│   ├── loading
│   └── error
├── UI State
│   ├── selectedTiles
│   ├── highlightedCells
│   └── notifications
└── Router State
    └── Route parameters
```

## Real-time Communication

### Socket.io Events Structure

```
Client                                Server
  │                                     │
  ├──► "game:create" ──────────────────►│
  │                                     ├─ Validate input
  │                                     ├─ Create game in Redis
  │◄── "game:created" ───────────────────┤
  │                                     │
  ├──► "game:join" ──────────────────►│
  │                                     ├─ Add player to game
  │◄── "game:joined" (broadcast) ────────┤
  │                                     │
  ├──► "game:start" ──────────────────►│
  │                                     ├─ Initialize game
  │◄── "game:started" (broadcast) ────────┤
  │                                     │
  ├──► "game:move" ──────────────────►│
  │                                     ├─ Validate move
  │                                     ├─ Check dictionary
  │                                     ├─ Calculate score
  │◄── "game:player-moved" (broadcast) ───┤
  │                                     │
```

## API Endpoint Architecture

```
Express App
└── Middleware
    ├── Helmet (Security)
    ├── CORS
    ├── Body Parser
    └── Error Handler
    │
    └── Routes
        ├── /api/games
        │   ├── POST   - Create game
        │   ├── GET    - Get game state
        │   ├── POST   /:id/join
        │   ├── POST   /:id/start
        │   └── DELETE /:id/leave
        │
        ├── /api/dictionary
        │   ├── GET    /validate/:word
        │   └── GET    /words/:language
        │
        └── /api/health
            └── GET    - Server status
```

## Database Schema (PostgreSQL)

```
dictionaries
├── id (UUID)
├── word (VARCHAR)
├── language (ENUM: 'en', 'de')
├── points (INT)
└── created_at (TIMESTAMP)

game_history (future)
├── id (UUID)
├── players (JSONB)
├── board_state (JSONB)
├── winner_id (UUID)
├── created_at (TIMESTAMP)
└── ended_at (TIMESTAMP)
```

## Redis Cache Structure

```
scrabble:game:{gameId}
├── gameState: GameState
├── players: Player[]
├── board: Board
└── expiry: 3600000ms

scrabble:session:{sessionId}
├── playerId: string
├── gameId: string
└── expiry: 1800000ms
```

## Component Hierarchy

```
AppComponent
├── HomeComponent
│   ├── GameCreationForm
│   │   ├── PlayerNameInput
│   │   ├── LanguageSelector
│   │   ├── AISettingsForm
│   │   └── CreateButton
│   └── GameJoiningForm
│       ├── GameIdInput
│       ├── PlayerNameInput
│       └── JoinButton
│
└── GameComponent
    ├── GameHeader
    │   ├── PlayersList
    │   ├── CurrentTurnIndicator
    │   └── GameStatus
    ├── GameBoard
    │   ├── BoardGrid
    │   ├── TileCell (x225)
    │   └── WordMultiplier
    ├── PlayerRack
    │   ├── RackTiles (draggable)
    │   └── TileCount
    ├── GameActions
    │   ├── SubmitMoveButton
    │   ├── PassButton
    │   └── ExchangeButton
    ├── ScoreBoard
    │   └── PlayerScores
    └── ChatPanel
        ├── MessageHistory
        └── MessageInput
```

## Performance Optimizations

1. **Frontend**
   - Lazy loading routes
   - OnPush change detection
   - Selector memoization in NgRx
   - Bundle optimization

2. **Backend**
   - Caching with Redis
   - Query optimization
   - Connection pooling
   - Async/await patterns

3. **Network**
   - WebSocket for real-time updates
   - Compression
   - Minimal payload size

## Security Considerations

1. **Input Validation**: Joi on backend
2. **CORS**: Restricted to frontend origin
3. **Security Headers**: Helmet.js
4. **Error Handling**: Generic messages in production
5. **Future**: JWT authentication, rate limiting

## Scalability Paths

1. **Horizontal Scaling**
   - Load balancer for Express servers
   - Redis cluster for cache
   - PostgreSQL replication

2. **Vertical Scaling**
   - Upgrade server resources
   - Database optimization
   - Caching strategies

3. **Microservices** (future)
   - Separate game service
   - Separate AI service
   - Separate dictionary service

