# CAPSULA Shipping Roadmap

CAPSULA is now in shipping mode. The platform direction is not more generic docs; it is a complete IDE-shaped workbench with integrations, deploy evidence, and real user workflows.

## North Star

A user opens CAPSULA and can:

1. create a project capsule,
2. edit files in a studio/IDE surface,
3. run code,
4. preview web/API/mobile/data outputs,
5. connect services they already use,
6. deploy to a public target,
7. collect proof and feedback,
8. iterate through GitHub/issue/release workflows.

## Release 0.1: Today-usable IDE shell

Goal: a user can run the studio locally and understand the product in five minutes.

Required:

- Web studio launches with `npm run dev`.
- Python API launches with `python -m capsula.cli api`.
- Preview server launches with `python -m capsula.cli preview`.
- IDE panels exist: Explorer, Editor, Terminal, Preview, Integrations, Deploy, Evidence.
- Real work templates exist: customer portal, science/data report, Expo preview, API service, GitHub deploy package.
- README tells the truth about credentials, deploy state, and required commands.

## Release 0.2: Integration fabric

Goal: user can connect their real workflow stack.

Required connectors:

- GitHub
- Cloudflare Pages
- Expo Go / EAS
- Supabase
- Stripe
- Slack / Discord
- Sentry
- Linear / Jira
- Notion / Drive

Required product surfaces:

- Integration registry API.
- Integrations tab in web studio.
- `.env.example` with required secret names.
- setup docs per connector.
- proof artifacts per connector.

## Release 0.3: Project runtime workbench

Goal: the IDE can manage a real capsule lifecycle.

Required:

- file explorer bound to capsule session files,
- editor state model,
- terminal command registry,
- run/build/preview/deploy buttons,
- manifest inspector,
- release gate inspector,
- evidence timeline,
- deploy status cards.

## Release 0.4: Hosted collaboration

Goal: move from local-only to team workspace.

Required:

- Supabase auth adapter,
- workspace/member model wired to API,
- project persistence,
- Stripe checkout/subscription adapter,
- support intake connector,
- audit log.

## Release 0.5: Marketplace and templates

Goal: people can start with useful shipped work, not empty screens.

Required:

- template marketplace view,
- deployable templates for web, API, mobile, worker, data report, and agent server,
- template scoring by maturity evidence,
- one-click starter generation,
- feedback loop into GitHub issues.

## Immediate Build Order

1. Add integration registry model. Done in this branch.
2. Add docs for the integration fabric. Done in this branch.
3. Add `.env.example`. Done in this branch.
4. Add integration tests. Done in this branch.
5. Add Integrations tab to the web studio.
6. Add `/api/integrations` to API server.
7. Wire GitHub and Cloudflare first because they prove shipping.
8. Add Supabase and Stripe next because they prove customers/workspaces.
9. Add Slack/Discord/Sentry because they prove support and ops maturity.

## First customer-ready demo

Run:

```bash
python -m pip install -r requirements-dev.txt
python -m pytest tests
cd web
npm install
npm run verify
npm run build
npm run dev
```

Show:

- web studio,
- IDE panels,
- integration readiness,
- deploy targets,
- Cloudflare setup doc,
- Expo QR workflow,
- real work examples,
- production maturity doc.

## Rule

Shipping means the platform says what it can do today, shows the command to do it, and shows what credential or host is still required. No vague claims.
