# CAPSULA Studio

**Isolated runtime, build, preview and deployment-plan platform for the POCKET/NEXUS ecosystem.**

CAPSULA turns a project task into a bounded execution capsule with explicit scope, budgets, artifacts and handoffs. It is the right lane for work that should be separated from a primary agent workspace: code generation, preview environments, WASM planning, mobile capsules, build verification and deployment preparation.

```text
NEXUS task
  │
  ▼
CAPSULA policy + project scope
  │
  ├── create session
  ├── bounded file work
  ├── run / verify
  ├── preview
  ├── WASM / mobile plan
  ├── artifact hash
  └── deploy plan
  │
  ▼
artifact + execution receipt + handoff
```

## Quick start

```bash
python -m pip install -r requirements-dev.txt
python -m pytest tests
```

Core CLI:

```bash
python -m capsula.cli runtimes
python -m capsula.cli create python --name demo-python
python -m capsula.cli run demo-python
python -m capsula.cli manifest demo-python
python -m capsula.cli deploy-plan demo-python
python -m capsula.cli api
python -m capsula.cli preview
```

API:

```text
http://127.0.0.1:8784
```

Preview:

```text
http://127.0.0.1:8785
```

## Web Studio

```bash
cd web
npm install
npm run verify
npm run build
npm run dev
```

The Studio includes workspace, demo, connector, protocol, deployment, activation and template surfaces.

## NEXUS federation

CAPSULA is the **execution-capsule plane**. [`capsula/ecosystem.py`](capsula/ecosystem.py) provides a bounded adapter for NEXUS tasks.

The federation layer supports:

- explicit action/risk catalog;
- project-scoped `nexus.task.v1` validation;
- required time/change-byte budgets for mutating work;
- artifact lineage through `nexus.artifact.v1`;
- explicit `nexus.handoff.v1` after capsule work;
- deployment planning as a separate operation from deployment authority.

Declaration: [`ecosystem.surface.json`](ecosystem.surface.json).

## MCP

```bash
python -m capsula.mcp.server
```

Primary tools:

```text
capsula.runtimes
capsula.create_session
capsula.write_file
capsula.run_session
capsula.manifest
capsula.deploy_plan
capsula.ai_generate
capsula.ai_review
capsula.wasm_plan
capsula.expo
```

Provider modes:

```bash
CAPSULA_AI_PROVIDER=local python -m capsula.mcp.server
CAPSULA_AI_PROVIDER=openai OPENAI_API_KEY=... python -m capsula.mcp.server
```

## Runtime lanes

```text
Python
Node / React
HTML/CSS/JS
C / C++
Java
Julia
MATLAB/Octave-style
Expo Go
WASM/WASI planning
```

Toolchain-sensitive lanes detect the actual compiler/runtime and return a real failure when the toolchain is missing.

## Local production stack

```bash
docker compose up --build
curl http://127.0.0.1:8784/health
```

## Build and preview flow

```text
idea / task
 -> project scope
 -> capsule
 -> bounded mutation
 -> verify
 -> standalone preview
 -> manifest
 -> artifact hash
 -> deploy plan
 -> NEXUS handoff
```

Standalone demo previews live under `examples/demo-apps/` and can be served with:

```bash
python -m http.server 8080 -d examples/demo-apps
```

## Mobile capsule

```bash
python -m capsula.cli expo --name "CAPSULA Mobile" --slug capsula-mobile --out .capsula/expo/capsula-mobile
cd .capsula/expo/capsula-mobile
npm install
npm run start
```

## Verification

```bash
python -m pytest tests
bash scripts/verify-demo-apps.sh
cd web && npm install && npm run verify && npm run build
```

## Deployment targets

CAPSULA can prepare artifacts/plans for:

```text
Cloudflare
GitHub Pages
Vercel
Netlify
Render
Fly.io
Docker / Compose
Expo / EAS
```

External deployments should consume a capsule manifest and artifact hashes so the deployed version can be traced back to its build.

## Repository map

```text
capsula/                  runtime + ecosystem adapter
capsules/                 capsule schemas
tests/                    runtime/contract tests
web/                      browser Studio
workers/                  worker scaffolds
examples/                 demo and real-work examples
docs/                     production/deployment/design guides
ecosystem.surface.json    NEXUS capability declaration
```

## Docs

- [`docs/PRODUCTION_MATURITY.md`](docs/PRODUCTION_MATURITY.md)
- [`docs/DEPLOYMENT_MATRIX.md`](docs/DEPLOYMENT_MATRIX.md)
- [`docs/STRUCTURE_BUILDING_PROTOCOLS.md`](docs/STRUCTURE_BUILDING_PROTOCOLS.md)
- [`docs/FRONTEND_ECOSYSTEM.md`](docs/FRONTEND_ECOSYSTEM.md)
- [`docs/UI_UX_SYSTEM.md`](docs/UI_UX_SYSTEM.md)

## Ecosystem

- [NEXUS](https://github.com/ItsNotAILABS/nexus) — protocol/route authority
- [POCKET](https://github.com/ItsNotAILABS/pocket) — identity, tenancy and policy
- [POCKET Agent](https://github.com/ItsNotAILABS/pocket-agent) — long-running execution
- [MatDaemon](https://github.com/ItsNotAILABS/MatDaemon) — bounded compute
- [Sovereign Forge](https://github.com/ItsNotAILABS/sovereign-forge-os) — build/release preparation

CAPSULA's core value is isolation with lineage: **scope the work, execute it in a bounded lane, prove the output, and hand it back cleanly.**
