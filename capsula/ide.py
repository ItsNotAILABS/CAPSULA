from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Dict, List, Literal, Optional

PanelKind = Literal["explorer", "editor", "terminal", "preview", "assistant", "deploy", "logs", "protocols"]
WorkspaceMode = Literal["local", "cloud-preview", "production"]


@dataclass(frozen=True)
class IDEPanel:
    id: str
    title: str
    kind: PanelKind
    purpose: str
    required_capability: str

    def to_dict(self) -> Dict[str, str]:
        return asdict(self)


@dataclass
class IDEWorkspace:
    id: str
    name: str
    mode: WorkspaceMode = "local"
    runtime: str = "python"
    files: List[str] = field(default_factory=list)
    panels: List[IDEPanel] = field(default_factory=list)
    commands: List[str] = field(default_factory=list)
    deploy_targets: List[str] = field(default_factory=list)
    current_file: Optional[str] = None

    def open_file(self, path: str) -> None:
        if path not in self.files:
            self.files.append(path)
        self.current_file = path

    def add_command(self, command: str) -> None:
        if command not in self.commands:
            self.commands.append(command)

    def add_deploy_target(self, target: str) -> None:
        if target not in self.deploy_targets:
            self.deploy_targets.append(target)

    def to_dict(self) -> Dict[str, object]:
        data = asdict(self)
        data["panels"] = [panel.to_dict() for panel in self.panels]
        return data


def default_ide_panels() -> List[IDEPanel]:
    return [
        IDEPanel("explorer", "Explorer", "explorer", "Navigate capsule files, docs, manifests, and examples.", "filesystem.read"),
        IDEPanel("editor", "Editor", "editor", "Edit source files and capsule manifests.", "filesystem.write"),
        IDEPanel("terminal", "Terminal", "terminal", "Run verify, build, test, and deploy commands.", "subprocess.approval"),
        IDEPanel("preview", "Preview", "preview", "Show web, API, mobile, and artifact previews.", "preview.server"),
        IDEPanel("assistant", "Assistant", "assistant", "Create work packets, explain errors, and generate capsule changes.", "ai.bridge"),
        IDEPanel("deploy", "Deploy", "deploy", "Publish through GitHub, Cloudflare, Vercel, Netlify, Render, Fly, or Expo.", "deploy.approval"),
        IDEPanel("logs", "Logs", "logs", "Display CI, runtime, and local telemetry output.", "telemetry.read"),
        IDEPanel("protocols", "Protocols", "protocols", "Expose the 30 protocol owners and release gates.", "protocol.registry"),
    ]


def create_default_workspace(name: str = "CAPSULA Studio") -> IDEWorkspace:
    workspace = IDEWorkspace(
        id="capsula-studio",
        name=name,
        mode="production",
        runtime="python+react+cpp+shell",
        panels=default_ide_panels(),
        files=[
            "web/src/App.tsx",
            "capsula/server.py",
            "capsula/orchestrator.py",
            "capsula/ide.py",
            "native/cpp/wasm_kernel/main.cpp",
            "scripts/verify-production.sh",
            "cloudflare/wrangler.toml",
        ],
        commands=[
            "python -m pytest tests",
            "cd web && npm install && npm run verify && npm run build",
            "bash scripts/verify-production.sh",
            "docker compose up --build",
        ],
        deploy_targets=["github-pages", "cloudflare-pages", "vercel", "netlify", "render", "fly-io", "expo-go"],
        current_file="web/src/App.tsx",
    )
    return workspace
