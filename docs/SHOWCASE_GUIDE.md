# CAPSULA Showcase Guide

This guide turns CAPSULA into something people can actually open, understand, and try.

## Showcase goal

The showcase is not a research paper and not a raw repo. It is the public-facing proof surface for users, customers, partners, and funding conversations.

It should answer four questions in under two minutes:

1. What does CAPSULA do?
2. What can I build with it today?
3. How do I preview the result?
4. How do I deploy or hand it to GitHub/Caffeine/Emergent/Expo?

## Core showcase routes

| Route | Purpose |
| --- | --- |
| `/` | Enterprise command center and platform story |
| `/bots` | Bot OS and GitHub operator swarm |
| `/protocols` | 30-protocol operating atlas |
| `/templates` | App, agent, science, mobile, and deployment templates |
| `/showcase` | User demo surface |
| `/funding` | Evidence stack and data room |

The current Vite app is a single-page command center. These routes can be split into real React Router pages when the surface becomes public.

## Expo Go mobile showcase

Use this for phone demos:

```bash
python -m capsula.cli expo --name "CAPSULA Mobile" --slug capsula-mobile --out .capsula/expo/capsula-mobile
cd .capsula/expo/capsula-mobile
npm install
npm run start
```

Then scan the QR code with Expo Go.

## Caffeine-style showcase app

Use CAPSULA as a demo shell:

```bash
cd web
npm install
npm run verify
npm run build
```

Deploy the `web` app as a showcase. The page should contain:

- headline
- visible product workflow
- bot operator map
- protocols map
- templates catalog
- deployment target matrix
- call to action

## Emergent-style app handoff

Before handing a build to an AI deployment app or app builder, write a handoff packet:

- repo URL
- app root
- build command
- environment variables
- preview screenshots
- known risks
- selected deploy target
- support/contact path

## Demo script

1. Open the CAPSULA web command center.
2. Show templates: web app, science lab, Expo mobile, Caffeine showcase, Emergent handoff.
3. Show protocol atlas: P01 through P30.
4. Show deployment targets: Vercel, Netlify, Cloudflare Pages, Expo Go, EAS, Railway, Render, Fly, Caffeine, Emergent, Zenodo.
5. Generate or describe a capsule manifest.
6. Explain the release gate.
7. Open the GitHub repo and show docs/tests.

## Acceptance bar

The showcase is ready when a new user can say:

- I understand what CAPSULA is.
- I know which template to start from.
- I know how to preview it.
- I know where it can deploy.
- I know what is implemented versus planned.
