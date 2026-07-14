from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Dict, List, Literal

SurfaceKind = Literal[
    "workspace",
    "builder",
    "preview",
    "integration",
    "deploy",
    "governance",
    "analytics",
    "support",
    "marketplace",
]

Maturity = Literal["shipping", "adapter", "planned"]


@dataclass(frozen=True)
class FrontendSurface:
    id: str
    name: str
    kind: SurfaceKind
    maturity: Maturity
    user: str
    job_to_be_done: str
    primary_action: str
    evidence: List[str]
    components: List[str]
    connected_backends: List[str]
    next_upgrade: str

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


SURFACES: Dict[str, FrontendSurface] = {
    "workspace-ide": FrontendSurface(
        id="workspace-ide",
        name="Workspace IDE",
        kind="workspace",
        maturity="shipping",
        user="builder creating or editing a capsule",
        job_to_be_done="open project context, edit files, run checks, inspect preview, and prepare deploy from one surface",
        primary_action="create capsule workspace",
        evidence=["file tree", "editor panel", "preview panel", "terminal log", "release gate"],
        components=["AppShell", "FileTree", "EditorPane", "PreviewPane", "TerminalPane", "ReleaseGateCard"],
        connected_backends=["capsula.ide", "capsula.orchestrator", "capsula.storage", "capsula.release_gate"],
        next_upgrade="wire live file operations and persisted workspace sessions",
    ),
    "demo-gallery": FrontendSurface(
        id="demo-gallery",
        name="Demo App Gallery",
        kind="preview",
        maturity="shipping",
        user="founder, client, or operator who needs to see value before backend launch",
        job_to_be_done="open standalone HTML/static demos that prove the structure and workflow before credentials exist",
        primary_action="open prelaunch demo",
        evidence=["HTML file", "local HTTP preview", "static deploy target", "proof checklist"],
        components=["DemoCard", "ProtocolRail", "UseCaseMatrix", "LaunchChecklist"],
        connected_backends=["capsula.demo_apps", "docs/DEMO_APP_LAUNCH_FLOW.md"],
        next_upgrade="add in-platform generation of new static demo apps",
    ),
    "connector-gallery": FrontendSurface(
        id="connector-gallery",
        name="Connector Gallery",
        kind="integration",
        maturity="shipping",
        user="team connecting the tools they already use",
        job_to_be_done="connect GitHub, Cloudflare, Slack, Discord, Linear, Jira, Notion, Google, Supabase, Stripe, Sentry, Figma, Expo, and model providers",
        primary_action="configure connector",
        evidence=["connector registry", "auth requirements", "direction map", "webhook/outbound boundary"],
        components=["ConnectorCard", "AuthRequirementList", "DirectionBadge", "WebhookPanel"],
        connected_backends=["capsula.integrations"],
        next_upgrade="add OAuth app scaffolds and secret-health checks",
    ),
    "deployment-command": FrontendSurface(
        id="deployment-command",
        name="Deployment Command Center",
        kind="deploy",
        maturity="shipping",
        user="operator shipping public URLs or backend services",
        job_to_be_done="choose GitHub Pages, Cloudflare, Vercel, Netlify, Render, Fly.io, Docker, or Expo and follow exact release evidence",
        primary_action="generate deploy plan",
        evidence=["build command", "deploy command", "required files", "public URL", "logs"],
        components=["DeployTargetPicker", "BuildLog", "SecretChecklist", "PublicUrlCard"],
        connected_backends=["capsula.deployments", "cloudflare/wrangler.toml", "Dockerfile", "render.yaml"],
        next_upgrade="display real GitHub Actions run status and artifact links",
    ),
    "protocol-console": FrontendSurface(
        id="protocol-console",
        name="Protocol Console",
        kind="governance",
        maturity="shipping",
        user="team standardizing how structures are created and launched",
        job_to_be_done="select the protocol path for render-before-backend, static demo gate, connector boundary, and live launch gate",
        primary_action="apply protocol path",
        evidence=["protocol ID", "owner", "gate", "acceptance criteria"],
        components=["ProtocolPath", "GateCard", "OwnerBadge", "RiskBoundary"],
        connected_backends=["capsula.protocols", "docs/STRUCTURE_BUILDING_PROTOCOLS.md"],
        next_upgrade="wire protocol selection into manifest generation",
    ),
    "user-activation": FrontendSurface(
        id="user-activation",
        name="User Activation Board",
        kind="analytics",
        maturity="adapter",
        user="founder or product operator tracking real adoption",
        job_to_be_done="see visitors move from workspace to first capsule, preview, manifest, deploy plan, team invite, and paid workspace",
        primary_action="inspect activation dropoff",
        evidence=["local-first telemetry", "funnel counts", "activation health"],
        components=["ActivationFunnel", "MilestoneCard", "DropoffInsight", "NextAction"],
        connected_backends=["capsula.telemetry"],
        next_upgrade="persist local events and sync opt-in aggregate metrics",
    ),
    "template-marketplace": FrontendSurface(
        id="template-marketplace",
        name="Template Marketplace",
        kind="marketplace",
        maturity="adapter",
        user="builder choosing a proven structure instead of starting blank",
        job_to_be_done="select customer portal, ops agent, MCP server, mobile preview, science report, integration console, support desk, or release gate template",
        primary_action="instantiate template",
        evidence=["starter files", "success criteria", "deploy target", "use-case matrix"],
        components=["TemplateCard", "UseCaseFit", "StarterFilePreview", "DeployPath"],
        connected_backends=["capsula.templates", "capsula.demo_apps"],
        next_upgrade="generate complete project directories from template definitions",
    ),
}


def list_frontend_surfaces() -> List[Dict[str, object]]:
    return [surface.to_dict() for surface in SURFACES.values()]


def get_frontend_surface(surface_id: str) -> FrontendSurface:
    if surface_id not in SURFACES:
        raise KeyError(f"unknown frontend surface: {surface_id}; available: {', '.join(sorted(SURFACES))}")
    return SURFACES[surface_id]


def shipping_surface_sequence() -> List[str]:
    return [
        "workspace-ide",
        "demo-gallery",
        "connector-gallery",
        "deployment-command",
        "protocol-console",
        "template-marketplace",
        "user-activation",
    ]
