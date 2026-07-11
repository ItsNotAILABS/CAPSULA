# CAPSULA Production Maturity Evidence

CAPSULA should not be positioned as a niche demo. It must be judged by working surfaces, runnable paths, release evidence, and customer-facing workflows.

## Maturity claim

CAPSULA is a runtime capsule platform with these production-facing assets:

1. **Runnable web studio** - Vite/React app with strict TypeScript verification and production build.
2. **Runnable Python runtime** - local API server, preview server, runtime registry, manifest generation, and deploy-plan engine.
3. **Mobile showcase path** - Expo Go generator and QR-code preview flow.
4. **Deployment adapters** - GitHub Pages, Vercel, Netlify, Render, Fly.io, Docker Compose, Expo Go, EAS, Caffeine-style, and Emergent-style handoff routes.
5. **Professional library stack** - optional math, science, data, AI, API, notebook, storage, and quality libraries without forcing the core runtime to become bloated.
6. **Release governance** - release gates, bot owners, protocol atlas, issue templates, and CI workflows.
7. **Real-work templates** - customer portal, operations agent, MCP toolkit, Expo preview, WASM kernel, data science notebook/report, AI app showcase, and deployment-ready web showcase.

## User-ready paths

### Web product surface

```bash
cd web
npm install
npm run verify
npm run build
npm run dev
```

### Python runtime surface

```bash
python -m pip install -r requirements-dev.txt
python -m pytest tests
python -m capsula.cli api
python -m capsula.cli preview
python -m capsula.cli create python --name demo-python
python -m capsula.cli run demo-python
python -m capsula.cli manifest demo-python
python -m capsula.cli deploy-plan demo-python
```

### Full professional stack

```bash
python -m pip install -r requirements-platform.txt
```

### Docker local production stack

```bash
docker compose up --build
```

### Static production deployment

Use any of:

- GitHub Pages workflow: `.github/workflows/pages.yml`
- Vercel: `vercel.json`
- Netlify: `netlify.toml`
- Cloudflare Pages: build `web/dist`

### API deployment

Use any of:

- Dockerfile
- Render blueprint: `render.yaml`
- Fly.io config: `fly.toml`
- Railway: Dockerfile or Python service from `requirements-platform.txt`

## Evidence rules

A feature is called production-ready only when it has:

- runnable command
- source file path
- test or verification command
- deployment route
- owner bot/protocol
- user-facing documentation
- failure mode or limitation disclosed

## Language discipline

Do not market CAPSULA as only a prompt, only a dashboard, or only an idea. The system has actual code surfaces, deploy adapters, generated app paths, tests, protocol governance, and docs. Claims must remain tied to evidence in this repository.

## Current limitation

External hosting still requires account-level credentials and settings outside the repository. CAPSULA now includes the deployment configurations and workflows; the operator must connect the target account and secrets before a public URL can be claimed.
