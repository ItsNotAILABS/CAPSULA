# Use Case and Template Matrix

This matrix maps CAPSULA use cases to structures, preview surfaces, workflow protocols, and deployment targets.

| Use case | Structure | Preview before backend | Production target | Protocols |
| --- | --- | --- | --- | --- |
| Founder demo | Static studio app | HTML demo | Cloudflare Pages | P-S01, P-S04, P-S05 |
| Customer portal | Web app + API | Vite static mock | Vercel/Render | P-S02, P-S05, P-S08 |
| AI operations agent | Python capsule | terminal transcript + HTML report | Render/Fly/Railway | P-S07, P-S08, P-S09 |
| Integration console | Web app + webhook router | HTML dashboard | Cloudflare/Render | P-S06, P-S07, P-S10 |
| Sovereign node console | IDE workspace + runtime panel | standalone HTML console | Docker/Fly | P-S03, P-S07, P-S12 |
| Data/report app | Python report + static output | generated HTML report | GitHub Pages/Cloudflare | P-S01, P-S08 |
| Mobile proof | Expo Go app | QR preview | EAS/App Store later | P-S04, P-S05 |
| Docs/data room | Docs portal | static HTML/docs | GitHub Pages/Cloudflare | P-S11 |
| Release gate | Protocol workflow | gate dashboard | GitHub Actions | P-S08, P-S09, P-S11 |
| Support loop | ticket/feed workflow | mock issue board | Linear/Jira/GitHub | P-S10 |

## Template family requirements

Each template family should ship with:

- `README.md`
- starter source
- demo preview
- proof checklist
- deploy adapter
- integration hints
- tests or verification script

## First templates to maximize

1. `capsula-studio-html` - standalone file demo for visible platform rendering.
2. `integration-console` - shows connectors and event flow.
3. `sovereign-node-console` - runtime, memory, agents, proof, deploy gates.
4. `customer-portal` - user onboarding, workspace, billing, support.
5. `ops-agent` - Python worker with report output.
6. `data-report-app` - scientific or business report rendered as static HTML.
7. `mobile-preview` - Expo Go QR demo.
8. `release-gate` - GitHub workflow and deployment proof panel.
