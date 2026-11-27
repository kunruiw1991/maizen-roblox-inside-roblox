// Canvas 2D renderer for JJ & Mikey's Roblox-Inside-Roblox iPad Simulator (Do9uo62h_d8)
// Renders the sunny studded Roblox baseplate, Mikey's green hands holding the glossy iPad, and all 10 live apps!

import { CANVAS_W, CANVAS_H, IPAD_SCREEN, CALC_KEYS } from "./data.js";
import { getAppDef } from "./state.js";

const S = IPAD_SCREEN;

function drawStuddedRect(ctx, x, y, w, h, baseColor, studColor, step = 28) {
  ctx.fillStyle = baseColor;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = studColor;
  for (let sy = y + 8; sy < y + h - 8; sy += step) {
    for (let sx = x + 8; sx < x + w - 8; sx += step) {
      ctx.fillRect(sx, sy, 12, 12);
    }
  }
}

function drawRobloxAvatar(ctx, cx, cy, scale, hoodieColor, isMikey, time, facingFront = true) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Legs
  ctx.fillStyle = isMikey ? "#16a34a" : "#1e293b";
  ctx.fillRect(-20, 42, 16, 42);
  ctx.fillRect(4, 42, 16, 42);
  // Sneakers
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(-22, 80, 18, 9);
  ctx.fillRect(4, 80, 18, 9);

  // Torso hoodie
  ctx.fillStyle = hoodieColor;
  ctx.beginPath();
  ctx.roundRect(-26, -12, 52, 58, 10);
  ctx.fill();

  // Arms (gentle wave animation)
  const wave = Math.sin(time * 0.006) * 0.28;
  ctx.save();
  ctx.translate(-32, -4);
  ctx.rotate(isMikey ? -0.4 + wave : 0.15);
  ctx.fillStyle = hoodieColor;
  ctx.beginPath();
  ctx.roundRect(-8, 0, 16, 46, 7);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 48, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(32, -4);
  ctx.rotate(isMikey ? 0.35 - wave : -0.15);
  ctx.fillStyle = hoodieColor;
  ctx.beginPath();
  ctx.roundRect(-8, 0, 16, 46, 7);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 48, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Head + Hood
  ctx.fillStyle = hoodieColor;
  ctx.beginPath();
  ctx.roundRect(-24, -58, 48, 48, 14);
  ctx.fill();

  if (facingFront) {
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.roundRect(-16, -48, 32, 30, 8);
    ctx.fill();
    // Classic Maizen Roblox face
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(-6, -37, 3.2, 0, Math.PI * 2);
    ctx.arc(6, -37, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, -29, 7, 0.1, Math.PI - 0.1);
    ctx.stroke();
  } else if (!isMikey) {
    // JJ's iconic red hood tails from behind (thumb_maxres.jpg!)
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.roundRect(-18, -22, 12, 34, 6);
    ctx.roundRect(6, -22, 12, 34, 6);
    ctx.fill();
  }

  ctx.restore();
}

function drawOuterRobloxWorld(ctx, time) {
  // Sunny sky-blue Roblox backdrop matching thumb_maxres.jpg
  const sky = ctx.createLinearGradient(0, 0, 0, 380);
  sky.addColorStop(0, "#0ea5e9");
  sky.addColorStop(0.65, "#7dd3fc");
  sky.addColorStop(1, "#e0f2fe");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_W, 380);

  // Fluffy blocky Roblox clouds
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  const drift = (time * 0.015) % 1400;
  for (const [bx, by, bw] of [[120, 72, 110], [480, 54, 130], [920, 82, 120], [1160, 48, 95]]) {
    const x = ((bx + drift) % 1420) - 100;
    ctx.fillRect(x, by, bw, 28);
    ctx.fillRect(x + 20, by - 16, bw - 40, 18);
  }

  // Bright green studded Roblox grass baseplate on left & right horizons
  drawStuddedRect(ctx, 0, 375, CANVAS_W, 345, "#22c55e", "#4ade80", 34);
  ctx.fillStyle = "#15803d";
  ctx.fillRect(0, 372, CANVAS_W, 6);
}

