# 🎲 Scrabble Game - Project Setup

Ein modernes, webbasiertes Scrabble-Spiel mit Multiplayer-Unterstützung, KI-Gegnern und Real-Time-Kommunikation.

## 🚀 Quick Start

### Voraussetzungen
- Node.js 18+ und npm
- PostgreSQL 15+
- Redis 7+

### Installation

1. **Abhängigkeiten installieren:**
```bash
npm install
```

2. **Umgebungsvariablen konfigurieren:**
```bash
cp .env.example .env
```

3. **Backend starten:**
```bash
npm run dev:backend
```

4. **Frontend starten (in separatem Terminal):**
```bash
npm run dev:frontend
```

Die Anwendung ist dann unter `http://localhost:4200` verfügbar.

## 📁 Projektstruktur

```
scrabble-at-igel/
├── frontend/              # Angular 18 Frontend-Anwendung
│   ├── src/
│   │   ├── app/          # Angular-Komponenten, Services, Guards
│   │   ├── assets/       # Bilder, Icons, Wörterbücher
│   │   ├── styles/       # Global Styles
│   │   └── main.ts       # Entry Point
│   ├── angular.json      # Angular-Build-Konfiguration
│   └── package.json
│
├── backend/               # Express.js Backend-Anwendung
│   ├── src/
│   │   ├── controllers/  # Request Handler
│   │   ├── services/     # Business Logic
│   │   ├── middleware/   # Custom Middleware
│   │   ├── routes/       # API Routes
│   │   ├── types/        # TypeScript Types
│   │   ├── sockets/      # Socket.io Handler
│   │   └── app.ts        # Express App
│   ├── tests/            # Unit & Integration Tests
│   └── package.json
│
├── shared/                # Gemeinsame Types & Utils
│   └── types.ts          # Shared TypeScript Interfaces
│
├── docs/                  # Dokumentation
│   ├── SETUP.md          # Detaillierte Setup-Anleitung
│   ├── API.md            # API-Dokumentation
│   └── ARCHITECTURE.md   # Architektur-Überblick
│
├── .env.example          # Template für Umgebungsvariablen
├── package.json          # Root Workspace Configuration
├── tsconfig.json         # Root TypeScript Config
└── SCRABBLE_BLUEPRINT.md # Projekt-Blueprint
```

## 📦 Tech Stack

### Frontend
- **Angular** 18.x+ - UI Framework
- **TypeScript** 5.3+ - Type Safety
- **NgRx** 17.x+ - State Management
- **Socket.io Client** 4.7+ - Real-time Communication
- **Angular CDK** 18.x+ - Drag & Drop

### Backend
- **Node.js** 18+ - Runtime
- **Express.js** 4.18+ - Web Framework
- **Socket.io** 4.7+ - WebSocket Server
- **PostgreSQL** 15+ - Datenbank
- **Redis** 7+ - In-Memory Cache

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Beide Anwendungen starten
npm run dev:frontend    # Nur Frontend
npm run dev:backend     # Nur Backend

# Build
npm run build           # Beide Anwendungen bauen
npm run build:frontend  # Nur Frontend
npm run build:backend   # Nur Backend

# Linting & Formatting
npm run lint            # Alle Dateien linted
npm run format          # Code formatieren
npm run format:check    # Check ohne Formatieren

# Tests
npm run test            # Tests ausführen
npm run test:frontend   # Frontend Tests
npm run test:backend    # Backend Tests

# Database
npm run db:setup        # Datenbank initialisieren
npm run db:migrate      # Migrations ausführen
```

## 🗄️ Datenbank & Cache Setup

### PostgreSQL
```bash
# Docker-Container (optional)
docker run --name postgres15 \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15
```

### Redis
```bash
# Docker-Container (optional)
docker run --name redis7 \
  -p 6379:6379 \
  redis:7
```

## 📖 Dokumentation

Siehe `docs/` Verzeichnis für detaillierte Dokumentation zu:
- Projekteinrichtung und Konfiguration
- Backend API-Spezifikation
- Frontend-Architektur und State Management
- Socket.io Events und Real-Time Kommunikation

## 👨‍💻 Development

### Code Style
- ESLint für Linting
- Prettier für Code Formatting
- TypeScript Strict Mode aktiviert

### IDE Empfehlungen
- Visual Studio Code mit Extensions:
  - ESLint
  - Prettier
  - Angular Language Service
  - Thunder Client (für API Testing)

## 🤝 Contributing

1. Branch von `main` erstellen
2. Feature/Fix implementieren
3. Tests schreiben
4. Pull Request erstellen

## 📝 Lizenz

MIT

