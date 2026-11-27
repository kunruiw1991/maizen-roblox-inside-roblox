// Main controller for Maizen: Roblox INSIDE Roblox iPad Simulator (Do9uo62h_d8)
import { APPS, CANVAS_W, CANVAS_H, IPAD_SCREEN } from "./data.js";
import {
  createInitialState,
  loadState,
  saveState,
  getAppDef,
  selectApp,
  countPlayedApps,
  pressCalcKey,
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
} from "./state.js";
import { IpadAudio } from "./audio.js";
import {
  renderIpadStage,
  getCalcKeyAt,
  getBlockBlastHit,
  getTttCellAt,
} from "./apps_canvas.js";

const S = IPAD_SCREEN;
const canvas = document.getElementById("ipad-canvas");
const ctx = canvas.getContext("2d");

const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const btnProgress = document.getElementById("btn-progress");
const btnGallery = document.getElementById("btn-gallery");
const btnGalleryClose = document.getElementById("btn-gallery-close");
const btnSound = document.getElementById("btn-sound");
const iconSoundOn = document.getElementById("icon-sound-on");
const iconSoundOff = document.getElementById("icon-sound-off");
const btnReset = document.getElementById("btn-reset");
const resetModal = document.getElementById("reset-modal");
const btnResetNo = document.getElementById("btn-reset-no");
const btnResetYes = document.getElementById("btn-reset-yes");
const appCounter = document.getElementById("app-counter");
const progressFill = document.getElementById("progress-fill");
const toolPill = document.getElementById("tool-pill");
const galleryOverlay = document.getElementById("gallery-overlay");
const galleryGrid = document.getElementById("gallery-grid");

let state = loadState();
const audio = new IpadAudio();
audio.setEnabled(state.soundEnabled);

// Real-time arcade simulation buffers (Fruit, Snake, Flappy, Space)
const sim = {
  fruits: [
    { x: 240, y: 380, vx: 1.8, vy: -7.8, rot: 0, emoji: "🍉" },
    { x: 520, y: 420, vx: -1.4, vy: -8.6, rot: 0.4, emoji: "🍊" },
    { x: 680, y: 360, vx: -2.1, vy: -7.5, rot: 1.0, emoji: "🍋" },
  ],
  snake: Array.from({ length: 14 }, (_, i) => ({ x: 420 - i * 12, y: 270 })),
  snakeTarget: { x: 580, y: 270 },
  orbs: Array.from({ length: 16 }, (_, i) => ({
    x: 70 + ((i * 137) % (S.w - 140)),
    y: 70 + ((i * 89) % (S.h - 140)),
    color: ["#fde047", "#38bdf8", "#f472b6", "#4ade80"][i % 4],
  })),
  pipes: [
    { x: 560, gapY: 240, passed: false },
    { x: 860, gapY: 300, passed: false },
  ],
  ufos: [
    { x: 240, y: 120, vx: 1.8 },
    { x: 480, y: 90, vx: -2.0 },
    { x: 680, y: 150, vx: 1.5 },
  ],
  bullets: [],
  tickCount: 0,
};

let pointerDown = false;
let activeStroke = null;
const keys = new Set();

function toCanvasXY(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((evt.clientX - rect.left) / rect.width) * CANVAS_W,
    y: ((evt.clientY - rect.top) / rect.height) * CANVAS_H,
  };
}

function updateTopHUD() {
  btnPrev.disabled = state.currentAppIndex <= 0;
  btnNext.disabled = state.currentAppIndex >= APPS.length - 1;
  appCounter.textContent = `${state.currentAppIndex + 1}/${APPS.length}`;
  const pct = Math.max(10, Math.round((countPlayedApps(state) / APPS.length) * 100));
  progressFill.style.width = `${pct}%`;

  btnSound.setAttribute("aria-pressed", String(state.soundEnabled));
  iconSoundOn.classList.toggle("hidden", !state.soundEnabled);
  iconSoundOff.classList.toggle("hidden", state.soundEnabled);
}

