# CAPSULA Cloudflare Pages Deployment

CAPSULA cannot be connected to a Cloudflare account from this chat without your Cloudflare account ID and API token being added as GitHub Actions secrets. What is in the repo now is the deploy-ready adapter: the build config, workflow, and preflight script.

## Required GitHub secrets

Add these in GitHub repository settings:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The token should have permission to deploy Cloudflare Pages for the target account. Do not paste it into source code, issues, README files, or chat logs.

## Build settings

Cloudflare Pages project settings:

- Framework preset: Vite
- Build command: `cd web && npm ci && npm run build`
- Build output directory: `web/dist`
- Root directory: `/`
- Node: 22

## Local preflight

```bash
CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... bash scripts/cloudflare-preflight.sh
```

## GitHub Actions deploy

The workflow `.github/workflows/cloudflare-pages.yml` builds the web studio and publishes `web/dist` through `cloudflare/pages-action` when the secrets exist.

## Production posture

Cloudflare Pages is the public static studio surface. The CAPSULA API remains separate and can run on Render, Fly.io, Railway, Docker, or local production compose until a Cloudflare Workers API adapter is added.
