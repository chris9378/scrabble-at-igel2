// Scrabble Tile Points
export const TILE_POINTS: Record<string, number> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
  // German special characters
  Ä: 6,
  Ö: 8,
  Ü: 6,
  ß: 2,
};

// Game Constants
export const BOARD_SIZE = 15;
export const RACK_SIZE = 7;
export const INITIAL_TILES_COUNT = 100;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 3;
export const GAME_SESSION_TIMEOUT = 3600000; // 1 hour

// AI Difficulty
export const AI_DIFFICULTY_DELAY = {
  easy: 1000,
  medium: 2000,
  hard: 3000,
};

// Languages
export const SUPPORTED_LANGUAGES = ['en', 'de'];
export const DEFAULT_LANGUAGE = 'en';

