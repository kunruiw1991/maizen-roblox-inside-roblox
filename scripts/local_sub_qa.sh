#!/usr/bin/env bash
set -euo pipefail
if command -v claude >/dev/null 2>&1; then
  claude --model claude-opus-5-5 --effort extra -p "$(cat .qa/claude_prompt.md)"
fi
if command -v codex >/dev/null 2>&1; then
  codex exec --model gpt-astra -c model_reasoning_effort=medium -i .qa/comparison_grid.png "$(cat .qa/gpt_prompt.md)"
fi
