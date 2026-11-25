// The Copper Ladle — staged screenshot states. `?shot=<name>` sets the game
// up deterministically so the screenshots show the kitchen at its best:
// a cover mid-service, a rush, a ready-to-serve plate and the title screen.

import { newShift, spawnTicket } from './state.js';
import { takeIngredient } from './kitchen.js';

function seedRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function stageCover(state, now) {
  // Three tickets, stove busy, board chopping, plate half-built, timer mid-shift.
  state.screen = 'playing';
  state.day = 1;
  state.timeLeftMs = 118000;
  state.elapsedMs = 32000;
  state.coins = 84;
  state.served = 5;
  state.combo = 3;
  state.bestCombo = 3;
  const rng = seedRandom(11);
  spawnTicket(state, rng, now - 9000);
  spawnTicket(state, rng, now - 22000);
  spawnTicket(state, rng, now - 30000);
  takeIngredient(state, 'patty', now - 4200);
  takeIngredient(state, 'fish', now - 2600);
  takeIngredient(state, 'tomato', now);
  state.board.chopsLeft = 2;
  state.plate = ['bun', 'cheese', 'lettuce'];
  state.stove[0].startedAt = now - 4200;
  state.stove[1].startedAt = now - 2600;
}

function stageRush(state, now) {
  // Four tickets, one nearly expired, both burners full, timer nearly out.
  state.screen = 'playing';
  state.day = 2;
  state.timeLeftMs = 41000;
  state.elapsedMs = 109000;
  state.coins = 132;
  state.served = 9;
  state.combo = 4;
  state.bestCombo = 5;
  const rng = seedRandom(23);
  spawnTicket(state, rng, now - 42000);
  spawnTicket(state, rng, now - 30000);
  spawnTicket(state, rng, now - 18000);
  spawnTicket(state, rng, now - 6000);
  state.tickets[0].patienceMs = 52000;
  takeIngredient(state, 'egg', now - 4800);
  takeIngredient(state, 'pasta', now - 6100);
  takeIngredient(state, 'tomato', now);
  state.plate = ['bun', 'fish', 'lettuce'];
}

function stageServe(state, now) {
  // A finished plate that matches the first ticket exactly: green READY.
  state.screen = 'playing';
  state.day = 1;
  state.timeLeftMs = 94000;
  state.elapsedMs = 56000;
  state.coins = 118;
  state.served = 7;
  state.combo = 2;
  state.bestCombo = 4;
  const rng = seedRandom(37);
  spawnTicket(state, rng, now - 12000);
  spawnTicket(state, rng, now - 25000);
  const first = state.tickets[0];
  state.plate = [...first.recipe.needs];
  takeIngredient(state, 'fish', now - 3000);
  state.stove[0].startedAt = now - 3000;
}

function stageTitle(state) {
  state.screen = 'title';
}

const STAGES = { cover: stageCover, rush: stageRush, serve: stageServe, title: stageTitle };

export function applyShot(state, params) {
  const name = params.get('shot');
  if (!name || !STAGES[name]) return false;
  const seed = Number(params.get('seed') || '1');
  const now = performance.now();
  const staged = newShift(state.day || 1);
  Object.assign(state, staged);
  state.day = name === 'rush' ? 2 : 1;
  STAGES[name](state, now);
  window.__shotReady = true;
  return true;
}

export function shotNames() {
  return Object.keys(STAGES);
}
