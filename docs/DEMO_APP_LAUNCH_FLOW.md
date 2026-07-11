# Demo App Launch Flow

CAPSULA needs demo apps because backend systems are hard to see. The platform should let a builder create a visible HTML or static app first, prove the structure, then graduate to a hosted launch.

## Flow

```text
idea -> structure template -> standalone demo -> local preview -> proof packet -> live deploy
```

## Stage 1: Structure Intake

Capture:

- user type
- problem
- structure family
- target runtime
- demo surface
- integration needs
- deploy host

## Stage 2: Standalone Demo

Generate one of these before live launch:

- `*.html` single-file demo
- static React/Vite app
- docs portal
- dashboard mock
- integration console mock
- mobile preview mock

The demo must open without backend secrets.

## Stage 3: Local Preview

Use one of:

```bash
python -m http.server 8080 -d examples/demo-apps
python -m capsula.cli preview
cd web && npm run dev
```

## Stage 4: Proof Packet

A proof packet contains:

- screenshot or recorded walkthrough
- files created
- commands run
- expected user journey
- limitations
- live-launch blockers

## Stage 5: Live Launch

Launch only after the proof packet is accepted.

Static targets:

- Cloudflare Pages
- GitHub Pages
- Vercel
- Netlify

Service targets:

- Render
- Fly.io
- Railway

## Stage 6: Integration Backflow

After launch, connect feedback into:

- GitHub issues
- Slack/Discord notifications
- Linear/Jira tickets
- Notion/Google docs
- Sentry errors
- Stripe workspace events

## Acceptance Criteria

A demo app is accepted when a non-builder can open it, understand the product, see the workflow, and know what happens after clicking deploy.
