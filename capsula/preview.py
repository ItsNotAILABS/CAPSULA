from __future__ import annotations

import mimetypes
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote

from .storage import CapsuleStorage, StorageError


class PreviewRouter:
    def __init__(self) -> None:
        self.storage = CapsuleStorage()

    def resolve(self, session_id: str, requested: str) -> Path:
        root = self.storage.session_root(session_id)
        if requested in ("", "/"):
            for candidate in ("index.html", "dist/index.html", "public/index.html", "capsula.manifest.json"):
                path = root / candidate
                if path.exists():
                    return path
            return root / "capsula.manifest.json"
        return self.storage.safe_join(root, unquote(requested.lstrip("/")))


class CapsulaPreview(BaseHTTPRequestHandler):
    router = PreviewRouter()

    def do_GET(self) -> None:
        if self.path == "/health":
            self.send_json({"ok": True, "service": "capsula-preview"})
            return
        if self.path.startswith("/preview/"):
            parts = self.path[len("/preview/"):].split("/", 1)
            session_id = parts[0]
            requested = parts[1] if len(parts) > 1 else ""
            self.serve_file(session_id, requested)
            return
        self.send_json({"ok": True, "routes": ["/health", "/preview/<session_id>/", "/preview/<session_id>/<file>"]})

    def serve_file(self, session_id: str, requested: str) -> None:
        try:
            path = self.router.resolve(session_id, requested)
            if not path.exists() or not path.is_file():
                self.send_error(404, "preview file not found")
                return
            data = path.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", mimetypes.guess_type(str(path))[0] or "application/octet-stream")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except StorageError as exc:
            self.send_error(400, str(exc))

    def send_json(self, payload: dict) -> None:
        import json
        data = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, format: str, *args: object) -> None:
        return


def run_preview(host: str = "127.0.0.1", port: int = 8785) -> None:
    server = ThreadingHTTPServer((host, port), CapsulaPreview)
    print(f"CAPSULA preview on http://{host}:{port}")
    server.serve_forever()