function drawHeldIpadBezel(ctx) {
  // Space-grey iPad outer bezel
  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.45)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = "#18181b";
  ctx.strokeStyle = "#52525b";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(S.x - 20, S.y - 20, S.w + 40, S.h + 40, 34);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawHoldingHands(ctx) {
  // Mikey's iconic green Roblox arms & white blocky gloved thumbs gripping left & right edges (thumb_maxres.jpg)
  const drawGrip = (side) => {
    ctx.save();
    if (side === "right") {
      ctx.translate(CANVAS_W, 0);
      ctx.scale(-1, 1);
    }
    // Bright green arm entering from bottom corner
    ctx.fillStyle = "#22c55e";
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 520);
    ctx.lineTo(190, 485);
    ctx.lineTo(220, 720);
    ctx.lineTo(0, 720);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Chunky white Roblox glove & thumb gripping iPad bezel
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.roundRect(142, 435, 96, 175, 26);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(172, 448, 86, 56, 22);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  drawGrip("left");
  drawGrip("right");
}

// Hit-testing helpers exported for main.js
export function getCalcKeyAt(x, y) {
  const bx = S.x + 250;
  const by = S.y + 150;
  const bw = 90;
  const bh = 66;
  const gap = 12;
  for (let r = 0; r < CALC_KEYS.length; r++) {
    for (let c = 0; c < CALC_KEYS[r].length; c++) {
      const kx = bx + c * (bw + gap);
      const ky = by + r * (bh + gap);
      if (x >= kx && x <= kx + bw && y >= ky && y <= ky + bh) {
        return CALC_KEYS[r][c];
      }
    }
  }
  return null;
}

export function getBlockBlastHit(x, y) {
  const cell = 48;
  const gx = S.x + 252;
  const gy = S.y + 68;
  if (x >= gx && x < gx + cell * 8 && y >= gy && y < gy + cell * 8) {
    return { kind: "grid", col: Math.floor((x - gx) / cell), row: Math.floor((y - gy) / cell) };
  }
  // 3 tray slots on the left panel
  for (let i = 0; i < 3; i++) {
    const tx = S.x + 48;
    const ty = S.y + 115 + i * 135;
    if (x >= tx && x <= tx + 160 && y >= ty && y <= ty + 115) {
      return { kind: "tray", index: i };
    }
  }
  return null;
}

export function getTttCellAt(x, y) {
  const size = 98;
  const gx = S.x + (S.w - size * 3) / 2;
  const gy = S.y + 125;
  if (x >= gx && x < gx + size * 3 && y >= gy && y < gy + size * 3) {
    const col = Math.floor((x - gx) / size);
    const row = Math.floor((y - gy) / size);
    return row * 3 + col;
  }
  return -1;
}

export function renderIpadStage(ctx, state, sim, time) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawOuterRobloxWorld(ctx, time);
  drawHeldIpadBezel(ctx);

  // Clip strictly to the glossy 888x556 iPad screen
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(S.x, S.y, S.w, S.h, S.r);
  ctx.clip();

  const app = getAppDef(state.currentAppIndex);
  switch (app.id) {
    case "roblox":
      renderRobloxObby(ctx, state, time);
      break;
    case "calc":
      renderCalculator(ctx, state);
      break;
    case "blockblast":
      renderBlockBlast(ctx, state);
      break;
    case "camera":
      renderFaceTimeCamera(ctx, state, time);
      break;
    case "fruit":
      renderFruitSlice(ctx, state, sim);
      break;
    case "snake":
      renderSnakeArena(ctx, state, sim);
      break;
    case "flappy":
      renderFlappyWings(ctx, state, sim, time);
      break;
    case "draw":
      renderDrawPad(ctx, state);
      break;
    case "space":
      renderSpaceDefense(ctx, state, sim, time);
      break;
    case "ttt":
      renderCouchTtt(ctx, state, time);
      break;
  }

  // Subtle iPad glass reflection diagonal sheen
  const sheen = ctx.createLinearGradient(S.x, S.y, S.x + S.w, S.y + S.h);
  sheen.addColorStop(0, "rgba(255,255,255,0.12)");
  sheen.addColorStop(0.32, "rgba(255,255,255,0)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(S.x, S.y, S.w, S.h);
  ctx.restore();

  // Draw Mikey's gripping hands over left & right edges of the iPad bezel
  drawHoldingHands(ctx);
}

