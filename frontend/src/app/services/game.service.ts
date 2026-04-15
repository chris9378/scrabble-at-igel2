import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor(private socketService: SocketService) {}

  createGame(playerName: string, language: 'en' | 'de', aiPlayers?: any): void {
    this.socketService.emit('game:create', {
      playerName,
      language,
      aiPlayers,
    });
  }

  joinGame(gameId: string, playerName: string): void {
    this.socketService.emit('game:join', {
      gameId,
      playerName,
    });
  }

  startGame(gameId: string): void {
    this.socketService.emit('game:start', gameId);
  }

  makeMove(gameId: string, tiles: any[]): void {
    this.socketService.emit('game:move', {
      gameId,
      tiles,
    });
  }

  passMove(gameId: string): void {
    this.socketService.emit('game:pass', gameId);
  }

  exchangeTiles(gameId: string, tileIds: string[]): void {
    this.socketService.emit('game:exchange-tiles', {
      gameId,
      tileIds,
    });
  }

  leaveGame(gameId: string): void {
    this.socketService.emit('game:leave', gameId);
  }

  onGameCreated(callback: (game: any) => void): void {
    this.socketService.on('game:created', callback);
  }

  onGameJoined(callback: (game: any) => void): void {
    this.socketService.on('game:joined', callback);
  }

  onGameStarted(callback: (game: any) => void): void {
    this.socketService.on('game:started', callback);
  }

  onPlayerMoved(callback: (game: any) => void): void {
    this.socketService.on('game:player-moved', callback);
  }

  onTurnChanged(callback: (player: any) => void): void {
    this.socketService.on('game:turn-changed', callback);
  }

  onGameFinished(callback: (result: any) => void): void {
    this.socketService.on('game:finished', callback);
  }

  onGameError(callback: (error: any) => void): void {
    this.socketService.on('game:error', callback);
  }
}

