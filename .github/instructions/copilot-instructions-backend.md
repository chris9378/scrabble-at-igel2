# Backend Domain Instructions - Express.js

> **Domain-specific coding standards for `backend/**/*`**  
> **Complements**: [Base Copilot Instructions](../copilot-instructions.md)

**Last Updated**: 2026-04-15

---

## Scope

These instructions apply to all files matching the glob pattern:

```glob
backend/**/*
```

For general project standards, see [copilot-instructions.md](../copilot-instructions.md).

---

## Table of Contents

- [Layered Architecture](#layered-architecture)
- [Express.js Patterns](#expressjs-patterns)
- [Socket.io Server](#socketio-server)
- [Input Validation (Joi)](#input-validation-joi)
- [Database Access](#database-access)
- [Game Logic Services](#game-logic-services)
- [Concurrency & Race Conditions](#concurrency--race-conditions)
- [Error Handling](#error-handling)
- [Structured Logging (Winston)](#structured-logging-winston)
- [Security Practices](#security-practices)
- [Testing Strategies](#testing-strategies)

---

## Layered Architecture

### Layer Responsibilities

```typescript
// ✅ GOOD - Clear separation of concerns

// 1. ROUTES - Transport layer only (no business logic)
// backend/src/routes/game.routes.ts
import { Router } from 'express';
import { validateRequest } from '../middleware/validation.middleware';
import { createGameSchema } from '../validators/game.validator';
import { GameController } from '../controllers/game.controller';

const router = Router();
const gameController = new GameController();

router.post('/games', 
  validateRequest(createGameSchema), 
  gameController.createGame
);

export default router;

// 2. CONTROLLERS - Request orchestration
// backend/src/controllers/game.controller.ts
export class GameController {
  constructor(private gameService: GameService) {}
  
  async createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { playerName, language, aiPlayers } = req.body;
      const game = await this.gameService.createGame(playerName, language, aiPlayers);
      
      res.status(201).json({
        success: true,
        data: game,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
}

// 3. SERVICES - Business logic
// backend/src/services/game.service.ts
export class GameService {
  constructor(
    private gameRepository: GameRepository,
    private aiService: AIService,
    private validationService: ValidationService
  ) {}
  
  async createGame(
    playerName: string, 
    language: Language, 
    aiPlayers?: AIPlayersConfig
  ): Promise<Game> {
    // Validation
    this.validationService.validatePlayerName(playerName);
    
    // Business logic
    const game = this.initializeGame(playerName, language);
    
    if (aiPlayers) {
      await this.aiService.addAIPlayers(game, aiPlayers);
    }
    
    // Persist
    await this.gameRepository.save(game);
    
    return game;
  }
  
  private initializeGame(playerName: string, language: Language): Game {
    // Game initialization logic
    return {
      id: uuid(),
      status: 'waiting',
      players: [{
        id: uuid(),
        name: playerName,
        type: 'human',
        score: 0,
        tiles: []
      }],
      language,
      createdAt: new Date().toISOString()
    };
  }
}

// 4. REPOSITORIES - Data access
// backend/src/repositories/game.repository.ts
export class GameRepository {
  constructor(
    private redis: RedisClient,
    private logger: Logger
  ) {}
  
  async save(game: Game): Promise<void> {
    const key = `game:${game.id}`;
    await this.redis.setex(
      key,
      3600, // TTL: 1 hour
      JSON.stringify(game)
    );
    
    this.logger.debug('Game saved', { gameId: game.id });
  }
  
  async findById(gameId: string): Promise<Game | null> {
    const key = `game:${gameId}`;
    const data = await this.redis.get(key);
    
    if (!data) {
      return null;
    }
    
    return JSON.parse(data) as Game;
  }
}

// ❌ BAD - Business logic in routes
router.post('/games', async (req, res) => {
  const game = { id: uuid(), players: [] };  // ❌ Logic here
  await redis.set(`game:${game.id}`, game);  // ❌ Direct DB access
  res.json(game);
});
```

### Dependency Injection Pattern

```typescript
// ✅ GOOD - Constructor injection with interfaces
export interface IGameRepository {
  save(game: Game): Promise<void>;
  findById(gameId: string): Promise<Game | null>;
  delete(gameId: string): Promise<void>;
}

export class GameService {
  constructor(
    private readonly gameRepository: IGameRepository,
    private readonly logger: ILogger
  ) {}
}

// Easy to mock in tests
class MockGameRepository implements IGameRepository {
  async save(game: Game): Promise<void> { /* mock */ }
  async findById(gameId: string): Promise<Game | null> { /* mock */ }
  async delete(gameId: string): Promise<void> { /* mock */ }
}
```

---

## Express.js Patterns

### Async Error Handling

```typescript
// ✅ GOOD - Async wrapper utility
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage
router.get('/games/:id', asyncHandler(async (req, res) => {
  const game = await gameService.getGame(req.params.id);
  res.json({ success: true, data: game });
}));

// ❌ BAD - Unhandled promise rejection
router.get('/games/:id', async (req, res) => {
  const game = await gameService.getGame(req.params.id);  // ❌ No error handling
  res.json(game);
});
```

### Middleware Composition

```typescript
// ✅ GOOD - Composable middleware
import helmet from 'helmet';
import cors from 'cors';
import express from 'express';

export function setupMiddleware(app: express.Application): void {
  // Security
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }));
  
  // Parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Custom middleware
  app.use(requestLogger);
  app.use(correlationId);
  app.use(errorHandler);
}

// Request ID middleware
export const correlationId: RequestHandler = (req, res, next) => {
  req.id = req.headers['x-correlation-id'] as string || uuid();
  res.setHeader('X-Correlation-ID', req.id);
  next();
};
```

### Response Envelope Pattern

```typescript
// ✅ GOOD - Consistent response structure
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export class ResponseBuilder {
  static success<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
  }
  
  static error(message: string, code: string, details?: Record<string, unknown>): ApiResponse<never> {
    return {
      success: false,
      error: { message, code, details },
      timestamp: new Date().toISOString()
    };
  }
}

// Usage
res.status(200).json(ResponseBuilder.success(game));
res.status(404).json(ResponseBuilder.error('Game not found', 'GAME_NOT_FOUND'));
```

---

## Socket.io Server

### Typed Event Handlers

```typescript
// ✅ GOOD - Typed socket events with validation
import { Server, Socket } from 'socket.io';
import Joi from 'joi';

interface ServerToClientEvents {
  'game:created': (game: GameState) => void;
  'game:updated': (game: GameState) => void;
  'game:error': (error: ErrorPayload) => void;
}

interface ClientToServerEvents {
  'game:create': (payload: CreateGamePayload) => void;
  'game:join': (payload: JoinGamePayload) => void;
  'game:move': (payload: MovePayload) => void;
}

export class GameSocketHandler {
  constructor(
    private io: Server<ClientToServerEvents, ServerToClientEvents>,
    private gameService: GameService,
    private logger: Logger
  ) {
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      this.logger.info('Client connected', { socketId: socket.id });
      
      socket.on('game:create', (payload) => 
        this.handleCreateGame(socket, payload)
      );
      
      socket.on('game:join', (payload) => 
        this.handleJoinGame(socket, payload)
      );
      
      socket.on('disconnect', () => 
        this.handleDisconnect(socket)
      );
    });
  }
  
  private async handleCreateGame(
    socket: Socket, 
    payload: unknown
  ): Promise<void> {
    try {
      // Validate payload
      const createGameSchema = Joi.object({
        playerName: Joi.string().min(2).max(20).required(),
        language: Joi.string().valid('en', 'de').required(),
        aiPlayers: Joi.object({
          count: Joi.number().min(0).max(2),
          difficulty: Joi.string().valid('easy', 'medium', 'hard')
        }).optional()
      });
      
      const { error, value } = createGameSchema.validate(payload);
      
      if (error) {
        socket.emit('game:error', {
          message: 'Invalid payload',
          code: 'INVALID_PAYLOAD',
          details: { validation: error.details }
        });
        return;
      }
      
      // Create game
      const game = await this.gameService.createGame(
        value.playerName,
        value.language,
        value.aiPlayers
      );
      
      // Join socket room
      socket.join(`game:${game.id}`);
      
      // Emit success
      socket.emit('game:created', game);
      
      this.logger.info('Game created via socket', { 
        gameId: game.id, 
        socketId: socket.id 
      });
      
    } catch (error) {
      this.logger.error('Error creating game', { 
        error: error.message, 
        socketId: socket.id 
      });
      
      socket.emit('game:error', {
        message: 'Failed to create game',
        code: 'GAME_CREATION_FAILED'
      });
    }
  }
  
  private async handleDisconnect(socket: Socket): Promise<void> {
    this.logger.info('Client disconnected', { socketId: socket.id });
    
    // Cleanup logic (e.g., mark player as inactive)
    const gameId = await this.getGameIdForSocket(socket.id);
    if (gameId) {
      await this.gameService.handlePlayerDisconnect(gameId, socket.id);
    }
  }
}
```

### Room Management

```typescript
// ✅ GOOD - Consistent room membership
export class SocketRoomManager {
  constructor(
    private io: Server,
    private redis: RedisClient
  ) {}
  
  async joinGameRoom(socket: Socket, gameId: string, playerId: string): Promise<void> {
    // Verify player belongs to game
    const game = await this.gameService.getGame(gameId);
    if (!game.players.find(p => p.id === playerId)) {
      throw new Error('Player not in game');
    }
    
    // Join room
    socket.join(`game:${gameId}`);
    
    // Store mapping for cleanup
    await this.redis.set(`socket:${socket.id}`, JSON.stringify({
      gameId,
      playerId
    }), 'EX', 3600);
  }
  
  async leaveGameRoom(socket: Socket, gameId: string): Promise<void> {
    socket.leave(`game:${gameId}`);
    await this.redis.del(`socket:${socket.id}`);
  }
  
  emitToGame(gameId: string, event: string, data: unknown): void {
    this.io.to(`game:${gameId}`).emit(event, data);
  }
}
```

---

## Input Validation (Joi)

### Schema Definitions

```typescript
// ✅ GOOD - Reusable Joi schemas
import Joi from 'joi';

export const createGameSchema = Joi.object({
  playerName: Joi.string()
    .min(2)
    .max(20)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Player name must contain only letters, numbers, hyphens, and underscores',
      'string.min': 'Player name must be at least 2 characters',
      'string.max': 'Player name cannot exceed 20 characters'
    }),
  
  language: Joi.string()
    .valid('en', 'de')
    .required(),
  
  aiPlayers: Joi.object({
    count: Joi.number().integer().min(0).max(2).required(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').required()
  }).optional()
});

export const moveTilesSchema = Joi.object({
  gameId: Joi.string().uuid().required(),
  tiles: Joi.array().items(
    Joi.object({
      tileId: Joi.string().uuid().required(),
      row: Joi.number().integer().min(0).max(14).required(),
      col: Joi.number().integer().min(0).max(14).required()
    })
  ).min(1).max(7).required()
});
```

### Validation Middleware

```typescript
// ✅ GOOD - Middleware with detailed error reporting
export const validateRequest = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,  // Collect all errors
      stripUnknown: true  // Remove unknown fields
    });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));
      
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'INVALID_INPUT',
          details: { validation: details }
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Replace req.body with validated/sanitized value
    req.body = value;
    next();
  };
};
```

---

## Database Access

### PostgreSQL Connection Pool

```typescript
// ✅ GOOD - Connection pooling with proper error handling
import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger';  // Winston logger

export class DatabaseClient {
  private pool: Pool;
  
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      max: 20,  // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle PostgreSQL client', {
        error: err.message,
        stack: err.stack
      });
    });
  }
  
  async query<T>(text: string, params?: (string | number | boolean | null)[]): Promise<T[]> {
    const start = Date.now();
    const result = await this.pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug('PostgreSQL query executed', { 
      query: text, 
      duration, 
      rowCount: result.rowCount 
    });
    
    return result.rows as T[];
  }
  
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  async close(): Promise<void> {
    await this.pool.end();
  }
}
```

### Prepared Statements (SQL Injection Prevention)

```typescript
// ✅ GOOD - Parameterized queries
export class DictionaryRepository {
  constructor(private db: DatabaseClient) {}
  
  async isValidWord(word: string, language: string): Promise<boolean> {
    const result = await this.db.query<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM dictionary WHERE word = $1 AND language = $2)',
      [word.toLowerCase(), language]
    );
    
    return result[0]?.exists || false;
  }
  
  // ❌ DANGEROUS - SQL Injection vulnerability
  async badQuery(word: string): Promise<boolean> {
    const result = await this.db.query(
      `SELECT * FROM dictionary WHERE word = '${word}'`  // ❌ NEVER!
    );
    return result.length > 0;
  }
}
```

### Redis Client

```typescript
// ✅ GOOD - Redis client with structured logging
import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

export class RedisClient {
  private client: RedisClientType;
  
  constructor() {
    this.client = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      password: process.env.REDIS_PASSWORD,
    });
    
    this.client.on('error', (err) => {
      logger.error('Redis client error', {
        error: err.message,
        stack: err.stack,
        host: process.env.REDIS_HOST
      });
    });
    
    this.client.on('connect', () => {
      logger.info('Redis client connected', {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
      });
    });
  }
  
  async connect(): Promise<void> {
    await this.client.connect();
  }
  
  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }
  
  // Atomic operations
  async setWithTTL(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client.setEx(key, ttlSeconds, value);
  }
  
  async getAndDelete(key: string): Promise<string | null> {
    // Use pipeline for atomic operations
    const pipeline = this.client.multi();
    pipeline.get(key);
    pipeline.del(key);
    
    const results = await pipeline.exec();
    return results[0] as string | null;
  }
}
```

---

## Game Logic Services

### Move Validation Service

```typescript
// ✅ GOOD - Separated validation concerns
export class MoveValidationService {
  constructor(
    private dictionaryService: DictionaryService,
    private scoringService: ScoringService
  ) {}
  
  async validateMove(
    game: GameState, 
    playerId: string, 
    tiles: PlacedTile[]
  ): Promise<ValidationResult> {
    // 1. Check if it's player's turn
    if (!this.isPlayerTurn(game, playerId)) {
      return { valid: false, error: 'NOT_YOUR_TURN' };
    }
    
    // 2. Validate tile ownership
    if (!this.playerOwnsTiles(game, playerId, tiles)) {
      return { valid: false, error: 'INVALID_TILES' };
    }
    
    // 3. Check board placement rules
    const placementResult = this.validatePlacement(game.board, tiles);
    if (!placementResult.valid) {
      return placementResult;
    }
    
    // 4. Extract words formed
    const words = this.extractWordsFormed(game.board, tiles);
    
    // 5. Validate words in dictionary
    for (const word of words) {
      const isValid = await this.dictionaryService.isValidWord(
        word, 
        game.language
      );
      
      if (!isValid) {
        return { 
          valid: false, 
          error: 'WORD_NOT_IN_DICTIONARY',
          details: { word }
        };
      }
    }
    
    // 6. Calculate score
    const score = this.scoringService.calculateScore(game.board, tiles);
    
    return { valid: true, score, words };
  }
  
  private isPlayerTurn(game: GameState, playerId: string): boolean {
    const currentPlayer = game.players[game.currentPlayerIndex];
    return currentPlayer.id === playerId;
  }
  
  private playerOwnsTiles(
    game: GameState, 
    playerId: string, 
    tiles: PlacedTile[]
  ): boolean {
    const player = game.players.find(p => p.id === playerId);
    if (!player) return false;
    
    const playerTileIds = new Set(player.tiles.map(t => t.id));
    return tiles.every(t => playerTileIds.has(t.tile.id));
  }
}
```

---

## Concurrency & Race Conditions

### Optimistic Locking with Versioning

```typescript
// ✅ GOOD - Version-based optimistic locking
export interface GameState {
  id: string;
  version: number;  // Increment on each update
  status: 'waiting' | 'active' | 'finished';
  // ...
}

export class GameService {
  async submitMove(
    gameId: string, 
    playerId: string, 
    move: Move
  ): Promise<GameState> {
    const game = await this.gameRepository.findById(gameId);
    if (!game) throw new Error('GAME_NOT_FOUND');
    
    // Validate and apply move
    const updatedGame = this.applyMove(game, playerId, move);
    updatedGame.version += 1;
    
    // Try to save with version check
    const saved = await this.gameRepository.saveWithVersion(
      updatedGame,
      game.version  // Expected version
    );
    
    if (!saved) {
      // Another update happened concurrently
      throw new Error('CONCURRENT_MODIFICATION');
    }
    
    return updatedGame;
  }
}

export class GameRepository {
  async saveWithVersion(game: GameState, expectedVersion: number): Promise<boolean> {
    // Lua script for atomic check-and-set in Redis
    const script = `
      local key = KEYS[1]
      local expected_version = ARGV[1]
      local new_data = ARGV[2]
      
      local current = redis.call('GET', key)
      if current == false then
        return 0
      end
      
      local current_version = cjson.decode(current).version
      if current_version ~= tonumber(expected_version) then
        return 0
      end
      
      redis.call('SET', key, new_data)
      return 1
    `;
    
    const result = await this.redis.eval(script, {
      keys: [`game:${game.id}`],
      arguments: [expectedVersion.toString(), JSON.stringify(game)]
    });
    
    return result === 1;
  }
}
```

### Redis Locks for Critical Sections

```typescript
// ✅ GOOD - Distributed lock pattern
export class LockService {
  constructor(private redis: RedisClient) {}
  
  async acquireLock(
    resource: string, 
    ttlSeconds: number = 5
  ): Promise<string | null> {
    const lockKey = `lock:${resource}`;
    const lockValue = uuid();
    
    // SET if Not eXists with EXpiry
    const acquired = await this.redis.set(
      lockKey,
      lockValue,
      'NX',  // Only set if not exists
      'EX',  // Set expiry
      ttlSeconds
    );
    
    return acquired ? lockValue : null;
  }
  
  async releaseLock(resource: string, lockValue: string): Promise<void> {
    const lockKey = `lock:${resource}`;
    
    // Lua script for atomic check-and-delete
    const script = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;
    
    await this.redis.eval(script, { keys: [lockKey], arguments: [lockValue] });
  }
  
  async withLock<T>(
    resource: string,
    callback: () => Promise<T>,
    ttlSeconds: number = 5
  ): Promise<T> {
    const lockValue = await this.acquireLock(resource, ttlSeconds);
    
    if (!lockValue) {
      throw new Error('LOCK_ACQUISITION_FAILED');
    }
    
    try {
      return await callback();
    } finally {
      await this.releaseLock(resource, lockValue);
    }
  }
}

// Usage
await lockService.withLock(`game:${gameId}`, async () => {
  const game = await gameRepository.findById(gameId);
  // ... modify game ...
  await gameRepository.save(game);
});
```

### Idempotency Tracking

```typescript
// ✅ GOOD - Idempotent move submission
export class GameService {
  async submitMove(moveId: string, gameId: string, move: Move): Promise<GameState> {
    // Check if move already processed
    const processed = await this.redis.get(`move:${moveId}`);
    if (processed) {
      // Return cached result (idempotent)
      return JSON.parse(processed);
    }
    
    // Process move
    const game = await this.processMove(gameId, move);
    
    // Cache result
    await this.redis.setex(
      `move:${moveId}`,
      300,  // 5 minutes TTL
      JSON.stringify(game)
    );
    
    return game;
  }
}
```

---

## Error Handling

### Custom Error Classes

```typescript
// ✅ GOOD - Domain-specific errors
export class GameError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export class NotFoundError extends GameError {
  constructor(resource: string, id: string) {
    super(
      `${resource} not found`,
      `${resource.toUpperCase()}_NOT_FOUND`,
      404,
      { id }
    );
  }
}

export class ValidationError extends GameError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

// Usage
if (!game) {
  throw new NotFoundError('Game', gameId);
}

if (!this.isPlayerTurn(game, playerId)) {
  throw new GameError('Not your turn', 'NOT_YOUR_TURN', 403);
}
```

### Global Error Handler

```typescript
// ✅ GOOD - Centralized error handling
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Log error
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    correlationId: req.id,
    path: req.path,
    method: req.method
  });
  
  // Determine response
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'Internal server error';
  let details: Record<string, unknown> | undefined;
  
  if (err instanceof GameError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ValidationError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
  }
  
  // Never expose stack traces in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: errorCode,
      ...(details && { details }),
      ...(isDevelopment && { stack: err.stack })
    },
    timestamp: new Date().toISOString(),
    correlationId: req.id
  });
};
```

---

## Structured Logging (Winston)

### Logger Configuration

```typescript
// ✅ GOOD - Structured logging setup
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'scrabble-backend' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Usage
logger.info('Game created', {
  gameId: game.id,
  playerCount: game.players.length,
  language: game.language,
  correlationId: req.id
});

logger.error('Move validation failed', {
  gameId,
  playerId,
  error: error.message,
  stack: error.stack
});

// ❌ BAD - Unstructured console logs
console.log('Game created: ' + gameId);  // ❌ Not structured
console.log(password);  // ❌ NEVER log secrets!

// ⚠️ NOTE: Development-only exception
// console.log/console.error are ONLY acceptable in:
// 1. Development environment checks (if NODE_ENV === 'development')
// 2. Quick debugging during local development (must be removed before commit)
// 3. Test files (.spec.ts, .test.ts)
// All production code MUST use Winston logger.
```

---

## Security Practices

### Helmet.js Configuration

```typescript
// ✅ GOOD - Security headers
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' }
}));
```

### Rate Limiting

```typescript
// ✅ GOOD - Rate limiting for API endpoints
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Stricter limits for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  skipSuccessfulRequests: true
});

app.use('/api/auth/', authLimiter);
```

---

## Testing Strategies

### Unit Tests (Services)

```typescript
// ✅ GOOD - Unit test with mocks
describe('GameService', () => {
  let gameService: GameService;
  let mockGameRepository: jest.Mocked<GameRepository>;
  let mockAIService: jest.Mocked<AIService>;
  
  beforeEach(() => {
    mockGameRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn()
    } as any;
    
    mockAIService = {
      addAIPlayers: jest.fn()
    } as any;
    
    gameService = new GameService(mockGameRepository, mockAIService);
  });
  
  describe('createGame', () => {
    it('should create game with human player', async () => {
      const game = await gameService.createGame('Alice', 'en');
      
      expect(game.status).toBe('waiting');
      expect(game.players).toHaveLength(1);
      expect(game.players[0].name).toBe('Alice');
      expect(mockGameRepository.save).toHaveBeenCalledWith(game);
    });
    
    it('should add AI players when specified', async () => {
      const aiConfig = { count: 2, difficulty: 'medium' as const };
      
      await gameService.createGame('Alice', 'en', aiConfig);
      
      expect(mockAIService.addAIPlayers).toHaveBeenCalledWith(
        expect.any(Object),
        aiConfig
      );
    });
    
    it('should throw error for invalid player name', async () => {
      await expect(
        gameService.createGame('A', 'en')
      ).rejects.toThrow('INVALID_PLAYER_NAME');
    });
  });
});
```

### Integration Tests (API)

```typescript
// ✅ GOOD - Integration test with supertest
import request from 'supertest';
import { app } from '../src/app';

describe('POST /api/games', () => {
  it('should create a new game', async () => {
    const response = await request(app)
      .post('/api/games')
      .send({
        playerName: 'Alice',
        language: 'en'
      })
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('gameId');
    expect(response.body.data.players).toHaveLength(1);
    expect(response.body.data.players[0].name).toBe('Alice');
  });
  
  it('should return 400 for invalid input', async () => {
    const response = await request(app)
      .post('/api/games')
      .send({
        playerName: 'A',  // Too short
        language: 'invalid'
      })
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_INPUT');
  });
});
```

---

## Definition of Done (Backend-Specific)

A backend feature is complete when:

- ✅ Layered architecture followed (Routes → Controllers → Services → Repositories)
- ✅ TypeScript strict mode with no `any`
- ✅ All inputs validated with Joi
- ✅ Structured logging with Winston (no console.log in production)
- ✅ Error handling with custom error classes
- ✅ Concurrency protection (locks, versioning) where needed
- ✅ Unit tests for services (>80% coverage)
- ✅ Integration tests for API endpoints
- ✅ Socket events validated and typed
- ✅ No SQL injection vulnerabilities (parameterized queries)
- ✅ No secrets in code (environment variables)
- ✅ Rate limiting configured
- ✅ Security headers (Helmet) applied
- ✅ CORS properly configured
- ✅ Lint and format checks pass
- ✅ No memory leaks (proper cleanup)

---

**For questions**: Reference [base copilot-instructions.md](../copilot-instructions.md) or consult [DOMAIN_STRUCTURE.md](../../docs/DOMAIN_STRUCTURE.md)

**Maintained by**: Scrabble at Igel Backend Team  
**Last Review**: 2026-04-15

