from __future__ import annotations

from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional

RuntimeKind = Literal["python", "node", "react", "html", "c", "cpp", "java", "julia", "matlab", "rust", "go", "r", "shell"]
PreviewKind = Literal["web", "api", "terminal", "notebook", "artifact", "mobile"]
TargetKind = Literal["browser", "web-worker", "service-worker", "wasm", "wasi", "native", "node", "github", "expo-go"]
DeployMode = Literal["agent", "app", "worker", "service", "mobile", "capsule"]


@dataclass(frozen=True)
class RuntimeSpec:
    key: str
    label: str
    kind: RuntimeKind
    default_file: str
    run_command: List[str]
    preview: PreviewKind
    targets: List[TargetKind]
    deploy_modes: List[DeployMode]
    server_enabled: bool
    wasm_candidate: bool
    toolchain_hint: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class CapsuleFile:
    path: str
    language: str
    content: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class CapsuleWorker:
    name: str
    role: str
    entrypoint: str
    target: TargetKind = "web-worker"
    persistent: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class CapsuleSession:
    id: str
    runtime: RuntimeSpec
    root: Path
    state: str = "created"
    preview_url: Optional[str] = None
    files: List[CapsuleFile] = field(default_factory=list)
    workers: List[CapsuleWorker] = field(default_factory=list)
    logs: List[str] = field(default_factory=list)

    def log(self, message: str) -> None:
        self.logs.append(message)

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["root"] = str(self.root)
        data["runtime"] = self.runtime.to_dict()
        return data


@dataclass
class CapsuleManifest:
    id: str
    name: str
    version: str
    runtime: RuntimeSpec
    entrypoint: str
    files: List[str]
    workers: List[CapsuleWorker]
    targets: List[TargetKind]
    deploy: Dict[str, str]
    preview: Dict[str, str]
    build: Dict[str, Any]
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "version": self.version,
            "runtime": self.runtime.to_dict(),
            "entrypoint": self.entrypoint,
            "files": self.files,
            "workers": [worker.to_dict() for worker in self.workers],
            "targets": self.targets,
            "deploy": self.deploy,
            "preview": self.preview,
            "build": self.build,
            "metadata": self.metadata,
        }
