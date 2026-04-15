import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="home-container">
      <h1>🎲 Scrabble Game</h1>
      <p>Welcome to Scrabble! Create a new game or join an existing one.</p>
      <!-- TODO: Implement game creation and joining UI -->
    </div>
  `,
  styles: [
    `
      .home-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: Arial, sans-serif;
      }
    `,
  ],
})
export class HomeComponent {}

