# Shared Types - Scrabble Game

## Game State

```typescript
interface GameState {
  gameId: string;
  status: 'waiting' | 'active' | 'finished';
  players: Player[];
  currentPlayerIndex: number;
  board: Board;
  tileRack: TileRack[];
  playHistory: Move[];
  scores: Record<string, number>;
  language: 'en' | 'de';
  createdAt: Date;
  updatedAt: Date;
}
```

## Player

```typescript
interface Player {
  id: string;
  name: string;
  type: 'human' | 'ai';
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  score: number;
  tiles: Tile[];
  isActive: boolean;
  joinedAt: Date;
}
```

## Board & Tiles

```typescript
interface Board {
  width: number;
  height: number;
  cells: BoardCell[][];
}

interface BoardCell {
  row: number;
  col: number;
  tile?: Tile;
  multiplier?: 'double_letter' | 'triple_letter' | 'double_word' | 'triple_word';
}

interface Tile {
  id: string;
  letter: string;
  points: number;
  isBlank: boolean;
}
```

## Move

```typescript
interface Move {
  playerId: string;
  playerName: string;
  tiles: PlacedTile[];
  score: number;
  isPass: boolean;
  isExchange: boolean;
  timestamp: Date;
}

interface PlacedTile {
  tile: Tile;
  row: number;
  col: number;
}
```

## API Response

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
  timestamp: Date;
}
```

## Socket.io Events

```typescript
// Emit Events (Client → Server)
interface SocketEmitEvents {
  'game:create': (payload: CreateGamePayload) => void;
  'game:join': (payload: JoinGamePayload) => void;
  'game:start': (gameId: string) => void;
  'game:move': (payload: MovePayload) => void;
  'game:pass': (gameId: string) => void;
  'game:exchange-tiles': (payload: ExchangeTilesPayload) => void;
  'game:leave': (gameId: string) => void;
  'chat:send': (payload: ChatMessagePayload) => void;
}

// Receive Events (Server → Client)
interface SocketReceiveEvents {
  'game:created': (game: GameState) => void;
  'game:joined': (game: GameState) => void;
  'game:started': (game: GameState) => void;
  'game:player-moved': (game: GameState) => void;
  'game:turn-changed': (player: Player) => void;
  'game:finished': (result: GameResult) => void;
  'game:error': (error: ErrorPayload) => void;
  'chat:message': (message: ChatMessage) => void;
  'players:updated': (players: Player[]) => void;
}
```

## Payloads

```typescript
interface CreateGamePayload {
  playerName: string;
  language: 'en' | 'de';
  aiPlayers?: {
    count: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

interface JoinGamePayload {
  gameId: string;
  playerName: string;
}

interface MovePayload {
  gameId: string;
  tiles: PlacedTile[];
}

interface ExchangeTilesPayload {
  gameId: string;
  tileIds: string[];
}

interface ChatMessagePayload {
  gameId: string;
  message: string;
}

interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
}

interface GameResult {
  gameId: string;
  winner: Player;
  finalScores: Record<string, number>;
  totalMoves: number;
  duration: number; // milliseconds
}

interface ErrorPayload {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
```

