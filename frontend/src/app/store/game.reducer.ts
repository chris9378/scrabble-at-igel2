import { createReducer, on } from '@ngrx/store';
import * as GameActions from './game.actions';

export interface GameState {
  games: Map<string, any>;
  currentGame: any | null;
  loading: boolean;
  error: string | null;
}

export const initialState: GameState = {
  games: new Map(),
  currentGame: null,
  loading: false,
  error: null,
};

export const gameReducer = createReducer(
  initialState,
  on(GameActions.createGame, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(GameActions.createGameSuccess, (state, { game }) => ({
    ...state,
    currentGame: game,
    loading: false,
  })),
  on(GameActions.createGameFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(GameActions.joinGameSuccess, (state, { game }) => ({
    ...state,
    currentGame: game,
    loading: false,
  })),
  on(GameActions.joinGameFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);

