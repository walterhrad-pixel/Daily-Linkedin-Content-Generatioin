#!/usr/bin/env bash
# Render.com start command: bash ./render-run.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND="$ROOT/frontend"
VENV_PYTHON="$ROOT/backend/.venv/bin/python"

export PYTHONUTF8=1
export PYTHON_PATH="${PYTHON_PATH:-$VENV_PYTHON}"
export BACKEND_DIR="$ROOT/backend"
export PORT="${PORT:-3000}"

if [ ! -x "$PYTHON_PATH" ]; then
  echo "ERROR: Python not found at $PYTHON_PATH. Run render-build.sh first." >&2
  exit 1
fi

cd "$FRONTEND"
exec npm run start -- -p "$PORT"
