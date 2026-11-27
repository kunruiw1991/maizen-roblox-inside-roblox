# Claude Reproducibility Audit Prompt — **Opus 5.5 (`extra`)**

**Target Auditor Model**: Anthropic **Claude Opus 5.5** (`--model claude-opus-5-5`, reasoning/effort: **`extra`**)
**Reference Video**: `https://youtu.be/Do9uo62h_d8` — *"How JJ and Mikey to PLAY Roblox INSIDE Roblox? - Maizen"*
**Visual Evidence**: `.qa/comparison_grid.png` (once Module 2 lands) & `.qa/reference/*` (`thumb_maxres.jpg`, `sb0_00.jpg`–`sb0_05.jpg`).

## Per-Module Audit Focus
1. **Module 1 (State & Mini-Game Logic)**: Inspect `js/data.js`, `js/state.js`, `js/audio.js`, and `tests/unit.test.js` for edge cases in Calculator (`67`), Block Blast `8×8` line clears, Roblox Obby physics, Flappy Wings, Space Defense, Couch Tic-Tac-Toe AI, and `localStorage` recovery.
2. **Module 2 (iPad Canvas Rendering, UI & E2E)**: Inspect `js/apps_canvas.js`, `js/main.js`, `index.html`, `css/style.css`, and `.qa/comparison_grid.png` for visual fidelity (JJ & Mikey's hands holding the iPad over the Roblox plaza, all 10 playable apps), zero overflow, and centered destructive reset modal safety.
3. **Actionable Findings**: Report concrete **P0 / P1 / P2** issues with exact `file:line` references.
