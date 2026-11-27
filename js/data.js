// Chronological 10-App Maizen Roblox-Inside-Roblox iPad Simulator
// Faithfully mapped from YouTube Do9uo62h_d8 ("How JJ and Mikey to PLAY Roblox INSIDE Roblox? - Maizen")

export const CANVAS_W = 1280;
export const CANVAS_H = 720;

// Glossy iPad bezel & screen coordinates inside the 1280x720 stage (held by JJ & Mikey's Roblox hands)
export const IPAD_SCREEN = {
  x: 196,
  y: 78,
  w: 888,
  h: 556,
  r: 22,
};

export const APPS = [
  { id: "roblox",     index: 0, icon: "🎮", name: "Roblox Obby",   color: "#2563eb", timestamp: "02:55" },
  { id: "calc",       index: 1, icon: "🧮", name: "Calc 67",       color: "#f59e0b", timestamp: "00:15" },
  { id: "blockblast", index: 2, icon: "🧱", name: "Block Blast",   color: "#3b82f6", timestamp: "00:35" },
  { id: "camera",     index: 3, icon: "📷", name: "FaceTime",      color: "#10b981", timestamp: "01:10" },
  { id: "fruit",      index: 4, icon: "🍉", name: "Fruit Slice",   color: "#b45309", timestamp: "03:35" },
  { id: "snake",      index: 5, icon: "🐍", name: "Snake Arena",   color: "#06b6d4", timestamp: "04:20" },
  { id: "flappy",     index: 6, icon: "🐦", name: "Flappy Wings",  color: "#22c55e", timestamp: "05:25" },
  { id: "draw",       index: 7, icon: "🎨", name: "Draw Pad",      color: "#ec4899", timestamp: "06:15" },
  { id: "space",      index: 8, icon: "🚀", name: "Space Defense", color: "#7c3aed", timestamp: "08:40" },
  { id: "ttt",        index: 9, icon: "⭕", name: "Couch XO",      color: "#ef4444", timestamp: "09:50" },
];

export const BLOCK_SHAPES = [
  { id: "sq2", color: "#ef4444", cells: [[0,0],[1,0],[0,1],[1,1]] },
  { id: "bar3", color: "#38bdf8", cells: [[0,0],[1,0],[2,0]] },
  { id: "l3", color: "#f59e0b", cells: [[0,0],[0,1],[1,1]] },
  { id: "t4", color: "#a855f7", cells: [[0,0],[1,0],[2,0],[1,1]] },
  { id: "dot1", color: "#22c55e", cells: [[0,0]] },
  { id: "bar2v", color: "#ec4899", cells: [[0,0],[0,1]] },
];

export const CALC_KEYS = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", "67", ".", "="],
];
