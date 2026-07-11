from __future__ import annotations

import argparse
import json
from pathlib import Path

from .expo import ExpoCapsule, create_expo_capsule
from .orchestrator import CapsulaOrchestrator
from .preview import run_preview
from .server import run_api
from .wasm import WasmBuilder


def emit(payload: object) -> None:
    print(json.dumps(payload, indent=2, default=str))


def main() -> int:
    parser = argparse.ArgumentParser(prog="capsula", description="CAPSULA Studio local runtime")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("runtimes")

    create = sub.add_parser("create")
    create.add_argument("runtime")
    create.add_argument("--name")

    run = sub.add_parser("run")
    run.add_argument("session")

    manifest = sub.add_parser("manifest")
    manifest.add_argument("session")

    deploy = sub.add_parser("deploy-plan")
    deploy.add_argument("session")

    api = sub.add_parser("api")
    api.add_argument("--host", default="127.0.0.1")
    api.add_argument("--port", type=int, default=8784)

    preview = sub.add_parser("preview")
    preview.add_argument("--host", default="127.0.0.1")
    preview.add_argument("--port", type=int, default=8785)

    wasm = sub.add_parser("wasm-plan")
    wasm.add_argument("source")
    wasm.add_argument("--kind", choices=["c", "cpp"], default="cpp")

    expo = sub.add_parser("expo")
    expo.add_argument("--name", default="CAPSULA Mobile")
    expo.add_argument("--slug", default="capsula-mobile")
    expo.add_argument("--out", default=".capsula/expo/capsula-mobile")

    args = parser.parse_args()
    orchestrator = CapsulaOrchestrator()

    if args.command == "runtimes":
        emit(orchestrator.list_runtimes())
        return 0
    if args.command == "create":
        emit(orchestrator.create_session(args.runtime, args.name).to_dict())
        return 0
    if args.command == "run":
        emit(orchestrator.run_session(args.session))
        return 0
    if args.command == "manifest":
        emit(orchestrator.build_manifest(args.session).to_dict())
        return 0
    if args.command == "deploy-plan":
        emit(orchestrator.deploy_plan(args.session))
        return 0
    if args.command == "api":
        run_api(args.host, args.port)
        return 0
    if args.command == "preview":
        run_preview(args.host, args.port)
        return 0
    if args.command == "wasm-plan":
        emit(WasmBuilder().plan(Path(args.source), args.kind).to_dict())
        return 0
    if args.command == "expo":
        files = create_expo_capsule(Path(args.out), ExpoCapsule(args.name, args.slug))
        emit({"ok": True, "files": files, "run": ["cd " + args.out, "npm install", "npm run start", "scan QR with Expo Go"]})
        return 0
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
