#!/usr/bin/env bash
set -euo pipefail

: "${CLOUDFLARE_ACCOUNT_ID:=}"
: "${CLOUDFLARE_API_TOKEN:=}"

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "Missing CLOUDFLARE_ACCOUNT_ID. Set it in GitHub Actions secrets or local env."
  exit 2
fi

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "Missing CLOUDFLARE_API_TOKEN. Set it in GitHub Actions secrets or local env."
  exit 2
fi

cd "$(dirname "$0")/../web"
npm install
npm run verify
npm run build

echo "Cloudflare preflight passed. web/dist is ready for Pages."
