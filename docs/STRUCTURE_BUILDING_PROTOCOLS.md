# CAPSULA Structure Building Protocols

These protocols turn CAPSULA from a code showcase into a structure-building platform. A structure is any repeatable unit a user can build on: demo app, agent, integration, workflow, template family, deployment packet, proof packet, or live service.

## Protocol P-S01: Render Before Backend

Every backend-heavy idea must have a visible front surface before launch.

Required evidence:

- static HTML or web preview
- user-facing story
- example data
- limitations called out
- next live-launch step

## Protocol P-S02: Template Owns Workflow

A template is not a file starter. It owns the full workflow.

A production template needs:

- intended user
- starting files
- local preview command
- verification command
- deploy target
- proof checklist
- escalation path when credentials are missing

## Protocol P-S03: Our Structures First

CAPSULA must ship first-class templates for the structures we build repeatedly:

- workspace IDE
- sovereign node console
- customer portal
- AI ops agent
- integration console
- data/report app
- mobile preview
- documentation portal
- release gate
- funding/data room

## Protocol P-S04: Static Demo Gate

Before Cloudflare, Vercel, Netlify, Render, or Fly receives a live deploy, the structure must pass a static-demo gate.

The gate verifies:

- openable HTML or static web app
- no required secrets in demo path
- visible workflow
- working navigation
- demo copy that a user can understand

## Protocol P-S05: Live Launch Gate

A live launch is allowed only when the template has:

- environment variable map
- build command
- deploy command
- rollback note
- owner
- support path

## Protocol P-S06: Connector Boundary

External apps are never implied to be connected until the user provides credentials or OAuth.

Each connector states:

- inbound events it accepts
- outbound events it can send
- required scopes
- secrets required
- safe local fallback

## Protocol P-S07: Backend Visibility

Backend capability must be represented as a visible panel, event log, manifest, generated file, or proof artifact.

Examples:

- worker status panel
- release gate card
- manifest viewer
- integration event log
- generated README
- mock webhook transcript

## Protocol P-S08: Build Packet Discipline

Every generated structure emits a build packet:

- files created
- commands to run
- dependencies
- deploy targets
- known missing credentials
- user test script

## Protocol P-S09: Deploy Packet Discipline

Every generated structure emits a deploy packet:

- target host
- build output directory
- environment variables
- secrets needed
- smoke test URL
- rollback path

## Protocol P-S10: Feedback Becomes Work

User feedback routes into one of four lanes:

- fix now
- docs update
- roadmap item
- support note

## Protocol P-S11: Evidence Beats Claims

CAPSULA should avoid maturity claims without evidence. Each claim links to commands, files, tests, examples, or deployment configuration.

## Protocol P-S12: Local First, Cloud Second

Local file demos, local preview servers, and static HTML proofs come before cloud deployment. This prevents empty cloud shells and keeps shipping honest.
