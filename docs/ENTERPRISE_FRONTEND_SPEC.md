# CAPSULA Enterprise Frontend Specification

The CAPSULA frontend is the commercial cockpit for the platform. It must feel like an enterprise-grade build system, not a demo page.

## Design principles

1. **Calm command center**: high information density without visual panic.
2. **Truthful status**: show ready, gated, planned, experimental, and missing states honestly.
3. **Protocol visibility**: the user should see that the system has rules and gates.
4. **Bot visibility**: bots should feel like platform operators, not decorations.
5. **User path clarity**: every screen should make the next action obvious.
6. **Founder-grade demo**: the product should be explainable in under five minutes.

## Primary navigation

- Overview
- Builder
- Runtimes
- Bots
- Protocols
- Workflows
- Mobile
- Funding
- Users
- Deploy

## Required surfaces

### Overview
Shows value proposition, commercial metrics, active lane, command loop, and enterprise release posture.

### Builder
Shows capsule templates and the build path from intent to preview to deploy.

### Runtimes
Shows language lanes, previews, deploy targets, toolchain honesty, and commands.

### Bots
Shows GitHub bots and CAPSULA platform bots with owner responsibilities.

### Protocols
Shows 30 protocols grouped by governance, GitHub, runtime, security, product, release, research, growth, and support.

### Workflows
Shows the real operating flows:

- issue to work packet
- capsule to preview
- preview to manifest
- manifest to release gate
- release gate to GitHub release
- user feedback to docs/product fix

### Mobile
Shows Expo Go capsule creation flow.

### Funding
Shows data room assets, investor narrative, traction signals, and demo path.

### Users
Shows activation ladder and onboarding path.

### Deploy
Shows release gate, GitHub path, manifest, CI, and handoff.

## UI polish requirements

- no dead panels
- no unexplained jargon
- no fake live integrations
- readable on laptop screens
- responsive layout
- obvious selected state
- consistent cards, chips, meters, and terminals
- hidden Easter eggs must not block serious usage

## Easter eggs

Allowed:

- hidden command string
- subtle footer marker
- non-blocking hover detail
- small internal codename

Not allowed:

- fake success status
- hidden data collection
- misleading capability claims
- disruptive animation

Current Easter egg marker: `first-light://capsula-enterprise-ui`
