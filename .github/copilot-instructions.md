# Copilot Instructions - scrabble-at-igel

## Project Context

This repository contains a session-based, multiplayer Scrabble game with optional AI opponents.
Key constraints and goals:

- No user accounts; guest flow only
- 2-3 players (human and/or AI)
- Languages: English (`en`) and German (`de`)
- Real-time gameplay via Socket.io
- Active game state is ephemeral (Redis), no long-term gameplay persistence required
- Frontend: Angular + TypeScript + NgRx
- Backend: Node.js + Express + TypeScript + Socket.io
- Infrastructure services: PostgreSQL + Redis
- No Docker-specific assumptions in generated code or docs

---

## General Engineering Principles

- Prefer clarity over cleverness.
- Make small, focused changes.
- Keep behavior explicit; avoid hidden side effects.
- Default to strict typing and predictable state transitions.
- Validate all external input at boundaries (HTTP and Socket events).
- Keep UI responsive and resilient to temporary network issues.

---

## Coding Standards (All Code)

### TypeScript

- Use strict TypeScript settings.
- Avoid `any`; use explicit interfaces/types.
- Prefer discriminated unions for status/state modeling.
- Use `readonly` where mutation is not intended.
- Export shared contracts from shared modules instead of redefining local copies.

### Naming

- Use descriptive, domain-driven names (`GameState`, `PlaceTilesCommand`, `validateWord`).
- Booleans: prefix with `is/has/can/should`.
- Event handlers: `handleXxx`.
- Async methods: verb-first names (`createGame`, `joinRoom`, `calculateMoveScore`).

### Imports and Module Boundaries

- Keep imports grouped: framework -> third-party -> internal.
- Do not use deep imports across feature boundaries.
- Keep frontend and backend concerns separated.
- Put reusable contracts/types in shared modules.

### Error Handling

- Never swallow errors.
- Convert low-level errors into user-safe/domain-safe messages.
- Return consistent error structures for REST and Socket events.
- Include correlation/request IDs in logs when available.

### Logging

- Backend: structured logs only (no noisy console dumping in production paths).
- Log at appropriate levels (`debug`, `info`, `warn`, `error`).
- Do not log secrets, tokens, passwords, or full connection strings.

---

## Frontend Standards (Angular)

### Angular Architecture

- Prefer standalone components.
- Organize by feature (`game`, `lobby`, `chat`, `shared/ui`) rather than by file type only.
- Keep components presentational when possible; move orchestration to facades/services.
- Use `OnPush` change detection for non-trivial components.

### State Management (NgRx)

- Use NgRx for shared, cross-component game state.
- Keep store state serializable.
- Actions describe intent, not implementation details.
- Reducers must stay pure and synchronous.
- Effects handle side effects (API/socket calls, timers, persistence).
- Use selectors for all state reads from components (no ad-hoc store shape access).

### UI and Interaction Patterns

- Use Angular CDK Drag & Drop for tile interactions.
- Keep drag/drop logic deterministic and testable.
- Optimistically update UI only when rollback strategy is defined.
- Disable conflicting actions while a move is pending.

### Frontend Networking

- Centralize HTTP logic in API services.
- Centralize Socket.io logic in a socket gateway/service.
- Handle reconnects gracefully and re-sync game state after reconnect.
- Define typed payloads for outgoing and incoming events.

---

## Backend Standards (Express + Socket.io)

### Layering

Use a clear layered structure:

- Routes/Socket handlers: transport concerns only
- Controllers/Handlers: request orchestration
- Services: business rules and game logic
- Repositories/Clients: PostgreSQL/Redis access

Do not place business logic directly inside routes or socket callbacks.

### Validation and Contracts

- Validate all REST payloads and socket payloads (Joi or equivalent).
- Reject unknown fields where appropriate.
- Fail fast on invalid input with clear error codes.

### Game and Session Rules

- Treat Redis as source of truth for active games.
- Keep turn transitions atomic and validated.
- Prevent duplicate move submission for same turn.
- Enforce player count and game lifecycle rules (`waiting`, `active`, `finished`).

### Concurrency and Reliability

- Guard against race conditions for simultaneous moves.
- Use idempotency strategies where practical for repeated client events.
- Ensure socket room membership is consistent with game membership.

---

## API and Event Conventions

### REST API

- Use resource-oriented routes (`/api/games`, `/api/games/:id`).
- Keep response envelope consistent:
  - `success`
  - `data` (on success)
  - `error` with stable `code` and safe `message` (on failure)
  - `timestamp`

### Socket.io Events

Use namespaced event naming:

- Client -> Server: `game:create`, `game:join`, `game:move`, `game:pass`, `chat:send`
- Server -> Client: `game:created`, `game:updated`, `game:error`, `chat:message`

Event naming rules:

- `namespace:action`
- past-tense for server notifications when action has completed
- payloads must be typed and version-safe

---

## Testing Standards

### Backend

- Unit test core game services (move validation, scoring, turn handling).
- Integration test critical API and socket flows.
- Cover invalid input and edge cases (language mismatch, out-of-turn move, stale session).
- Prefer deterministic tests; avoid timing-sensitive flakiness.

### Frontend

- Unit test reducers, selectors, and effects.
- Component tests for major game UI interactions.
- Mock sockets/API in tests; do not depend on real services.
- Add E2E tests for primary user journeys when stable:
  - create game
  - join game
  - place valid move
  - pass/exchange
  - finish game

---

## Security Checklist

- Validate and sanitize all external input.
- Keep CORS restricted to configured frontend origins.
- Apply secure headers with Helmet.
- Do not expose stack traces to clients in production.
- Store secrets in environment variables only.
- Rate limiting should be considered for public endpoints and socket abuse protection.

---

## Performance Checklist

- Avoid unnecessary full-board recalculations on each action.
- Use memoized selectors in NgRx.
- Minimize socket payload size; send deltas when practical.
- Avoid N+1 queries against PostgreSQL.
- Cache read-heavy dictionary lookups where appropriate.
- Profile before optimizing; document known bottlenecks.

---

## Git and PR Workflow

### Branching

- Branch naming:
  - `feat/<short-description>`
  - `fix/<short-description>`
  - `chore/<short-description>`
  - `test/<short-description>`

### Commit Messages

Use Conventional Commits:

- `feat: ...`
- `fix: ...`
- `refactor: ...`
- `test: ...`
- `docs: ...`
- `chore: ...`

### Pull Requests

Each PR should include:

- Problem statement
- Scope and non-goals
- Screenshots/GIFs for UI changes
- Test evidence (unit/integration/e2e as applicable)
- Risk notes and rollback considerations

---

## Definition of Done (DoD)

A change is done when:

- Code follows the standards above
- Types are strict and no unjustified `any` is introduced
- Lint/format checks pass
- Relevant tests are added/updated and pass
- Error paths are handled and logged safely
- Documentation is updated when behavior/contracts change
- No secrets, debug leftovers, or dead code remain

---

## Anti-Patterns to Avoid

- Business logic inside Angular components or Express routes
- Unstructured global mutable state
- Silent catch blocks
- Socket events without schema validation
- Tight coupling between UI and backend response shape without typed contracts
- Large “god” services/components with mixed responsibilities