function renderDock() {
  toolPill.innerHTML = "";
  for (const app of APPS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tool-btn";
    if (app.index === state.currentAppIndex) btn.classList.add("active");
    if (state.playedApps[app.id]) btn.classList.add("done");
    btn.setAttribute("aria-label", app.name);
    btn.title = app.name;
    btn.textContent = app.icon;
    btn.dataset.app = app.id;
    btn.addEventListener("click", () => {
      audio.playTap(660);
      goApp(app.index);
    });
    toolPill.appendChild(btn);
  }
}

function renderGallery() {
  galleryGrid.innerHTML = "";
  for (const app of APPS) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "app-tile";
    if (app.index === state.currentAppIndex) tile.classList.add("current");
    if (state.playedApps[app.id]) tile.classList.add("done");
    tile.style.background = `linear-gradient(145deg, ${app.color}, #1e293b)`;
    tile.innerHTML = `<span class="tile-icon">${app.icon}</span><span class="tile-name">${app.name}</span>`;
    tile.addEventListener("click", () => {
      audio.playTap(700);
      goApp(app.index);
      galleryOverlay.classList.add("hidden");
    });
    galleryGrid.appendChild(tile);
  }
}

function goApp(idx) {
  selectApp(state, idx);
  saveState(state);
  updateTopHUD();
  renderDock();
}

function handleCanvasDown(x, y) {
  const app = getAppDef(state.currentAppIndex);
  const lx = x - S.x;
  const ly = y - S.y;

  if (app.id === "roblox") {
    const isJump = lx > S.w * 0.55;
    stepRobloxObby(state, { moveX: isJump ? 3 : (lx > 130 ? 4 : -4), jump: isJump });
    audio.playTap(isJump ? 820 : 540);
  } else if (app.id === "calc") {
    const key = getCalcKeyAt(x, y);
    if (key) {
      pressCalcKey(state, key);
      audio.playTap(key === "67" ? 960 : 620);
    }
  } else if (app.id === "blockblast") {
    const hit = getBlockBlastHit(x, y);
    if (hit && hit.kind === "tray") {
      state.blockblast.selectedTray = hit.index;
      audio.playTap(580);
    } else if (hit && hit.kind === "grid") {
      const res = placeBlock(state, state.blockblast.selectedTray, hit.row, hit.col);
      if (res.placed) audio[res.cleared ? "playWin" : "playTap"]();
    }
  } else if (app.id === "camera") {
    snapMikeyWallpaper(state);
    audio.playWin();
  } else if (app.id === "fruit") {
    sliceFruitsNear(lx, ly);
  } else if (app.id === "snake") {
    sim.snakeTarget.x = Math.max(40, Math.min(S.w - 40, lx));
    sim.snakeTarget.y = Math.max(40, Math.min(S.h - 40, ly));
  } else if (app.id === "flappy") {
    flapWings(state);
    audio.playTap(760);
  } else if (app.id === "draw") {
    // Check color swatches or "MIKEY NOOB" stamp button
    const colors = ["#111827", "#ef4444", "#22c55e", "#3b82f6", "#ec4899"];
    for (let i = 0; i < colors.length; i++) {
      if (Math.hypot(lx - (240 + i * 54), ly - (S.h - 36)) <= 20) {
        state.draw.color = colors[i];
        audio.playTap(660);
        return;
      }
    }
    if (lx >= 530 && lx <= 680 && ly >= S.h - 54 && ly <= S.h - 18) {
      stampMikeyNoob(state);
      audio.playWin();
    } else if (lx >= 88 && lx <= S.w - 88 && ly >= 28 && ly <= S.h - 74) {
      activeStroke = { color: state.draw.color, pts: [[lx, ly]] };
      state.draw.strokes.push(activeStroke);
      state.playedApps.draw = true;
    }
  } else if (app.id === "space") {
    state.space.shipX = Math.max(45, Math.min(S.w - 45, lx));
    sim.bullets.push({ x: state.space.shipX, y: S.h - 110 });
    audio.playLaser();
  } else if (app.id === "ttt") {
    if (state.ttt.winner) {
      resetTttBoard(state);
      audio.playTap(600);
    } else {
      const idx = getTttCellAt(x, y);
      if (idx >= 0) {
        const res = playTttCell(state, idx);
        if (res.moved) audio[res.winner ? "playWin" : "playTap"]();
      }
    }
  }

  saveState(state);
  updateTopHUD();
  renderDock();
}

