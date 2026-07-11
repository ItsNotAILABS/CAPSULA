from __future__ import annotations

import sys
from pathlib import Path
from typing import Any, Callable, Dict

from capsula.ai import CapsulaAI
from capsula.expo import ExpoCapsule, create_expo_capsule
from capsula.orchestrator import CapsulaOrchestrator
from capsula.wasm import WasmBuilder

from .protocol import RPCError, err, ok, parse


class CapsulaMCPServer:
    def __init__(self) -> None:
        self.orchestrator = CapsulaOrchestrator()
        self.ai = CapsulaAI()
        self.wasm = WasmBuilder()
        self.tools: Dict[str, Callable[[Dict[str, Any]], Any]] = {
            "capsula.runtimes": self.runtimes,
            "capsula.create_session": self.create_session,
            "capsula.write_file": self.write_file,
            "capsula.run_session": self.run_session,
            "capsula.manifest": self.manifest,
            "capsula.deploy_plan": self.deploy_plan,
            "capsula.ai_generate": self.ai_generate,
            "capsula.ai_review": self.ai_review,
            "capsula.wasm_plan": self.wasm_plan,
            "capsula.expo": self.expo,
        }

    def handle(self, line: str) -> str:
        request_id: Any = None
        try:
            request = parse(line)
            request_id = request.id
            if request.method in {"initialize", "mcp.initialize"}:
                return ok(request.id, {"serverInfo": {"name": "capsula-mcp", "version": "0.1.0"}, "capabilities": {"tools": True}})
            if request.method in {"tools/list", "mcp.tools.list"}:
                return ok(request.id, {"tools": [{"name": name, "description": name.replace('.', ' ')} for name in sorted(self.tools)]})
            if request.method in {"tools/call", "mcp.tools.call"}:
                name = request.params.get("name")
                args = request.params.get("arguments") or {}
                if not isinstance(name, str) or name not in self.tools:
                    raise RPCError(-32601, f"unknown tool: {name}")
                if not isinstance(args, dict):
                    raise RPCError(-32602, "arguments must be object")
                return ok(request.id, self.tools[name](args))
            if request.method in self.tools:
                return ok(request.id, self.tools[request.method](request.params))
            raise RPCError(-32601, f"unknown method: {request.method}")
        except RPCError as exc:
            return err(request_id, exc.code, exc.message)
        except Exception as exc:
            return err(request_id, -32000, str(exc))

    def serve_forever(self) -> None:
        for line in sys.stdin:
            line = line.strip()
            if line:
                print(self.handle(line), flush=True)

    def runtimes(self, _: Dict[str, Any]) -> Dict[str, Any]:
        return {"runtimes": self.orchestrator.list_runtimes()}

    def create_session(self, args: Dict[str, Any]) -> Dict[str, Any]:
        session = self.orchestrator.create_session(str(args.get("runtime", "python")), str(args["name"]) if args.get("name") else None)
        return {"session": session.to_dict()}

    def write_file(self, args: Dict[str, Any]) -> Dict[str, Any]:
        session = self.orchestrator.get_session(str(args["session"]))
        path = self.orchestrator.write_file(session, str(args.get("path", session.runtime.default_file)), str(args.get("content", "")))
        return {"path": str(path)}

    def run_session(self, args: Dict[str, Any]) -> Dict[str, Any]:
        return self.orchestrator.run_session(str(args["session"]))

    def manifest(self, args: Dict[str, Any]) -> Dict[str, Any]:
        return self.orchestrator.build_manifest(str(args["session"])).to_dict()

    def deploy_plan(self, args: Dict[str, Any]) -> Dict[str, Any]:
        return self.orchestrator.deploy_plan(str(args["session"]))

    def ai_generate(self, args: Dict[str, Any]) -> Dict[str, Any]:
        result = self.ai.generate_code(str(args.get("prompt", "")), str(args.get("language", "python")), str(args.get("context", "")))
        return result.__dict__

    def ai_review(self, args: Dict[str, Any]) -> Dict[str, Any]:
        manifest = args.get("manifest", {})
        if not isinstance(manifest, dict):
            raise RPCError(-32602, "manifest must be object")
        return self.ai.review_manifest(manifest).__dict__

    def wasm_plan(self, args: Dict[str, Any]) -> Dict[str, Any]:
        return self.wasm.plan(Path(str(args["source"])), str(args.get("kind", "cpp"))).to_dict()

    def expo(self, args: Dict[str, Any]) -> Dict[str, Any]:
        out = Path(str(args.get("out", ".capsula/expo/capsula-mobile")))
        files = create_expo_capsule(out, ExpoCapsule(str(args.get("name", "CAPSULA Mobile")), str(args.get("slug", "capsula-mobile"))))
        return {"files": files, "run": [f"cd {out}", "npm install", "npm run start", "scan QR with Expo Go"]}


def main() -> int:
    CapsulaMCPServer().serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
