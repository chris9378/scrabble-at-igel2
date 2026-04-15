# Frontend Domain Instructions - Angular

> **Domain-specific coding standards for `frontend/**/*`**  
> **Complements**: [Base Copilot Instructions](../copilot-instructions.md)

**Last Updated**: 2026-04-15

---

## Scope

These instructions apply to all files matching the glob pattern:

```glob
frontend/**/*
```

For general project standards, see [copilot-instructions.md](../copilot-instructions.md).

---

## Table of Contents

- [Angular Architecture Patterns](#angular-architecture-patterns)
- [NgRx State Management](#ngrx-state-management)
- [Component Design](#component-design)
- [Angular CDK Integration](#angular-cdk-integration)
- [Socket.io Client](#socketio-client)
- [Performance Optimization](#performance-optimization)
- [Security Guidelines](#security-guidelines)
- [Accessibility (A11y)](#accessibility-a11y)
- [Responsive Design](#responsive-design)
- [Testing Strategies](#testing-strategies)

---

## Angular Architecture Patterns

### Standalone Components (Required)

```typescript
// ✅ GOOD - Standalone component with explicit imports
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`,
  styles: [`...`]
})
export class GameBoardComponent { }

// ❌ BAD - NgModule approach (deprecated in this project)
@NgModule({ declarations: [GameBoardComponent] })
```

### Feature-Based Organization

```
frontend/src/app/
├── features/
│   ├── game/
│   │   ├── components/       # Game-specific components
│   │   ├── services/         # Game facade, game logic
│   │   ├── store/            # Game-specific NgRx
│   │   └── game.routes.ts    # Lazy-loaded routes
│   ├── lobby/
│   └── chat/
├── shared/
│   ├── ui/                   # Reusable UI components
│   ├── services/             # Cross-feature services
│   └── utils/                # Helper functions
└── core/
    ├── guards/               # Route guards
    └── interceptors/         # HTTP interceptors
```

### File Naming Conventions

```
game-board.component.ts       # Component
game-board.component.html     # Template
game-board.component.scss     # Styles
game-board.component.spec.ts  # Tests
game.service.ts               # Service
game.facade.ts                # Facade (NgRx orchestration)
game.actions.ts               # NgRx actions
game.reducer.ts               # NgRx reducer
game.effects.ts               # NgRx effects
game.selectors.ts             # NgRx selectors
```

---

## NgRx State Management

### State Shape Design

```typescript
// ✅ GOOD - Serializable state with discriminated unions
export interface GameState {
  currentGame: GameState | null;
  players: Player[];
  loading: boolean;
  error: string | null;
  lastUpdated: string;  // ISO 8601 string, not Date
}

// ❌ BAD - Non-serializable state
export interface BadGameState {
  socket: Socket;              // ❌ Not serializable
  callback: () => void;        // ❌ Functions
  timestamp: Date;             // ❌ Use string instead
  cache: Map<string, Game>;    // ❌ Use Record/Array
}
```

### Actions - Intent-Based Naming

```typescript
// ✅ GOOD - Describes user/system intent
export const GameActions = createActionGroup({
  source: 'Game',
  events: {
    // User actions
    'Create Game Requested': props<{ playerName: string; language: Language }>(),
    'Join Game Requested': props<{ gameId: string; playerName: string }>(),
    'Move Tile': props<{ tileId: string; position: Position }>(),
    
    // Server responses
    'Game Created Successfully': props<{ game: GameState }>(),
    'Game Creation Failed': props<{ error: string }>(),
    
    // System events
    'Socket Reconnected': emptyProps(),
    'Game State Synced': props<{ game: GameState }>(),
  }
});

// ❌ BAD - Implementation details or generic names
export const badActions = {
  setLoading: createAction('[Game] Set Loading'),        // ❌ Too generic
  httpCallSucceeded: createAction('[Game] HTTP Success'), // ❌ Implementation detail
  update: createAction('[Game] Update'),                  // ❌ Not descriptive
};
```

### Reducers - Pure Functions Only

```typescript
// ✅ GOOD - Pure reducer
export const gameReducer = createReducer(
  initialState,
  on(GameActions.createGameRequested, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(GameActions.gameCreatedSuccessfully, (state, { game }) => ({
    ...state,
    currentGame: game,
    loading: false
  })),
  on(GameActions.gameCreationFailed, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);

// ❌ BAD - Side effects in reducer
export const badReducer = createReducer(
  initialState,
  on(GameActions.createGameRequested, (state) => {
    localStorage.setItem('game', JSON.stringify(state));  // ❌ Side effect!
    socket.emit('game:create');                            // ❌ Side effect!
    return { ...state, loading: true };
  })
);
```

### Effects - Side Effects Orchestration

```typescript
// ✅ GOOD - Effect handles side effects
@Injectable()
export class GameEffects {
  // API calls
  createGame$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.createGameRequested),
      switchMap(({ playerName, language }) =>
        this.gameService.createGame(playerName, language).pipe(
          map(game => GameActions.gameCreatedSuccessfully({ game })),
          catchError(error => of(GameActions.gameCreationFailed({ 
            error: error.message 
          })))
        )
      )
    )
  );
  
  // Socket.io integration
  listenToGameUpdates$ = createEffect(() =>
    this.socketService.on<GameState>('game:updated').pipe(
      map(game => GameActions.gameStateSynced({ game }))
    )
  );
  
  // Navigate on success
  navigateToGame$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.gameCreatedSuccessfully),
      tap(({ game }) => this.router.navigate(['/game', game.gameId]))
    ),
    { dispatch: false }
  );
  
  constructor(
    private actions$: Actions,
    private gameService: GameService,
    private socketService: SocketService,
    private router: Router
  ) {}
}
```

### Selectors - Memoization Required

```typescript
// ✅ GOOD - Memoized selectors with composition
export const selectGameState = createFeatureSelector<GameState>('game');

export const selectCurrentGame = createSelector(
  selectGameState,
  (state) => state.currentGame
);

export const selectPlayers = createSelector(
  selectCurrentGame,
  (game) => game?.players || []
);

export const selectCurrentPlayer = createSelector(
  selectGameState,
  selectPlayers,
  (state, players) => players[state.currentPlayerIndex] || null
);

export const selectCanMove = createSelector(
  selectCurrentGame,
  selectCurrentPlayer,
  (game, player) => 
    game?.status === 'active' && 
    player?.isActive === true
);

// ❌ BAD - Not memoized, recalculates every time
export const badSelector = (state: AppState) => {
  return state.game.players.filter(p => p.isActive);  // ❌ Always new array
};
```

---

## Component Design

### Smart vs. Presentational Pattern

```typescript
// ✅ GOOD - Smart Container (manages state)
@Component({
  selector: 'app-game-container',
  standalone: true,
  imports: [CommonModule, GameBoardComponent],
  template: `
    <app-game-board
      [board]="board$ | async"
      [currentPlayer]="currentPlayer$ | async"
      [canMove]="canMove$ | async"
      (tileMoved)="onTileMoved($event)"
      (tileSelected)="onTileSelected($event)">
    </app-game-board>
  `
})
export class GameContainerComponent {
  board$ = this.store.select(selectBoard);
  currentPlayer$ = this.store.select(selectCurrentPlayer);
  canMove$ = this.store.select(selectCanMove);
  
  constructor(private store: Store) {}
  
  onTileMoved(event: TileMovedEvent): void {
    this.store.dispatch(GameActions.moveTile({
      tileId: event.tileId,
      position: event.position
    }));
  }
  
  onTileSelected(tileId: string): void {
    this.store.dispatch(GameActions.tileSelected({ tileId }));
  }
}

// ✅ GOOD - Presentational Component (pure UI)
@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, CdkDrag, CdkDropList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="board" cdkDropListGroup>
      <app-board-cell
        *ngFor="let cell of board?.cells; trackBy: trackByCell"
        [cell]="cell"
        [disabled]="!canMove"
        (cellClicked)="onCellClick(cell)">
      </app-board-cell>
    </div>
  `
})
export class GameBoardComponent {
  @Input() board: Board | null = null;
  @Input() currentPlayer: Player | null = null;
  @Input() canMove: boolean = false;
  
  @Output() tileMoved = new EventEmitter<TileMovedEvent>();
  @Output() tileSelected = new EventEmitter<string>();
  
  trackByCell(index: number, cell: BoardCell): string {
    return `${cell.row}-${cell.col}`;
  }
  
  onCellClick(cell: BoardCell): void {
    if (this.canMove && cell.tile) {
      this.tileSelected.emit(cell.tile.id);
    }
  }
}
```

### Input/Output Decorators

```typescript
// ✅ GOOD - Typed inputs with defaults
@Component({})
export class MyComponent {
  @Input({ required: true }) gameId!: string;
  @Input() players: Player[] = [];
  @Input() isLoading: boolean = false;
  
  @Output() gameStarted = new EventEmitter<string>();
  @Output() playerJoined = new EventEmitter<Player>();
}

// ❌ BAD - No types, no defaults
@Component({})
export class BadComponent {
  @Input() data: any;              // ❌ No type
  @Input() items;                  // ❌ Implicit any
  @Output() changed = new EventEmitter();  // ❌ No type parameter
}
```

### Lifecycle Hooks Order

```typescript
// ✅ GOOD - Implement in standard order
@Component({})
export class MyComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // 1. Constructor - dependency injection only
  constructor(
    private store: Store,
    private gameService: GameService
  ) {}
  
  // 2. ngOnChanges - respond to input changes
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gameId']) {
      this.loadGame(changes['gameId'].currentValue);
    }
  }
  
  // 3. ngOnInit - component initialization
  ngOnInit(): void {
    this.store.select(selectGame)
      .pipe(takeUntil(this.destroy$))
      .subscribe(game => this.game = game);
  }
  
  // 4. ngAfterViewInit - after view initialization
  ngAfterViewInit(): void {
    // DOM-dependent logic
  }
  
  // 5. ngOnDestroy - cleanup
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## Angular CDK Integration

### Drag & Drop for Tiles

```typescript
// ✅ GOOD - Deterministic drag & drop
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-tile-rack',
  standalone: true,
  imports: [CdkDrag, CdkDropList],
  template: `
    <div cdkDropList
         [cdkDropListData]="tiles"
         [cdkDropListConnectedTo]="['board-drop-list']"
         (cdkDropListDropped)="onDrop($event)">
      <div *ngFor="let tile of tiles; trackBy: trackByTile"
           cdkDrag
           [cdkDragData]="tile">
        {{ tile.letter }}
      </div>
    </div>
  `
})
export class TileRackComponent {
  @Input() tiles: Tile[] = [];
  @Output() tileMoved = new EventEmitter<{ tile: Tile; fromIndex: number; toIndex: number }>();
  
  onDrop(event: CdkDragDrop<Tile[]>): void {
    if (event.previousContainer === event.container) {
      // Same container - reorder
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Different container - transfer
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Emit event for state update
      this.tileMoved.emit({
        tile: event.item.data,
        fromIndex: event.previousIndex,
        toIndex: event.currentIndex
      });
    }
  }
  
  trackByTile(index: number, tile: Tile): string {
    return tile.id;
  }
}
```

---

## Socket.io Client

### Typed Socket Service

```typescript
// ✅ GOOD - Typed socket events
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, fromEvent } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  
  constructor() {
    this.socket = io(environment.socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
    
    this.setupEventLogging();
  }
  
  // Typed event emission
  emit<T>(event: string, data: T): void {
    this.socket.emit(event, data);
  }
  
  // Typed event listening with RxJS
  on<T>(event: string): Observable<T> {
    return fromEvent<T>(this.socket, event);
  }
  
  // Connection management
  connect(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }
  
  disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }
  
  get isConnected(): boolean {
    return this.socket.connected;
  }
  
  private setupEventLogging(): void {
    // ⚠️ NOTE: console.log/warn/error in frontend is acceptable for:
    // - Connection events (debugging network issues)
    // - Development-only logging
    // For production error tracking, consider a service like Sentry
    
    this.socket.on('connect', () => {
      console.log('[Socket.io] Connected:', this.socket.id);
    });
    
    this.socket.on('disconnect', (reason) => {
      console.warn('[Socket.io] Disconnected:', reason);
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('[Socket.io] Connection error:', error);
    });
  }
}
```

### Socket Integration in NgRx

```typescript
// ✅ GOOD - Socket events via effects
@Injectable()
export class GameSocketEffects {
  // Listen to incoming events
  gameUpdated$ = createEffect(() =>
    this.socketService.on<GameState>('game:updated').pipe(
      map(game => GameActions.gameStateSynced({ game }))
    )
  );
  
