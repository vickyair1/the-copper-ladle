// The Copper Ladle — kitchen actions: taking ingredients, cooking, chopping,
// plating and serving. Every click in the game funnels through here.

import { INGREDIENTS, LAYOUT, binRect, boardSlotRect, plateRect, stoveSlotRect, ticketRect } from './config.js';
import {
  addFloater, addSteam, loseTicket, registerMistake, serveTicket,
  stoveItemBurnt, stoveItemDone, ticketIsReady, ticketPatienceLeft,
} from './state.js';

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function stoveSlotAt(px, py) {
  for (let i = 0; i < 2; i++) {
    if (pointInRect(px, py, stoveSlotRect(i))) return i;
  }
  return -1;
}

export function takeIngredient(state, id, now) {
  const def = INGREDIENTS[id];
  if (!def) return false;
  if (def.prep === 'ready') {
    state.plate.push(id);
    return true;
  }
  if (def.prep === 'stove') {
    const free = state.stove.findIndex((s) => s === null);
    if (free === -1) return false;
    state.stove[free] = { id, startedAt: now, cookMs: def.cookMs, burnt: false };
    return true;
  }
  if (def.prep === 'board') {
    if (state.board) return false;
    state.board = { id, chopsLeft: def.chops };
    return true;
  }
  return false;
}

export function collectStove(state, slot, now) {
  const item = state.stove[slot];
  if (!item) return false;
  if (stoveItemBurnt(item, now)) {
    state.stove[slot] = null;
    registerMistake(state);
    state.message = { text: 'Burnt! Tossed it.', sub: 'Watch the ring — collect while it is golden.', born: now };
    return false;
  }
  if (!stoveItemDone(item, now)) {
    state.shakeMs = 160;
    return false;
  }
  state.stove[slot] = null;
  state.plate.push(item.id);
  return true;
}

export function chopBoard(state, now) {
  const item = state.board;
  if (!item) return false;
  item.chopsLeft -= 1;
  if (item.chopsLeft <= 0) {
    state.board = null;
    state.plate.push(item.id);
  }
  return true;
}

export function removeFromPlate(state, index) {
  if (index < 0 || index >= state.plate.length) return false;
  state.plate.splice(index, 1);
  return true;
}

export function tryServe(state, ticketUid, now) {
  const ticket = state.tickets.find((t) => t.uid === ticketUid);
  if (!ticket) return false;
  if (!ticketIsReady(state, ticket)) {
    registerMistake(state);
    state.message = { text: 'Not that order yet!', sub: 'The plate must match the ticket exactly.', born: now };
    return false;
  }
  const rect = ticketRect(state.tickets.indexOf(ticket));
  const result = serveTicket(state, ticket, now);
  addFloater(state, rect.x + rect.w / 2, rect.y + 20, `+$${result.earned}`, '#ffd166');
  if (result.tip > 0) addFloater(state, rect.x + rect.w / 2, rect.y + 44, `tip $${result.tip}`, '#9be29b');
  return true;
}

export function clickAt(state, px, py, now) {
  if (state.screen !== 'playing') return 'none';
  // Serving: click a ticket to hand the plate over.
  for (let i = 0; i < state.tickets.length; i++) {
    if (pointInRect(px, py, ticketRect(i))) {
      return tryServe(state, state.tickets[i].uid, now) ? 'serve' : 'mistake';
    }
  }
  // Stove: click a cooking slot to collect it when done.
  const slot = stoveSlotAt(px, py);
  if (slot >= 0) {
    return collectStove(state, slot, now) ? 'collect' : 'wait';
  }
  // Chopping board: click to chop.
  if (pointInRect(px, py, boardSlotRect())) {
    return chopBoard(state, now) ? 'chop' : 'none';
  }
  // Plate: click an ingredient on the plate to take it back off.
  const pr = plateRect();
  if (pointInRect(px, py, pr)) {
    const index = state.plate.length - 1 - Math.floor((pr.y + pr.h - py) / 16);
    if (removeFromPlate(state, index)) return 'unplate';
  }
  // Ingredient bins along the bottom.
  const ids = Object.keys(INGREDIENTS);
  for (let i = 0; i < ids.length; i++) {
    if (pointInRect(px, py, binRect(i))) {
      const ok = takeIngredient(state, ids[i], now);
      if (!ok) {
        state.shakeMs = 140;
        return 'full';
      }
      return 'take';
    }
  }
  return 'none';
}

export function clickTopBar(state, px, py) {
  // Pause and mute live in the top-right corner.
  const pause = { x: 1160, y: 12, w: 52, h: 38 };
  const mute = { x: 1096, y: 12, w: 52, h: 38 };
  if (pointInRect(px, py, pause)) return 'pause';
  if (pointInRect(px, py, mute)) return 'mute';
  return null;
}

export function tickStations(state, now) {
  for (const item of state.stove) {
    if (item && stoveItemDone(item, now) && !stoveItemBurnt(item, now)) {
      if (Math.random() < 0.06) addSteam(state, LAYOUT.stove.x + 84, LAYOUT.stove.y + 70);
    }
  }
  // Burnt items announce themselves once.
  for (let i = 0; i < state.stove.length; i++) {
    const item = state.stove[i];
    if (item && stoveItemBurnt(item, now) && !item.burnt) {
      item.burnt = true;
      addFloater(state, LAYOUT.stove.x + 84 + i * 150, LAYOUT.stove.y + 40, 'BURNT!', '#ff6b5e');
    }
  }
}

export function anyTicketReady(state) {
  return state.tickets.some((t) => ticketIsReady(state, t));
}

export function patienceColor(left, total) {
  const ratio = left / total;
  if (ratio > 0.5) return '#7bc96f';
  if (ratio > 0.25) return '#f7c948';
  return '#ff6b5e';
}

export { ticketPatienceLeft };
