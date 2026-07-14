# CAPSULA End-to-End Stack Plan

This is the stack direction for shipping CAPSULA as a full platform instead of a single app surface.

## Layer 1: Studio frontend

Purpose: make every backend capability visible and usable.

Ships:

- Workspace IDE
- Demo App Gallery
- Connector Gallery
- Protocol Console
- Deployment Command Center
- User Activation Board
- Template Marketplace
- Support/Feedback Loop

## Layer 2: Python platform core

Purpose: own the actual orchestration, registries, release gates, and structure logic.

Already in motion:

- runtime registry
- orchestrator
- storage boundary
- release gate model
- template registry
- deployment registry
- integration registry
- demo app registry
- IDE workspace model
- frontend ecosystem registry

Next:

- persisted sessions across CLI/API calls
- real project import and file tree scanning
- generated static demo directories
- generated deploy manifests
- connector secret status checks
- local event store for activation telemetry

## Layer 3: Static demo/render layer

Purpose: show the structure before the backend is live.

Ships:

- standalone HTML demos
- local file opening
- local HTTP preview
- Cloudflare/GitHub Pages static deploy
- demo proof packets

Next:

- generate a complete HTML demo from a template definition
- package demo assets into `dist/demo/<id>`
- produce a shareable proof URL after Cloudflare/GitHub Pages deploy

## Layer 4: Integration fabric

Purpose: meet users inside the apps they already use and let those apps use CAPSULA.

First-wave connectors:

- GitHub
- Cloudflare
- Slack
- Discord
- Linear
- Jira
- Notion
- Google Workspace
- Supabase
- Stripe
- Sentry
- Figma
- Vercel
- Netlify
- Render
- Fly.io
- Expo
- Caffeine
- Emergent
- OpenAI-compatible providers

Next:

- auth boundary cards
- webhook route contracts
- outbound action contracts
- connector health checks
- integration test fixtures

## Layer 5: Deploy/release system

Purpose: move from local value to public value.

Targets:

- local file
- local HTTP server
- GitHub Pages
- Cloudflare Pages
- Vercel
- Netlify
- Render
- Fly.io
- Docker Compose
- Expo Go
- Expo EAS

Next:

- one-click deploy instructions per target
- required secret checklist per target
- publish evidence object per target
- deploy log ingestion

## Layer 6: Governance and protocols

Purpose: keep the system from becoming random generation.

Core gates:

- render-before-backend gate
- static demo gate
- connector boundary gate
- manifest truth gate
- release gate
- live launch gate
- support feedback gate

Next:

- attach protocol ID to every template
- attach release gate to every deploy plan
- generate proof packet for every public release

## Layer 7: Commercial layer

Purpose: turn usage into an actual product/business surface.

Ships:

- pricing plan model
- activation checklist
- funding data room docs
- commercial QA gate

Next:

- Stripe checkout route plan
- workspace members and roles in UI
- workspace/project limits
- support and onboarding flows

## Execution order

1. Make the IDE workbench visible and navigable.
2. Generate more demo apps for actual use cases.
3. Add connector gallery UX and credential boundaries.
4. Wire deploy command center into real targets.
5. Add persisted workspace/session backend.
6. Add project import from GitHub.
7. Add real billing/access layer.
8. Add support/feedback loop.
9. Add marketplace submission path.
10. Package public release with proof packet.