function renderRobloxObby(ctx, state, time) {
  // Faithful to thumb_maxres.jpg! Bright sky, distant blocky city, studded grey walls & ramp, JJ running!
  const sky = ctx.createLinearGradient(S.x, S.y, S.x, S.y + S.h);
  sky.addColorStop(0, "#0284c7");
  sky.addColorStop(0.6, "#7dd3fc");
  sky.addColorStop(1, "#e0f2fe");
  ctx.fillStyle = sky;
  ctx.fillRect(S.x, S.y, S.w, S.h);

  // Distant blocky Roblox city skyline
  ctx.fillStyle = "rgba(186, 230, 253, 0.72)";
  for (let i = 0; i < 9; i++) {
    const bh = 75 + ((i * 43) % 110);
    ctx.fillRect(S.x + 60 + i * 92, S.y + 300 - bh, 68, bh);
  }

  // White studded base floor
  drawStuddedRect(ctx, S.x, S.y + 390, S.w, 170, "#e2e8f0", "#cbd5e1", 26);

  // Left grey studded obby tower & right studded ramp (exact silhouette of thumb_maxres.jpg!)
  drawStuddedRect(ctx, S.x + 24, S.y + 175, 250, 235, "#94a3b8", "#64748b", 26);
  // Brick accent wall behind center
  ctx.fillStyle = "#b91c1c";
  ctx.fillRect(S.x + 276, S.y + 250, 90, 140);
  // Right studded slope/ramp
  drawStuddedRect(ctx, S.x + 560, S.y + 225, 290, 175, "#cbd5e1", "#94a3b8", 24);
  // Floating golden obby coins
  const scroll = (state.roblox.distance * 3) % 240;
  for (let i = 0; i < 4; i++) {
    const cx = S.x + 340 + ((i * 150 - scroll + 600) % 520);
    const cy = S.y + 270 + Math.sin(time * 0.006 + i) * 14;
    ctx.fillStyle = "#facc15";
    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // JJ in Red Hoodie facing forward into the obby (thumb_maxres.jpg!)
  const jx = S.x + 120 + (state.roblox.playerX * 0.78);
  const jy = S.y + 345 - state.roblox.playerY * 1.4;
  drawRobloxAvatar(ctx, jx, jy, 1.45, "#ef4444", false, time, false);

  // On-screen Roblox mobile controls inside iPad (joystick left, jump right, green 100 HP bar!)
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.fillStyle = "rgba(15,23,42,0.22)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(S.x + 130, S.y + 425, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.beginPath();
  ctx.arc(S.x + 130, S.y + 425, 22, 0, Math.PI * 2);
  ctx.fill();

  // Jump button right
  ctx.fillStyle = "rgba(15,23,42,0.24)";
  ctx.beginPath();
  ctx.arc(S.x + S.w - 135, S.y + 425, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 34px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⬆", S.x + S.w - 135, S.y + 427);

  // Green HP 100 bar + Stage/Coin pill
  ctx.fillStyle = "#22c55e";
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(S.x + 42, S.y + 504, 210, 26, 13);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(String(state.roblox.hp), S.x + 240, S.y + 518);

  ctx.fillStyle = "rgba(15,23,42,0.62)";
  ctx.beginPath();
  ctx.roundRect(S.x + 30, S.y + 22, 165, 38, 19);
  ctx.fill();
  ctx.fillStyle = "#fde047";
  ctx.textAlign = "center";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(`🪙 ${state.roblox.coins} · S${state.roblox.stage}`, S.x + 112, S.y + 42);
  ctx.restore();
}

function renderCalculator(ctx, state) {
  // Retro dark iOS Calculator with bright orange operators & "67" meme (sb0_00 f3-5)
  ctx.fillStyle = "#18181b";
  ctx.fillRect(S.x, S.y, S.w, S.h);

  // Display
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 66px monospace";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(state.calc.display, S.x + 642, S.y + 92);

  if (state.calc.display.includes("67")) {
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("✨ 67! ✨", S.x + 252, S.y + 92);
  }

  const bx = S.x + 250;
  const by = S.y + 150;
  const bw = 90;
  const bh = 66;
  const gap = 12;
  for (let r = 0; r < CALC_KEYS.length; r++) {
    for (let c = 0; c < CALC_KEYS[r].length; c++) {
      const k = CALC_KEYS[r][c];
      const kx = bx + c * (bw + gap);
      const ky = by + r * (bh + gap);
      const isOp = ["÷", "×", "−", "+", "="].includes(k);
      const isTop = r === 0 && !isOp;
      const is67 = k === "67";
      ctx.fillStyle = isOp ? "#f59e0b" : (is67 ? "#ef4444" : (isTop ? "#a1a1aa" : "#3f3f46"));
      ctx.beginPath();
      ctx.roundRect(kx, ky, bw, bh, 33);
      ctx.fill();
      ctx.fillStyle = isTop ? "#18181b" : "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(k, kx + bw / 2, ky + bh / 2 + 1);
    }
  }
}

function renderBlockBlast(ctx, state) {
  // Royal-blue 8x8 Block Blast board (sb0_00 f8-11, f23-25)
  const bg = ctx.createLinearGradient(S.x, S.y, S.x, S.y + S.h);
  bg.addColorStop(0, "#1d4ed8");
  bg.addColorStop(1, "#312e81");
  ctx.fillStyle = bg;
  ctx.fillRect(S.x, S.y, S.w, S.h);

  // Score banner
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`🧱 ${state.blockblast.score}`, S.x + 444, S.y + 36);

  // 8x8 grid
  const cell = 48;
  const gx = S.x + 252;
  const gy = S.y + 68;
  ctx.fillStyle = "#172554";
  ctx.beginPath();
  ctx.roundRect(gx - 8, gy - 8, cell * 8 + 16, cell * 8 + 16, 14);
  ctx.fill();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const col = state.blockblast.grid[r][c];
      ctx.fillStyle = col || "rgba(59, 130, 246, 0.25)";
      ctx.beginPath();
      ctx.roundRect(gx + c * cell + 3, gy + r * cell + 3, cell - 6, cell - 6, 7);
      ctx.fill();
    }
  }

  // 3 Tray Shapes on left
  for (let i = 0; i < 3; i++) {
    const shape = state.blockblast.tray[i];
    const tx = S.x + 48;
    const ty = S.y + 115 + i * 135;
    const sel = state.blockblast.selectedTray === i;
    ctx.fillStyle = sel ? "rgba(250, 204, 21, 0.28)" : "rgba(15, 23, 42, 0.35)";
    ctx.strokeStyle = sel ? "#facc15" : "rgba(255,255,255,0.2)";
    ctx.lineWidth = sel ? 4 : 2;
    ctx.beginPath();
    ctx.roundRect(tx, ty, 160, 115, 16);
    ctx.fill();
    ctx.stroke();

    if (shape) {
      ctx.fillStyle = shape.color;
      for (const [dc, dr] of shape.cells) {
        ctx.beginPath();
        ctx.roundRect(tx + 36 + dc * 30, ty + 28 + dr * 30, 26, 26, 6);
        ctx.fill();
      }
    }
  }
}

