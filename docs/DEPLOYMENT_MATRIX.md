# CAPSULA Deployment Matrix

CAPSULA should not be locked to one host. The platform needs deploy-ready language for GitHub, Caffeine-style showcases, Emergent-style app handoff, Expo Go, and normal production platforms.

## Matrix

| Target | Best for | Build | Output | Notes |
| --- | --- | --- | --- | --- |
| Vercel | React/Vite web apps | `npm run build` | `web/dist` | Set root to `web` |
| Netlify | Static web showcases | `npm run build` | `web/dist` | Base directory `web` |
| Cloudflare Pages | Fast static demos | `npm run build` | `web/dist` | Add Workers later for APIs |
| GitHub Pages | Public docs/demos | `npm run build` | artifact | Publish through Actions |
| Railway | FastAPI/Node services | service start command | service | Good for API capsules |
| Render | APIs and workers | uvicorn/node start | service | Good simple hosting path |
| Fly.io | Docker services | Docker build | image | Good for global API capsules |
| Docker | portable services | `docker build` | image | Universal deployment boundary |
| Expo Go | live phone preview | `npm run start` | QR preview | Best immediate mobile demo |
| EAS Update | stakeholder mobile preview | `eas update` | update channel | Needs Expo account/token |
| EAS Build | installable mobile apps | `eas build` | app binary | App store path |
| Caffeine | AI app showcase | `npm run build` | web demo | Use showcase packet |
| Emergent | AI-built app handoff | selected by app | handoff | Use source/env/demo packet |
| Zenodo | research artifact | manifest + archive | DOI package | For papers and evidence |

## Deploy packet standard

Every deployable capsule should include:

```json
{
  "app_root": "web",
  "install": "npm install",
  "verify": "npm run verify",
  "build": "npm run build",
  "preview": "npm run preview",
  "env": [],
  "target": "vercel|netlify|cloudflare-pages|caffeine|emergent|expo-go|railway|render|fly|docker|zenodo",
  "evidence": ["screenshot", "build log", "release gate", "manifest"]
}
```

## Production rule

No deployment target should be marked ready unless:

1. install command is known,
2. verify command exists,
3. build or start command exists,
4. environment variables are named,
5. public/private boundary is documented,
6. rollback or exit path is clear.
