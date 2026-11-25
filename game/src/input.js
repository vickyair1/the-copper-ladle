// The Copper Ladle — input: mouse clicks on the kitchen and keyboard
// shortcuts for ingredients, serving, pause, mute and restart.

import { INGREDIENTS } from './config.js';
import { clickAt, clickTopBar, takeIngredient, tryServe } from './kitchen.js';
import { anyTicketReady } from './kitchen.js';
import { sfx, setMuted, unlockAudio } from './audio.js';

export function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * 1280,
    y: ((event.clientY - rect.top) / rect.height) * 720,
  };
}

export function attachInput(canvas, state, hooks) {
  canvas.addEventListener('click', (event) => {
    unlockAudio();
    const now = performance.now();
    const { x, y } = canvasPoint(canvas, event);
    if (state.screen === 'title') {
      hooks.startShift();
      sfx.click();
      return;
    }
    if (state.screen === 'dayEnd' || state.screen === 'gameOver') {
      hooks.continueFromEnd();
      sfx.click();
      return;
    }
    const bar = clickTopBar(state, x, y);
    if (bar === 'pause') {
      hooks.togglePause();
      sfx.click();
      return;
    }
    if (bar === 'mute') {
      state.muted = !state.muted;
      setMuted(state.muted);
      return;
    }
    if (state.screen === 'paused') {
      hooks.togglePause();
      return;
    }
    const result = clickAt(state, x, y, now);
    if (result === 'serve') sfx.serve();
    else if (result === 'mistake') sfx.mistake();
    else if (result === 'chop') sfx.chop();
    else if (result === 'collect') sfx.ding();
    else if (result === 'take') sfx.take();
    else if (result === 'full') sfx.mistake();
  });

  window.addEventListener('keydown', (event) => {
    const now = performance.now();
    if (event.key === 'm' || event.key === 'M') {
      state.muted = !state.muted;
      setMuted(state.muted);
      return;
    }
    if (state.screen === 'title' && (event.key === 'Enter' || event.key === ' ')) {
      hooks.startShift();
      return;
    }
    if ((state.screen === 'dayEnd' || state.screen === 'gameOver') && event.key === 'r') {
      hooks.restartDay();
      return;
    }
    if (state.screen === 'dayEnd' && event.key === 'n') {
      hooks.nextDay();
      return;
    }
    if (event.key === 'p' || event.key === 'P') {
      hooks.togglePause();
      return;
    }
    if (event.key === 'r' || event.key === 'R') {
      if (state.screen === 'playing' || state.screen === 'paused') hooks.restartDay();
      return;
    }
    if (state.screen !== 'playing') return;
    if (event.key === ' ') {
      event.preventDefault();
      const ready = state.tickets.find((t) => {
        const counts = {};
        for (const id of state.plate) counts[id] = (counts[id] || 0) + 1;
        return t.recipe.needs.every((id) => (counts[id] || 0) > 0) &&
          t.recipe.needs.length === state.plate.length;
      });
      if (ready) {
        if (tryServe(state, ready.uid, now)) sfx.serve();
        else sfx.mistake();
      }
      return;
    }
    const ids = Object.keys(INGREDIENTS);
    const index = ids.findIndex((id) => INGREDIENTS[id].key === event.key);
    if (index >= 0) {
      unlockAudio();
      if (takeIngredient(state, ids[index], now)) sfx.take();
      else sfx.mistake();
    }
  });
}

export { anyTicketReady };
