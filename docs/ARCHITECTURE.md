# CAPSULA Architecture

## High-Level Architecture

CAPSULA is composed of the following layers:

```text
Web Studio
  -> Python API Server
  -> Orchestrator
  -> Runtime Registry
  -> Storage Boundary
  -> Preview Server
  -> Manifest Engine
  -> Deploy Planner
  -> MCP AI Tool Server
  -> GitHub Handoff
```

## Web Studio

The web studio lives under `web/` and is built with React, TypeScript, Vite, and CSS. It is the commercial product surface that users see first.

Core views:

- Overview
- Builder
- Runtimes
- Bots + Workers
- Expo Go
- Deploy

## Python Runtime

The Python runtime lives under `capsula/`.

Key modules:

- `models.py`: dataclass models
- `runtimes.py`: runtime lane registry
- `storage.py`: safe workspace boundary
- `orchestrator.py`: session and manifest engine
- `server.py`: HTTP API
- `preview.py`: local preview server
- `wasm.py`: WASM/WASI build planner
- `expo.py`: Expo Go generator
- `ai.py`: AI provider layer
- `cli.py`: command-line entrypoint

## Session Lifecycle

1. User selects runtime lane.
2. Orchestrator creates session root.
3. Starter file is written.
4. User edits or generates code.
5. Runtime command runs when toolchain exists.
6. Preview route is exposed.
7. Manifest is generated.
8. Deploy plan is generated.
9. GitHub handoff occurs.

## Runtime Lane State

Runtime lanes should always be honest:

- ready: local commands are expected to work with common tools
- toolchain: requires compiler/runtime installation
- planned: modeled but not fully implemented

## Storage Boundary

CAPSULA writes into `.capsula/` by default. Path traversal is rejected by safe path joining. Future production versions should isolate execution in containers.

## Preview Routing

Preview kinds:

- web
- API
- terminal
- notebook
- artifact
- mobile

The preview server resolves session files from the safe session root.

## MCP/AI Bridge

The MCP-style server is a local JSON-RPC tool server. It exposes controlled methods to local AI clients instead of letting AI write or execute arbitrary commands without boundaries.

## Deployment Model

GitHub is the first deployment and evidence target. Future deployments can include:

- hosted CAPSULA cloud
- static web hosting
- cloud workers
- Expo/EAS
- container services
- capsule registry

## Security Model

Minimum current protections:

- local root isolation
- safe join path checks
- toolchain honesty
- no hidden deploy claims

Future protections:

- authentication
- workspace ACLs
- sandboxed execution
- signed capsules
- audit logs
- secret vault
- dependency scanning

## Commercial Readiness Path

To reach commercial production:

1. connect web app to API
2. add persistent database
3. add editor/file tree
4. add WebSocket logs
5. add hosted preview
6. add real branch/PR workflow
7. add billing and users
8. add cloud compiler workers
9. add team workspaces
10. add security and governance
