import { Component } from '@angular/core';

@Component({
  selector: 'app-game',
  standalone: true,
  template: `
    <div class="game-container">
      <h1>Game Board</h1>
      <!-- TODO: Implement game board, tile rack, score display -->
    </div>
  `,
  styles: [
    `
      .game-container {
        padding: 20px;
        font-family: Arial, sans-serif;
      }
    `,
  ],
})
export class GameComponent {}

