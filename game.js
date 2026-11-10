'use strict';

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

let COLORS = [
  null,
  '#4dd0e1', // I - cyan
  '#ffd54f', // O - yellow
  '#ba68c8', // T - purple
  '#81c784', // S - green
  '#e57373', // Z - red
  '#9fa8da', // J - light indigo blue
  '#ffb74d', // L - orange
  '#f48fb1', // Ring - pink
];

// ---- Skins ----
// Cada skin aporta colores (índices 1-8 como COLORS), rejilla (null = sigue el tema) y su drawBlock.
const RETRO_COLORS = COLORS;

function roundRectPath(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

const SKINS = {
  retro: {
    colors: RETRO_COLORS,
    gridColor: null,
    drawBlock(context, x, y, color, size, alpha) {
      context.globalAlpha = alpha;
      context.fillStyle = color;
      context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      context.fillStyle = 'rgba(255,255,255,0.12)';
      context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
      context.globalAlpha = 1;
    },
  },
  neon: {
    colors: [null, '#00f0ff', '#ffee00', '#d500f9', '#39ff14', '#ff1744', '#536dfe', '#ff9100', '#ff4fd8'],
    gridColor: '#1c1c2c', // el fondo negro lo aplica CSS (data-skin="neon")
    drawBlock(context, x, y, color, size, alpha) {
      context.save();
      context.globalAlpha = alpha;
      context.shadowColor = color;
      context.shadowBlur = size * 0.5;
      context.fillStyle = color;
      context.fillRect(x * size + 3, y * size + 3, size - 6, size - 6);
      context.shadowBlur = 0;
      context.fillStyle = 'rgba(255,255,255,0.35)';
      context.fillRect(x * size + 3, y * size + 3, size - 6, 3);
      context.restore();
    },
  },
  pastel: {
    colors: [null, '#a8e6ef', '#fff1b0', '#d9b8ec', '#bfe8c3', '#f5b7b1', '#c5cae9', '#ffd8a8', '#f8c8dc'],
    gridColor: null,
    drawBlock(context, x, y, color, size, alpha) {
      context.save();
      context.globalAlpha = alpha;
      context.fillStyle = color;
      roundRectPath(context, x * size + 1, y * size + 1, size - 2, size - 2, size * 0.28);
      context.fill();
      context.strokeStyle = 'rgba(80,80,120,0.25)'; // contorno para contraste en tema claro
      context.lineWidth = 1;
      context.stroke();
      context.fillStyle = 'rgba(255,255,255,0.35)';
      roundRectPath(context, x * size + 5, y * size + 4, size - 10, 4, 2);
      context.fill();
      context.restore();
    },
  },
  pixel: {
    colors: RETRO_COLORS,
    gridColor: null,
    drawBlock(context, x, y, color, size, alpha) {
      context.save();
      context.globalAlpha = alpha;
      const px = x * size + 1, py = y * size + 1, s = size - 2, p = 3;
      context.fillStyle = color;
      context.fillRect(px, py, s, s);
      // patrón de píxeles claros/oscuros sobre cuadrícula de 3 px
      for (let i = 0; i * p < s; i++) {
        for (let j = 0; j * p < s; j++) {
          const k = (i + j) % 4;
          if (k === 0) context.fillStyle = 'rgba(255,255,255,0.22)';
          else if (k === 2) context.fillStyle = 'rgba(0,0,0,0.18)';
          else continue;
          context.fillRect(px + i * p, py + j * p, Math.min(p, s - i * p), Math.min(p, s - j * p));
        }
      }
      context.strokeStyle = 'rgba(0,0,0,0.45)';
      context.lineWidth = 1;
      context.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
      context.restore();
    },
  },
  vintage: {
    // mostaza, vino, terracota, verde oliva, azul petróleo, café y rosa viejo
    colors: [null, '#4f8a8b', '#e0a526', '#8e4a6b', '#7d8f3f', '#a8283c', '#3f5e7a', '#c9702f', '#c98a8a'],
    gridColor: null,
    drawBlock(context, x, y, color, size, alpha) {
      context.save();
      context.globalAlpha = alpha;
      const px = x * size + 1, py = y * size + 1, s = size - 2;
      context.fillStyle = color;
      roundRectPath(context, px, py, s, s, 3);
      context.fill();
      // luz cálida arriba/izquierda y sombra café abajo/derecha (aspecto de bakelita)
      context.fillStyle = 'rgba(255,236,190,0.28)';
      context.fillRect(px + 2, py + 2, s - 4, 3);
      context.fillRect(px + 2, py + 2, 3, s - 4);
      context.fillStyle = 'rgba(60,30,15,0.28)';
      context.fillRect(px + 2, py + s - 5, s - 4, 3);
      context.fillRect(px + s - 5, py + 2, 3, s - 4);
      context.strokeStyle = 'rgba(55,32,20,0.7)';
      context.lineWidth = 1;
      roundRectPath(context, px + 0.5, py + 0.5, s - 1, s - 1, 3);
      context.stroke();
      context.restore();
    },
  },
};
let currentSkin = 'retro';

const PIECES = [
  null,
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
  [[2,2],[2,2]],                               // O
  [[0,3,0],[3,3,3],[0,0,0]],                  // T
  [[0,4,4],[4,4,0],[0,0,0]],                  // S
  [[5,5,0],[0,5,5],[0,0,0]],                  // Z
  [[6,0,0],[6,6,6],[0,0,0]],                  // J
  [[0,0,7],[7,7,7],[0,0,0]],                  // L
  [[8,8,8],[8,0,8],[8,8,8]],                  // Ring (hueco central)
];

const RING = 8;
const RING_CHANCE = 0.05; // probabilidad de la pieza anillo; las otras 7 se reparten el resto

const LINE_SCORES =[0, 100, 300, 500, 800];

const BOLT_SCORE_STEP = 2000; // puntos necesarios para cargar un rayo
const BOLT_MS = 500;          // duración del efecto del rayo

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const boltEl = document.getElementById('bolt');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');
const pauseMenu = document.getElementById('pause-menu');
const pmResume = document.getElementById('pm-resume');
const pmRestart = document.getElementById('pm-restart');
const pmControls = document.getElementById('pm-controls');
const pmControlsList = document.getElementById('pm-controls-list');
const pmLevel = document.getElementById('pm-level');
const pmLevelVal = document.getElementById('pm-level-val');
const pmLevelIcon = document.getElementById('pm-level-icon');
const themeBtn = document.getElementById('pm-theme');
const themeIcon = document.getElementById('pm-theme-icon');
const themeLabel = document.getElementById('pm-theme-label');
const pmButtons = [pmResume, pmRestart, pmControls, pmLevel, themeBtn];
// Cara por nivel inicial: de amigable (1) a diablo (10)
const LEVEL_ICONS = ['😇', '😊', '🙂', '😏', '😎', '😤', '😠', '😡', '👿', '😈'];
const SUN_SVG = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
const MOON_SVG = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
let gridColor = '#22222e';
const skinSelect = document.getElementById('skin-select');

// Records locales
const RECORDS_KEY = 'tetrisRecords';
const BESTS_KEY = 'tetrisBests';
const MAX_RECORDS = 10;
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const startRecordsEl = document.getElementById('start-records');
const overlayRecordsEl = document.getElementById('overlay-records');
const recordEntry = document.getElementById('record-entry');
const recordMsg = document.getElementById('record-msg');
const recordName = document.getElementById('record-name');
const recordSave = document.getElementById('record-save');
const overlayResetBtn = document.getElementById('overlay-reset-records');
let combo = 0, bestCombo = 0;
const MAX_START_LEVEL = 10;
const RESUME_GRACE_MS = 150;
let startLevel = 1;
try {
  const saved = parseInt(localStorage.getItem('startLevel'), 10);
  if (saved >= 1 && saved <= MAX_START_LEVEL) startLevel = saved;
} catch (e) {}
const heldKeys = new Set();   // teclas pulsadas ahora mismo
let blockedKeys = new Set();  // pulsadas al reanudar: se ignoran hasta soltarlas
let resumeUntil = 0;
let gameStartLevel = 1;       // nivel inicial de la partida en curso
window.addEventListener('blur', () => { heldKeys.clear(); blockedKeys.clear(); });

let board, current, next, score, lines, level, paused, gameOver, lastTime, dropAccum, dropInterval, animId, bolt, nextBoltAt;

function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function randomPiece() {
  const type = Math.random() < RING_CHANCE ? RING : Math.floor(Math.random() * 7) + 1;
  const shape = PIECES[type].map(row => [...row]);
  return { type, shape, x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 };
}

function collide(shape, ox, oy) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c;
      const ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function rotateCW(shape) {
  const rows = shape.length, cols = shape[0].length;
  const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      result[c][rows - 1 - r] = shape[r][c];
  return result;
}

function tryRotate() {
  const rotated = rotateCW(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(rotated, current.x + kick, current.y)) {
      current.shape = rotated;
      current.x += kick;
      return;
    }
  }
}

