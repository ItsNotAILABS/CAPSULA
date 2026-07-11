# CAPSULA API Reference

## Local API Server

Start:

```bash
python -m capsula.cli api
```

Default server:

```text
http://127.0.0.1:8784
```

## Endpoints

### GET /health

Returns service health.

### GET /api/runtimes

Returns runtime lanes.

### GET /api/sessions

Returns loaded sessions in memory.

### POST /api/session

Creates a session.

Request:

```json
{
  "runtime": "python",
  "name": "demo-python"
}
```

### GET /api/session/<id>

Returns session state.

### POST /api/session/<id>/file

Writes a file into the session.

Request:

```json
{
  "path": "main.py",
  "content": "print('hello')"
}
```

### POST /api/session/<id>/run

Runs the session command when the toolchain exists.

### POST /api/session/<id>/manifest

Builds and writes a capsule manifest.

### POST /api/session/<id>/deploy-plan

Returns deploy-plan steps and manifest metadata.

## Preview Server

Start:

```bash
python -m capsula.cli preview
```

Default server:

```text
http://127.0.0.1:8785
```

Preview path:

```text
/preview/<session_id>/
```

## MCP-Style JSON-RPC Server

Start:

```bash
python -m capsula.mcp.server
```

Tools:

- `capsula.runtimes`
- `capsula.create_session`
- `capsula.write_file`
- `capsula.run_session`
- `capsula.manifest`
- `capsula.deploy_plan`
- `capsula.ai_generate`
- `capsula.ai_review`
- `capsula.wasm_plan`

## CLI Reference

```bash
python -m capsula.cli runtimes
python -m capsula.cli create python --name demo-python
python -m capsula.cli run demo-python
python -m capsula.cli manifest demo-python
python -m capsula.cli deploy-plan demo-python
python -m capsula.cli wasm-plan path/to/main.cpp --kind cpp
python -m capsula.cli expo --name "CAPSULA Mobile" --slug capsula-mobile --out .capsula/expo/capsula-mobile
```
