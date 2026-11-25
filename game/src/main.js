// The Copper Ladle — boot and game loop: owns the canvas, the shift clock,
// screen changes and the bridge to the screenshot stager.

import { VIEW_H, VIEW_W } from './config.js';
import { sfx, setMuted } from './audio.js';
import { attachInput } from './input.js';
import { tickStations } from './kitchen.js';
import { renderFrame } from './render.js';
import { applyShot } from './shots.js';
import { newShift, tickShift } from './state.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let state = newShift(1);
let lastTick = performance.now();
let rngState = 1234567;

function rng() {
  rngState = (rngState * 1664525 + 1013904223) >>> 0;
  return rngState / 4294967296;
}

// The state object is mutated in place (never replaced) so the input
// handlers attached below always see the live shift.
function resetShift(day) {
  const muted = state.muted;
  const fresh = newShift(day);
  for (const key of Object.keys(state)) delete state[key];
  Object.assign(state, fresh);
  state.muted = muted;
  setMuted(muted);
  state.screen = 'playing';
  lastTick = performance.now();
}

function startShift() {
  resetShift(state.day);
}

function restartDay() {
  startShift();
}

function nextDay() {
  resetShift(state.day + 1);
}

function continueFromEnd() {
  if (state.screen === 'dayEnd') nextDay();
  else restartDay();
}

function togglePause() {
  if (state.screen === 'playing') state.screen = 'paused';
  else if (state.screen === 'paused') {
    state.screen = 'playing';
    lastTick = performance.now();
  }
}

attachInput(canvas, state, { startShift, restartDay, nextDay, continueFromEnd, togglePause });

// A staged screenshot (?shot=cover|rush|serve|title) replaces the live state.
const params = new URLSearchParams(window.location.search);
const staged = applyShot(state, params);
if (!staged) {
  window.__shotReady = true;
}

window.__game = {
  get state() {
    return state;
  },
  startShift,
  restartDay,
  nextDay,
  togglePause,
};

function frame(now) {
  const dt = Math.min(100, now - lastTick);
  lastTick = now;
  if (state.screen === 'playing') {
    const before = state.screen;
    tickShift(state, dt, now, rng);
    tickStations(state, now);
    if (state.screen !== before) {
      if (state.screen === 'dayEnd') sfx.win();
      else if (state.screen === 'gameOver') sfx.lost();
    }
    if (state.shakeMs > 0) state.shakeMs = Math.max(0, state.shakeMs - dt);
  }
  renderFrame(ctx, state, now);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
