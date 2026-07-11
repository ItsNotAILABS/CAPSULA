# CAPSULA Real Work Portfolio

CAPSULA should demonstrate real work, not only platform theory. Use this file as the operator checklist for live user sessions.

## Real work examples to run

### 1. Customer portal web app

Purpose: show a business-facing web app capsule with a dashboard, onboarding, and deploy path.

```bash
python -m capsula.cli create react --name customer-portal-demo
python -m capsula.cli manifest customer-portal-demo
python -m capsula.cli deploy-plan customer-portal-demo
cd web && npm install && npm run build
```

Evidence to capture:

- browser screenshot
- build log
- manifest file
- deploy plan
- user feedback notes

### 2. Operations agent

Purpose: show a Python agent capsule for reports, daily closeouts, data checks, or internal workflow automation.

```bash
python -m capsula.cli create python --name ops-agent-demo
python -m capsula.cli run ops-agent-demo
python -m capsula.cli manifest ops-agent-demo
```

Evidence to capture:

- run output
- manifest
- operator instructions
- issue ticket for next improvement

### 3. Expo Go mobile showcase

Purpose: put a mobile build in a user's hand immediately.

```bash
python -m capsula.cli expo --name "CAPSULA Showcase" --slug capsula-showcase --out .capsula/expo/capsula-showcase
cd .capsula/expo/capsula-showcase
npm install
npm run start
```

Evidence to capture:

- QR code screenshot
- phone screenshot
- user feedback
- next release task

### 4. Data/science report capsule

Purpose: prove CAPSULA is not just UI. Use the professional stack to generate an analytical artifact.

```bash
python -m pip install -r requirements-platform.txt
python -m capsula.cli create python --name data-report-demo
python -m capsula.cli run data-report-demo
```

Evidence to capture:

- notebook/report artifact
- data assumptions
- charts or metrics
- reproducibility note

### 5. API/runtime service

Purpose: show a deployable backend service.

```bash
docker compose up --build
curl http://127.0.0.1:8784/health
```

Evidence to capture:

- health response
- Docker log
- deployment target selected
- secrets policy confirmed

## Live demo sequence

1. Open the web studio.
2. Show bot operators and protocol atlas.
3. Create a capsule.
4. Run it.
5. Generate a manifest.
6. Generate a deploy plan.
7. Open the deployment matrix.
8. Show the Expo Go QR path.
9. Capture user feedback.
10. Convert feedback into an issue.

## Standard maturity proof packet

Every serious user/funder conversation should produce:

- link to repository
- web studio screenshot
- one generated capsule
- one manifest
- one deploy plan
- one issue or feedback item
- one target deployment route
- one release-gate summary

## Positioning

CAPSULA is not niche when it can produce web apps, Python agents, mobile previews, WASM plans, API services, data reports, and GitHub release packets from the same operating model.
