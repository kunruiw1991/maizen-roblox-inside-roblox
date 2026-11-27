// Pure deterministic Node-testable state machine for all 10 playable Maizen iPad apps (Do9uo62h_d8)
import { APPS, BLOCK_SHAPES } from "./data.js";

export const STORAGE_KEY = "maizen_roblox_inside_roblox_v1";

function emptyGrid(n = 8) {
  return Array.from({ length: n }, () => Array(n).fill(null));
}

export function createInitialState() {
  return {
    currentAppIndex: 0,
    soundEnabled: true,
    playedApps: {},
    mikeyWallpaper: false,
    calc: {
      display: "0",
      acc: null,
      op: null,
      fresh: true,
      meme67Count: 0,
    },
    blockblast: {
      grid: emptyGrid(8),
      tray: [BLOCK_SHAPES[0], BLOCK_SHAPES[1], BLOCK_SHAPES[2]],
      selectedTray: 0,
      score: 0,
      linesCleared: 0,
    },
    roblox: {
      playerX: 160,
      playerY: 0,
      vy: 0,
      onGround: true,
      coins: 0,
      hp: 100,
      distance: 0,
      stage: 1,
    },
    fruit: {
      score: 0,
      sliced: 0,
      combo: 0,
    },
    snake: {
      score: 0,
      length: 12,
      dirX: 1,
      dirY: 0,
    },
    flappy: {
      score: 0,
      best: 0,
      birdY: 260,
      vy: 0,
      alive: true,
    },
    draw: {
      color: "#111827",
      strokes: [],
      stampedMikey: false,
    },
    space: {
      score: 0,
      wave: 1,
      shipX: 444,
      ufosDestroyed: 0,
    },
    ttt: {
      board: Array(9).fill(null),
      turn: "X",
      winner: null,
      winLine: null,
      jjWins: 0,
      mikeyWins: 0,
    },
  };
}

export function getAppDef(index) {
  const clamped = Math.max(0, Math.min(APPS.length - 1, Number(index) || 0));
  return APPS[clamped];
}

export function selectApp(state, index) {
  const app = getAppDef(index);
  state.currentAppIndex = app.index;
  return app;
}

export function markAppPlayed(state, appId) {
  state.playedApps[appId] = true;
}

export function countPlayedApps(state) {
  return APPS.reduce((acc, a) => acc + (state.playedApps[a.id] ? 1 : 0), 0);
}

// 1. Calculator ("67" Meme!)
export function pressCalcKey(state, key) {
  const c = state.calc;
  markAppPlayed(state, "calc");
  if (key === "C") {
    c.display = "0";
    c.acc = null;
    c.op = null;
    c.fresh = true;
    return c.display;
  }
  if (key === "67") {
    c.display = c.fresh || c.display === "0" ? "67" : (c.display + "67").slice(0, 10);
    c.fresh = false;
    c.meme67Count += 1;
    return c.display;
  }
  if (/^[0-9.]$/.test(key)) {
    if (key === "." && c.display.includes(".") && !c.fresh) return c.display;
    c.display = c.fresh || (c.display === "0" && key !== ".") ? (key === "." ? "0." : key) : (c.display + key).slice(0, 10);
    c.fresh = false;
    if (c.display.includes("67")) c.meme67Count += 1;
    return c.display;
  }
  if (key === "±") {
    const v = parseFloat(c.display) || 0;
    c.display = String(-v);
    return c.display;
  }
  if (key === "%") {
    const v = parseFloat(c.display) || 0;
    c.display = String(Number((v / 100).toFixed(4)));
    return c.display;
  }
  const cur = parseFloat(c.display) || 0;
  if (["+", "−", "×", "÷"].includes(key)) {
    c.acc = cur;
    c.op = key;
    c.fresh = true;
    return c.display;
  }
  if (key === "=" && c.op !== null && c.acc !== null) {
    let out = cur;
    if (c.op === "+") out = c.acc + cur;
    else if (c.op === "−") out = c.acc - cur;
    else if (c.op === "×") out = c.acc * cur;
    else if (c.op === "÷") out = cur === 0 ? 0 : c.acc / cur;
    c.display = String(Number(out.toFixed(4))).slice(0, 10);
    c.acc = null;
    c.op = null;
    c.fresh = true;
  }
  return c.display;
}

