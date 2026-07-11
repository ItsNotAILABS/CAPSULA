# CAPSULA Studio

CAPSULA Studio is a capsule-first coding, preview, agent, mobile, and deployment platform. It turns code sessions into runnable capsules with manifests, release gates, deployment targets, Expo Go previews, GitHub workflows, demo apps, structure-building protocols, and real-work proof packets.

## What This Build Is

CAPSULA runs in parallel with `ItsNotAILABS/specforge-launch-studio`:

- `specforge-launch-studio` is the broader builder/spec/launcher platform.
- `CAPSULA` is the dedicated runtime, worker, mobile preview, AI/MCP, integration, demo-app, and deployment capsule platform.

## Core Platform

- Python API server
- Python preview server
- MCP-style JSON-RPC inner server
- AI provider bridge with local fallback and OpenAI-compatible mode
- browser studio UI
- static HTML demo app gallery for prelaunch rendering
- Web Worker capsule scaffold
- Expo Go mobile capsule generator
- C/C++ WASM/WASI build planner
- runtime/session orchestrator
- manifest generator
- deploy-plan engine
- GitHub CI verification
- GitHub Pages production deploy workflow
- Docker, Compose, Vercel, Netlify, Render, Fly.io, and Cloudflare deployment configuration
- professional math/science/data/AI optional stack
- integration fabric for the apps users already use
- real-work examples and live-demo proof packet

## Production Posture

CAPSULA should be judged by evidence, not adjectives. A capability is considered mature only when it has:

- a runnable command
- source files in the repository
- a verification command or release gate
- a deployment target
- documentation for the user/operator
- an explicit limitation when outside credentials are required

See:

- `docs/PRODUCTION_MATURITY.md`
- `docs/REAL_WORK_PORTFOLIO.md`
- `docs/DEPLOYMENT_MATRIX.md`
- `docs/CAPSULA_SHOWCASE.md`

## Quick Start

```bash
python -m capsula.cli api
python -m capsula.cli preview
python -m capsula.cli runtimes
python -m capsula.cli create python --name demo-python
python -m capsula.cli run demo-python
python -m capsula.cli manifest demo-python
python -m capsula.cli deploy-plan demo-python
```

API server: `http://127.0.0.1:8784`

Preview server: `http://127.0.0.1:8785`

## Web Studio

```bash
cd web
npm install
npm run verify
npm run build
npm run dev
```

Open `http://127.0.0.1:5173`.

## Standalone Demo App Preview

Use this when the backend is hard to see or when a user needs a visible proof before live launch.

```text
examples/demo-apps/capsula_studio.html
```

Open it directly as a local file, or serve it:

```bash
python -m http.server 8080 -d examples/demo-apps
```

Then open:

```text
http://127.0.0.1:8080/capsula_studio.html
```

Verify demo artifacts:

```bash
bash scripts/verify-demo-apps.sh
```

## Local Production Stack

```bash
docker compose up --build
```

API health check:

```bash
curl http://127.0.0.1:8784/health
```

## MCP Inner Server

```bash
python -m capsula.mcp.server
```

AI modes:

```bash
CAPSULA_AI_PROVIDER=local python -m capsula.mcp.server
CAPSULA_AI_PROVIDER=openai OPENAI_API_KEY=... CAPSULA_AI_MODEL=gpt-4.1-mini python -m capsula.mcp.server
```

Available MCP-style tools:

- `capsula.runtimes`
- `capsula.create_session`
- `capsula.write_file`
- `capsula.run_session`
- `capsula.manifest`
- `capsula.deploy_plan`
- `capsula.ai_generate`
- `capsula.ai_review`
- `capsula.wasm_plan`
- `capsula.expo`

## Expo Go Capsule

```bash
python -m capsula.cli expo --name "CAPSULA Mobile" --slug capsula-mobile --out .capsula/expo/capsula-mobile
cd .capsula/expo/capsula-mobile
npm install
npm run start
```

Scan the QR code with Expo Go.

## Runtime Lanes

- Python
- React
- Node
- HTML/CSS/JS
- C
- C++
- Java
- Julia
- MATLAB/Octave-style
- Expo Go mobile

Toolchain-sensitive lanes do not fake compile success. WASM planning detects real Emscripten or clang/WASI tooling.

## Structure-Building Protocols

CAPSULA structures should follow this ladder:

```text
idea -> structure template -> standalone demo -> local preview -> proof packet -> live deploy
```

Key docs:

- `docs/STRUCTURE_BUILDING_PROTOCOLS.md`
- `docs/DEMO_APP_LAUNCH_FLOW.md`
- `docs/USE_CASE_TEMPLATE_MATRIX.md`
- `examples/demo-apps/README.md`

## Full Platform Stack

Core remains stdlib-first. Install the heavy stack when the user session needs math, science, data, notebooks, AI, APIs, storage, or professional analysis.

```bash
python -m pip install -r requirements-platform.txt
```

## Deploy Targets

Static/web:

- GitHub Pages workflow: `.github/workflows/pages.yml`
- Vercel: `vercel.json`
- Netlify: `netlify.toml`
- Cloudflare Pages: build `web/dist`

API/service:

- Dockerfile
- Docker Compose
- Render blueprint: `render.yaml`
- Fly.io config: `fly.toml`
- Railway compatible Docker/Python service

Mobile/showcase:

- Expo Go QR preview
- Expo EAS build route
- Caffeine-style app showcase
- Emergent-style app handoff

## Verify

```bash
python -m pip install -r requirements-dev.txt
python -m pytest tests
bash scripts/verify-demo-apps.sh
cd web && npm install && npm run verify && npm run build
```

## Real Work Examples

- `examples/real-work/customer-portal/README.md`
- `examples/real-work/science-data-report/report.py`
- `examples/real-work/science-data-report/README.md`
- `examples/demo-apps/capsula_studio.html`

## Docs

- `docs/PRODUCTION_MATURITY.md`
- `docs/REAL_WORK_PORTFOLIO.md`
- `docs/DEPLOYMENT_MATRIX.md`
- `docs/CAPSULA_SHOWCASE.md`
- `docs/AI_APP_HANDOFF.md`
- `docs/PROTOCOL_ATLAS.md`
- `docs/STRUCTURE_BUILDING_PROTOCOLS.md`
- `docs/DEMO_APP_LAUNCH_FLOW.md`
- `docs/USE_CASE_TEMPLATE_MATRIX.md`
- `capsules/schema/capsula.schema.json`
- `workers/capsula.worker.ts`

## Deploy Direction

CAPSULA supports direct-to-main work when explicitly requested, plus the intended release path:

```text
create branch -> generate capsule -> push -> open PR -> compare -> merge -> deploy artifact
```

CAPSULA is the runtime capsule studio: code becomes sessions, sessions become manifests, manifests become workers/apps/mobile previews/WASM plans, deploy plans go back to GitHub, demo apps make backend work visible, and production surfaces can be shipped to public URLs once the target host/account is connected.
