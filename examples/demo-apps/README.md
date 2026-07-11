# CAPSULA Demo App Gallery

CAPSULA needs visible app surfaces before the full backend is live. This folder is the prelaunch demo gallery: standalone HTML, static apps, and lightweight proof surfaces that can be opened locally, shown to users, or deployed to static hosts.

## Why this exists

Backends are hard to see. Users, investors, and operators need a fast renderable surface that demonstrates the structure, workflow, protocols, templates, and launch motion.

## Included demo

- `capsula_studio.html` - standalone file-based CAPSULA Studio preview modeled after the local `file:///.../capsula_studio.html` workflow.

## Open locally

Double-click the file or open it directly in a browser:

```text
examples/demo-apps/capsula_studio.html
```

Serve it locally when browser security or assets need a local server:

```bash
python -m http.server 8080 -d examples/demo-apps
```

Then open:

```text
http://127.0.0.1:8080/capsula_studio.html
```

## Verify

```bash
bash scripts/verify-demo-apps.sh
```

## Launch ladder

```text
standalone file demo -> local HTTP preview -> static host -> connected backend -> production app
```

## Required demo rules

- No secrets required.
- No fake backend claim.
- Visible user workflow.
- Visible protocol and deploy gate.
- Clear next step into live launch.
