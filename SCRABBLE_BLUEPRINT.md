# 🎲 Scrabble Game - Project Blueprint

> **A multiplayer word game with AI opponents, supporting German and English dictionaries**

---

## 📋 PURPOSE

### Project Vision
Build a modern, web-based Scrabble game that combines classic gameplay with real-time multiplayer functionality and intelligent AI opponents. The game provides a seamless experience for 2-3 players (human or AI) without requiring user accounts, making it accessible for quick casual gaming sessions.

### Core Objectives
- **Accessibility**: No registration required - instant guest play
- **Multilingual**: Full support for German and English word dictionaries
- **Flexible Gaming**: Mix of human players and AI opponents with varying difficulty levels
- **Real-time Experience**: Live game updates with WebSocket communication
- **Strategic Depth**: Multiple AI difficulty levels (Easy, Medium, Hard)
- **Session-Based**: Games exist only during active play sessions (no persistence)

### Target Audience
- Casual players looking for quick word game sessions
- Friends wanting to play together via private rooms
- Solo players practicing against AI opponents
- Players seeking both relaxed and competitive gameplay

---

## 🛠️ TECH STACK

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 18.x+ | UI Framework |
| **TypeScript** | 5.3+ | Type Safety |
| **Angular CLI** | 18.x+ | Build Tool & Dev Server |
| **Socket.io Client** | 4.7+ | Real-time Communication |
| **NgRx** | 17.x+ | State Management |
| **Angular Animations** | 18.x+ | Animations & Transitions |
| **CDK Drag & Drop** | 18.x+ | Drag & Drop for Tiles |
| **ng-icons** / **Angular Material Icons** | Latest | Icon Library |
| **Axios** | 1.6+ | HTTP Client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime Environment |
| **Express.js** | 4.18+ | Web Framework |
| **TypeScript** | 5.3+ | Type Safety |
| **Socket.io** | 4.7+ | WebSocket Server |
| **PostgreSQL** | 15+ | Dictionary & Configuration Storage |
| **Redis** | 7+ | Active Game State (In-Memory) |
| **Joi** | 17+ | Input Validation |
| **Helmet.js** | 7+ | Security Headers |
| **CORS** | 2.8+ | Cross-Origin Resource Sharing |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **PostgreSQL 15** | Persistent Data Storage |
| **Redis** | In-Memory Cache & Game States |

### Development Tools
- **ts-node-dev**: TypeScript Development Server
- **ESLint**: Code Linting
- **Prettier**: Code Formatting
- **Jest** (optional): Unit Testing
- **Playwright/Cypress** (optional): E2E Testing

---

## 📂 PROJECT STRUCTURE
