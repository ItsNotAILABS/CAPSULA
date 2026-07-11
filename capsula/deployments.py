from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Dict, List, Literal

DeploymentSurface = Literal[
    "web",
    "api",
    "mobile",
    "worker",
    "data",
    "ai",
    "docs",
    "showcase",
]

DeploymentMaturity = Literal["ready", "adapter", "planned"]


@dataclass(frozen=True)
class DeploymentTarget:
    id: str
    name: str
    surface: DeploymentSurface
    maturity: DeploymentMaturity
    best_for: str
    build_command: str
    deploy_command: str
    required_files: List[str]
    evidence: List[str]
    notes: str

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


TARGETS: Dict[str, DeploymentTarget] = {
    "github-pages": DeploymentTarget(
        id="github-pages",
        name="GitHub Pages",
        surface="web",
        maturity="adapter",
        best_for="public documentation, demo landing pages, and static showcases",
        build_command="cd web && npm install && npm run build",
        deploy_command="publish web/dist to GitHub Pages or a gh-pages branch",
        required_files=["web/package.json", "web/vite.config.ts", "web/src/App.tsx"],
        evidence=["web build artifact", "public URL", "README link"],
        notes="Use for a lightweight public showcase. Avoid secrets and private runtime calls.",
    ),
    "vercel": DeploymentTarget(
        id="vercel",
        name="Vercel",
        surface="web",
        maturity="adapter",
        best_for="React/Vite product demos, landing pages, and user-facing web studio previews",
        build_command="cd web && npm install && npm run build",
        deploy_command="vercel --prod from the repository root or web directory",
        required_files=["web/package.json", "web/index.html", "web/src/App.tsx"],
        evidence=["deployment URL", "build logs", "environment variable map"],
        notes="Good default for investor demo links and quick user trials.",
    ),
    "netlify": DeploymentTarget(
        id="netlify",
        name="Netlify",
        surface="web",
        maturity="adapter",
        best_for="static web studio demos, forms, preview branches, and quick client links",
        build_command="cd web && npm install && npm run build",
        deploy_command="netlify deploy --prod --dir web/dist",
        required_files=["web/package.json", "web/vite.config.ts"],
        evidence=["deploy URL", "build settings", "preview branch"],
        notes="Good for static showcase builds and fast public validation.",
    ),
    "cloudflare-pages": DeploymentTarget(
        id="cloudflare-pages",
        name="Cloudflare Pages",
        surface="web",
        maturity="adapter",
        best_for="edge-hosted static apps, docs, and front-end capsules",
        build_command="cd web && npm install && npm run build",
        deploy_command="wrangler pages deploy web/dist",
        required_files=["web/package.json", "web/dist"],
        evidence=["pages URL", "build log", "wrangler config when needed"],
        notes="Use for fast global static delivery and later worker integration.",
    ),
    "railway": DeploymentTarget(
        id="railway",
        name="Railway",
        surface="api",
        maturity="adapter",
        best_for="FastAPI, Node services, AI bridges, and prototype backend APIs",
        build_command="python -m pip install -r requirements-platform.txt",
        deploy_command="railway up",
        required_files=["requirements-platform.txt", "capsula/server.py"],
        evidence=["service URL", "logs", "health endpoint"],
        notes="Keep API secrets in Railway environment variables, never in repo.",
    ),
    "render": DeploymentTarget(
        id="render",
        name="Render",
        surface="api",
        maturity="adapter",
        best_for="API services, hosted preview servers, and background workers",
        build_command="python -m pip install -r requirements-platform.txt",
        deploy_command="render service deploy through dashboard or CLI",
        required_files=["requirements-platform.txt", "capsula/server.py"],
        evidence=["service URL", "health check", "logs"],
        notes="Good for demo APIs and always-on preview services.",
    ),
    "fly-io": DeploymentTarget(
        id="fly-io",
        name="Fly.io",
        surface="api",
        maturity="adapter",
        best_for="global API workers and small containerized services",
        build_command="docker build .",
        deploy_command="fly deploy",
        required_files=["Dockerfile", "fly.toml"],
        evidence=["app URL", "region map", "release logs"],
        notes="Add Dockerfile before claiming production readiness for this target.",
    ),
    "expo-go": DeploymentTarget(
        id="expo-go",
        name="Expo Go Showcase",
        surface="mobile",
        maturity="ready",
        best_for="showing mobile prototypes to users from a QR code before app-store review",
        build_command="python -m capsula.cli expo --name CAPSULA --slug capsula-showcase",
        deploy_command="cd .capsula/expo/capsula-showcase && npm install && npm run start",
        required_files=["capsula/expo.py", "showcase/expo-go/README.md"],
        evidence=["QR code", "device screenshot", "user feedback notes"],
        notes="This is the fastest user demo path for mobile previews.",
    ),
    "eas": DeploymentTarget(
        id="eas",
        name="Expo EAS Build",
        surface="mobile",
        maturity="adapter",
        best_for="shareable mobile builds beyond Expo Go",
        build_command="npx eas build --platform all",
        deploy_command="npx eas submit --platform all when store-ready",
        required_files=["app.json", "eas.json"],
        evidence=["build URL", "install link", "device QA"],
        notes="Use after Expo Go demo proves the mobile concept.",
    ),
    "caffeine": DeploymentTarget(
        id="caffeine",
        name="Caffeine App Showcase",
        surface="showcase",
        maturity="adapter",
        best_for="public AI app demos, shareable product surfaces, and rapid user sessions",
        build_command="prepare CAPSULA web/app capsule bundle",
        deploy_command="import or recreate the capsule in Caffeine with public demo copy",
        required_files=["docs/CAFFEINE_SHOWCASE.md", "docs/FOUNDER_DEMO_SCRIPT.md"],
        evidence=["public app link", "screen recording", "feedback log"],
        notes="Treat as a showcase adapter: preserve source of truth in GitHub, then mirror the demo surface.",
    ),
    "emergent": DeploymentTarget(
        id="emergent",
        name="Emergent App Showcase",
        surface="showcase",
        maturity="adapter",
        best_for="fast product experiments and public web-app presentation",
        build_command="prepare prompt, repo context, and deployment checklist",
        deploy_command="use docs/EMERGENT_SHOWCASE.md as the source handoff",
        required_files=["docs/EMERGENT_SHOWCASE.md", "docs/DEPLOYMENT_MATRIX.md"],
        evidence=["public URL", "generated app notes", "CAPSULA source link"],
        notes="Keep generated changes auditable by back-porting useful source into GitHub.",
    ),
}


def list_deployment_targets() -> List[Dict[str, object]]:
    return [target.to_dict() for target in TARGETS.values()]


def get_deployment_target(target_id: str) -> DeploymentTarget:
    if target_id not in TARGETS:
        raise KeyError(f"unknown deployment target: {target_id}; available: {', '.join(sorted(TARGETS))}")
    return TARGETS[target_id]
