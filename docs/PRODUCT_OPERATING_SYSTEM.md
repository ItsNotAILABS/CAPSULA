# CAPSULA Product Operating System

## Operating Principle

Every user action should move a capsule closer to being shown to a real person. The product should avoid dead-end generation and preserve evidence at each stage.

## Product Objects

### Workspace

A workspace contains members, projects, billing plan, and release history.

### Project

A project contains one or more capsules, selected runtime lane, source tree, preview target, and deploy destination.

### Capsule

A capsule is the product's atomic build object. It includes source, manifest, preview, worker contract, release gate, and deploy plan.

### Worker

A worker performs execution or governance: preview, session, MCP AI, issue triage, deploy, QA, or WASM planning.

### Release Gate

A release gate converts claims into evidence. It requires documented runtime command, preview confirmation, manifest, security notes, CI, and commercial copy review.

## User Journey

1. Create workspace.
2. Pick a template.
3. Create capsule.
4. Run capsule.
5. Open preview.
6. Generate manifest.
7. Review deploy plan.
8. Pass release gate.
9. Share with user/investor/client.
10. Publish to GitHub or hosted deploy target.

## Commercial Product Surfaces

- Landing page
- Auth and workspace setup
- Capsule builder
- Runtime lanes
- Code editor
- Live logs
- Preview panel
- Manifest viewer
- Deploy plan
- Issue bot dashboard
- Release gate checklist
- Billing/plan settings
- Docs and onboarding

## Alpha Definition

CAPSULA is alpha-ready when a new user can create a workspace, choose a template, generate a capsule, run it, preview it, produce a manifest, and understand how to deploy it without founder intervention.

## Beta Definition

CAPSULA is beta-ready when the same loop works for multiple users, GitHub write-back, hosted previews, billing, telemetry, and release gates.

## Commercial Readiness Definition

CAPSULA is commercial-ready when users can pay, onboard, build, preview, deploy, recover from failures, and trust security boundaries without custom support.