// 2. Block Blast (8x8 Grid + Row/Col Clearing)
export function canPlaceBlock(grid, shape, row, col) {
  if (!shape) return false;
  for (const [dc, dr] of shape.cells) {
    const r = row + dr;
    const c = col + dc;
    if (r < 0 || r >= 8 || c < 0 || c >= 8) return false;
    if (grid[r][c] !== null) return false;
  }
  return true;
}

export function placeBlock(state, trayIdx, row, col) {
  const b = state.blockblast;
  const shape = b.tray[trayIdx];
  if (!canPlaceBlock(b.grid, shape, row, col)) {
    return { placed: false, cleared: 0 };
  }
  for (const [dc, dr] of shape.cells) {
    b.grid[row + dr][col + dc] = shape.color;
  }
  b.score += shape.cells.length * 10;
  markAppPlayed(state, "blockblast");

  // Clear completed rows & columns
  const fullRows = [];
  const fullCols = [];
  for (let r = 0; r < 8; r++) {
    if (b.grid[r].every((v) => v !== null)) fullRows.push(r);
  }
  for (let c = 0; c < 8; c++) {
    let all = true;
    for (let r = 0; r < 8; r++) if (b.grid[r][c] === null) all = false;
    if (all) fullCols.push(c);
  }
  for (const r of fullRows) for (let c = 0; c < 8; c++) b.grid[r][c] = null;
  for (const c of fullCols) for (let r = 0; r < 8; r++) b.grid[r][c] = null;

  const cleared = fullRows.length + fullCols.length;
  if (cleared > 0) {
    b.linesCleared += cleared;
    b.score += cleared * 100;
  }

  // Replace placed tray shape cyclically
  const nextShape = BLOCK_SHAPES[(b.score + trayIdx + 1) % BLOCK_SHAPES.length];
  b.tray[trayIdx] = nextShape;
  // Prevent permanent soft-lock if no tray piece fits anywhere on the 8x8 board
  if (!hasAnyValidBlockMove(b.grid, b.tray)) {
    b.grid = emptyGrid(8);
  }
  return { placed: true, cleared };
}

export function hasAnyValidBlockMove(grid, tray) {
  for (const shape of tray) {
    if (!shape) continue;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (canPlaceBlock(grid, shape, r, c)) return true;
      }
    }
  }
  return false;
}

// 3. Camera / FaceTime Mikey Wallpaper Snap
export function snapMikeyWallpaper(state) {
  state.mikeyWallpaper = true;
  markAppPlayed(state, "camera");
  return true;
}

// 4. Roblox Inside Roblox Obby Step
export function stepRobloxObby(state, { moveX = 0, jump = false } = {}) {
  const r = state.roblox;
  markAppPlayed(state, "roblox");
  if (jump && r.onGround) {
    r.vy = 14;
    r.onGround = false;
  }
  r.playerX = Math.max(40, Math.min(820, r.playerX + moveX * 6));
  r.distance += Math.max(0, moveX * 2);
  if (!r.onGround) {
    r.playerY += r.vy;
    r.vy -= 1.1;
    if (r.playerY <= 0) {
      r.playerY = 0;
      r.vy = 0;
      r.onGround = true;
    }
  }
  if (r.distance >= r.stage * 80) {
    r.stage += 1;
    r.coins += 5;
  }
  return r;
}

// 5. Fruit Slice
export function recordFruitSlice(state, points = 1) {
  state.fruit.sliced += 1;
  state.fruit.combo += 1;
  state.fruit.score += points;
  markAppPlayed(state, "fruit");
  return state.fruit.score;
}

// 6. Snake Arena
export function eatSnakeOrb(state, value = 5) {
  state.snake.score += value;
  state.snake.length += 2;
  markAppPlayed(state, "snake");
  return state.snake.score;
}

// 7. Flappy Wings
export function flapWings(state) {
  const f = state.flappy;
  if (!f.alive) {
    f.alive = true;
    f.birdY = 260;
    f.score = 0;
  }
  f.vy = -8.5;
  markAppPlayed(state, "flappy");
  return f.vy;
}

export function passFlappyPipe(state) {
  const f = state.flappy;
  f.score += 1;
  if (f.score > f.best) f.best = f.score;
  markAppPlayed(state, "flappy");
  return f.score;
}

