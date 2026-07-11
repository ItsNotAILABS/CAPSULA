# Founder Demo Script

## Goal

Show CAPSULA as a user-ready platform that turns an idea into a running, previewable, documented, GitHub-ready capsule.

## Demo Flow

### 1. Open the commercial studio

```bash
cd web
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

Narrative: CAPSULA is a capsule-first studio for building apps, agents, mobile previews, and WASM-capable workers.

### 2. Start the runtime servers

```bash
python -m capsula.cli api
python -m capsula.cli preview
```

Narrative: The browser studio is backed by a local Python runtime and preview server.

### 3. Create the first capsule

```bash
python -m capsula.cli create python --name investor-demo
python -m capsula.cli run investor-demo
python -m capsula.cli manifest investor-demo
python -m capsula.cli deploy-plan investor-demo
```

Narrative: A capsule is not just generated code. It includes runtime metadata, preview path, workers, manifest, and deployment evidence.

### 4. Show mobile preview path

```bash
python -m capsula.cli expo --name "CAPSULA Demo" --slug capsula-demo --out .capsula/expo/capsula-demo
cd .capsula/expo/capsula-demo
npm install
npm run start
```

Narrative: Users can preview generated mobile capsules with Expo Go and show real devices quickly.

### 5. Show issue bots

Open GitHub issues:

- Runtime Triage Bot
- Commercial QA Bot
- Deploy Bot

Narrative: CAPSULA carries release discipline forward by turning issues into operating work queues.

### 6. Show research and funding docs

Open:

- `papers/CAPSULA_Runtime_Thesis.md`
- `papers/CAPSULA_Commercial_Research_Memo.md`
- `docs/INVESTOR_BRIEF.md`
- `docs/GO_TO_MARKET.md`
- `docs/COMMERCIAL_READINESS.md`

Narrative: The product is being built as a real commercial platform, not a toy prototype.

## Closing Line

CAPSULA shortens the path from idea to usable software by preserving the whole operating envelope: code, runtime, preview, manifest, workers, release gate, and deploy plan.
