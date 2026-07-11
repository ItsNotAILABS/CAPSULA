# CAPSULA Studio Technical Paper

## Abstract

This paper describes the technical design of CAPSULA Studio: a full-stack capsule-based coding environment with a commercial React web application, a Python local runtime, a JSON-RPC/MCP-style tool server, web worker scaffolds, Expo Go mobile capsule generation, WebAssembly planning, and GitHub-first release handoff. The system is designed to support multiple language lanes without falsely claiming unsupported compiler availability.

## 1. System Goals

CAPSULA is designed to:

- create real coding sessions
- attach each session to a runtime lane
- write and run source files locally
- expose previews through web, API, terminal, artifact, notebook, or mobile surfaces
- generate capsule manifests
- support AI tool calls through a local tool server
- support GitHub issue, PR, and release handoffs
- prepare a path to WebAssembly and worker deployments

## 2. Runtime Model

A runtime lane is represented by:

- key
- label
- runtime kind
- default file
- run command
- preview kind
- deploy targets
- deploy modes
- server flag
- WASM candidate flag
- toolchain hint

The current lanes are Python, HTML, React, Node, C, C++, Java, Julia, MATLAB/Octave, and Expo Go. Additional lanes such as Rust, Go, R, and Shell are part of the larger platform plan.

## 3. Capsule Manifest

A capsule manifest contains:

- capsule id
- name
- version
- runtime metadata
- entrypoint
- file list
- worker contracts
- targets
- deploy mode and destination
- preview kind and URL
- build command and toolchain hint
- metadata such as logs and state

The manifest is the bridge between user-facing studio actions and machine-executable deployment plans.

## 4. Python Runtime

The Python runtime contains:

- `capsula/models.py`: dataclasses for runtime specs, files, workers, sessions, and manifests
- `capsula/runtimes.py`: runtime registry
- `capsula/storage.py`: safe local workspace boundary
- `capsula/orchestrator.py`: session creation, file writes, execution, manifests, deploy plans
- `capsula/server.py`: local API server
- `capsula/preview.py`: preview server
- `capsula/wasm.py`: honest WASM planner
- `capsula/cli.py`: local command interface

The runtime intentionally starts with the Python standard library where possible to reduce install friction and make it usable in constrained coding environments.

## 5. Web Application

The web app is a commercial-grade React/Vite studio. It includes:

- overview command center
- builder surface
- runtime lanes
- issue bots and worker cards
- Expo Go mobile flow
- deploy and release surface
- visual readiness metrics
- command snippets
- preview surfaces

The UI presents CAPSULA as a user-facing product, not only a developer scaffold.

## 6. MCP-Style AI Bridge

CAPSULA includes a lightweight JSON-RPC server compatible with MCP-style tool flows. It exposes tools for:

- listing runtimes
- creating sessions
- writing files
- running sessions
- creating manifests
- generating deploy plans
- AI code generation
- AI manifest review
- WASM planning

The first implementation is dependency-light and can later be replaced or wrapped by the official MCP SDK.

## 7. Web Workers and WASM

The worker model is used for browser-safe background computation. CAPSULA includes scaffolds for web worker capsules and plans for service worker/offline preview support.

The WASM planner checks for actual local tools such as Emscripten or clang/WASI. If they are not installed, the system reports missing toolchains instead of pretending compilation succeeded.

## 8. Issue Bots

Issue bots are represented through templates, workflow policies, and GitHub issues. The first bots are:

- Runtime Triage Bot
- Commercial QA Bot
- Deploy Bot
- Research Bot

These bots define operational behavior before full automation is attached.

## 9. Security Boundary

CAPSULA uses a safe workspace root and path traversal checks for local file operations. Future production deployments should add authentication, workspace permissions, execution sandboxing, signed capsules, audit logs, and secrets isolation.

## 10. Production Roadmap

Near-term engineering priorities:

- persistent SQLite/Postgres session store
- WebSocket logs
- Monaco editor
- hosted preview routes
- worker runtime execution
- generated branch and PR flow
- issue bot automation
- user accounts and billing
- capsule registry

## Conclusion

CAPSULA Studio establishes a technical architecture for multi-language, AI-assisted, previewable, deployable software capsules. It creates a practical path from code generation to commercial-grade user-facing software delivery.
