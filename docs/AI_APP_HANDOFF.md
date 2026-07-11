# AI App Handoff Packet

This packet is for moving CAPSULA builds into GitHub, Caffeine-style builders, Emergent-style builders, Expo, or any deployment app without losing product truth.

## Required fields

| Field | Meaning |
| --- | --- |
| Product name | User-facing name |
| App root | Folder to install/build |
| Runtime | React, Node, Python, Expo, etc. |
| Install command | Exact command |
| Verify command | Exact command |
| Build/start command | Exact command |
| Env vars | Names only; never secrets |
| Public routes | What users can open |
| Admin routes | Internal/operator surfaces |
| Known limits | Honest limits and planned work |
| Deploy target | Selected platform |
| Demo script | What to show a user |
| Rollback | How to recover |

## CAPSULA default web handoff

```yaml
product: CAPSULA Studio
app_root: web
runtime: React + Vite + TypeScript
install: npm install
verify: npm run verify
build: npm run build
preview: npm run preview
env: []
routes:
  - overview
  - builder
  - runtimes
  - bot_os
  - protocols
  - workflows
  - expo_go
  - funding
  - users
  - deploy
limits:
  - live backend integration is staged behind local CAPSULA API
  - deployment targets are registered and documented; production credentials are operator-provided
```

## Caffeine handoff

Use when the target is a public product demo. Include:

- web build root
- polished headline
- screenshots
- CTA
- protocol/bot map
- deploy target matrix
- support path

## Emergent handoff

Use when another AI app platform will continue the build. Include:

- source map
- important files
- dependencies
- env contract
- errors already fixed
- verification commands
- intended user flow

## Expo handoff

Use when showing mobile:

```bash
python -m capsula.cli expo --name "CAPSULA Mobile" --slug capsula-mobile --out .capsula/expo/capsula-mobile
cd .capsula/expo/capsula-mobile
npm install
npm run start
```

Scan with Expo Go.
