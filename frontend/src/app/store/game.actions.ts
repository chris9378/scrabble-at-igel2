import { createAction, props } from '@ngrx/store';

// Game Actions
export const createGame = createAction(
  '[Game] Create Game',
  props<{ playerName: string; language: string; aiPlayers?: any }>()
);

export const createGameSuccess = createAction(
  '[Game] Create Game Success',
  props<{ game: any }>()
);

export const createGameFailure = createAction(
  '[Game] Create Game Failure',
  props<{ error: string }>()
);

export const joinGame = createAction(
  '[Game] Join Game',
  props<{ gameId: string; playerName: string }>()
);

export const joinGameSuccess = createAction(
  '[Game] Join Game Success',
  props<{ game: any }>()
);

export const joinGameFailure = createAction(
  '[Game] Join Game Failure',
  props<{ error: string }>()
);

export const startGame = createAction('[Game] Start Game', props<{ gameId: string }>());

export const makeMove = createAction(
  '[Game] Make Move',
  props<{ gameId: string; tiles: any[] }>()
);

export const gameFinished = createAction(
  '[Game] Game Finished',
  props<{ result: any }>()
);

