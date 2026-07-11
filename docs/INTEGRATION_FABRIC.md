# CAPSULA Integration Fabric

CAPSULA should become the place where a user can build, run, preview, ship, and connect real work without leaving the studio. The integration fabric has two directions:

1. **Inside CAPSULA**: people use familiar services inside the IDE workspace.
2. **Outside CAPSULA**: external services call CAPSULA capsules, manifests, deploy plans, and proof packets.

This is the next shipping layer after Cloudflare deployment and the IDE surface.

## Product Position

CAPSULA is not only an app generator. It is a production workbench:

- IDE shell for files, terminals, previews, manifests, deploy gates, and evidence.
- Integration hub for services already used by builders, operators, and teams.
- Capsule runtime that can be called by outside apps through API, webhook, or GitHub workflow.
- Shipping control plane for web, API, mobile, worker, science/data, and AI app projects.

## Integration Tiers

### Tier 1: Shipping-critical

These must be first because they convert CAPSULA from local studio into real daily workflow.

| Connector | Why it matters | Direction |
| --- | --- | --- |
| GitHub | repo, PR, issues, releases, CI proof | bidirectional |
| Cloudflare | public web deployment, edge routing, future Workers/KV/R2 | CAPSULA -> Cloudflare |
| Expo Go / EAS | mobile preview and shareable device builds | CAPSULA -> Expo |
| Supabase | auth, database, storage, realtime app backend | bidirectional |
| Stripe | subscription, checkout, paid workspace control | bidirectional |
| Slack / Discord | team notifications, support intake, deployment alerts | bidirectional |
| Sentry | production errors, release health, user-impact evidence | external -> CAPSULA |

### Tier 2: Team workflow

| Connector | Why it matters | Direction |
| --- | --- | --- |
| Linear / Jira | work planning and issue escalation | bidirectional |
| Notion | docs, customer notes, release rooms | bidirectional |
| Google Drive | import/export docs and customer assets | bidirectional |
| Gmail / Calendar | user communication and scheduled work packets | bidirectional |
| Figma | design source, screenshots, handoff data | external -> CAPSULA |

### Tier 3: Compute and deployment expansion

| Connector | Why it matters | Direction |
| --- | --- | --- |
| Vercel / Netlify | static web and preview deploys | CAPSULA -> host |
| Render / Railway / Fly.io | API/service deployment | CAPSULA -> host |
| AWS S3 / R2 | artifacts, reports, logs, datasets | bidirectional |
| OpenAI / Anthropic / LiteLLM | AI generation, review, assistants, routing | bidirectional |
| Caffeine / Emergent-style showcase | public app showcase and demo surfaces | CAPSULA -> showcase |

## IDE Integration Surfaces

The user should see integrations as real product surfaces, not hidden config files.

### Workspace panel

Shows connected services, missing credentials, last sync, and available actions.

### Build panel

Lets a user generate an app, API, worker, mobile build, report, or integration adapter.

### Preview panel

Shows web preview, API health, Expo QR, deployed URL, screenshots, and live evidence.

### Deploy panel

Runs the deploy plan for GitHub Pages, Cloudflare Pages, Vercel, Netlify, Render, Fly, Expo, or other targets.

### Evidence panel

Keeps proof: command output, build logs, screenshots, manifests, issue links, PR links, release notes.

## Connector Contract

Every connector should have:

- `id`
- `name`
- `category`
- `direction`
- `auth_mode`
- `required_secrets`
- `user_actions`
- `system_actions`
- `proof_artifacts`
- `first_ship_use_case`
- `risk_boundary`

This lets CAPSULA show honest readiness. A connector can be listed before credentials exist, but the UI must say what is connected, what is configured, and what still needs external account access.

## First Shipping Sequence

1. GitHub: issues, PRs, commits, release gates, workflow links.
2. Cloudflare: Pages deployment and future Workers endpoint.
3. Expo Go: QR mobile preview from inside the studio.
4. Supabase: auth/database starter for real customer apps.
5. Stripe: paid workspace and subscription proof.
6. Slack/Discord: deployment and support notifications.
7. Sentry: error evidence and release health.
8. Linear/Jira: issue routing from user feedback.

## Near-Term Build Targets

- `capsula/integrations.py` registry and tests.
- `/api/integrations` endpoint returning connector readiness.
- web studio Integrations view.
- `.env.example` with no secrets, only required names.
- connector docs under `docs/integrations/`.
- sample webhook payloads under `integrations/examples/`.

## Shipping Rule

No connector should claim live external control until credentials and a successful call exist. Before credentials, the connector is a production adapter with explicit setup instructions and proof requirements.
