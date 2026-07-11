# CAPSULA Funding Data Room

## Product

CAPSULA is a capsule-first software creation platform for turning ideas into running apps, agents, mobile previews, and WASM-capable workers.

## Core Assets

- Commercial web studio: `web/`
- Python runtime: `capsula/`
- MCP-style AI bridge: `capsula/mcp/`
- Expo generator: `capsula/expo.py`
- WASM planner: `capsula/wasm.py`
- Issue bots: `.github/ISSUE_TEMPLATE/` and open bot issues
- Research papers: `papers/`
- Commercial docs: `docs/`

## Investor Narrative

CAPSULA is a productization layer for AI-generated software. The platform does not stop at code generation; it captures the runtime, preview, manifest, release gate, and deployment evidence needed to show and ship software.

## Demo Evidence

- Web app can run locally with Vite.
- Python runtime can create sessions and manifests.
- Preview server can serve local capsule output.
- Expo generator can create a mobile preview app.
- MCP server exposes tool calls for AI clients.
- Tests cover core commercial objects.
- CI workflows exist for Python and web checks.

## Current Risks

- Hosted authentication, billing, and persistence are not fully wired yet.
- Real compiler availability depends on local toolchains.
- Web UI currently represents commercial workflow and needs deeper API integration.
- Payments, hosted multi-tenant workspaces, and production observability remain roadmap items.

## Near-Term Funding Use

1. Hosted workspace backend.
2. Real browser code editor integration.
3. OAuth/GitHub auth and repo write-back flow.
4. Payment and plan enforcement.
5. Hosted preview infrastructure.
6. User testing with builders and agencies.
7. Security review for subprocess and AI tool boundaries.

## Milestones

### Milestone 1: User-ready private alpha

- Hosted app deployed.
- Login and workspace creation.
- Create, run, preview, manifest, deploy-plan loop.
- 10-25 test users.

### Milestone 2: Paid design partners

- Stripe billing.
- Team workspaces.
- GitHub branch/PR flow.
- Expo Go demo templates.
- Release gate checklist in UI.

### Milestone 3: Public beta

- Template marketplace.
- Project dashboards.
- Hosted preview sessions.
- Real metrics dashboard.
- Security docs and trust center.

## Ask

Raise enough capital to convert the working local-first product into a hosted multi-tenant commercial platform, with the first paid wedge focused on builders, agencies, and technical founders who need to ship AI-generated software to users faster.
