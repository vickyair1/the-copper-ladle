// The Copper Ladle — canvas rendering: the kitchen, the order board, the
// stations, the plate and every ingredient are drawn in code, no images.

import { INGREDIENTS, LAYOUT, VIEW_H, VIEW_W, binRect, boardSlotRect, plateRect, stoveSlotRect, ticketRect } from './config.js';
import { patienceColor, ticketPatienceLeft } from './kitchen.js';
import { ticketIsReady } from './state.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

function text(ctx, str, x, y, size, color, weight = 700, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

// --- Food art ---------------------------------------------------------------
export function drawIngredient(ctx, id, cx, cy, s, opts = {}) {
  const def = INGREDIENTS[id];
  const u = s / 100;
  ctx.save();
  ctx.translate(cx, cy);
  if (opts.burnt) ctx.globalAlpha = 0.85;
  switch (id) {
    case 'bun': {
      ctx.fillStyle = def.color;
      ellipse(ctx, 0, 6 * u, 46 * u, 18 * u);
      ctx.fill();
      ctx.fillStyle = '#f3c37e';
      ctx.beginPath();
      ctx.arc(0, 2 * u, 44 * u, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff3d6';
      for (const [sx, sy] of [[-22, -16], [0, -26], [22, -16], [-10, -10], [12, -8]]) {
        ellipse(ctx, sx * u, sy * u, 4 * u, 2.5 * u);
        ctx.fill();
      }
      break;
    }
    case 'patty': {
      ctx.fillStyle = opts.burnt ? '#2b1d12' : def.color;
      roundRect(ctx, -46 * u, -12 * u, 92 * u, 26 * u, 12 * u);
      ctx.fill();
      ctx.fillStyle = opts.burnt ? '#1d130b' : def.dark;
      for (const [sx, sy] of [[-28, -2], [-6, 4], [18, -4], [32, 3]]) {
        ellipse(ctx, sx * u, sy * u, 6 * u, 3 * u);
        ctx.fill();
      }
      break;
    }
    case 'cheese': {
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.moveTo(-46 * u, 10 * u);
      ctx.lineTo(46 * u, 10 * u);
      ctx.lineTo(46 * u, -2 * u);
      ctx.lineTo(-20 * u, -14 * u);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = def.dark;
      ellipse(ctx, -12 * u, 2 * u, 4 * u, 4 * u);
      ctx.fill();
      ellipse(ctx, 20 * u, 0, 4 * u, 4 * u);
      ctx.fill();
      break;
    }
    case 'lettuce': {
      ctx.fillStyle = def.color;
      ctx.beginPath();
      for (let i = 0; i <= 10; i++) {
        const x = -48 * u + (96 * u * i) / 10;
        const y = (i % 2 === 0 ? -12 : 4) * u;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(48 * u, 14 * u);
      ctx.lineTo(-48 * u, 14 * u);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = def.dark;
      ctx.lineWidth = 2 * u;
      ctx.beginPath();
      ctx.moveTo(-40 * u, 2 * u);
      ctx.lineTo(40 * u, 2 * u);
      ctx.stroke();
      break;
    }
    case 'tomato': {
      ctx.fillStyle = def.color;
      ellipse(ctx, 0, 0, 44 * u, 20 * u);
      ctx.fill();
      ctx.fillStyle = '#ff8a6b';
      ellipse(ctx, 0, -2 * u, 34 * u, 13 * u);
      ctx.fill();
      ctx.fillStyle = '#ffd9cc';
      for (const sx of [-18, 0, 18]) {
        ellipse(ctx, sx * u, -2 * u, 7 * u, 4 * u);
        ctx.fill();
      }
      if (opts.chopped) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2 * u;
        ctx.beginPath();
        ctx.moveTo(-14 * u, -14 * u);
        ctx.lineTo(14 * u, 12 * u);
        ctx.moveTo(14 * u, -14 * u);
        ctx.lineTo(-14 * u, 12 * u);
        ctx.stroke();
      }
      break;
    }
    case 'egg': {
      ctx.fillStyle = '#fffdf4';
      ctx.beginPath();
      ctx.ellipse(0, 0, 44 * u, 24 * u, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffb703';
      ellipse(ctx, 4 * u, -2 * u, 15 * u, 13 * u);
      ctx.fill();
      ctx.fillStyle = '#ffdf6b';
      ellipse(ctx, 1 * u, -5 * u, 7 * u, 6 * u);
      ctx.fill();
      break;
    }
    case 'pasta': {
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 7 * u;
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc((i - 1.5) * 20 * u, (i % 2 === 0 ? -4 : 6) * u, 14 * u, Math.PI * 0.15, Math.PI * 1.15);
        ctx.stroke();
      }
      ctx.fillStyle = '#c0392b';
      ellipse(ctx, -20 * u, -12 * u, 6 * u, 5 * u);
      ctx.fill();
      ellipse(ctx, 22 * u, 12 * u, 6 * u, 5 * u);
      ctx.fill();
      break;
    }
    case 'fish': {
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 42 * u, 18 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(38 * u, 0);
      ctx.lineTo(52 * u, -14 * u);
      ctx.lineTo(52 * u, 14 * u);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#123';
      ellipse(ctx, -26 * u, -4 * u, 4 * u, 4 * u);
      ctx.fill();
      ctx.strokeStyle = def.dark;
      ctx.lineWidth = 2 * u;
      ctx.beginPath();
      ctx.moveTo(-6 * u, -14 * u);
      ctx.quadraticCurveTo(4 * u, 0, -6 * u, 14 * u);
      ctx.stroke();
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

function drawIngredientDot(ctx, id, cx, cy, r, done) {
  ctx.fillStyle = INGREDIENTS[id].color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  if (done) {
    ctx.strokeStyle = '#2f7d32';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.5, cy);
    ctx.lineTo(cx - r * 0.1, cy + r * 0.45);
    ctx.lineTo(cx + r * 0.55, cy - r * 0.45);
    ctx.stroke();
  }
}

// --- Kitchen chrome ----------------------------------------------------------
function drawTopBar(ctx, state, now) {
  const b = LAYOUT.topBar;
  ctx.fillStyle = '#3d2b1f';
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = '#59391f';
  ctx.fillRect(b.x, b.y + b.h - 6, b.w, 6);
  text(ctx, '🍳 THE COPPER LADLE', 24, 40, 26, '#ffd166', 800);
  const secs = Math.max(0, Math.ceil(state.timeLeftMs / 1000));
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  const low = secs <= 30 && state.screen === 'playing';
  ctx.fillStyle = low ? '#ff6b5e' : '#fff8e7';
  roundRect(ctx, 560, 10, 160, 42, 10);
  ctx.fill();
  text(ctx, `⏱ ${mm}:${ss}`, 640, 41, 26, low ? '#ff6b5e' : '#3d2b1f', 800, 'center');
  text(ctx, `Day ${state.day}`, 760, 40, 20, '#ffe9b0', 700);
  text(ctx, `💰 $${state.coins}`, 860, 40, 22, '#ffd166', 800);
  for (let i = 0; i < 3; i++) {
    text(ctx, i < state.hearts ? '❤' : '🤍', 990 + i * 30, 40, 20, '#fff', 700);
  }
  ctx.fillStyle = '#59391f';
  roundRect(ctx, 1096, 12, 52, 38, 8);
  ctx.fill();
  text(ctx, state.muted ? '🔇' : '🔊', 1122, 40, 20, '#ffe9b0', 700, 'center');
  ctx.fillStyle = '#59391f';
  roundRect(ctx, 1160, 12, 52, 38, 8);
  ctx.fill();
  text(ctx, state.screen === 'paused' ? '▶' : '⏸', 1186, 40, 20, '#ffe9b0', 700, 'center');
}

function drawOrderBoard(ctx, state, now) {
  const b = LAYOUT.board;
  ctx.fillStyle = '#2e3a45';
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.fillStyle = '#22303a';
  ctx.fillRect(b.x, b.y, b.w, 30);
  text(ctx, 'ORDER BOARD', b.x + 14, b.y + 21, 15, '#9fb4c4', 800);
  text(ctx, 'click a ticket to serve when the plate matches', b.x + 150, b.y + 21, 13, '#7d94a6', 600);
  if (state.tickets.length === 0) {
    text(ctx, 'No orders yet — the lunch rush is coming…', b.x + 24, b.y + 78, 18, '#8fa6b5', 600);
    return;
  }
  state.tickets.forEach((ticket, i) => {
    const r = ticketRect(i);
    const ready = ticketIsReady(state, ticket);
    const left = ticketPatienceLeft(ticket, now);
    ctx.fillStyle = ready ? '#fff3cf' : '#f7f3ea';
    roundRect(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    if (ready) {
      ctx.strokeStyle = '#2f9e44';
      ctx.lineWidth = 3;
      roundRect(ctx, r.x, r.y, r.w, r.h, 10);
      ctx.stroke();
    }
    text(ctx, `#${ticket.uid} ${ticket.recipe.name}`, r.x + 12, r.y + 24, 16, '#2b2b2b', 800);
    text(ctx, `$${ticket.recipe.price}`, r.x + r.w - 12, r.y + 24, 16, '#b8860b', 800, 'right');
    const counts = {};
    for (const id of state.plate) counts[id] = (counts[id] || 0) + 1;
    ticket.recipe.needs.forEach((id, j) => {
      const cx = r.x + 26 + j * 44;
      drawIngredientDot(ctx, id, cx, r.y + 52, 15, (counts[id] || 0) > 0);
      if ((counts[id] || 0) > 0) counts[id] -= 1;
    });
    text(ctx, ready ? 'READY — CLICK TO SERVE!' : 'waiting…', r.x + 12, r.y + 86, 13, ready ? '#2f9e44' : '#8a8a8a', 800);
    ctx.fillStyle = '#e8e2d4';
    roundRect(ctx, r.x + 170, r.y + 94, 112, 6, 3);
    ctx.fill();
    ctx.fillStyle = patienceColor(left, ticket.patienceMs);
    roundRect(ctx, r.x + 170, r.y + 94, 112 * (left / ticket.patienceMs), 6, 3);
    ctx.fill();
  });
}

function drawStove(ctx, state, now) {
  const s = LAYOUT.stove;
  ctx.fillStyle = '#8a5a3b';
  roundRect(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fill();
  ctx.fillStyle = '#6e452c';
  ctx.fillRect(s.x, s.y, s.w, 30);
  text(ctx, '🔥 STOVE — click a burner to cook', s.x + 12, s.y + 21, 13, '#ffd9a0', 800);
  for (let i = 0; i < 2; i++) {
    const r = stoveSlotRect(i);
    ctx.fillStyle = '#3a3a3a';
    ellipse(ctx, r.x + r.w / 2, r.y + r.h - 8, 62, 16);
    ctx.fill();
    ctx.fillStyle = '#555';
    ellipse(ctx, r.x + r.w / 2, r.y + r.h - 10, 52, 12);
    ctx.fill();
    const item = state.stove[i];
    if (!item) {
      text(ctx, 'empty burner', r.x + r.w / 2, r.y + 46, 13, '#d8c3ae', 600, 'center');
      continue;
    }
    const def = INGREDIENTS[item.id];
    const done = now - item.startedAt >= item.cookMs;
    const burnt = now - item.startedAt >= item.cookMs * 1.8;
    const ratio = Math.min(1, (now - item.startedAt) / item.cookMs);
    ctx.fillStyle = '#c9c9c9';
    ellipse(ctx, r.x + r.w / 2, r.y + 46, 54, 20);
    ctx.fill();
    ctx.fillStyle = '#9a9a9a';
    ellipse(ctx, r.x + r.w / 2, r.y + 46, 46, 15);
    ctx.fill();
    drawIngredient(ctx, item.id, r.x + r.w / 2, r.y + 44, 62, { burnt });
    ctx.strokeStyle = burnt ? '#ff6b5e' : done ? '#7bc96f' : '#ffd166';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(r.x + r.w / 2, r.y + 44, 46, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2);
    ctx.stroke();
    text(ctx, burnt ? 'BURNT — click to toss' : done ? 'DONE! click to collect' : `cooking ${def.name}…`, r.x + r.w / 2, r.y + r.h - 2, 12, burnt ? '#ff8a7a' : done ? '#b8f0b8' : '#ffe9b0', 700, 'center');
  }
}

function drawBoard(ctx, state) {
  const b = LAYOUT.board2;
  ctx.fillStyle = '#a9805a';
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.fillStyle = '#8a6844';
  ctx.fillRect(b.x, b.y, b.w, 30);
  text(ctx, '🔪 CHOPPING BOARD — click to chop', b.x + 12, b.y + 21, 13, '#ffe9c4', 800);
  const r = boardSlotRect();
  ctx.fillStyle = '#d9b380';
  roundRect(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#b98d5a';
  ctx.lineWidth = 2;
  roundRect(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.stroke();
  const item = state.board;
  if (!item) {
    text(ctx, 'empty board', r.x + r.w / 2, r.y + 56, 13, '#8a6844', 600, 'center');
    return;
  }
  drawIngredient(ctx, item.id, r.x + r.w / 2, r.y + 48, 64, { chopped: item.chopsLeft < 3 });
  text(ctx, `chop ×${item.chopsLeft}`, r.x + r.w / 2, r.y + r.h - 6, 14, '#5d3a1a', 800, 'center');
}

function drawPlate(ctx, state) {
  const p = LAYOUT.plate;
  ctx.fillStyle = '#5d7a8c';
  roundRect(ctx, p.x, p.y, p.w, p.h, 12);
  ctx.fill();
  ctx.fillStyle = '#4a6273';
  ctx.fillRect(p.x, p.y, p.w, 30);
  text(ctx, '🍽 PLATE — click an item to remove it', p.x + 12, p.y + 21, 13, '#d6ecf5', 800);
  const r = plateRect();
  ctx.fillStyle = '#f4f1e8';
  ellipse(ctx, r.x + r.w / 2, r.y + r.h - 14, 72, 20);
  ctx.fill();
  ctx.fillStyle = '#fffdf6';
  ellipse(ctx, r.x + r.w / 2, r.y + r.h - 16, 58, 15);
  ctx.fill();
  if (state.plate.length === 0) {
    text(ctx, 'empty plate', r.x + r.w / 2, r.y + 46, 13, '#8a97a3', 600, 'center');
    return;
  }
  state.plate.forEach((id, i) => {
    const y = r.y + r.h - 22 - i * 15;
    drawIngredient(ctx, id, r.x + r.w / 2, y, 58);
  });
}

function drawServeWindow(ctx, state) {
  const s = LAYOUT.serve;
  const ready = state.tickets.some((t) => ticketIsReady(state, t));
  ctx.fillStyle = ready ? '#2f7d32' : '#7a6a53';
  roundRect(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(s.x, s.y, s.w, 30);
  text(ctx, '🛎 SERVING WINDOW', s.x + 12, s.y + 21, 13, '#fff3d6', 800);
  text(ctx, '🔔', s.x + s.w / 2, s.y + 96, 44, '#ffd166', 700, 'center');
  text(ctx, ready ? 'ORDER READY!' : 'serve from a ticket', s.x + s.w / 2, s.y + 140, 15, '#fff', 800, 'center');
  text(ctx, ready ? 'click the green ticket' : 'match the plate to a ticket', s.x + s.w / 2, s.y + 164, 12, '#e8e0cc', 600, 'center');
}

function drawBins(ctx, state) {
  const b = LAYOUT.bins;
  ctx.fillStyle = '#6b4a2f';
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.fillStyle = '#54371f';
  ctx.fillRect(b.x, b.y, b.w, 28);
  text(ctx, 'INGREDIENTS — click to add (bun & cheese go straight to the plate; patty, egg, pasta & fish need the stove; tomato needs the board)', b.x + 12, b.y + 19, 12, '#ffd9a0', 700);
  const ids = Object.keys(INGREDIENTS);
  ids.forEach((id, i) => {
    const r = binRect(i);
    ctx.fillStyle = '#f7f3ea';
    roundRect(ctx, r.x, r.y + 34, r.w, r.h - 34, 10);
    ctx.fill();
    drawIngredient(ctx, id, r.x + r.w / 2, r.y + 82, 66);
    const def = INGREDIENTS[id];
    text(ctx, def.name, r.x + r.w / 2, r.y + 122, 13, '#3d2b1f', 800, 'center');
    ctx.fillStyle = '#3d2b1f';
    roundRect(ctx, r.x + 6, r.y + 40, 22, 20, 5);
    ctx.fill();
    text(ctx, def.key, r.x + 17, r.y + 55, 12, '#ffd166', 800, 'center');
    const hint = def.prep === 'stove' ? '🔥 stove' : def.prep === 'board' ? '🔪 board' : '→ plate';
    text(ctx, hint, r.x + r.w - 8, r.y + 55, 11, '#8a8a8a', 600, 'right');
  });
}

function drawHelp(ctx, state) {
  const h = LAYOUT.help;
  ctx.fillStyle = '#efe7d6';
  roundRect(ctx, h.x, h.y, h.w, h.h, 12);
  ctx.fill();
  text(ctx, 'HOW TO PLAY', h.x + 14, h.y + 24, 14, '#8a6844', 800);
  text(ctx, '1 · Click ingredients to cook, chop and plate them.   2 · Match a ticket exactly, then click the ticket to serve.   3 · Tips grow with patience left — serve fast, keep the combo alive.', h.x + 14, h.y + 48, 14, '#4a3b28', 600);
  text(ctx, 'Keys 1–8 grab ingredients · Space serves the first ready ticket · P pause · M mute · R restart shift', h.x + 14, h.y + 72, 14, '#4a3b28', 600);
  text(ctx, `Served ${state.served} · Lost ${state.lost} · Combo ×${state.combo} (best ×${state.bestCombo})`, h.x + 14, h.y + 92, 13, '#8a6844', 700);
}

// --- Screens -----------------------------------------------------------------
function drawTitle(ctx, state) {
  ctx.fillStyle = '#2b1d12';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#3d2b1f';
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(0, 90 + i * 80, VIEW_W, 40);
  }
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(640, 150, 86, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3d2b1f';
  ctx.font = '800 64px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🍳', 640, 172);
  text(ctx, 'THE COPPER LADLE', 640, 290, 64, '#ffd166', 800, 'center');
  text(ctx, 'a rush-hour kitchen game', 640, 330, 24, '#ffe9b0', 600, 'center');
  ctx.fillStyle = '#f7f3ea';
  roundRect(ctx, 340, 370, 600, 150, 14);
  ctx.fill();
  text(ctx, 'Cook it. Chop it. Plate it. Serve it before the ticket runs out.', 640, 406, 18, '#3d2b1f', 700, 'center');
  text(ctx, 'Burgers, pastas, omelettes and fish buns — the lunch rush waits for no chef.', 640, 436, 15, '#6b5a44', 600, 'center');
  text(ctx, 'CLICK TO START YOUR SHIFT  ·  150 seconds  ·  3 hearts', 640, 486, 17, '#b8860b', 800, 'center');
  text(ctx, 'Mouse to cook & serve · Keys 1–8 ingredients · Space serve · P pause', 640, 560, 15, '#cbb894', 600, 'center');
  text(ctx, 'An original game — all art and sound drawn and synthesized in code.', 640, 596, 13, '#8a7a5a', 600, 'center');
  const ids = Object.keys(INGREDIENTS);
  ids.forEach((id, i) => {
    drawIngredient(ctx, id, 300 + i * 97, 650, 52);
  });
}

function drawEndScreen(ctx, state, won) {
  ctx.fillStyle = 'rgba(20,14,8,0.82)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#f7f3ea';
  roundRect(ctx, 340, 130, 600, 460, 16);
  ctx.fill();
  text(ctx, won ? 'SHIFT COMPLETE!' : 'THE KITCHEN CLOSED…', 640, 200, 40, won ? '#2f7d32' : '#b23a1d', 800, 'center');
  const starRow = '★'.repeat(state.stars) + '☆'.repeat(3 - state.stars);
  text(ctx, starRow, 640, 260, 52, '#f7c948', 800, 'center');
  text(ctx, `Day ${state.day} — served ${state.served} orders, lost ${state.lost}`, 640, 310, 20, '#3d2b1f', 700, 'center');
  text(ctx, `Coins earned: $${state.coins}   ·   Best combo ×${state.bestCombo}   ·   Mistakes ${state.mistakes}`, 640, 344, 17, '#6b5a44', 600, 'center');
  if (won) {
    text(ctx, state.stars === 3 ? 'Three stars! The Copper Ladle gleams tonight.' : state.stars === 2 ? 'A solid shift — the regulars are happy.' : 'You survived the rush. Tomorrow, faster.', 640, 384, 17, '#2f7d32', 700, 'center');
    text(ctx, 'Press N for the next day, or R to replay this one', 640, 440, 18, '#b8860b', 800, 'center');
  } else {
    text(ctx, 'Too many walk-outs. The rush won this time.', 640, 384, 17, '#b23a1d', 700, 'center');
    text(ctx, 'Press R to run the shift again', 640, 440, 18, '#b8860b', 800, 'center');
  }
  text(ctx, 'Click anywhere to continue', 640, 520, 15, '#8a8a8a', 600, 'center');
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(20,14,8,0.6)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  text(ctx, 'PAUSED', 640, 340, 56, '#ffd166', 800, 'center');
  text(ctx, 'Press P or click ▶ to keep cooking', 640, 390, 18, '#fff8e7', 600, 'center');
}

function drawMessage(ctx, state, now) {
  const m = state.message;
  if (!m) return;
  if (now - m.born > 2600) {
    state.message = null;
    return;
  }
  const alpha = now - m.born > 2100 ? 1 - (now - m.born - 2100) / 500 : 1;
  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.fillStyle = '#2b1d12';
  roundRect(ctx, 390, 640, 500, 56, 12);
  ctx.fill();
  text(ctx, m.text, 640, 664, 18, '#ffd166', 800, 'center');
  text(ctx, m.sub, 640, 686, 13, '#ffe9b0', 600, 'center');
  ctx.restore();
}

function drawFloaters(ctx, state, now) {
  for (const f of state.floaters) {
    const age = now - f.born;
    if (age > f.lifeMs) continue;
    const y = f.y - (age / f.lifeMs) * 44;
    ctx.save();
    ctx.globalAlpha = 1 - age / f.lifeMs;
    text(ctx, f.text, f.x, y, 20, f.color, 800, 'center');
    ctx.restore();
  }
  state.floaters = state.floaters.filter((f) => now - f.born <= f.lifeMs);
}

function drawParticles(ctx, state, now) {
  for (const p of state.particles) {
    const age = now - p.born;
    if (age > p.lifeMs) continue;
    const t = age / p.lifeMs;
    ctx.save();
    ctx.globalAlpha = (1 - t) * 0.6;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x + p.vx * t, p.y + p.vy * t, p.size * (1 - t * 0.4), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  state.particles = state.particles.filter((p) => now - p.born <= p.lifeMs);
}

// --- Frame --------------------------------------------------------------------
export function renderFrame(ctx, state, now) {
  ctx.save();
  if (state.shakeMs > 0) {
    const mag = 5 * (state.shakeMs / 260);
    ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
  }
  // Wall + floor.
  ctx.fillStyle = '#f3e2c7';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#e8d3ae';
  for (let x = 0; x < VIEW_W; x += 96) {
    ctx.fillRect(x, 62, 2, 360);
  }
  ctx.fillStyle = '#c98f5f';
  ctx.fillRect(0, 420, VIEW_W, 8);
  ctx.fillStyle = '#d9b380';
  ctx.fillRect(0, 428, VIEW_W, 292);
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let y = 460; y < VIEW_H; y += 48) ctx.fillRect(0, y, VIEW_W, 2);

  drawTopBar(ctx, state, now);
  drawOrderBoard(ctx, state, now);
  drawStove(ctx, state, now);
  drawBoard(ctx, state);
  drawPlate(ctx, state);
  drawServeWindow(ctx, state);
  drawBins(ctx, state);
  drawHelp(ctx, state);
  drawParticles(ctx, state, now);
  drawFloaters(ctx, state, now);
  drawMessage(ctx, state, now);

  if (state.screen === 'title') drawTitle(ctx, state);
  if (state.screen === 'paused') drawPaused(ctx);
  if (state.screen === 'dayEnd') drawEndScreen(ctx, state, true);
  if (state.screen === 'gameOver') drawEndScreen(ctx, state, false);
  ctx.restore();
}
