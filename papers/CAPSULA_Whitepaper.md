# CAPSULA Studio Whitepaper

## Abstract

CAPSULA Studio is a capsule-first software creation platform that turns live coding sessions into deployable units called capsules. A capsule can contain source code, runtime metadata, preview instructions, worker contracts, WebAssembly or WASI build plans, GitHub deployment metadata, and release evidence. The platform targets builders who need to create real applications, agents, mobile previews, local services, and web-worker-based deployments without manually stitching together disconnected tools.

CAPSULA is designed around a practical loop: prompt, session, code, run, preview, manifest, capsule, deploy. This loop is implemented across a commercial web studio, a Python local runtime, an MCP-style AI tool bridge, an Expo Go mobile generator, a WebAssembly planning layer, issue-bot workflows, and GitHub-first release handoff.

## Problem

Modern software builders use fragmented systems: AI chat for code generation, terminals for execution, browser tools for preview, GitHub for versioning, Expo for mobile preview, WebAssembly toolchains for portable compute, and issue trackers for collaboration. The friction appears when a generated artifact has no durable runtime identity, no manifest, no preview route, no deploy evidence, and no handoff path.

CAPSULA solves this by making the unit of work explicit. A capsule is not just code. It is code plus runtime, preview, evidence, deploy path, and operational metadata.

## Thesis

The next generation of coding platforms will not only generate files. They will operate durable build capsules that can be run, inspected, previewed, delegated to agents, and deployed across multiple surfaces. The capsule abstraction gives AI coding sessions a durable structure that humans and machines can both trust.

## Core Concepts

### Capsule

A portable build unit containing source files, runtime lane, preview target, worker contracts, build plan, AI/MCP tool metadata, issue trail, release gate, and deployment destination.

### Runtime Lane

A language or platform execution lane such as Python, React, Node, C++, Java, Expo Go, Julia, MATLAB/Octave, Rust, Go, R, or Shell. A lane is marked as ready, toolchain-required, or planned.

### Preview Surface

A user-facing surface for inspecting results: web, API, terminal, notebook, artifact, or mobile Expo Go preview.

### Worker Capsule

A capsule deployed as a web worker, service worker, agent, or background task. Worker capsules keep long-running or compute-heavy logic off the main UI thread.

### GitHub Handoff

CAPSULA uses GitHub as the first deployment and evidence surface. Generated code, manifests, docs, issues, and release plans are committed into the repository.

## Platform Architecture

CAPSULA has five layers:

1. Commercial web app: user-facing studio for building, previewing, and deploying capsules.
2. Python runtime: local API, preview server, session orchestration, storage boundary, and manifest engine.
3. MCP-style AI bridge: local JSON-RPC tool server for AI coding agents.
4. Worker and WASM layer: web worker scaffolds and honest WASM/WASI build planning.
5. GitHub operating layer: issue bots, CI workflows, release documents, and deploy handoff.

## Market Position

CAPSULA is positioned for AI-native builders, technical founders, agencies, internal tool teams, educators, and labs that need a production-grade coding studio that can move from idea to working artifact quickly while keeping runtime identity and release evidence attached.

## Differentiation

CAPSULA is different from simple prompt-to-code tools because it adds:

- capsule manifests
- local runtime execution
- preview routing
- issue-bot operating layer
- Expo Go mobile generation
- MCP-style AI tools
- WebAssembly planning
- GitHub-first deployment evidence
- commercial product interface

## Funding Narrative

CAPSULA is a foundation for an AI-native software factory. The immediate product is a developer studio. The larger opportunity is a capsule operating standard for AI-generated applications, agents, workers, and portable runtime packages.

## Roadmap

Phase 1: commercial web app, Python runtime, issue bots, docs, Expo generator, GitHub workflows.

Phase 2: persistent backend database, authenticated workspace accounts, WebSocket logs, Monaco editor, real worker execution, hosted preview.

Phase 3: containerized toolchains, managed WASM builds, MCP marketplace, team workspaces, usage billing.

Phase 4: cloud deployment fabric, organization governance, enterprise audit logs, capsule registry, agent marketplace.

## Conclusion

CAPSULA Studio makes AI-generated software more durable, previewable, and deployable by treating each build as a capsule with identity, runtime, evidence, and release path. This gives founders, builders, and teams a stronger path from code generation to commercial software delivery.