  playerJoined$ = createEffect(() =>
    this.socketService.on<Player>('game:player-joined').pipe(
      map(player => GameActions.playerJoined({ player }))
    )
  );
  
  // Emit outgoing events
  emitCreateGame$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.createGameRequested),
      tap(({ playerName, language }) => {
        this.socketService.emit('game:create', { playerName, language });
      })
    ),
    { dispatch: false }
  );
  
  // Reconnect handling
  reconnectAndSync$ = createEffect(() =>
    this.socketService.on('connect').pipe(
      withLatestFrom(this.store.select(selectCurrentGameId)),
      filter(([_, gameId]) => !!gameId),
      map(([_, gameId]) => GameActions.resyncGameRequested({ gameId: gameId! }))
    )
  );
  
  constructor(
    private actions$: Actions,
    private socketService: SocketService,
    private store: Store
  ) {}
}
```

---

## Performance Optimization

### OnPush Change Detection

```typescript
// ✅ GOOD - OnPush with immutable inputs
@Component({
  selector: 'app-player-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngFor="let player of players; trackBy: trackById">
      {{ player.name }}: {{ player.score }}
    </div>
  `
})
export class PlayerListComponent {
  @Input() players: readonly Player[] = [];  // Immutable
  
  trackById(index: number, player: Player): string {
    return player.id;
  }
}

// Parent must provide new reference when data changes
this.players = [...this.players, newPlayer];  // ✅ New reference
// NOT: this.players.push(newPlayer);          // ❌ Same reference
```

### Lazy Loading Routes

```typescript
// ✅ GOOD - Lazy loaded feature modules
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'game/:id',
    loadComponent: () =>
      import('./features/game/game-container.component').then(m => m.GameContainerComponent),
    children: [
      {
        path: 'chat',
        loadComponent: () =>
          import('./features/chat/chat.component').then(m => m.ChatComponent),
      },
    ],
  },
  {
    path: 'lobby',
    loadChildren: () =>
      import('./features/lobby/lobby.routes').then(m => m.lobbyRoutes),
  },
];
```

### Subscription Management

```typescript
// ✅ OPTION 1: async pipe (best)
@Component({
  template: `<div>{{ game$ | async }}</div>`
})
export class MyComponent {
  game$ = this.store.select(selectGame);
}

// ✅ OPTION 2: takeUntilDestroyed (Angular 16+)
@Component({})
export class MyComponent {
  constructor(private gameService: GameService) {
    this.gameService.getGame()
      .pipe(takeUntilDestroyed())
      .subscribe(game => this.game = game);
  }
}

// ✅ OPTION 3: takeUntil pattern
@Component({})
export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    this.gameService.getGame()
      .pipe(takeUntil(this.destroy$))
      .subscribe(game => this.game = game);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// ❌ BAD - Memory leak
@Component({})
export class BadComponent {
  ngOnInit(): void {
    this.gameService.getGame().subscribe(game => this.game = game);  // ❌ Never unsubscribes
  }
}
```

---

## Security Guidelines

### XSS Prevention

```typescript
// ✅ GOOD - Safe data binding
@Component({
  template: `
    <div>{{ userName }}</div>                    <!-- ✅ Auto-escaped -->
    <div [textContent]="userMessage"></div>      <!-- ✅ Safe -->
    <img [src]="sanitizedUrl" [alt]="altText">   <!-- ✅ Sanitized -->
  `
})

// ⚠️ USE WITH CAUTION - Sanitize first
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({})
export class MyComponent {
  constructor(private sanitizer: DomSanitizer) {}
  
  getSafeHtml(html: string): SafeHtml {
    // Validate/sanitize input first!
    const cleaned = this.cleanHtml(html);
    return this.sanitizer.sanitize(SecurityContext.HTML, cleaned) || '';
  }
}

// ❌ DANGEROUS - Never do this
template: `<div [innerHTML]="untrustedUserInput"></div>`
```

### Form Validation

```typescript
// ✅ GOOD - Client-side validation
import { Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({})
export class CreateGameComponent {
  createGameForm = this.fb.group({
    playerName: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(20),
      Validators.pattern(/^[a-zA-Z0-9_-]+$/)
    ]],
    language: ['en', [
      Validators.required,
      this.languageValidator()
    ]],
  });
  
  constructor(private fb: FormBuilder) {}
  
  languageValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control) => {
      const valid = ['en', 'de'].includes(control.value);
      return valid ? null : { invalidLanguage: true };
    };
  }
  
  onSubmit(): void {
    if (this.createGameForm.valid) {
      const { playerName, language } = this.createGameForm.value;
      // Server will validate again!
      this.store.dispatch(GameActions.createGameRequested({ 
        playerName: playerName!, 
        language: language as Language 
      }));
    }
  }
}
```

---

## Accessibility (A11y)

### ARIA Labels and Roles

```typescript
// ✅ GOOD - Accessible component
@Component({
  template: `
    <div role="region" 
         aria-label="Game Board"
         [attr.aria-busy]="isLoading">
      
      <button
        type="button"
        [attr.aria-label]="'Place tile ' + tile.letter"
        [attr.aria-disabled]="!canMove"
        (click)="placeTile(tile)">
        {{ tile.letter }}
      </button>
      
      <div role="status" 
           aria-live="polite"
           *ngIf="statusMessage">
        {{ statusMessage }}
      </div>
    </div>
  `
})
```

### Keyboard Navigation

```typescript
// ✅ GOOD - Keyboard support
@Component({
  template: `
    <div class="tile"
         tabindex="0"
         (keydown)="onKeyDown($event)"
         (click)="onSelect()">
      {{ tile.letter }}
    </div>
  `
})
export class TileComponent {
  @Input() tile!: Tile;
  @Output() tileSelected = new EventEmitter<Tile>();
  
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onSelect();
    }
  }
  
  onSelect(): void {
    this.tileSelected.emit(this.tile);
  }
}
```

---

## Responsive Design

### Mobile-First SCSS

```scss
// ✅ GOOD - Mobile-first approach
.game-board {
  // Mobile (default)
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  gap: 2px;
  padding: 8px;
  
  // Tablet
  @media (min-width: 768px) {
    gap: 4px;
    padding: 16px;
  }
  
  // Desktop
  @media (min-width: 1024px) {
    gap: 6px;
    padding: 24px;
    max-width: 800px;
    margin: 0 auto;
  }
}
```

---

## Testing Strategies

### Component Tests

```typescript
// ✅ GOOD - Comprehensive component test
describe('GameBoardComponent', () => {
  let component: GameBoardComponent;
  let fixture: ComponentFixture<GameBoardComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameBoardComponent],
    }).compileComponents();
    
    fixture = TestBed.createComponent(GameBoardComponent);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should render board cells', () => {
    const mockBoard: Board = {
      width: 15,
      height: 15,
      cells: Array(15).fill(null).map((_, row) =>
        Array(15).fill(null).map((_, col) => ({ row, col }))
      )
    };
    
    component.board = mockBoard;
    fixture.detectChanges();
    
    const cells = fixture.nativeElement.querySelectorAll('.board-cell');
    expect(cells.length).toBe(225);
  });
  
  it('should emit tileMoved on valid drop', () => {
    spyOn(component.tileMoved, 'emit');
    
    const event: TileMovedEvent = {
      tileId: 'tile-1',
      position: { row: 7, col: 7 }
    };
    
    component.onTileDrop(event);
    
    expect(component.tileMoved.emit).toHaveBeenCalledWith(event);
  });
  
  it('should not allow move when canMove is false', () => {
    component.canMove = false;
    spyOn(component.tileMoved, 'emit');
    
    component.onTileDrop({ tileId: 'tile-1', position: { row: 7, col: 7 }});
    
    expect(component.tileMoved.emit).not.toHaveBeenCalled();
  });
});
```

### NgRx Tests

```typescript
// ✅ GOOD - Reducer, selector, and effect tests
describe('Game Reducer', () => {
  it('should return initial state', () => {
    const action = { type: 'Unknown' };
    const state = gameReducer(undefined, action);
    
    expect(state).toEqual(initialState);
  });
  
  it('should set loading on createGameRequested', () => {
    const action = GameActions.createGameRequested({ 
      playerName: 'Alice', 
      language: 'en' 
    });
    const state = gameReducer(initialState, action);
    
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });
});

describe('Game Selectors', () => {
  it('should select current player', () => {
    const mockState: GameState = {
      players: [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }],
      currentPlayerIndex: 1
    };
    
    const result = selectCurrentPlayer.projector(mockState);
    expect(result?.name).toBe('Bob');
  });
});

describe('Game Effects', () => {
  let actions$: Observable<Action>;
  let effects: GameEffects;
  let gameService: jasmine.SpyObj<GameService>;
  
  beforeEach(() => {
    gameService = jasmine.createSpyObj('GameService', ['createGame']);
    
    TestBed.configureTestingModule({
      providers: [
        GameEffects,
        provideMockActions(() => actions$),
        { provide: GameService, useValue: gameService }
      ]
    });
    
    effects = TestBed.inject(GameEffects);
  });
  
  it('should dispatch gameCreatedSuccessfully on success', (done) => {
    const game: GameState = { gameId: '123', status: 'waiting', players: [] };
    gameService.createGame.and.returnValue(of(game));
    
    actions$ = of(GameActions.createGameRequested({ 
      playerName: 'Alice', 
      language: 'en' 
    }));
    
    effects.createGame$.subscribe(action => {
      expect(action).toEqual(GameActions.gameCreatedSuccessfully({ game }));
      done();
    });
  });
});
```

---

## Definition of Done (Frontend-Specific)

A frontend feature is complete when:

- ✅ Standalone components used
- ✅ OnPush change detection for non-trivial components
- ✅ NgRx patterns followed (actions, reducers, effects, selectors)
- ✅ Smart/Presentational split implemented
- ✅ TypeScript strict mode with no `any`
- ✅ All subscriptions properly cleaned up
- ✅ Component tests written (>70% coverage)
- ✅ Accessibility attributes added (ARIA labels, keyboard nav)
- ✅ Responsive design implemented (mobile, tablet, desktop)
- ✅ No XSS vulnerabilities
- ✅ No memory leaks
- ✅ Performance optimized (lazy loading, memoization)
- ✅ Lint and format checks pass
- ✅ No console errors or warnings

---

**For questions**: Reference [base copilot-instructions.md](../copilot-instructions.md) or consult [DOMAIN_STRUCTURE.md](../../docs/DOMAIN_STRUCTURE.md)

**Maintained by**: Scrabble at Igel Frontend Team  
**Last Review**: 2026-04-15