// 8. Creative Draw Pad ("MIKEY NOOB" / "67" doodle)
export function stampMikeyNoob(state) {
  state.draw.stampedMikey = true;
  markAppPlayed(state, "draw");
  return true;
}

// 9. Space Defense
export function destroyUfo(state, points = 25) {
  const sp = state.space;
  sp.ufosDestroyed += 1;
  sp.score += points;
  sp.wave = 1 + Math.floor(sp.score / 200);
  markAppPlayed(state, "space");
  return sp;
}

// 10. Couch Tic-Tac-Toe Finale (JJ = X vs Mikey = O)
export const WIN_LINES = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6],
];

export function checkTttWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: "TIE", line: null };
  }
  return { winner: null, line: null };
}

export function playTttCell(state, cellIndex, rng = Math.random) {
  const t = state.ttt;
  if (cellIndex < 0 || cellIndex > 8) return { moved: false };
  if (t.winner || t.board[cellIndex] !== null) return { moved: false };

  markAppPlayed(state, "ttt");
  t.board[cellIndex] = "X";
  let res = checkTttWinner(t.board);
  if (res.winner) {
    t.winner = res.winner;
    t.winLine = res.line;
    if (res.winner === "X") t.jjWins += 1;
    return { moved: true, winner: t.winner };
  }

  // Playful, kid-friendly Mikey ("O") AI — fun & beatable, never unbeatable!
  const aiMove = pickMikeyMove(t.board, rng);
  if (aiMove >= 0) {
    t.board[aiMove] = "O";
    res = checkTttWinner(t.board);
    if (res.winner) {
      t.winner = res.winner;
      t.winLine = res.line;
      if (res.winner === "O") t.mikeyWins += 1;
    }
  }
  return { moved: true, aiMove, winner: t.winner };
}

export function pickMikeyMove(board, rng = Math.random) {
  const open = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) open.push(i);
  }
  if (!open.length) return -1;

  // Classic goofy Mikey: sometimes spots a win (~45%) or blocks JJ (~28%), otherwise picks a fun open spot!
  const findTwoInARow = (sym) => {
    for (const [a, b, c] of WIN_LINES) {
      const vals = [board[a], board[b], board[c]];
      if (vals.filter((v) => v === sym).length === 2 && vals.includes(null)) {
        return [a, b, c][vals.indexOf(null)];
      }
    }
    return -1;
  };

  const winCell = findTwoInARow("O");
  if (winCell >= 0 && rng() < 0.45) return winCell;

  const blockCell = findTwoInARow("X");
  if (blockCell >= 0 && rng() < 0.28) return blockCell;

  // Prefer varied open cells (never always hogging center + corners!)
  const pick = Math.floor(rng() * open.length);
  return open[Math.max(0, Math.min(open.length - 1, pick))];
}

export function resetTttBoard(state) {
  state.ttt.board = Array(9).fill(null);
  state.ttt.winner = null;
  state.ttt.winLine = null;
  state.ttt.turn = "X";
}

export function saveState(state, storage = typeof localStorage !== "undefined" ? localStorage : null) {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({
      currentAppIndex: state.currentAppIndex,
      soundEnabled: state.soundEnabled,
      playedApps: state.playedApps,
      mikeyWallpaper: state.mikeyWallpaper,
      flappyBest: state.flappy.best,
      jjWins: state.ttt.jjWins,
      mikeyWins: state.ttt.mikeyWins,
    }));
    return true;
  } catch {
    return false;
  }
}

export function loadState(storage = typeof localStorage !== "undefined" ? localStorage : null) {
  const fresh = createInitialState();
  if (!storage) return fresh;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const p = JSON.parse(raw);
    if (!p || typeof p !== "object") return fresh;
    fresh.currentAppIndex = Math.max(0, Math.min(APPS.length - 1, Number(p.currentAppIndex) || 0));
    fresh.soundEnabled = p.soundEnabled !== false;
    fresh.playedApps = { ...(p.playedApps || {}) };
    fresh.mikeyWallpaper = Boolean(p.mikeyWallpaper);
    fresh.flappy.best = Number(p.flappyBest) || 0;
    fresh.ttt.jjWins = Number(p.jjWins) || 0;
    fresh.ttt.mikeyWins = Number(p.mikeyWins) || 0;
    return fresh;
  } catch {
    return fresh;
  }
}