function merge() {
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        board[current.y + r][current.x + c] = current.shape[r][c];
}

function intervalFor(lvl) {
  return Math.max(100, 1000 - (lvl - 1) * 90);
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(v => v !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (cleared) {
    combo++;
    if (combo > bestCombo) bestCombo = combo;
  } else {
    combo = 0;
  }
  if (cleared) {
    lines += cleared;
    score += (LINE_SCORES[cleared] || 0) * level;
    level = Math.max(gameStartLevel,Math.floor(lines / 10) + 1);
    dropInterval = intervalFor(level);
    updateHUD();
  }
}

function ghostY() {
  let gy = current.y;
  while (!collide(current.shape, current.x, gy + 1)) gy++;
  return gy;
}

function hardDrop() {
  const gy = ghostY();
  score += (gy - current.y) * 2;
  current.y = gy;
  lockPiece();
}

function softDrop() {
  if (!collide(current.shape, current.x, current.y + 1)) {
    current.y++;
    score += 1;
    updateHUD();
  } else {
    lockPiece();
  }
}

function lockPiece() {
  merge();
  clearLines();
  if (tryStartBolt()) return; // spawn() se llama al terminar el rayo
  spawn();
}

function tryStartBolt() {
  if (score < nextBoltAt) return false;
  const candidates = [];
  for (let r = 0; r < ROWS; r++)
    if (board[r].some(v => v)) candidates.push({ kind: 'row', index: r });
  for (let c = 0; c < COLS; c++)
    if (board.some(row => row[c])) candidates.push({ kind: 'col', index: c });
  if (!candidates.length) return false; // tablero vacío: el rayo queda pendiente
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  bolt = { ...pick, t: 0 };
  nextBoltAt = (Math.floor(score / BOLT_SCORE_STEP) + 1) * BOLT_SCORE_STEP;
  canvas.classList.add('shake');
  updateHUD();
  return true;
}

function finishBolt() {
  if (bolt.kind === 'row') {
    board.splice(bolt.index, 1);
    board.unshift(new Array(COLS).fill(0));
  } else {
    for (let r = 0; r < ROWS; r++) board[r][bolt.index] = 0;
  }
  bolt = null;
  canvas.classList.remove('shake');
  updateHUD();
  spawn();
}

function spawn() {
  current = next;
  next = randomPiece();
  if (collide(current.shape, current.x, current.y)) {
    endGame();
  }
  drawNext();
}

function updateHUD() {
  scoreEl.textContent = score.toLocaleString();
  linesEl.textContent = lines;
  levelEl.textContent = level;
  boltEl.textContent = Math.max(0, nextBoltAt - score).toLocaleString();
}

function drawBlock(context, x, y, colorIndex, size, alpha) {
  if (!colorIndex) return;
  SKINS[currentSkin].drawBlock(context, x, y, COLORS[colorIndex], size, alpha ?? 1);
}

function drawGrid() {
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.5;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK, 0);
    ctx.lineTo(c * BLOCK, ROWS * BLOCK);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK);
    ctx.lineTo(COLS * BLOCK, r * BLOCK);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  // board
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      drawBlock(ctx, c, r, board[r][c], BLOCK);

  if (bolt) {
    drawBolt();
    return;
  }

  // ghost
  const gy = ghostY();
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        drawBlock(ctx, current.x + c, gy + r, current.shape[r][c], BLOCK, 0.2);

  // current piece
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      drawBlock(ctx, current.x + c, current.y + r, current.shape[r][c], BLOCK);
}

