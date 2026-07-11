# CAPSULA Studio

CAPSULA Studio is a capsule-first coding, preview, agent, mobile, and deployment platform. It remixes the existing Expo/Orbit-style device workflow into a full runtime studio for code capsules, MCP AI tools, Web Workers, WASM/WASI plans, Expo Go previews, and GitHub deployments.

## What This Build Is

CAPSULA runs in parallel with `ItsNotAILABS/specforge-launch-studio`:

- `specforge-launch-studio` is the broader builder/spec/launcher platform.
- `CAPSULA` is the dedicated runtime, worker, mobile preview, AI/MCP, and deployment capsule platform.

## Core Platform

- Python API server
- Python preview server
- MCP-style JSON-RPC inner server
- AI provider bridge with local fallback and OpenAI-compatible mode
- browser studio UI
- Web Worker capsule scaffold
- Expo Go mobile capsule generator
- C/C++ WASM/WASI build planner
- runtime/session orchestrator
- manifest generator
- deploy-plan engine
- GitHub CI verification

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
npm run dev
```

Open `http://127.0.0.1:5173`.

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

## Verify

```bash
python -m pip install -r requirements-dev.txt
python -m pytest tests
cd web && npm install && npm run verify && npm run build
```

## Docs

- `docs/CAPSULA_STUDIO_BUILD.md`
- `capsules/schema/capsula.schema.json`
- `workers/capsula.worker.ts`

## Deploy Direction

Current build pushes directly to `main`. The intended full automation path is:

```text
create branch -> generate capsule -> push -> open PR -> compare -> merge -> deploy artifact
```

CAPSULA is now the runtime capsule studio: code becomes sessions, sessions become manifests, manifests become workers/apps/mobile previews/WASM plans, and deploy plans go back to GitHub.