function sliceFruitsNear(lx, ly) {
  for (const f of sim.fruits) {
    if (Math.hypot(f.x - lx, f.y - ly) <= 46) {
      recordFruitSlice(state, 1);
      audio.playSlice();
      f.y = S.h + 30;
      f.x = 120 + Math.random() * (S.w - 240);
      f.vy = -8.4 - Math.random() * 2.5;
      f.emoji = ["🍉", "🍊", "🍋", "🍓", "🍎"][Math.floor(Math.random() * 5)];
      updateTopHUD();
      renderDock();
    }
  }
}

canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  pointerDown = true;
  const pt = toCanvasXY(e);
  handleCanvasDown(pt.x, pt.y);
});

canvas.addEventListener("pointermove", (e) => {
  const pt = toCanvasXY(e);
  const lx = pt.x - S.x;
  const ly = pt.y - S.y;
  const app = getAppDef(state.currentAppIndex);

  if (app.id === "snake" && lx >= 20 && lx <= S.w - 20 && ly >= 20 && ly <= S.h - 20) {
    sim.snakeTarget.x = lx;
    sim.snakeTarget.y = ly;
  }
  if (app.id === "space" && pointerDown) {
    state.space.shipX = Math.max(45, Math.min(S.w - 45, lx));
  }
  if (app.id === "fruit" && pointerDown) {
    sliceFruitsNear(lx, ly);
  }
  if (app.id === "draw" && pointerDown && activeStroke) {
    if (lx >= 88 && lx <= S.w - 88 && ly >= 28 && ly <= S.h - 74) {
      activeStroke.pts.push([lx, ly]);
    }
  }
});

const release = () => { pointerDown = false; activeStroke = null; };
canvas.addEventListener("pointerup", release);
canvas.addEventListener("pointercancel", release);

// Top pill & modal bindings
btnPrev.addEventListener("click", () => { if (state.currentAppIndex > 0) goApp(state.currentAppIndex - 1); });
btnNext.addEventListener("click", () => { if (state.currentAppIndex < APPS.length - 1) goApp(state.currentAppIndex + 1); });

const openGallery = () => { renderGallery(); galleryOverlay.classList.remove("hidden"); };
btnGallery.addEventListener("click", openGallery);
btnProgress.addEventListener("click", openGallery);
btnGalleryClose.addEventListener("click", () => galleryOverlay.classList.add("hidden"));
galleryOverlay.addEventListener("click", (e) => { if (e.target === galleryOverlay) galleryOverlay.classList.add("hidden"); });

btnSound.addEventListener("click", () => {
  state.soundEnabled = !state.soundEnabled;
  audio.setEnabled(state.soundEnabled);
  saveState(state);
  updateTopHUD();
});

const closeResetModal = () => resetModal.classList.add("hidden");
btnReset.addEventListener("click", () => { resetModal.classList.remove("hidden"); btnResetNo.focus(); });
btnResetNo.addEventListener("click", closeResetModal);
resetModal.addEventListener("click", (e) => { if (e.target === resetModal) closeResetModal(); });
btnResetYes.addEventListener("click", () => {
  state = createInitialState();
  saveState(state);
  closeResetModal();
  updateTopHUD();
  renderDock();
});

window.addEventListener("keydown", (e) => {
  keys.add(e.key.toLowerCase());
  if (e.key === " " && getAppDef(state.currentAppIndex).id === "flappy") flapWings(state);
  if (e.key === "Escape") { galleryOverlay.classList.add("hidden"); closeResetModal(); }
});
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

