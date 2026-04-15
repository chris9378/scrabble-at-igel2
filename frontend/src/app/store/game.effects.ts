import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as GameActions from './game.actions';
import { GameService } from '../services/game.service';

@Injectable()
export class GameEffects {
  createGame$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.createGame),
      map(({ playerName, language, aiPlayers }) => {
        this.gameService.createGame(playerName, language as 'en' | 'de', aiPlayers);
        return GameActions.createGameSuccess({ game: {} });
      }),
      catchError((error) => of(GameActions.createGameFailure({ error: error.message })))
    )
  );

  joinGame$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.joinGame),
      map(({ gameId, playerName }) => {
        this.gameService.joinGame(gameId, playerName);
        return GameActions.joinGameSuccess({ game: {} });
      }),
      catchError((error) => of(GameActions.joinGameFailure({ error: error.message })))
    )
  );

  constructor(private actions$: Actions, private gameService: GameService) {}
}

