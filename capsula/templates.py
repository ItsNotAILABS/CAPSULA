from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Literal

TemplateKind = Literal["web-app", "python-agent", "mcp-server", "expo-mobile", "wasm-worker", "data-report"]


@dataclass(frozen=True)
class CapsuleTemplate:
    id: str
    name: str
    kind: TemplateKind
    runtime: str
    audience: str
    description: str
    starter_files: Dict[str, str]
    success_criteria: List[str]

    def to_dict(self) -> Dict[str, object]:
        return {
            "id": self.id,
            "name": self.name,
            "kind": self.kind,
            "runtime": self.runtime,
            "audience": self.audience,
            "description": self.description,
            "starter_files": self.starter_files,
            "success_criteria": self.success_criteria,
        }


TEMPLATES: Dict[str, CapsuleTemplate] = {
    "customer-portal": CapsuleTemplate(
        id="customer-portal",
        name="Customer Portal App",
        kind="web-app",
        runtime="react",
        audience="Founder or agency shipping a client-facing SaaS portal",
        description="A polished web app capsule with dashboard, preview route, deploy manifest, and onboarding checklist.",
        starter_files={"src/App.tsx": "export default function App(){return <main>Customer Portal</main>}", "README.md": "# Customer Portal"},
        success_criteria=["loads in browser", "has deploy plan", "has user-facing copy", "has preview screenshot"],
    ),
    "ops-agent": CapsuleTemplate(
        id="ops-agent",
        name="Operations Agent",
        kind="python-agent",
        runtime="python",
        audience="Operator automating reports, closeouts, data checks, or daily workflows",
        description="A Python capsule with scheduled commands, structured logs, and GitHub handoff metadata.",
        starter_files={"main.py": "print('operations agent online')\n", "capsule.md": "# Operations Agent"},
        success_criteria=["runs locally", "writes logs", "generates manifest", "documents operator instructions"],
    ),
    "mcp-toolkit": CapsuleTemplate(
        id="mcp-toolkit",
        name="MCP Tool Server",
        kind="mcp-server",
        runtime="python",
        audience="AI builder exposing local tools to model clients",
        description="A JSON-RPC/MCP-style tool server capsule with AI provider bridge and deploy checklist.",
        starter_files={"server.py": "print('mcp toolkit online')\n", "tools.json": "[]\n"},
        success_criteria=["tools list works", "safe errors", "AI fallback configured", "docs include client wiring"],
    ),
    "mobile-preview": CapsuleTemplate(
        id="mobile-preview",
        name="Expo Go Mobile Preview",
        kind="expo-mobile",
        runtime="expo",
        audience="Founder showing a mobile concept to users and investors",
        description="A mobile capsule that generates an Expo project and preview QR flow.",
        starter_files={"App.tsx": "export default function App(){return null}\n", "app.json": "{}\n"},
        success_criteria=["Expo starts", "QR code scans", "phone preview works", "README explains install"],
    ),
    "wasm-kernel": CapsuleTemplate(
        id="wasm-kernel",
        name="C++ WASM Kernel",
        kind="wasm-worker",
        runtime="cpp",
        audience="Engineer moving performance-critical logic into browser-safe workers",
        description="A C++ source capsule with honest Emscripten/WASI build planning and worker deployment metadata.",
        starter_files={"main.cpp": "int main(){return 0;}\n", "build.md": "# WASM build plan"},
        success_criteria=["toolchain detected", "build plan recorded", "worker route defined", "fallback documented"],
    ),
}


def list_templates() -> List[Dict[str, object]]:
    return [template.to_dict() for template in TEMPLATES.values()]


def get_template(template_id: str) -> CapsuleTemplate:
    if template_id not in TEMPLATES:
        raise KeyError(f"unknown template: {template_id}; available: {', '.join(sorted(TEMPLATES))}")
    return TEMPLATES[template_id]
