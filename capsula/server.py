from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Dict
from urllib.parse import urlparse

from .orchestrator import CapsulaOrchestrator


class CapsulaAPI(BaseHTTPRequestHandler):
    orchestrator = CapsulaOrchestrator()

    def do_GET(self) -> None:
        path = urlparse(self.path).path.rstrip("/") or "/"
        if path == "/health":
            self.send_json({"ok": True, "service": "capsula-api"})
            return
        if path == "/api/runtimes":
            self.send_json({"ok": True, "runtimes": self.orchestrator.list_runtimes()})
            return
        if path == "/api/sessions":
            self.send_json({"ok": True, "sessions": [session.to_dict() for session in self.orchestrator.sessions.values()]})
            return
        if path.startswith("/api/session/"):
            sid = path.split("/")[-1]
            try:
                self.send_json({"ok": True, "session": self.orchestrator.get_session(sid).to_dict()})
            except KeyError as exc:
                self.send_json({"ok": False, "error": str(exc)}, 404)
            return
        self.send_json({"ok": True, "routes": ["/health", "/api/runtimes", "/api/sessions", "/api/session/<id>"]})

    def do_POST(self) -> None:
        path = urlparse(self.path).path.rstrip("/") or "/"
        body = self.body_json()
        try:
            if path == "/api/session":
                session = self.orchestrator.create_session(str(body.get("runtime", "python")), str(body["name"]) if body.get("name") else None)
                self.send_json({"ok": True, "session": session.to_dict()})
                return
            if path.startswith("/api/session/") and path.endswith("/file"):
                sid = path.split("/")[3]
                session = self.orchestrator.get_session(sid)
                written = self.orchestrator.write_file(session, str(body.get("path", session.runtime.default_file)), str(body.get("content", "")))
                self.send_json({"ok": True, "path": str(written)})
                return
            if path.startswith("/api/session/") and path.endswith("/run"):
                sid = path.split("/")[3]
                self.send_json({"ok": True, "result": self.orchestrator.run_session(sid)})
                return
            if path.startswith("/api/session/") and path.endswith("/manifest"):
                sid = path.split("/")[3]
                self.send_json({"ok": True, "manifest": self.orchestrator.build_manifest(sid).to_dict()})
                return
            if path.startswith("/api/session/") and path.endswith("/deploy-plan"):
                sid = path.split("/")[3]
                self.send_json({"ok": True, "plan": self.orchestrator.deploy_plan(sid)})
                return
        except Exception as exc:
            self.send_json({"ok": False, "error": str(exc)}, 400)
            return
        self.send_json({"ok": False, "error": "unknown route"}, 404)

    def body_json(self) -> Dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            return {}
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except json.JSONDecodeError:
            return {}

    def send_json(self, payload: Dict[str, Any], status: int = 200) -> None:
        data = json.dumps(payload, indent=2, default=str).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format: str, *args: object) -> None:
        return


def run_api(host: str = "127.0.0.1", port: int = 8784) -> None:
    server = ThreadingHTTPServer((host, port), CapsulaAPI)
    print(f"CAPSULA API on http://{host}:{port}")
    server.serve_forever()
