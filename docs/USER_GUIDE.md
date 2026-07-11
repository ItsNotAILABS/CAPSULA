# CAPSULA User Guide

## Quick Start

Clone the repository and run the web studio:

```bash
cd web
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Run the Local Backend

Start the API server:

```bash
python -m capsula.cli api
```

Start the preview server:

```bash
python -m capsula.cli preview
```

## Create a Capsule

List runtimes:

```bash
python -m capsula.cli runtimes
```

Create a Python capsule:

```bash
python -m capsula.cli create python --name demo-python
```

Run it:

```bash
python -m capsula.cli run demo-python
```

Create a manifest:

```bash
python -m capsula.cli manifest demo-python
```

Create a deploy plan:

```bash
python -m capsula.cli deploy-plan demo-python
```

## Create a Web Capsule

```bash
python -m capsula.cli create html --name demo-web
python -m capsula.cli run demo-web
python -m capsula.cli manifest demo-web
```

Open the preview server route shown in the manifest.

## Create an Expo Go Capsule

```bash
python -m capsula.cli expo --name "CAPSULA Mobile" --slug capsula-mobile --out .capsula/expo/capsula-mobile
cd .capsula/expo/capsula-mobile
npm install
npm run start
```

Scan the QR code with Expo Go.

## Use the MCP-Style AI Server

```bash
python -m capsula.mcp.server
```

Offline mode:

```bash
CAPSULA_AI_PROVIDER=local python -m capsula.mcp.server
```

OpenAI-compatible mode:

```bash
CAPSULA_AI_PROVIDER=openai OPENAI_API_KEY=... python -m capsula.mcp.server
```

## Use the Issue Bots

Open issues using the templates. The issue-bot structure is designed to classify work into runtime triage, commercial QA, deployment, research, and roadmap tracks.

## What a Good Capsule Includes

- source files
- runtime lane
- preview path
- manifest
- deploy plan
- acceptance criteria
- issue link or release note
- toolchain status
- README or usage note

## Troubleshooting

If a runtime fails, check the toolchain hint. CAPSULA does not fake compiler availability. Install the missing compiler or use a ready runtime lane first.