function renderFaceTimeCamera(ctx, state, time) {
  // Sunny Roblox Plaza live Camera / FaceTime showing Mikey waving! (sb0_00 f15, sb0_01 f3, sb0_04 f14-16)
  const sky = ctx.createLinearGradient(S.x, S.y, S.x, S.y + 300);
  sky.addColorStop(0, "#38bdf8");
  sky.addColorStop(1, "#e0f2fe");
  ctx.fillStyle = sky;
  ctx.fillRect(S.x, S.y, S.w, 310);

  // White tiled Roblox plaza floor
  drawStuddedRect(ctx, S.x, S.y + 305, S.w, 255, "#e2e8f0", "#cbd5e1", 32);

  // Mikey waving cheerfully right in center frame!
  drawRobloxAvatar(ctx, S.x + 420, S.y + 315, 2.25, "#22c55e", true, time, true);

  // FaceTime PiP card of JJ in bottom-left
  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(S.x + 30, S.y + 355, 130, 165, 16);
  ctx.fill();
  ctx.stroke();
  drawRobloxAvatar(ctx, S.x + 95, S.y + 455, 0.9, "#ef4444", false, time, true);

  // Right black camera shutter bar (sb0_01 f3, sb0_04 f14)
  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.fillRect(S.x + S.w - 115, S.y, 115, S.h);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(S.x + S.w - 57, S.y + S.h / 2, 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = state.mikeyWallpaper ? "#22c55e" : "#ffffff";
  ctx.beginPath();
  ctx.arc(S.x + S.w - 57, S.y + S.h / 2, 26, 0, Math.PI * 2);
  ctx.fill();

  if (state.mikeyWallpaper) {
    ctx.fillStyle = "rgba(34, 197, 94, 0.9)";
    ctx.beginPath();
    ctx.roundRect(S.x + 310, S.y + 24, 240, 40, 20);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📸 Wallpaper Saved!", S.x + 430, S.y + 45);
  }
}

function renderFruitSlice(ctx, state, sim) {
  // Glossy brown wooden plank board (sb0_01 f17-22)
  ctx.fillStyle = "#7c3f18";
  ctx.fillRect(S.x, S.y, S.w, S.h);
  ctx.strokeStyle = "rgba(45, 20, 6, 0.45)";
  ctx.lineWidth = 4;
  for (let x = S.x + 90; x < S.x + S.w; x += 110) {
    ctx.beginPath();
    ctx.moveTo(x, S.y);
    ctx.lineTo(x, S.y + S.h);
    ctx.stroke();
  }

  // Score
  ctx.fillStyle = "#fde047";
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`🍉 ${state.fruit.score}`, S.x + 444, S.y + 46);

  // Flying fruits
  ctx.font = "54px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const f of sim.fruits) {
    ctx.save();
    ctx.translate(S.x + f.x, S.y + f.y);
    ctx.rotate(f.rot);
    ctx.fillText(f.emoji, 0, 0);
    ctx.restore();
  }
}

