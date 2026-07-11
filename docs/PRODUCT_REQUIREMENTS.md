# CAPSULA Product Requirements Document

## Product Name

CAPSULA Studio

## Product Goal

Build a commercial-grade app that lets users create, run, preview, package, and deploy software capsules across multiple runtime lanes.

## Primary User

A technical founder, builder, agency operator, or AI-native developer who wants to turn ideas into working software quickly while preserving deployable structure.

## Core User Jobs

1. Create a new coding capsule.
2. Select runtime lane.
3. Generate or edit files.
4. Run the capsule.
5. View preview output.
6. Generate manifest.
7. Review deploy plan.
8. Push to GitHub or prepare release.

## User-Facing Surfaces

### Overview

Commercial dashboard with value proposition, readiness metrics, active runtime lane, preview status, and command center.

### Builder

Surface for selecting capsule type and generating a production-ready unit: web app, Python agent, MCP server, Expo app, C++ WASM worker, or GitHub deploy package.

### Runtimes

Runtime lane picker with readiness status, commands, toolchain hints, and deploy targets.

### Bots + Workers

Issue bots and workers: Runtime Triage Bot, Commercial QA Bot, Deploy Bot, Research Bot, MCP AI Worker, Preview Worker, WASM Worker, GitHub Worker.

### Expo Go

Mobile generation flow that outputs an Expo app and tells users how to preview with Expo Go.

### Deploy

GitHub-first release handoff showing manifest, preview, CI, issue bot checks, and release readiness.

## Backend Requirements

- Python API server
- preview server
- session orchestration
- safe storage boundary
- runtime registry
- manifest generation
- deploy-plan generation
- MCP-style JSON-RPC server
- AI provider abstraction
- WASM planner
- Expo generator

## Non-Functional Requirements

- clear user-facing copy
- responsive layout
- no fake compiler success
- safe file paths
- low dependency footprint for local runtime
- GitHub Actions verification
- documentation sufficient for onboarding and funding conversations

## MVP Acceptance Criteria

- `cd web && npm run dev` runs commercial web app
- `python -m capsula.cli api` starts API server
- `python -m capsula.cli preview` starts preview server
- user can create Python capsule
- user can create HTML/web capsule
- user can generate manifest
- user can generate Expo project
- issue templates exist
- issue bot roadmap exists
- research papers exist
- investor brief exists

## V1 Acceptance Criteria

- Monaco editor
- real file tree
- API integration from web app
- persisted sessions
- WebSocket logs
- hosted preview route
- branch/PR flow
- authenticated accounts
- billing-ready plan structure
- team workspace model

## Success Metrics

- time to first capsule
- time to first preview
- successful manifest generation rate
- successful Expo Go preview rate
- GitHub deploy handoff completion rate
- activation rate
- returning weekly users
- paid alpha conversion
