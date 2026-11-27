# Codex / OpenAI Reproducibility Audit Prompt — **GPT Astra (`medium`)**

**Target Auditor Model**: OpenAI **GPT Astra** (`--model gpt-astra`, reasoning effort: **`medium`**)
**Reference Video**: `https://youtu.be/Do9uo62h_d8` — *"How JJ and Mikey to PLAY Roblox INSIDE Roblox? - Maizen"*
**Visual Evidence**: `.qa/comparison_grid.png` & `.qa/reference/*` (`thumb_maxres.jpg`, `sb0_00.jpg`–`sb0_05.jpg`).

## Per-Module Audit Focus
1. **Module 1 (Core State Machine & Unit Tests)**: Audit `js/data.js`, `js/state.js`, `js/audio.js`, and `tests/unit.test.js` for deterministic game logic across all 10 iPad apps (Calculator, Block Blast, Camera Wallpaper, Roblox Obby, Fruit Slice, Snake Arena, Flappy Wings, Draw Pad, Space Defense, Couch Tic-Tac-Toe).
2. **Module 2 (Canvas Engine, Touch UX & Visual Reproducibility)**: Audit `js/apps_canvas.js`, `js/main.js`, `tests/e2e_verify.py`, and `.qa/comparison_grid.png` for responsiveness, touch coordinates, visual polish, and zero console/overflow errors.
3. **Actionable Findings**: Report concrete **P0 / P1 / P2** findings with exact `file:line` references.
