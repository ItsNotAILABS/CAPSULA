#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "== CAPSULA production verification =="
python -m pip install -r requirements-dev.txt
python -m pytest tests

if [ -f requirements-platform.txt ]; then
  python -m pip install -r requirements-platform.txt --upgrade-strategy only-if-needed
fi

cd web
npm install
npm run verify
npm run build
cd "$ROOT"

if command -v docker >/dev/null 2>&1; then
  docker build -t capsula-api:local .
else
  echo "docker not installed; skipping container build"
fi

if command -v g++ >/dev/null 2>&1; then
  g++ -std=c++20 -O2 native/cpp/wasm_kernel/main.cpp -o /tmp/capsula-kernel
  /tmp/capsula-kernel
else
  echo "g++ not installed; skipping native C++ compile smoke test"
fi

echo "CAPSULA verification complete"