function stepSimulations() {
  sim.tickCount += 1;
  const app = getAppDef(state.currentAppIndex);

  if (app.id === "roblox") {
    let mx = 0;
    if (keys.has("d") || keys.has("arrowright")) mx = 1;
    if (keys.has("a") || keys.has("arrowleft")) mx = -1;
    if (mx !== 0 || !state.roblox.onGround || keys.has(" ")) {
      stepRobloxObby(state, { moveX: mx, jump: keys.has(" ") });
    }
  } else if (app.id === "fruit") {
    for (const f of sim.fruits) {
      f.x += f.vx;
      f.y += f.vy;
      f.vy += 0.16;
      f.rot += 0.04;
      if (f.y > S.h + 40) {
        f.x = 120 + Math.random() * (S.w - 240);
        f.y = S.h + 10;
        f.vx = (Math.random() - 0.5) * 3.8;
        f.vy = -8.5 - Math.random() * 2.4;
      }
    }
  } else if (app.id === "snake") {
    const head = sim.snake[0];
    const ang = Math.atan2(sim.snakeTarget.y - head.y, sim.snakeTarget.x - head.x);
    const nx = Math.max(36, Math.min(S.w - 36, head.x + Math.cos(ang) * 3.6));
    const ny = Math.max(36, Math.min(S.h - 36, head.y + Math.sin(ang) * 3.6));
    sim.snake.unshift({ x: nx, y: ny });
    while (sim.snake.length > Math.min(48, state.snake.length)) sim.snake.pop();
    for (const o of sim.orbs) {
      if (Math.hypot(o.x - nx, o.y - ny) < 22) {
        eatSnakeOrb(state, 5);
        o.x = 60 + Math.random() * (S.w - 120);
        o.y = 60 + Math.random() * (S.h - 120);
        updateTopHUD();
        renderDock();
      }
    }
  } else if (app.id === "flappy") {
    state.flappy.vy += 0.35;
    state.flappy.birdY = Math.max(26, Math.min(S.h - 95, state.flappy.birdY + state.flappy.vy));
    for (const p of sim.pipes) {
      p.x -= 2.4;
      if (!p.passed && p.x + 68 < 220) {
        p.passed = true;
        passFlappyPipe(state);
      }
      if (p.x < -80) {
        p.x = S.w + 40;
        p.gapY = 160 + Math.random() * 190;
        p.passed = false;
      }
    }
  } else if (app.id === "space") {
    if (sim.tickCount % 22 === 0) {
      sim.bullets.push({ x: state.space.shipX, y: S.h - 110 });
    }
    for (let i = sim.bullets.length - 1; i >= 0; i--) {
      sim.bullets[i].y -= 9;
      if (sim.bullets[i].y < 0) sim.bullets.splice(i, 1);
    }
    for (const u of sim.ufos) {
      u.x += u.vx;
      if (u.x < 50 || u.x > S.w - 50) u.vx *= -1;
      for (let i = sim.bullets.length - 1; i >= 0; i--) {
        if (Math.hypot(u.x - sim.bullets[i].x, u.y - sim.bullets[i].y) < 30) {
          sim.bullets.splice(i, 1);
          destroyUfo(state, 25);
          u.x = 80 + Math.random() * (S.w - 160);
          u.y = 75 + Math.random() * 130;
          updateTopHUD();
          renderDock();
          break;
        }
      }
    }
  }
}

function tick(time) {
  stepSimulations();
  renderIpadStage(ctx, state, sim, time);
  requestAnimationFrame(tick);
}

window.__GAME__ = {
  isReady: () => true,
  getState: () => state,
  goApp: (idx) => goApp(idx),
  pressCalc: (k) => { pressCalcKey(state, k); updateTopHUD(); renderDock(); },
  placeBlock: (t, r, c) => { placeBlock(state, t, r, c); updateTopHUD(); renderDock(); },
  snapCamera: () => { snapMikeyWallpaper(state); updateTopHUD(); renderDock(); },
  stampDraw: () => { stampMikeyNoob(state); updateTopHUD(); renderDock(); },
  playTtt: (i) => { playTttCell(state, i); updateTopHUD(); renderDock(); },
};

updateTopHUD();
renderDock();
requestAnimationFrame(tick);
