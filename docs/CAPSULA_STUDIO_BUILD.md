# CAPSULA Studio Remixed Build

CAPSULA is now built as the parallel production remix of Capsule Studio and the existing Expo/Orbit-style device workflow.

## Platform Units

- Python runtime server
- preview server
- MCP-style inner server
- AI provider bridge
- Web Worker capsule scaffold
- Expo Go mobile capsule generator
- C/C++ WASM planner
- browser studio UI
- GitHub deploy plan

## Runtime Flow

```text
source files -> session runtime -> preview -> capsule manifest -> worker / app / mobile / wasm -> GitHub deploy
```

## Local Servers

```bash
python -m capsula.cli api
python -m capsula.cli preview
python -m capsula.mcp.server
```

- API: `http://127.0.0.1:8784`
- Preview: `http://127.0.0.1:8785`
- MCP bridge: stdio JSON-RPC

## Mobile Preview With Expo Go

```bash
python -m capsula.cli expo --name "CAPSULA Mobile" --slug capsula-mobile --out .capsula/expo/capsula-mobile
cd .capsula/expo/capsula-mobile
npm install
npm run start
```

Scan the QR code with Expo Go.

## AI Bridge

Default local mode is safe and offline:

```bash
CAPSULA_AI_PROVIDER=local python -m capsula.mcp.server
```

OpenAI-compatible mode:

```bash
CAPSULA_AI_PROVIDER=openai OPENAI_API_KEY=... CAPSULA_AI_MODEL=gpt-4.1-mini python -m capsula.mcp.server
```

## Parallel With Capsule Studio

This repo should evolve in parallel with `ItsNotAILABS/specforge-launch-studio`:

- `specforge-launch-studio` remains the broader product/spec/launcher studio.
- `CAPSULA` becomes the dedicated runtime, worker, mobile preview, MCP, and deploy capsule platform.

## Push / PR / Merge Path

Current commits are pushed directly to `main`. Future automation can change this to:

1. create branch
2. generate capsule files
3. push branch
4. open PR
5. compare
6. merge
7. publish deploy artifact
