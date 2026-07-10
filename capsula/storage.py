from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any, Dict, Iterable


class StorageError(RuntimeError):
    pass


class CapsuleStorage:
    def __init__(self, root: str | Path = ".capsula") -> None:
        self.root = Path(root).resolve()
        self.sessions = self.root / "sessions"
        self.artifacts = self.root / "artifacts"
        self.expo = self.root / "expo"
        for directory in (self.sessions, self.artifacts, self.expo):
            directory.mkdir(parents=True, exist_ok=True)

    def safe_join(self, base: Path, relative: str) -> Path:
        candidate = (base / relative).resolve()
        if not str(candidate).startswith(str(base.resolve())):
            raise StorageError(f"unsafe path rejected: {relative}")
        return candidate

    def session_root(self, session_id: str) -> Path:
        return self.safe_join(self.sessions, session_id)

    def create_session_root(self, session_id: str) -> Path:
        root = self.session_root(session_id)
        for name in ("src", "logs", "artifacts", "workers"):
            (root / name).mkdir(parents=True, exist_ok=True)
        return root

    def write_file(self, session_id: str, relative_path: str, content: str) -> Path:
        root = self.create_session_root(session_id)
        path = self.safe_join(root, relative_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path

    def write_json(self, path: Path, payload: Dict[str, Any]) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    def list_files(self, session_id: str) -> Iterable[Path]:
        root = self.session_root(session_id)
        if not root.exists():
            return []
        return [path for path in root.rglob("*") if path.is_file()]

    def delete_session(self, session_id: str) -> None:
        root = self.session_root(session_id)
        if root.exists():
            shutil.rmtree(root)
