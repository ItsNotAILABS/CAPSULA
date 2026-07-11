from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Literal

TemplateKind = Literal[
    "web-app",
    "python-agent",
    "mcp-server",
    "expo-mobile",
    "wasm-worker",
    "data-report",
    "science-lab",
    "dashboard",
    "deployment",
    "ai-agent",
    "caffeine-app",
    "emergent-app",
]


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
    deploy_targets: List[str]
    libraries: List[str]

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
            "deploy_targets": self.deploy_targets,
            "libraries": self.libraries,
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
        deploy_targets=["Vercel", "Netlify", "Cloudflare Pages", "GitHub Pages"],
        libraries=["react", "vite", "lucide-react", "zod", "@tanstack/react-query"],
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
        deploy_targets=["GitHub Actions", "Railway", "Render", "Fly.io", "Docker"],
        libraries=["pydantic", "typer", "rich", "httpx", "python-dotenv"],
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
        deploy_targets=["Local", "Docker", "Railway", "Render", "Caffeine"],
        libraries=["fastapi", "uvicorn", "pydantic", "openai", "anthropic"],
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
        deploy_targets=["Expo Go", "EAS Update", "EAS Build", "TestFlight", "Play Console"],
        libraries=["expo", "react-native", "expo-router", "react-native-svg"],
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
        deploy_targets=["Cloudflare Workers", "Web Worker", "Static WASM artifact", "GitHub Release"],
        libraries=["emscripten", "wasi-sdk", "wasmtime"],
    ),
    "science-lab": CapsuleTemplate(
        id="science-lab",
        name="Science and Math Lab",
        kind="science-lab",
        runtime="python",
        audience="Researcher or builder running numerical, symbolic, simulation, or optimization work",
        description="A professional Python science capsule with notebooks, data contracts, plots, and reproducible reports.",
        starter_files={"lab.py": "import numpy as np\nprint(np.array([1,2,3]).mean())\n", "notebooks/README.md": "# Notebooks\n", "reports/README.md": "# Reports\n"},
        success_criteria=["imports optional science stack", "data folder documented", "report artifact generated", "results are reproducible"],
        deploy_targets=["JupyterLab", "GitHub Codespaces", "Docker", "Zenodo package", "Static report"],
        libraries=["numpy", "scipy", "sympy", "pandas", "polars", "matplotlib", "plotly", "scikit-learn"],
    ),
    "analytics-dashboard": CapsuleTemplate(
        id="analytics-dashboard",
        name="Analytics Dashboard",
        kind="dashboard",
        runtime="react",
        audience="Team tracking activation, usage, release quality, and capsule performance",
        description="A data dashboard capsule with charts, query state, filters, and product KPI cards.",
        starter_files={"src/App.tsx": "export default function App(){return <main>Analytics Dashboard</main>}\n"},
        success_criteria=["renders KPI cards", "charts render", "empty states exist", "data source documented"],
        deploy_targets=["Vercel", "Netlify", "Cloudflare Pages", "Caffeine"],
        libraries=["recharts", "@tanstack/react-query", "zod", "date-fns"],
    ),
    "caffeine-showcase": CapsuleTemplate(
        id="caffeine-showcase",
        name="Caffeine Showcase App",
        kind="caffeine-app",
        runtime="react",
        audience="Builder publishing a fast showcase website for users and demos",
        description="A deployable showcase capsule prepared for Caffeine-style app publishing and public demo links.",
        starter_files={"src/App.tsx": "export default function App(){return <main>CAPSULA Showcase</main>}\n", "DEPLOY.md": "# Caffeine deploy notes\n"},
        success_criteria=["homepage explains product", "demo route exists", "CTA exists", "deploy notes are clear"],
        deploy_targets=["Caffeine", "Vercel", "Netlify", "Cloudflare Pages"],
        libraries=["react", "vite", "framer-motion", "lucide-react"],
    ),
    "emergent-app": CapsuleTemplate(
        id="emergent-app",
        name="Emergent App Handoff",
        kind="emergent-app",
        runtime="react",
        audience="Founder moving an AI-built app into a deployable product shell",
        description="A product handoff capsule with source map, environment contract, deploy checklist, and user demo script.",
        starter_files={"README.md": "# Emergent App Handoff\n", "handoff.json": "{}\n"},
        success_criteria=["source map complete", "env vars documented", "demo script written", "deployment path selected"],
        deploy_targets=["Emergent", "GitHub", "Vercel", "Render", "Railway"],
        libraries=["react", "vite", "zod", "fastapi", "pydantic"],
    ),
}


def list_templates() -> List[Dict[str, object]]:
    return [template.to_dict() for template in TEMPLATES.values()]


def get_template(template_id: str) -> CapsuleTemplate:
    if template_id not in TEMPLATES:
        raise KeyError(f"unknown template: {template_id}; available: {', '.join(sorted(TEMPLATES))}")
    return TEMPLATES[template_id]
