from __future__ import annotations

import subprocess
import time
import uuid
from pathlib import Path
from typing import Dict, List, Optional

from .models import CapsuleFile, CapsuleManifest, CapsuleSession, CapsuleWorker
from .runtimes import RUNTIMES, get_runtime
from .storage import CapsuleStorage

STARTERS: Dict[str, str] = {
    "python": "print('CAPSULA Python agent online')\n",
    "html": "<!doctype html><html><head><meta charset='utf-8'><title>CAPSULA</title></head><body><h1>CAPSULA Web Capsule</h1><script>console.log('CAPSULA online')</script></body></html>\n",
    "node": "console.log(JSON.stringify({ ok: true, runtime: 'CAPSULA Node service' }, null, 2));\n",
    "react": "export function App(){ return <main><h1>CAPSULA React Capsule</h1></main>; }\n",
    "cpp": "#include <iostream>\nint main(){ std::cout << \"CAPSULA C++ capsule online\\n\"; return 0; }\n",
    "c": "#include <stdio.h>\nint main(){ puts(\"CAPSULA C capsule online\"); return 0; }\n",
    "java": "public class Main { public static void main(String[] args){ System.out.println(\"CAPSULA Java capsule online\"); } }\n",
    "julia": "println(\"CAPSULA Julia capsule online\")\n",
    "matlab": "disp('CAPSULA MATLAB/Octave capsule online')\n",
}

DEFAULT_WORKERS = [
    CapsuleWorker("Capsule Session Worker", "session lifecycle and manifest writer", "capsula/orchestrator.py", "native", True),
    CapsuleWorker("Preview Worker", "web api terminal notebook artifact preview", "capsula/preview.py", "web-worker", False),
    CapsuleWorker("MCP AI Worker", "AI tool bridge and local agent entry", "capsula/mcp/server.py", "native", False),
    CapsuleWorker("GitHub Publisher Worker", "repo handoff and deploy metadata", "capsula/cli.py", "github", False),
]


class CapsulaOrchestrator:
    def __init__(self, storage: Optional[CapsuleStorage] = None) -> None:
        self.storage = storage or CapsuleStorage()
        self.sessions: Dict[str, CapsuleSession] = {}

    def list_runtimes(self) -> List[Dict[str, object]]:
        return [runtime.to_dict() for runtime in RUNTIMES.values()]

    def create_session(self, runtime_key: str, name: Optional[str] = None) -> CapsuleSession:
        runtime = get_runtime(runtime_key)
        session_id = name or f"{runtime.key}-{uuid.uuid4().hex[:10]}"
        root = self.storage.create_session_root(session_id)
        session = CapsuleSession(session_id, runtime, root, preview_url=self.preview_url(session_id, runtime.preview), workers=list(DEFAULT_WORKERS))
        starter = STARTERS.get(runtime.key, "# CAPSULA session\n")
        self.write_file(session, runtime.default_file, starter)
        session.log(f"created {runtime.label}")
        self.sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> CapsuleSession:
        if session_id not in self.sessions:
            raise KeyError(f"session not loaded: {session_id}")
        return self.sessions[session_id]

    def write_file(self, session: CapsuleSession, relative_path: str, content: str) -> Path:
        path = self.storage.write_file(session.id, relative_path, content)
        language = relative_path.rsplit(".", 1)[-1] if "." in relative_path else session.runtime.kind
        session.files = [asset for asset in session.files if asset.path != relative_path]
        session.files.append(CapsuleFile(relative_path, language, content))
        session.log(f"wrote {relative_path}")
        return path

    def run_session(self, session_id: str, timeout_seconds: int = 15) -> Dict[str, object]:
        session = self.get_session(session_id)
        runtime = session.runtime
        started = time.time()
        session.state = "running"
        if runtime.run_command == ["serve-static"]:
            session.log("static preview ready")
            return {"ok": True, "mode": "preview", "preview_url": session.preview_url}
        try:
            result = subprocess.run(runtime.run_command, cwd=session.root, text=True, capture_output=True, timeout=timeout_seconds, check=False)
            session.state = "stopped" if result.returncode == 0 else "failed"
            if result.stdout.strip():
                session.log(result.stdout.strip())
            if result.stderr.strip():
                session.log(result.stderr.strip())
            return {"ok": result.returncode == 0, "returncode": result.returncode, "stdout": result.stdout, "stderr": result.stderr, "elapsed_ms": int((time.time() - started) * 1000)}
        except FileNotFoundError as exc:
            session.state = "failed"
            return {"ok": False, "error": f"toolchain missing: {exc.filename}", "hint": runtime.toolchain_hint}
        except subprocess.TimeoutExpired:
            session.state = "failed"
            return {"ok": False, "error": f"timeout after {timeout_seconds}s"}

    def build_manifest(self, session_id: str) -> CapsuleManifest:
        session = self.get_session(session_id)
        runtime = session.runtime
        files = [str(path.relative_to(session.root)) for path in self.storage.list_files(session.id)]
        manifest = CapsuleManifest(
            id=f"capsula-{session.id}",
            name=f"{runtime.label}: {session.id}",
            version="0.1.0",
            runtime=runtime,
            entrypoint=runtime.default_file,
            files=files,
            workers=session.workers,
            targets=runtime.targets,
            deploy={"mode": runtime.deploy_modes[0], "destination": "github://ItsNotAILABS/CAPSULA"},
            preview={"kind": runtime.preview, "url": session.preview_url or ""},
            build={"command": runtime.run_command, "server_enabled": runtime.server_enabled, "wasm_candidate": runtime.wasm_candidate, "hint": runtime.toolchain_hint},
            metadata={"state": session.state, "logs": session.logs[-25:]},
        )
        self.storage.write_json(session.root / "capsula.manifest.json", manifest.to_dict())
        return manifest

    def deploy_plan(self, session_id: str) -> Dict[str, object]:
        manifest = self.build_manifest(session_id)
        return {
            "manifest": manifest.to_dict(),
            "steps": ["verify files", "run runtime", "write manifest", "open preview", "build worker/wasm plan", "push to GitHub", "create PR or merge to main"],
        }

    def preview_url(self, session_id: str, preview_kind: str) -> str:
        if preview_kind == "web":
            return f"http://127.0.0.1:8785/preview/{session_id}/"
        if preview_kind == "api":
            return f"http://127.0.0.1:8784/api/session/{session_id}"
        if preview_kind == "mobile":
            return f"expo://capsula/{session_id}"
        return f"session://{preview_kind}/{session_id}"
