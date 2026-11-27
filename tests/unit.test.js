import test from "node:test";
import assert from "node:assert/strict";
import { APPS } from "../js/data.js";
import {
  STORAGE_KEY,
  WIN_LINES,
  createInitialState,
  getAppDef,
  selectApp,
  countPlayedApps,
  pressCalcKey,
  canPlaceBlock,
  hasAnyValidBlockMove,
  placeBlock,
  snapMikeyWallpaper,
  stepRobloxObby,
  recordFruitSlice,
  eatSnakeOrb,
  flapWings,
  passFlappyPipe,
  stampMikeyNoob,
  destroyUfo,
  checkTttWinner,
  playTttCell,
  pickMikeyMove,
  resetTttBoard,
  saveState,
  loadState,
} from "../js/state.js";

test("initial state defines all 10 iPad apps cleanly", () => {
  assert.equal(APPS.length, 10);
  const s = createInitialState();
  assert.equal(getAppDef(-1).index, 0);
  assert.equal(getAppDef(99).index, 9);
  assert.equal(selectApp(s, 3).id, "camera");
  assert.equal(countPlayedApps(s), 0);
});

test("Calculator 67 meme and full arithmetic operations work accurately", () => {
  const s = createInitialState();
  assert.equal(pressCalcKey(s, "67"), "67");
  assert.equal(s.calc.meme67Count, 1);
  pressCalcKey(s, "+");
  pressCalcKey(s, "3");
  assert.equal(pressCalcKey(s, "="), "70");
  pressCalcKey(s, "−");
  pressCalcKey(s, "3");
  assert.equal(pressCalcKey(s, "="), "67");
  pressCalcKey(s, "×");
  pressCalcKey(s, "2");
  assert.equal(pressCalcKey(s, "="), "134");
  pressCalcKey(s, "±");
  assert.equal(s.calc.display, "-134");
  pressCalcKey(s, "%");
  assert.equal(s.calc.display, "-1.34");
  pressCalcKey(s, "C");
  assert.equal(s.calc.display, "0");
  pressCalcKey(s, "8");
  pressCalcKey(s, "÷");
  pressCalcKey(s, "0");
  assert.equal(pressCalcKey(s, "="), "0");
  // Prevent duplicate decimals
  pressCalcKey(s, "1");
  pressCalcKey(s, ".");
  pressCalcKey(s, "5");
  pressCalcKey(s, ".");
  assert.equal(s.calc.display, "1.5");
});

test("Block Blast 8x8 placement, line clearing, and soft-lock board recovery work deterministically", () => {
  const s = createInitialState();
  for (let c = 3; c < 8; c++) s.blockblast.grid[0][c] = "#3b82f6";
  assert.equal(canPlaceBlock(s.blockblast.grid, s.blockblast.tray[1], 0, 0), true);
  assert.equal(canPlaceBlock(s.blockblast.grid, s.blockblast.tray[1], 0, 6), false);
  const res = placeBlock(s, 1, 0, 0);
  assert.equal(res.placed, true);
  assert.equal(res.cleared, 1);
  assert.equal(s.blockblast.linesCleared, 1);
  assert.equal(s.blockblast.grid[0].every((v) => v === null), true);
  assert.equal(placeBlock(s, 99, 0, 0).placed, false);

  // Fill entire grid to test hasAnyValidBlockMove false
  const full = Array.from({ length: 8 }, () => Array(8).fill("#ef4444"));
  assert.equal(hasAnyValidBlockMove(full, s.blockblast.tray), false);
});