function drawBolt() {
  const p = Math.min(bolt.t / BOLT_MS, 1);
  const isRow = bolt.kind === 'row';
  const bx = isRow ? 0 : bolt.index * BLOCK;
  const by = isRow ? bolt.index * BLOCK : 0;
  const bw = isRow ? COLS * BLOCK : BLOCK;
  const bh = isRow ? BLOCK : ROWS * BLOCK;

  ctx.save();

  // franja parpadeante
  ctx.fillStyle = Math.random() < 0.5 ? '#ffffff' : '#fff176';
  ctx.globalAlpha = (1 - p) * (0.5 + Math.random() * 0.5);
  ctx.fillRect(bx, by, bw, bh);

  // rayo en zigzag con chisporroteo
  const len = isRow ? bw : bh;
  const mid = (isRow ? by : bx) + BLOCK / 2;
  const steps = 14;
  ctx.globalAlpha = 1 - p * 0.6;
  ctx.lineJoin = 'round';
  ctx.shadowColor = '#ffeb3b';
  ctx.shadowBlur = 20;
  for (const [color, width] of [['#fff59d', 5], ['#ffffff', 2]]) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const along = (len * i) / steps;
      const off = mid + (i === 0 || i === steps ? 0 : (Math.random() - 0.5) * BLOCK * 1.2);
      if (isRow) ctx.lineTo(along, off);
      else ctx.lineTo(off, along);
    }
    ctx.stroke();
  }

  // destello general al inicio
  if (p < 0.25) {
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.35 * (1 - p * 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // texto
  ctx.shadowBlur = 10;
  ctx.globalAlpha = 1 - p;
  ctx.fillStyle = '#fff59d';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('¡RAYO!', canvas.width / 2, canvas.height / 2);

  ctx.restore();
}

function drawNext() {
  const NB = 30;
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const shape = next.shape;
  const offX = Math.floor((4 - shape[0].length) / 2);
  const offY = Math.floor((4 - shape.length) / 2);
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      drawBlock(nextCtx, offX + c, offY + r, shape[r][c], NB);
}

function endGame() {
  gameOver = true;
  cancelAnimationFrame(animId);
  overlayTitle.textContent = 'GAME OVER';
  overlayScore.textContent = `Puntuación: ${score.toLocaleString()}`;

  commitBests();

  if (qualifies(score)) {
    // Mientras se pide el nombre no se puede reiniciar ni borrar records (se perdería la puntuación)
    recordMsg.textContent = '¡Entraste en el top 10! Escribe tu nombre';
    recordName.value = 'Jugador';
    recordEntry.classList.remove('hidden');
    overlayRecordsEl.classList.add('hidden');
    restartBtn.style.display = 'none';
    overlayResetBtn.classList.add('hidden');
    overlay.classList.remove('hidden');
    recordName.focus();
    recordName.select();
  } else {
    recordEntry.classList.add('hidden');
    overlayRecordsEl.classList.remove('hidden');
    overlayResetBtn.classList.remove('hidden');
    renderRecords(overlayRecordsEl, null);
    overlay.classList.remove('hidden');
  }
}

// Guarda mejor combo / líneas máximas de la partida en curso
function commitBests() {
  const bests = loadBests();
  bests.maxCombo = Math.max(bests.maxCombo, bestCombo);
  bests.maxLines = Math.max(bests.maxLines, lines || 0);
  saveBests(bests);
}

// ---- Records (localStorage) ----
function loadRecords() {
  try {
    const data = JSON.parse(localStorage.getItem(RECORDS_KEY));
    if (!Array.isArray(data)) return [];
    return data
      .filter(r => r && typeof r === 'object' && Number.isFinite(r.score))
      .map(r => ({
        name: String(r.name ?? '').slice(0, 12),
        score: r.score,
        lines: Number.isFinite(r.lines) ? r.lines : 0,
        combo: Number.isFinite(r.combo) ? r.combo : 0,
        date: String(r.date ?? ''),
      }))
      .sort((a, b) => b.score - a.score)
      .filter((r, i, arr) => arr.findIndex(o => nameKey(o.name) === nameKey(r.name)) === i) // nombres únicos: se conserva la mejor puntuación
      .slice(0, MAX_RECORDS);
  } catch (e) {
    return [];
  }
}

function cleanName(n) {
  return String(n).replace(/\s+/g, ' ').trim().slice(0, 12) || 'Jugador';
}

function nameKey(n) {
  return cleanName(n).toLocaleLowerCase();
}

function saveRecords(list) {
  try { localStorage.setItem(RECORDS_KEY, JSON.stringify(list)); } catch (e) {}
}

function loadBests() {
  try {
    const d = JSON.parse(localStorage.getItem(BESTS_KEY));
    return {
      maxCombo: d && Number.isFinite(d.maxCombo) ? d.maxCombo : 0,
      maxLines: d && Number.isFinite(d.maxLines) ? d.maxLines : 0,
    };
  } catch (e) {
    return { maxCombo: 0, maxLines: 0 };
  }
}

function saveBests(b) {
  try { localStorage.setItem(BESTS_KEY, JSON.stringify(b)); } catch (e) {}
}

function qualifies(s) {
  if (s <= 0) return false;
  const list = loadRecords();
  return list.length < MAX_RECORDS || s > list[list.length - 1].score;
}

function submitRecord() {
  if (recordEntry.classList.contains('hidden')) return; // evita doble guardado
  const name = cleanName(recordName.value);
  const list = loadRecords();
  if (list.some(r => nameKey(r.name) === nameKey(name))) {
    recordMsg.textContent = `El nombre "${name}" ya existe. Elige otro distinto`;
    recordName.focus();
    recordName.select();
    return;
  }
  const entry = {
    name,
    score,
    lines,
    combo: bestCombo,
    date: new Date().toISOString().slice(0, 10),
  };
  let idx = list.findIndex(r => r.score < entry.score);
  if (idx === -1) idx = list.length;
  list.splice(idx, 0, entry);
  list.length = Math.min(list.length, MAX_RECORDS);
  saveRecords(list);
  recordEntry.classList.add('hidden');
  overlayRecordsEl.classList.remove('hidden');
  overlayResetBtn.classList.remove('hidden');
  restartBtn.style.display = '';
  renderRecords(overlayRecordsEl, idx < MAX_RECORDS ? idx : null);
  restartBtn.focus();
}

function renderRecords(container, highlight) {
  container.textContent = '';
  const list = loadRecords();
  const bests = loadBests();
  if (!list.length) {
    const p = document.createElement('p');
    p.className = 'hs-empty';
    p.textContent = 'Aún no hay records';
    container.appendChild(p);
  } else {
    const table = document.createElement('table');
    table.className = 'hs-table';
    const head = table.insertRow();
    for (const h of ['#', 'NOMBRE', 'PUNTOS', 'LÍN', 'COMBO']) {
      const th = document.createElement('th');
      th.textContent = h;
      head.appendChild(th);
    }
    list.forEach((r, i) => {
      const tr = table.insertRow();
      if (i === highlight) tr.className = 'hs-new';
      tr.title = r.date;
      for (const v of [i + 1, r.name, r.score.toLocaleString(), r.lines, r.combo]) {
        tr.insertCell().textContent = v;
      }
    });
    container.appendChild(table);
  }
  const b = document.createElement('div');
  b.className = 'hs-bests';
  const c = document.createElement('span');
  c.textContent = `Mejor combo: ${bests.maxCombo}`;
  const l = document.createElement('span');
  l.textContent = `Líneas máx.: ${bests.maxLines}`;
  b.append(c, l);
  container.appendChild(b);
}

function resetRecords() {
  if (!confirm('¿Borrar todos los records?')) return;
  try {
    localStorage.removeItem(RECORDS_KEY);
    localStorage.removeItem(BESTS_KEY);
  } catch (e) {}
  renderRecords(startRecordsEl, null);
  if (!overlayRecordsEl.classList.contains('hidden')) renderRecords(overlayRecordsEl, null);
}

function showStartScreen() {
  renderRecords(startRecordsEl, null);
  startScreen.classList.remove('hidden');
  startBtn.focus();
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  if (!paused) {
    closePauseMenu();
    blockedKeys = new Set(heldKeys);
    resumeUntil = performance.now() + RESUME_GRACE_MS;
    lastTime = performance.now();
    cancelAnimationFrame(animId);
    loop(lastTime);
  } else {
    cancelAnimationFrame(animId);
    openPauseMenu();
  }
}

function openPauseMenu() {
  pmControlsList.classList.add('hidden');
  pmControls.setAttribute('aria-expanded', 'false');
  pmLevelVal.textContent = startLevel;
  pmLevelIcon.textContent = LEVEL_ICONS[startLevel - 1];
  pauseMenu.classList.remove('hidden');
  pmResume.focus();
}

function closePauseMenu() {
  pauseMenu.classList.add('hidden');
  if (pauseMenu.contains(document.activeElement)) document.activeElement.blur();
}

function changeStartLevel(delta) {
  startLevel = Math.min(MAX_START_LEVEL, Math.max(1, startLevel + delta));
  pmLevelVal.textContent = startLevel;
  pmLevelIcon.textContent = LEVEL_ICONS[startLevel - 1];
  try { localStorage.setItem('startLevel', String(startLevel)); } catch (e) {}
}

function menuKey(e) {
  const i = pmButtons.indexOf(document.activeElement);
  if (i < 0 && e.code.startsWith('Arrow')) {
    // el foco se salió del menú: recuperarlo
    e.preventDefault();
    pmResume.focus();
    return;
  }
  switch (e.code) {
    case 'ArrowDown':
      e.preventDefault();
      pmButtons[(i + 1) % pmButtons.length].focus();
      break;
    case 'ArrowUp':
      e.preventDefault();
      pmButtons[(i - 1 + pmButtons.length) % pmButtons.length].focus();
      break;
    case 'ArrowLeft':
    case 'ArrowRight':
      e.preventDefault();
      if (document.activeElement === pmLevel) changeStartLevel(e.code === 'ArrowRight' ? 1 : -1);
      else if (document.activeElement === themeBtn) toggleTheme();
      break;
    // Enter/Espacio: el botón enfocado se activa de forma nativa
  }
}

pmResume.addEventListener('click', () => { if (paused) togglePause(); });
pmRestart.addEventListener('click', () => init());
pmControls.addEventListener('click', () => {
  const show = pmControlsList.classList.toggle('hidden') === false;
  pmControls.setAttribute('aria-expanded', String(show));
});
pmLevel.addEventListener('click', () => {
  changeStartLevel(startLevel >= MAX_START_LEVEL ? 1 - MAX_START_LEVEL : 1);
});

function loop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  if (bolt) {
    bolt.t += dt;
    if (bolt.t >= BOLT_MS) finishBolt();
  } else {
    dropAccum += dt;
  }
  if (!bolt && dropAccum >= dropInterval) {
    dropAccum = 0;
    if (!collide(current.shape, current.x, current.y + 1)) {
      current.y++;
    } else {
      lockPiece();
    }
  }
  draw();
  if (gameOver) return;
  animId = requestAnimationFrame(loop);
}

