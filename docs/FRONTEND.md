# 🎨 Frontend Architecture & Setup

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components (Home, Game)
│   │   ├── services/        # API & Socket.io services
│   │   ├── store/           # NgRx state management
│   │   ├── guards/          # Route guards
│   │   ├── app.component.ts # Root component
│   │   ├── app.routes.ts    # Route configuration
│   │   └── app.config.ts    # App providers
│   ├── assets/              # Images, icons, dictionaries
│   ├── environments/        # Environment configurations
│   ├── styles.scss          # Global styles
│   └── main.ts              # Bootstrap
├── angular.json             # Angular CLI config
├── tsconfig.app.json        # TypeScript config
├── proxy.conf.json          # Dev server proxy
└── package.json             # Dependencies
```

## Technology Stack

### Core Framework
- **Angular 18.x**: Modern component-based framework
- **TypeScript 5.3+**: Strong typing and OOP features
- **RxJS**: Reactive programming with Observables

### State Management
- **NgRx 17.x**: Redux-like state management
  - `store/`: Central state store
  - `actions/`: Dispatched events
  - `reducers/`: State mutations
  - `effects/`: Side effects handling
  - `selectors/`: State queries

### Real-time Communication
- **Socket.io Client 4.7+**: WebSocket client for real-time updates

### UI & Interactions
- **Angular CDK 18.x**: Drag & Drop utilities
- **Angular Animations**: Smooth transitions
- **Native Angular Material Icons**: Icon library (or ng-icons)

### HTTP Client
- **Axios**: Promise-based HTTP requests
- **API Service**: Centralized API communication

## Project Features

### Pages

#### Home Page
- Game creation form
- Game joining interface
- Player setup (Human/AI selection)
- Language selection (EN/DE)

#### Game Page
- Interactive board (15x15 grid)
- Tile rack with drag & drop
- Score display
- Move history
- Chat interface
- Game status/turn indicator

### Services

#### SocketService
- WebSocket connection management
- Event emission and listening
- Automatic reconnection logic

#### GameService
- Game creation and joining
- Move submission
- Turn management
- Game state subscriptions

#### ApiService
- Centralized HTTP requests
- Error handling
- Base URL configuration

### State Management (NgRx)

#### Game Store
- `gameState`: Current game data
- `players`: Active players
- `board`: Board state
- `scores`: Player scores
- `loading`: Loading state
- `error`: Error messages

#### Actions
- `createGame`: Initiate new game
- `joinGame`: Join existing game
- `makeMove`: Submit player move
- `gameFinished`: Handle game completion

#### Effects
- Listen to Socket.io events
- Dispatch actions on game updates
- Handle async operations

## Development Workflow

### Starting Development Server

```bash
# Install dependencies
npm install

# Start development server
npm start

# The app will be available at http://localhost:4200
# Backend proxy is configured at http://localhost:3000
```

### Building for Production

```bash
# Build optimized production bundle
npm run build

# Output in dist/ directory with tree-shaking and minification
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code with Prettier
npm run format

# Check formatting
npm run format:check

# Run tests
npm test
```

## Component Development Guide

### Creating a New Component

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.scss'],
})
export class MyComponent {
  // Component logic here
}
```

### Using Services

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MyService {
  constructor(private gameService: GameService) {}

  // Service methods
}
```

### Dispatching Actions

```typescript
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as GameActions from '../store/game.actions';

@Component({
  selector: 'app-my-component',
  standalone: true,
})
export class MyComponent {
  constructor(private store: Store) {}

  createGame(): void {
    this.store.dispatch(
      GameActions.createGame({
        playerName: 'John',
        language: 'en',
      })
    );
  }
}
```

## Features to Implement

### Phase 1 - Core Gameplay
- [x] Project setup and configuration
- [ ] Game board component
- [ ] Tile rack component
- [ ] Move validation UI
- [ ] Score tracking

### Phase 2 - Real-time Multiplayer
- [ ] Socket.io integration
- [ ] Player status display
- [ ] Live turn management
- [ ] Chat component

### Phase 3 - AI Opponents
- [ ] AI player logic integration
- [ ] Difficulty level selection
- [ ] AI move display

### Phase 4 - Polish & Features
- [ ] Game history
- [ ] Player statistics
- [ ] Mobile responsiveness
- [ ] Accessibility improvements

## Styling

### Global Styles
Located in `src/styles.scss`:
- Reset and base styles
- Typography
- Utility classes
- Component-level overrides

### Component Styles
- Use component-scoped SCSS
- BEM naming convention recommended
- Responsive design with mobile-first approach

## Performance Optimization

1. **Lazy Loading**: Route-based code splitting
2. **Change Detection**: OnPush strategy for components
3. **Virtual Scrolling**: For large lists (if needed)
4. **Tree Shaking**: Unused code elimination in production
5. **NgRx Memoization**: Selector memoization for performance

## Debugging

### Angular DevTools
- Install Angular DevTools extension
- Inspect component hierarchy
- Monitor state changes in NgRx Store

### Network Debugging
- Use Browser DevTools Network tab
- Monitor WebSocket connections
- Inspect API requests

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