test("Couch Tic-Tac-Toe: JJ can cleanly win across all 8 lines, ties work, and Mikey does NOT always win!", () => {
  // 1. Verify every single one of the 8 win lines is detected for JJ (X) and Mikey (O)
  for (const line of WIN_LINES) {
    const bX = Array(9).fill(null);
    const bO = Array(9).fill(null);
    for (const idx of line) {
      bX[idx] = "X";
      bO[idx] = "O";
    }
    assert.equal(checkTttWinner(bX).winner, "X");
    assert.equal(checkTttWinner(bO).winner, "O");
  }
  assert.equal(checkTttWinner(["X","O","X","X","O","O","O","X","X"]).winner, "TIE");

  // 2. Verify deterministic JJ win increments jjWins and NOT mikeyWins
  const s = createInitialState();
  // Deterministic RNG > 0.5 causes Mikey to miss blocks & play open spots cleanly
  const chillRng = () => 0.99; // picks last open cell (8, 7, ...)
  playTttCell(s, 0, chillRng);
  playTttCell(s, 1, chillRng);
  const winRes = playTttCell(s, 2, chillRng);
  assert.equal(winRes.winner, "X");
  assert.equal(s.ttt.jjWins, 1);
  assert.equal(s.ttt.mikeyWins, 0);

  // 3. Monte Carlo 200-game fairness audit: a normal player aiming for rows/center beats Mikey the majority of the time!
  let seed = 1337;
  const seededRng = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  let jjWins = 0;
  let mikeyWins = 0;
  let ties = 0;

  for (let game = 0; game < 200; game++) {
    const g = createInitialState();
    // Simulate a normal kid playing JJ: take any immediate win for X, else pick center/corners/edges
    const pref = [4, 0, 2, 6, 8, 1, 3, 5, 7];
    while (!g.ttt.winner) {
      let move = -1;
      for (const [a, b, c] of WIN_LINES) {
        const vals = [g.ttt.board[a], g.ttt.board[b], g.ttt.board[c]];
        if (vals.filter((v) => v === "X").length === 2 && vals.includes(null)) {
          move = [a, b, c][vals.indexOf(null)];
          break;
        }
      }
      if (move < 0) move = pref.find((idx) => g.ttt.board[idx] === null);
      playTttCell(g, move, seededRng);
    }
    if (g.ttt.winner === "X") jjWins += 1;
    else if (g.ttt.winner === "O") mikeyWins += 1;
    else ties += 1;
  }

  assert.ok(jjWins >= 120, `Expected JJ to win >= 60% of 200 games, got JJ=${jjWins}, Mikey=${mikeyWins}, Ties=${ties}`);
  assert.ok(jjWins > mikeyWins * 2, `Mikey wins too often! JJ=${jjWins}, Mikey=${mikeyWins}`);
  assert.equal(pickMikeyMove(Array(9).fill("X")), -1);
});

test("Roblox Obby, Camera Wallpaper, Fruit, Snake, Flappy, Draw, Space, and localStorage persistence work cleanly", () => {
  const s = createInitialState();
  snapMikeyWallpaper(s);
  assert.equal(s.mikeyWallpaper, true);

  stepRobloxObby(s, { moveX: 5, jump: true });
  assert.equal(s.roblox.onGround, false);
  for (let i = 0; i < 30; i++) stepRobloxObby(s, { moveX: 2 });
  assert.equal(s.roblox.onGround, true);
  assert.ok(s.roblox.coins >= 5);

  assert.equal(recordFruitSlice(s, 2), 2);
  assert.equal(eatSnakeOrb(s, 10), 10);
  s.flappy.alive = false;
  flapWings(s);
  assert.equal(s.flappy.alive, true);
  assert.equal(passFlappyPipe(s), 1);
  assert.equal(s.flappy.best, 1);
  stampMikeyNoob(s);
  assert.equal(s.draw.stampedMikey, true);
  for (let i = 0; i < 9; i++) destroyUfo(s, 25);
  assert.equal(s.space.wave, 2);

  resetTttBoard(s);
  assert.equal(playTttCell(s, -1).moved, false);
  assert.equal(countPlayedApps(s), 7);

  const store = new Map();
  const mock = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
  };
  assert.equal(saveState(s, mock), true);
  const restored = loadState(mock);
  assert.equal(restored.mikeyWallpaper, true);
  assert.equal(restored.flappy.best, 1);
  mock.setItem(STORAGE_KEY, "{bad");
  assert.equal(loadState(mock).currentAppIndex, 0);
  assert.equal(saveState(s, null), false);
});
