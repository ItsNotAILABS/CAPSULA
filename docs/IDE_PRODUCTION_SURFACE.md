# CAPSULA IDE Production Surface

CAPSULA is moving from a showcase dashboard into an IDE-shaped production studio. The IDE envelope has eight surfaces:

1. Explorer: repo files, generated capsules, docs, manifests, examples.
2. Editor: source files, capsule manifests, deploy configs, protocol docs.
3. Terminal: verify, build, test, preview, Docker, Cloudflare preflight.
4. Preview: web studio, API health, Expo Go, static artifacts, science reports.
5. Assistant: work packets, issue triage, bot-owner routing, error repair.
6. Deploy: GitHub Pages, Cloudflare Pages, Vercel, Netlify, Render, Fly, Expo.
7. Logs: CI output, runtime logs, local telemetry, release gates.
8. Protocols: 30 operating protocols with owners and release boundaries.

## What users can do today

- Run the studio locally with `cd web && npm install && npm run dev`.
- Verify and build with `cd web && npm run verify && npm run build`.
- Run Python tests with `python -m pytest tests`.
- Run the production verification script with `bash scripts/verify-production.sh`.
- Run the API container with `docker compose up --build`.
- Prepare Cloudflare Pages with the provided workflow and secrets.
- Compile the C++ kernel when a compiler exists.
- Generate Expo Go mobile previews with the existing Expo command.

## What is intentionally not claimed yet

- A live Cloudflare URL until account secrets and project setup exist.
- Browser-executed C++/WASM until Emscripten or a WASI SDK compiles the kernel.
- Hosted API production operations until the selected host is connected.

## Maturity standard

CAPSULA should be judged by runnable paths, tests, deploy configs, real examples, and honest boundaries. That is the production standard for every new surface.
