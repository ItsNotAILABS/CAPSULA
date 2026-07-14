# CAPSULA Frontend Ecosystem

CAPSULA is now shipping as a platform surface, not a prototype screen. The frontend ecosystem has to make the backend visible, give users a clear path from idea to deploy, and let every structure become a demo, app, workflow, connector, or public release.

## Product thesis

Users do not buy invisible backend architecture. They adopt a system when they can see:

1. what they are building,
2. what state it is in,
3. what protocol governs it,
4. what template it came from,
5. what app or service it connects to,
6. what proof shows it is real,
7. where it can be deployed.

The frontend is the operational cockpit for that entire path.

## Primary surfaces

### 1. Workspace IDE

The default screen for real work.

Required zones:

- workspace switcher
- project/capsule file tree
- editor pane
- live preview pane
- terminal/check output
- protocol and release gate panel
- integration panel
- deploy target panel

User value: a builder can create, edit, inspect, validate, and ship without leaving the workspace.

### 2. Demo App Gallery

The prelaunch rendering layer.

Required zones:

- template selector
- standalone HTML/static preview
- local file path instructions
- local HTTP preview command
- proof checklist
- launch path

User value: backend-heavy structures become visible before credentials, live services, or hosted accounts exist.

### 3. Connector Gallery

The app and service integration layer.

Required zones:

- connector cards
- inbound/outbound direction badges
- auth requirement list
- event/action examples
- secret health status
- webhook target preview

User value: users can connect GitHub, Cloudflare, Slack, Discord, Linear, Jira, Notion, Google Workspace, Supabase, Stripe, Sentry, Figma, Expo, Caffeine, Emergent, and AI providers.

### 4. Protocol Console

The governance and workflow layer.

Required zones:

- protocol path selector
- gate status
- owner role
- evidence checklist
- failure boundary
- next required action

User value: the platform does not just generate things; it runs controlled shipping processes.

### 5. Deployment Command Center

The publish layer.

Required zones:

- deploy target picker
- build command
- deploy command
- required files
- secrets checklist
- public URL evidence
- logs/artifacts

User value: local work graduates to Cloudflare, GitHub Pages, Vercel, Netlify, Render, Fly.io, Docker, or Expo.

### 6. User Activation Board

The adoption layer.

Required zones:

- first workspace
- first capsule
- first preview
- first manifest
- first deploy plan
- first public URL
- invite/team use
- payment/plan signal

User value: operators can see if real users are getting value.

## End-to-end flow

```text
Idea -> Template -> Workspace -> Demo -> Protocol Gate -> Connector -> Deploy -> Feedback -> Upgrade
```

Each phase must have:

- a visible surface,
- a command or action,
- an output artifact,
- a protocol or gate,
- a next action.

## UI/UX rules

- Show one primary action per surface.
- Always show the current state: draft, demo, checked, blocked, ready, deployed.
- Never hide missing credentials. Show the exact secret, OAuth app, or external account needed.
- Keep backend systems visible through proof cards, logs, manifests, and release gates.
- Every generated structure must have a preview path before live launch.
- Every public deploy must produce an evidence card: URL, build log, target, timestamp, and owner.

## Shipping sequence

1. Make the Workspace IDE the default front door.
2. Add Demo Gallery as the fastest visible value path.
3. Add Connector Gallery for app/service adoption.
4. Add Deployment Command Center for public URLs.
5. Add Protocol Console to keep quality and evidence high.
6. Add User Activation Board for real usage learning.
7. Add Template Marketplace so users build from proven structures.

## Success criteria

CAPSULA is frontend-ready when a new user can:

1. open a project,
2. pick a template,
3. see the structure rendered,
4. preview it locally,
5. connect one external service,
6. generate a proof packet,
7. deploy to one public target,
8. create a next issue or roadmap item from feedback.
