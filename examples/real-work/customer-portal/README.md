# Customer Portal Real Work Example

This example is the standard business-facing CAPSULA demo.

## Goal

Show a real customer portal workflow:

- account dashboard
- project status
- activation checklist
- deployment handoff
- support/feedback capture

## Build path

```bash
cd web
npm install
npm run verify
npm run build
```

## CAPSULA proof path

```bash
python -m capsula.cli create react --name customer-portal-demo
python -m capsula.cli manifest customer-portal-demo
python -m capsula.cli deploy-plan customer-portal-demo
```

## User evidence

Capture:

- web screenshot
- user feedback
- manifest
- deploy plan
- next GitHub issue

## Deployment routes

- GitHub Pages for public static showcase
- Vercel or Netlify for polished public link
- Caffeine-style showcase for AI-app demo sessions
- Emergent-style handoff for rapid public app variants
