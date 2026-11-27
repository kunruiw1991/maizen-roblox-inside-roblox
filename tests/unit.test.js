import test from "node:test";
import assert from "node:assert/strict";
import { APPS } from "../js/data.js";
import {
  STORAGE_KEY,
  createInitialState,
  getAppDef,
  selectApp,
  countPlayedApps,
  pressCalcKey,
  canPlaceBlock,
  placeBlock,
  snapMikeyWallpaper,
  stepRobloxObby,
  recordFruitSlice,
  eatSnakeOrb,
  flapWings,
  passFlappyPipe,
  stampMikeyNoob,
  destroyUfo,
  playTttCell,
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

test("Calculator 67 meme and arithmetic operations work accurately", () => {
  const s = createInitialState();
  assert.equal(pressCalcKey(s, "67"), "67");
  assert.equal(s.calc.meme67Count, 1);
  pressCalcKey(s, "+");
  pressCalcKey(s, "3");
  assert.equal(pressCalcKey(s, "="), "70");
  pressCalcKey(s, "±");
  assert.equal(s.calc.display, "-70");
  pressCalcKey(s, "%");
  assert.equal(s.calc.display, "-0.7");
  pressCalcKey(s, "C");
  assert.equal(s.calc.display, "0");
  pressCalcKey(s, "8");
  pressCalcKey(s, "÷");
  pressCalcKey(s, "0");
  assert.equal(pressCalcKey(s, "="), "0");
});

test("Block Blast 8x8 placement and full-row line clearing work deterministically", () => {
  const s = createInitialState();
  // Pre-fill row 0 except cols 0,1,2
  for (let c = 3; c < 8; c++) s.blockblast.grid[0][c] = "#3b82f6";
  // Tray[1] is 3-wide horizontal bar
  assert.equal(canPlaceBlock(s.blockblast.grid, s.blockblast.tray[1], 0, 0), true);
  assert.equal(canPlaceBlock(s.blockblast.grid, s.blockblast.tray[1], 0, 6), false);
  const res = placeBlock(s, 1, 0, 0);
  assert.equal(res.placed, true);
  assert.equal(res.cleared, 1);
  assert.equal(s.blockblast.linesCleared, 1);
  assert.equal(s.blockblast.grid[0].every((v) => v === null), true);
  assert.equal(placeBlock(s, 99, 0, 0).placed, false);
});

test("Roblox Obby, Camera Wallpaper, Fruit, Snake, Flappy, Draw, Space, and Couch Tic-Tac-Toe all update state cleanly", () => {
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
  flapWings(s);
  assert.equal(passFlappyPipe(s), 1);
  assert.equal(s.flappy.best, 1);
  stampMikeyNoob(s);
  assert.equal(s.draw.stampedMikey, true);
  for (let i = 0; i < 9; i++) destroyUfo(s, 25);
  assert.equal(s.space.wave, 2);

  // Couch Tic-Tac-Toe: play until winner or tie, then reset
  assert.equal(playTttCell(s, -1).moved, false);
  playTttCell(s, 0);
  assert.equal(s.ttt.board[0], "X");
  assert.equal(s.ttt.board[4], "O"); // Mikey smartly takes center!
  playTttCell(s, 1);
  playTttCell(s, 6);
  resetTttBoard(s);
  assert.equal(s.ttt.board.every((c) => c === null), true);

  assert.equal(countPlayedApps(s), 8);

  // localStorage round-trip + malformed JSON recovery
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
