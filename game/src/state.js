// The Copper Ladle — shift state: tickets, stations, plate, score and hearts.
// One shift is a timed service; the day ends when the timer runs out.

import {
  INGREDIENTS, MAX_HEARTS, MAX_TICKETS, SHIFT_SECONDS,
  patienceFor, recipesFor, spawnGapFor, starsFor,
} from './config.js';

let ticketSeq = 0;

export function newShift(day) {
  return {
    screen: 'title', // title | playing | paused | dayEnd | gameOver
    day,
    timeLeftMs: SHIFT_SECONDS * 1000,
    elapsedMs: 0,
    coins: 0,
    served: 0,
    lost: 0,
    mistakes: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    tickets: [],
    stove: [null, null], // { id, startedAt, cookMs, burnt }
    board: null, // { id, chopsLeft }
    plate: [], // finished ingredient ids, bottom to top
    selectedBin: null,
    nextSpawnMs: 2500,
    floaters: [], // { x, y, text, color, born, lifeMs }
    particles: [], // { x, y, vx, vy, born, lifeMs, color, size }
    shakeMs: 0,
    message: null, // { text, sub, born }
    muted: false,
    stars: 0,
  };
}

export function pickRecipe(day, rng) {
  const pool = recipesFor(day);
  return pool[Math.floor(rng() * pool.length)];
}

export function spawnTicket(state, rng, now) {
  if (state.tickets.length >= MAX_TICKETS) return;
  const recipe = pickRecipe(state.day, rng);
  state.tickets.push({
    uid: ++ticketSeq,
    recipe,
    born: now,
    patienceMs: patienceFor(state.day),
    servedAt: null,
  });
}

export function ticketPatienceLeft(ticket, now) {
  return Math.max(0, ticket.patienceMs - (now - ticket.born));
}

export function ticketIsReady(state, ticket) {
  const counts = {};
  for (const id of state.plate) counts[id] = (counts[id] || 0) + 1;
  const want = {};
  for (const id of ticket.recipe.needs) want[id] = (want[id] || 0) + 1;
  const keys = new Set([...Object.keys(counts), ...Object.keys(want)]);
  for (const k of keys) if ((counts[k] || 0) !== (want[k] || 0)) return false;
  return true;
}

export function plateHas(state, id) {
  return state.plate.includes(id);
}

export function addFloater(state, x, y, text, color) {
  state.floaters.push({ x, y, text, color, born: performance.now(), lifeMs: 1100 });
}

export function addSteam(state, x, y) {
  for (let i = 0; i < 3; i++) {
    state.particles.push({
      x: x + (Math.random() - 0.5) * 40,
      y,
      vx: (Math.random() - 0.5) * 12,
      vy: -28 - Math.random() * 18,
      born: performance.now(),
      lifeMs: 900 + Math.random() * 500,
      color: 'rgba(255,255,255,0.55)',
      size: 5 + Math.random() * 6,
    });
  }
}

export function serveTicket(state, ticket, now) {
  const left = ticketPatienceLeft(ticket, now);
  const tipRatio = left / ticket.patienceMs;
  const tip = Math.round(ticket.recipe.price * 0.5 * tipRatio);
  const comboBonus = state.combo >= 2 ? Math.min(6, state.combo) : 0;
  const earned = ticket.recipe.price + tip + comboBonus;
  state.coins += earned;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.tickets = state.tickets.filter((t) => t.uid !== ticket.uid);
  state.plate = [];
  return { earned, tip, comboBonus };
}

export function loseTicket(state, ticket) {
  state.tickets = state.tickets.filter((t) => t.uid !== ticket.uid);
  state.lost += 1;
  state.hearts -= 1;
  state.combo = 0;
  state.shakeMs = 260;
}

export function registerMistake(state) {
  state.mistakes += 1;
  state.combo = 0;
  state.shakeMs = 260;
}

export function finishShift(state) {
  state.stars = starsFor(state.coins, state.day);
  state.screen = state.hearts <= 0 ? 'gameOver' : 'dayEnd';
}

export function tickShift(state, dtMs, now, rng) {
  if (state.screen !== 'playing') return;
  state.elapsedMs += dtMs;
  state.timeLeftMs -= dtMs;
  state.nextSpawnMs -= dtMs;
  if (state.nextSpawnMs <= 0) {
    spawnTicket(state, rng, now);
    state.nextSpawnMs = spawnGapFor(state.day, state.elapsedMs / 1000);
  }
  for (const ticket of [...state.tickets]) {
    if (ticketPatienceLeft(ticket, now) <= 0) loseTicket(state, ticket);
  }
  if (state.hearts <= 0 || state.timeLeftMs <= 0) finishShift(state);
}

export function stoveItemDone(item, now) {
  return item && now - item.startedAt >= item.cookMs;
}

export function stoveItemBurnt(item, now) {
  return item && now - item.startedAt >= item.cookMs * 1.8;
}

export function ingredientLabel(id) {
  return INGREDIENTS[id].name;
}
