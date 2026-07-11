#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEMO_DIR="$ROOT_DIR/examples/demo-apps"

required_files=(
  "$DEMO_DIR/capsula_studio.html"
  "$DEMO_DIR/README.md"
  "$ROOT_DIR/docs/STRUCTURE_BUILDING_PROTOCOLS.md"
  "$ROOT_DIR/docs/DEMO_APP_LAUNCH_FLOW.md"
  "$ROOT_DIR/docs/USE_CASE_TEMPLATE_MATRIX.md"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "missing required demo artifact: $file" >&2
    exit 1
  fi
  if [[ ! -s "$file" ]]; then
    echo "empty demo artifact: $file" >&2
    exit 1
  fi
  echo "ok: $file"
done

if ! grep -q "CAPSULA Studio Demo" "$DEMO_DIR/capsula_studio.html"; then
  echo "demo html missing title marker" >&2
  exit 1
fi

if ! grep -q "Render Before Backend" "$ROOT_DIR/docs/STRUCTURE_BUILDING_PROTOCOLS.md"; then
  echo "protocol docs missing render-before-backend protocol" >&2
  exit 1
fi

echo "demo app verification passed"