function init() {
  if (current && !gameOver) commitBests(); // partida abandonada con Reiniciar
  board = createBoard();
  score = 0;
  lines = 0;
  gameStartLevel = startLevel; // el selector solo afecta a la próxima partida
  level = gameStartLevel;
  paused = false;
  gameOver = false;
  dropInterval = intervalFor(level);
  dropAccum = 0;
  bolt = null;
  nextBoltAt = BOLT_SCORE_STEP;
  combo = 0;
  bestCombo = 0;
  startScreen.classList.add('hidden');
  recordEntry.classList.add('hidden');
  overlayRecordsEl.classList.add('hidden');
  overlayResetBtn.classList.add('hidden');
  restartBtn.style.display = '';
  canvas.classList.remove('shake');
  lastTime = performance.now();
  next = randomPiece();
  spawn();
  updateHUD();
  overlay.classList.add('hidden');
  closePauseMenu();
  blockedKeys = new Set(heldKeys);
  resumeUntil = performance.now() + RESUME_GRACE_MS;
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

document.addEventListener('keyup', e => {
  heldKeys.delete(e.code);
  blockedKeys.delete(e.code);
});

document.addEventListener('keydown', e => {
  heldKeys.add(e.code);
  // Escribir en un campo de texto no debe disparar teclas del juego
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  // Pantalla de inicio: Enter empieza la partida (si el foco está en un botón, su click ya lo hace)
  if (!startScreen.classList.contains('hidden')) {
    if (e.code === 'Enter' && e.target.tagName !== 'BUTTON') init();
    return;
  }
  if (e.code === 'KeyP' || e.code === 'Escape') {
    if (!e.repeat) togglePause();
    return;
  }
  if (paused) { menuKey(e); return; }
  if (gameOver || bolt) return;
  if (blockedKeys.has(e.code) || performance.now() < resumeUntil) {
    if (e.code === 'Space') e.preventDefault();
    return;
  }
  switch (e.code) {
    case 'ArrowLeft':
      if (!collide(current.shape, current.x - 1, current.y)) current.x--;
      break;
    case 'ArrowRight':
      if (!collide(current.shape, current.x + 1, current.y)) current.x++;
      break;
    case 'ArrowDown':
      softDrop();
      break;
    case 'ArrowUp':
    case 'KeyX':
      tryRotate();
      break;
    case 'Space':
      e.preventDefault();
      hardDrop();
      break;
  }
  updateHUD();
});

restartBtn.addEventListener('click', () => { init(); restartBtn.blur(); });

startBtn.addEventListener('click', init);
recordSave.addEventListener('click', submitRecord);
recordName.addEventListener('keydown', e => {
  if (e.code === 'Enter' || e.code === 'NumpadEnter') { e.preventDefault(); submitRecord(); }
});
document.getElementById('start-reset-records').addEventListener('click', resetRecords);
document.getElementById('overlay-reset-records').addEventListener('click', resetRecords);

function resolveGridColor() {
  gridColor = SKINS[currentSkin].gridColor ||
    getComputedStyle(document.documentElement).getPropertyValue('--grid').trim() || '#22222e';
}

function setSkin(name, save = true) {
  if (!Object.prototype.hasOwnProperty.call(SKINS, name)) name = 'retro';
  currentSkin = name;
  COLORS = SKINS[name].colors;
  document.documentElement.dataset.skin = name;
  skinSelect.value = name;
  resolveGridColor();
  if (save) {
    try { localStorage.setItem('skin', name); } catch (e) {}
  }
  if (current) { draw(); drawNext(); }
}

// Las teclas pulsadas con el selector enfocado no deben mover la pieza
skinSelect.addEventListener('keydown', e => e.stopPropagation());
skinSelect.addEventListener('change', () => {
  setSkin(skinSelect.value);
  skinSelect.blur(); // evita que flechas/Espacio cambien el selector
});

function setTheme(theme, save = true) {
  document.documentElement.dataset.theme = theme;
  resolveGridColor();
  const isLight = theme === 'light';
  themeLabel.textContent = isLight ? 'Tema: Claro' : 'Tema: Oscuro';
  themeIcon.innerHTML = isLight ? SUN_SVG : MOON_SVG;
  themeBtn.setAttribute('aria-pressed', String(isLight));
  if (save) {
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }
  // Redibujar para que el cambio se vea también en pausa o game over
  if (current) { draw(); drawNext(); }
}

function toggleTheme() {
  setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
}

themeBtn.addEventListener('click', toggleTheme);

setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark', false);

{
  let saved = null;
  try { saved = localStorage.getItem('skin'); } catch (e) {}
  setSkin(saved, false);
}

// El juego empieza desde la pantalla de inicio (botón Jugar o Enter)
showStartScreen();