function renderSnakeArena(ctx, state, sim) {
  // Dark neon Slither.io arena (sb0_02 f2-12)
  ctx.fillStyle = "#161626";
  ctx.fillRect(S.x, S.y, S.w, S.h);
  ctx.strokeStyle = "rgba(168, 85, 247, 0.35)";
  ctx.lineWidth = 3;
  ctx.strokeRect(S.x + 24, S.y + 24, S.w - 48, S.h - 48);

  // Glowing neon orbs
  for (const o of sim.orbs) {
    ctx.fillStyle = o.color;
    ctx.beginPath();
    ctx.arc(S.x + o.x, S.y + o.y, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cyan-striped glowing snake!
  for (let i = sim.snake.length - 1; i >= 0; i--) {
    const seg = sim.snake[i];
    ctx.fillStyle = i % 2 === 0 ? "#38bdf8" : "#0284c7";
    ctx.beginPath();
    ctx.arc(S.x + seg.x, S.y + seg.y, i === 0 ? 18 : 14, 0, Math.PI * 2);
    ctx.fill();
  }
  // Cute snake eyes on head
  if (sim.snake.length) {
    const h = sim.snake[0];
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(S.x + h.x + 5, S.y + h.y - 5, 4, 0, Math.PI * 2);
    ctx.arc(S.x + h.x + 5, S.y + h.y + 5, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`🐍 ${state.snake.score}`, S.x + 444, S.y + 42);
}

function renderFlappyWings(ctx, state, sim, time) {
  // Sky-blue Flappy Wings with bright green pipes (sb0_02 f15-21)
  ctx.fillStyle = "#7dd3fc";
  ctx.fillRect(S.x, S.y, S.w, S.h);
  ctx.fillStyle = "#4ade80";
  ctx.fillRect(S.x, S.y + S.h - 72, S.w, 72);

  // Pipes
  for (const pipe of sim.pipes) {
    ctx.fillStyle = "#22c55e";
    ctx.strokeStyle = "#14532d";
    ctx.lineWidth = 3;
    ctx.fillRect(S.x + pipe.x, S.y, 68, pipe.gapY - 78);
    ctx.strokeRect(S.x + pipe.x, S.y, 68, pipe.gapY - 78);
    const botY = pipe.gapY + 78;
    ctx.fillRect(S.x + pipe.x, S.y + botY, 68, S.h - botY - 72);
    ctx.strokeRect(S.x + pipe.x, S.y + botY, 68, S.h - botY - 72);
  }

  // Yellow Bird
  ctx.save();
  ctx.translate(S.x + 220, S.y + state.flappy.birdY);
  ctx.fillStyle = "#facc15";
  ctx.strokeStyle = "#854d0e";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(8, -5, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.moveTo(18, -2);
  ctx.lineTo(30, 3);
  ctx.lineTo(18, 9);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 40px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(String(state.flappy.score), S.x + 444, S.y + 52);
  void time;
}

function renderDrawPad(ctx, state) {
  // Dark workspace + crisp white drawing pad + bottom tool strip (sb0_03 f1-15)
  ctx.fillStyle = "#3f3f46";
  ctx.fillRect(S.x, S.y, S.w, S.h);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(S.x + 88, S.y + 28, S.w - 176, S.h - 102, 12);
  ctx.fill();

  // Iconic "MIKEY NOOB / 67" doodle stamp!
  if (state.draw.stampedMikey) {
    ctx.fillStyle = "#111827";
    ctx.font = "bold 56px 'Comic Sans MS', cursive, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("MIKEY NOOB", S.x + 444, S.y + 210);
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 48px 'Comic Sans MS', cursive, sans-serif";
    ctx.fillText("67 😂", S.x + 444, S.y + 290);
  }

  // User freehand strokes
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const st of state.draw.strokes) {
    if (st.pts.length < 2) continue;
    ctx.strokeStyle = st.color;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(S.x + st.pts[0][0], S.y + st.pts[0][1]);
    for (let i = 1; i < st.pts.length; i++) {
      ctx.lineTo(S.x + st.pts[i][0], S.y + st.pts[i][1]);
    }
    ctx.stroke();
  }

  // Bottom color swatch strip + 1-tap "MIKEY NOOB" button
  const colors = ["#111827", "#ef4444", "#22c55e", "#3b82f6", "#ec4899"];
  colors.forEach((hex, idx) => {
    const cx = S.x + 240 + idx * 54;
    const cy = S.y + S.h - 36;
    ctx.fillStyle = hex;
    ctx.strokeStyle = state.draw.color === hex ? "#facc15" : "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Stamp button
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.roundRect(S.x + 530, S.y + S.h - 54, 150, 36, 18);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("✏️ MIKEY NOOB", S.x + 605, S.y + S.h - 36);
}

function renderSpaceDefense(ctx, state, sim, time) {
  // Deep purple cosmos + ringed Saturn in top-right + glowing planet floor (sb0_04 f3-13)
  const bg = ctx.createLinearGradient(S.x, S.y, S.x, S.y + S.h);
  bg.addColorStop(0, "#1e1b4b");
  bg.addColorStop(0.75, "#4c1d95");
  bg.addColorStop(1, "#7e22ce");
  ctx.fillStyle = bg;
  ctx.fillRect(S.x, S.y, S.w, S.h);

  // Twinkling stars
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 36; i++) {
    const sx = S.x + ((i * 197) % S.w);
    const sy = S.y + ((i * 113) % (S.h - 100));
    ctx.fillRect(sx, sy, 3, 3);
  }

  // Ringed Saturn in top-right (sb0_04 f3-12)
  ctx.save();
  ctx.translate(S.x + S.w - 120, S.y + 88);
  ctx.strokeStyle = "#fde68a";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.ellipse(0, 0, 56, 16, -0.25, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Purple curved planet horizon
  ctx.fillStyle = "#a855f7";
  ctx.beginPath();
  ctx.ellipse(S.x + S.w / 2, S.y + S.h + 150, 540, 210, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lasers
  ctx.fillStyle = "#38bdf8";
  for (const b of sim.bullets) {
    ctx.fillRect(S.x + b.x - 3, S.y + b.y - 12, 6, 22);
  }

  // UFO Saucers
  for (const u of sim.ufos) {
    ctx.save();
    ctx.translate(S.x + u.x, S.y + u.y);
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#bae6fd";
    ctx.beginPath();
    ctx.arc(0, -6, 13, Math.PI, 0);
    ctx.fill();
    ctx.restore();
  }

  // White Rocket Ship
  ctx.save();
  ctx.translate(S.x + state.space.shipX, S.y + S.h - 86);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(18, 18);
  ctx.lineTo(-18, 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.arc(0, 22 + Math.sin(time * 0.03) * 3, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`🚀 ${state.space.score} · WAVE ${state.space.wave}`, S.x + 444, S.y + 40);
}

function renderCouchTtt(ctx, state, time) {
  // Overhead white Roblox plaza couches + glass 3x3 Tic-Tac-Toe table (sb0_04 f17-25, sb0_05 f1-3)
  drawStuddedRect(ctx, S.x, S.y, S.w, S.h, "#cbd5e1", "#e2e8f0", 36);

  // White studio couches framing top & bottom
  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(S.x + 210, S.y + 448, 468, 86, 22);
  ctx.fill();
  ctx.stroke();

  // JJ (red) & Mikey (green) sitting side-by-side on the couch!
  drawRobloxAvatar(ctx, S.x + 360, S.y + 485, 0.72, "#ef4444", false, time, true);
  drawRobloxAvatar(ctx, S.x + 528, S.y + 485, 0.72, "#22c55e", true, time, true);

  // Score header
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`🔴 JJ ${state.ttt.jjWins}  —  ${state.ttt.mikeyWins} Mikey 🟢`, S.x + 444, S.y + 62);

  // Glass 3x3 Tic-Tac-Toe table
  const size = 98;
  const gx = S.x + (S.w - size * 3) / 2;
  const gy = S.y + 125;
  ctx.fillStyle = "rgba(30, 41, 59, 0.85)";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(gx - 12, gy - 12, size * 3 + 24, size * 3 + 24, 18);
  ctx.fill();
  ctx.stroke();

  for (let i = 0; i < 9; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = gx + col * size;
    const cy = gy + row * size;
    const isWin = state.ttt.winLine && state.ttt.winLine.includes(i);
    ctx.fillStyle = isWin ? "rgba(250, 204, 21, 0.32)" : "rgba(255, 255, 255, 0.1)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 2;
    ctx.fillRect(cx + 4, cy + 4, size - 8, size - 8);
    ctx.strokeRect(cx + 4, cy + 4, size - 8, size - 8);

    const sym = state.ttt.board[i];
    if (sym) {
      ctx.fillStyle = sym === "X" ? "#ef4444" : "#22c55e";
      ctx.font = "bold 58px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sym, cx + size / 2, cy + size / 2 + 2);
    }
  }

  if (state.ttt.winner) {
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.roundRect(S.x + 334, S.y + 82, 220, 34, 17);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 17px sans-serif";
    ctx.fillText(state.ttt.winner === "TIE" ? "🤝 TIE — Tap to Replay!" : `🏆 ${state.ttt.winner} WINS — Tap!`, S.x + 444, S.y + 100);
  }
}
