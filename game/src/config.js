// The Copper Ladle — game data: ingredients, recipes, and the kitchen layout.
// Every ingredient knows how it is prepared; every recipe is a list of
// finished ingredients. Nothing here is copied from another game.

export const VIEW_W = 1280;
export const VIEW_H = 720;

// --- Ingredients -----------------------------------------------------------
export const INGREDIENTS = {
  bun:     { name: 'Bun',      color: '#e8a95c', dark: '#b97e33', prep: 'ready',  key: '1' },
  patty:   { name: 'Patty',    color: '#8a5a3b', dark: '#5d3a24', prep: 'stove',  key: '2', cookMs: 6000 },
  cheese:  { name: 'Cheese',   color: '#f7c948', dark: '#d9a41f', prep: 'ready',  key: '3' },
  lettuce: { name: 'Lettuce',  color: '#7bc96f', dark: '#4d9a44', prep: 'ready',  key: '4' },
  tomato:  { name: 'Tomato',   color: '#e4572e', dark: '#b23a1d', prep: 'board',  key: '5', chops: 3 },
  egg:     { name: 'Egg',      color: '#fdf3d0', dark: '#e8c96a', prep: 'stove',  key: '6', cookMs: 5000 },
  pasta:   { name: 'Pasta',    color: '#f2d492', dark: '#c9a45a', prep: 'stove',  key: '7', cookMs: 8000 },
  fish:    { name: 'Fish',     color: '#7fb8c9', dark: '#4d8296', prep: 'stove',  key: '8', cookMs: 7000 },
};

// --- Recipes ---------------------------------------------------------------
export const RECIPES = [
  { id: 'copper-burger', name: 'Copper Burger',  price: 14, needs: ['bun', 'patty', 'cheese', 'lettuce'] },
  { id: 'garden-stack',  name: 'Garden Stack',   price: 11, needs: ['bun', 'lettuce', 'tomato', 'cheese'] },
  { id: 'sunrise-omelette', name: 'Sunrise Omelette', price: 13, needs: ['egg', 'cheese', 'tomato'] },
  { id: 'seaside-pasta', name: 'Seaside Pasta',  price: 15, needs: ['pasta', 'tomato', 'cheese'] },
  { id: 'crispy-fish-bun', name: 'Crispy Fish Bun', price: 16, needs: ['bun', 'fish', 'lettuce'] },
  { id: 'golden-melt',   name: 'Golden Melt',    price: 12, needs: ['bun', 'cheese', 'tomato', 'egg'] },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

// --- Shift tuning ----------------------------------------------------------
export const SHIFT_SECONDS = 150;
export const MAX_TICKETS = 4;
export const MAX_HEARTS = 3;
export const STOVE_SLOTS = 2;
export const BOARD_SLOTS = 1;

export function patienceFor(day) {
  return Math.max(32000, 52000 - day * 4000);
}
export function spawnGapFor(day, elapsedSec) {
  const base = Math.max(7000, 13000 - day * 1200 - elapsedSec * 60);
  return base;
}
export function recipesFor(day) {
  // Day 1 serves the first three recipes; a new one joins each day after.
  return RECIPES.slice(0, Math.min(RECIPES.length, 2 + day));
}
export function starsFor(coins, day) {
  const target = 90 + day * 40;
  if (coins >= target) return 3;
  if (coins >= Math.round(target * 0.6)) return 2;
  if (coins >= Math.round(target * 0.3)) return 1;
  return 0;
}

// --- Layout: every interactive zone on the 1280x720 canvas ------------------
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 62 },
  board: { x: 24, y: 74, w: 1232, h: 118 },
  ticketW: 296,
  ticketH: 106,
  ticketGap: 14,
  stove: { x: 24, y: 214, w: 330, h: 190 },
  board2: { x: 378, y: 214, w: 300, h: 190 },
  plate: { x: 702, y: 214, w: 290, h: 190 },
  serve: { x: 1016, y: 214, w: 240, h: 190 },
  bins: { x: 24, y: 428, w: 1232, h: 150 },
  binW: 142,
  binH: 132,
  binGap: 14,
  help: { x: 24, y: 596, w: 1232, h: 100 },
};

export function binRect(index) {
  const b = LAYOUT.bins;
  return {
    x: b.x + index * (LAYOUT.binW + LAYOUT.binGap),
    y: b.y,
    w: LAYOUT.binW,
    h: LAYOUT.binH,
  };
}
export function ticketRect(index) {
  const b = LAYOUT.board;
  return {
    x: b.x + index * (LAYOUT.ticketW + LAYOUT.ticketGap),
    y: b.y + 6,
    w: LAYOUT.ticketW,
    h: LAYOUT.ticketH,
  };
}
export function stoveSlotRect(slot) {
  const s = LAYOUT.stove;
  return { x: s.x + 18 + slot * 150, y: s.y + 58, w: 132, h: 108 };
}
export function boardSlotRect() {
  const b = LAYOUT.board2;
  return { x: b.x + 84, y: b.y + 58, w: 132, h: 108 };
}
export function plateRect() {
  const p = LAYOUT.plate;
  return { x: p.x + 70, y: p.y + 52, w: 150, h: 116 };
}
