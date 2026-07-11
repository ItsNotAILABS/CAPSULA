from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Dict, List, Literal

DeployCategory = Literal["static-web", "fullstack", "mobile", "worker", "container", "ai-app", "research-artifact"]


@dataclass(frozen=True)
class DeployTarget:
    id: str
    name: str
    category: DeployCategory
    best_for: str
    build_command: str
    output_path: str
    required_files: List[str]
    environment: List[str]
    handoff: str

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


DEPLOY_TARGETS: Dict[str, DeployTarget] = {
    "vercel": DeployTarget("vercel", "Vercel", "static-web", "React/Vite apps and marketing showcases", "npm run build", "dist", ["web/package.json", "web/vite.config.ts"], [], "connect GitHub repo and set root directory to web"),
    "netlify": DeployTarget("netlify", "Netlify", "static-web", "static frontends and previews", "npm run build", "dist", ["web/package.json"], [], "set base directory web and publish directory web/dist"),
    "cloudflare-pages": DeployTarget("cloudflare-pages", "Cloudflare Pages", "static-web", "fast static showcase and worker adjacent apps", "npm run build", "dist", ["web/package.json"], [], "connect repo, root web, output dist"),
    "github-pages": DeployTarget("github-pages", "GitHub Pages", "static-web", "public docs and demo exports", "npm run build", "dist", ["web/package.json"], [], "publish built artifact from GitHub Actions"),
    "railway": DeployTarget("railway", "Railway", "fullstack", "FastAPI, Node, and worker service capsules", "python -m capsula.cli api", ".", ["requirements-platform.txt"], ["PORT"], "create service from repo and expose API port"),
    "render": DeployTarget("render", "Render", "fullstack", "API services and scheduled workers", "uvicorn app:app --host 0.0.0.0 --port $PORT", ".", ["requirements-platform.txt"], ["PORT"], "create web service or background worker"),
    "fly": DeployTarget("fly", "Fly.io", "container", "global Docker-backed API/runtime services", "docker build .", ".", ["Dockerfile"], ["PORT"], "package capsule as container"),
    "docker": DeployTarget("docker", "Docker", "container", "portable local or cloud deployments", "docker build -t capsula-app .", ".", ["Dockerfile"], [], "standard container build and run"),
    "expo-go": DeployTarget("expo-go", "Expo Go", "mobile", "live phone demos before app store submission", "npm run start", ".", ["app.json", "package.json", "App.tsx"], [], "scan the QR code with Expo Go"),
    "eas-update": DeployTarget("eas-update", "Expo EAS Update", "mobile", "mobile preview channels and stakeholder demos", "eas update", ".", ["app.json", "eas.json"], ["EXPO_TOKEN"], "publish to an EAS update channel"),
    "eas-build": DeployTarget("eas-build", "Expo EAS Build", "mobile", "iOS/Android builds", "eas build", ".", ["app.json", "eas.json"], ["EXPO_TOKEN"], "create installable builds"),
    "caffeine": DeployTarget("caffeine", "Caffeine", "ai-app", "AI-built app showcases and fast user-facing demos", "npm run build", "dist", ["web/package.json", "docs/SHOWCASE_GUIDE.md"], [], "use CAPSULA showcase copy and deploy checklist"),
    "emergent": DeployTarget("emergent", "Emergent", "ai-app", "AI-generated app handoff and polishing", "npm run build", "dist", ["docs/AI_APP_HANDOFF.md"], [], "map source, env vars, deploy target, and demo flow before handoff"),
    "zenodo": DeployTarget("zenodo", "Zenodo", "research-artifact", "research papers, manifests, and reproducibility packages", "python -m capsula.cli manifest <session>", "capsule manifest + papers", ["papers/", "docs/", "capsules/schema/capsula.schema.json"], [], "archive release package with DOI-ready metadata"),
}


def list_deploy_targets() -> List[Dict[str, object]]:
    return [target.to_dict() for target in DEPLOY_TARGETS.values()]


def get_deploy_target(target_id: str) -> DeployTarget:
    if target_id not in DEPLOY_TARGETS:
        raise KeyError(f"unknown deploy target: {target_id}; available: {', '.join(sorted(DEPLOY_TARGETS))}")
    return DEPLOY_TARGETS[target_id]
