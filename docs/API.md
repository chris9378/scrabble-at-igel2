# 📡 API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

## Authentication

Currently, no authentication is required. Future versions will implement JWT-based authentication.

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "timestamp": "2024-04-15T10:00:00Z"
}
```

## Endpoints

### Games

#### Create Game

```http
POST /api/games
Content-Type: application/json

{
  "playerName": "John",
  "language": "en",
  "aiPlayers": {
    "count": 2,
    "difficulty": "medium"
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "gameId": "game_123",
    "status": "waiting",
    "players": [
      {
        "id": "player_1",
        "name": "John",
        "type": "human",
        "score": 0
      }
    ],
    "board": {
      "width": 15,
      "height": 15,
      "cells": []
    }
  }
}
```

#### Get Game

```http
GET /api/games/:gameId
```

Response:
```json
{
  "success": true,
  "data": {
    "gameId": "game_123",
    "status": "active",
    "currentPlayerIndex": 0,
    "players": [],
    "board": {},
    "scores": {
      "player_1": 45,
      "player_2": 32
    }
  }
}
```

#### Join Game

```http
POST /api/games/:gameId/join
Content-Type: application/json

{
  "playerName": "Alice"
}
```

#### Start Game

```http
POST /api/games/:gameId/start
```

#### Leave Game

```http
DELETE /api/games/:gameId/leave
```

### Dictionary

#### Validate Word

```http
GET /api/dictionary/validate/:word?language=en
```

Response:
```json
{
  "success": true,
  "data": {
    "word": "example",
    "isValid": true,
    "language": "en"
  }
}
```

#### Get Dictionary Words

```http
GET /api/dictionary/words/:language
```

Response:
```json
{
  "success": true,
  "data": {
    "language": "en",
    "wordCount": 120000,
    "words": [
      {
        "word": "able",
        "points": 6
      }
    ]
  }
}
```

### Health

#### Server Health Check

```http
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-04-15T10:00:00Z",
  "environment": "development"
}
```

## Socket.io Events

### Connection

```typescript
// Establish WebSocket connection
socket.connect();

// Connection established
socket.on('connect', () => {
  console.log('Connected');
});

// Connection lost
socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

### Game Events

#### Create Game

**Emit:**
```typescript
socket.emit('game:create', {
  playerName: 'John',
  language: 'en',
  aiPlayers: { count: 2, difficulty: 'medium' }
});
```

**Receive:**
```typescript
socket.on('game:created', (game) => {
  console.log('Game created:', game);
});
```

#### Join Game

**Emit:**
```typescript
socket.emit('game:join', {
  gameId: 'game_123',
  playerName: 'Alice'
});
```

**Receive:**
```typescript
socket.on('game:joined', (game) => {
  console.log('Player joined:', game);
});
```

#### Start Game

**Emit:**
```typescript
socket.emit('game:start', 'game_123');
```

**Receive:**
```typescript
socket.on('game:started', (game) => {
  console.log('Game started:', game);
});
```

#### Make Move

**Emit:**
```typescript
socket.emit('game:move', {
  gameId: 'game_123',
  tiles: [
    { letter: 'C', row: 7, col: 7 },
    { letter: 'A', row: 7, col: 8 },
    { letter: 'T', row: 7, col: 9 }
  ]
});
```

**Receive:**
```typescript
socket.on('game:player-moved', (game) => {
  console.log('Player moved:', game);
});
```

#### Pass Turn

**Emit:**
```typescript
socket.emit('game:pass', 'game_123');
```

**Receive:**
```typescript
socket.on('game:turn-changed', (player) => {
  console.log('Current player:', player);
});
```

#### Exchange Tiles

**Emit:**
```typescript
socket.emit('game:exchange-tiles', {
  gameId: 'game_123',
  tileIds: ['tile_1', 'tile_2', 'tile_3']
});
```

#### Leave Game

**Emit:**
```typescript
socket.emit('game:leave', 'game_123');
```

#### Game Finished

**Receive:**
```typescript
socket.on('game:finished', (result) => {
  console.log('Game finished:', result);
});
```

### Chat Events

#### Send Message

**Emit:**
```typescript
socket.emit('chat:send', {
  gameId: 'game_123',
  message: 'Great move!'
});
```

#### Receive Message

**Receive:**
```typescript
socket.on('chat:message', (message) => {
  console.log('Message from', message.playerName, ':', message.message);
});
```

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Game not found",
    "code": "GAME_NOT_FOUND"
  },
  "timestamp": "2024-04-15T10:00:00Z"
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| GAME_NOT_FOUND | 404 | Game doesn't exist |
| PLAYER_NOT_FOUND | 404 | Player not in game |
| INVALID_MOVE | 400 | Move validation failed |
| GAME_NOT_STARTED | 400 | Game not started yet |
| NOT_YOUR_TURN | 400 | It's not your turn |
| INVALID_TILES | 400 | Tiles are invalid |
| WORD_NOT_IN_DICTIONARY | 400 | Word not valid |
| INVALID_INPUT | 400 | Input validation failed |
| SERVER_ERROR | 500 | Internal server error |

## Rate Limiting

*To be implemented*

## CORS

CORS is enabled for the frontend origin specified in environment variables.

Default: `http://localhost:4200`

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:3000/api/health

# Create game
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{"playerName":"John","language":"en"}'
```

### Using Postman

1. Import the collection (to be created)
2. Set base URL to `http://localhost:3000/api`
3. Test endpoints

### Using Thunder Client (VS Code)

Create `.thunderclient/collections.json` for API testing.

