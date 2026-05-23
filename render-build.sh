#!/usr/bin/env bash
# Render.com build command: bash ./render-build.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
VENV="$BACKEND/.venv"

echo "==> Python: create venv and install backend dependencies"
python3 -m venv "$VENV"
"$VENV/bin/pip" install --upgrade pip
"$VENV/bin/pip" install -r "$BACKEND/requirements.txt"

echo "==> Node: install frontend dependencies"
cd "$FRONTEND"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "==> Node: production build"
npm run build

echo "==> Build complete"
