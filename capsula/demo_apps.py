from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Dict, List, Literal

DemoAppKind = Literal["static-html", "react", "expo", "dashboard", "workflow", "node-api"]
DemoAppStage = Literal["prototype", "preview", "client-demo", "prelaunch", "live"]


@dataclass(frozen=True)
class DemoAppTemplate:
    id: str
    name: str
    kind: DemoAppKind
    stage: DemoAppStage
    purpose: str
    structure_target: str
    build_command: str
    preview_command: str
    deploy_targets: List[str]
    required_files: List[str]
    protocol_ids: List[str]
    workflow: List[str]
    acceptance_checks: List[str]

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


DEMO_APPS: Dict[str, DemoAppTemplate] = {
    "capsula-studio-html": DemoAppTemplate(
        id="capsula-studio-html",
        name="CAPSULA Studio Standalone HTML Demo",
        kind="static-html",
        stage="client-demo",
        purpose="Render CAPSULA value before backend credentials or hosted services are connected.",
        structure_target="single-file HTML studio, local file preview, GitHub Pages, Cloudflare Pages, Caffeine/Emergent recreation",
        build_command="python -m capsula.demo_render capsula-studio-html --out .capsula/demo/capsula_studio.html",
        preview_command="open .capsula/demo/capsula_studio.html or double-click the file locally",
        deploy_targets=["github-pages", "cloudflare-pages", "vercel", "netlify"],
        required_files=["examples/demo-apps/capsula_studio.html", "docs/DEMO_APP_LAUNCH_FLOW.md"],
        protocol_ids=["P03", "P15", "P20", "P31", "P32", "P33"],
        workflow=[
            "Select CAPSULA structure to showcase",
            "Render standalone HTML shell",
            "Review copy, workflows, use cases, integrations, and deploy path",
            "Open locally through file:// or local preview server",
            "Collect user feedback before live backend launch",
            "Promote approved demo to hosted deployment",
        ],
        acceptance_checks=[
            "opens without backend server",
            "shows builder workflow and deploy targets",
            "names limitations honestly",
            "has next action for live launch",
        ],
    ),
    "sovereign-node-runtime": DemoAppTemplate(
        id="sovereign-node-runtime",
        name="Unified Sovereign Node Runtime Demo",
        kind="dashboard",
        stage="prelaunch",
        purpose="Show node runtime control, protocol governance, worker lanes, and deployment paths without exposing internal backend details.",
        structure_target="AIEOS-style sovereign node workspace, runtime panels, protocol console, deploy evidence",
        build_command="python -m capsula.cli create html --name sovereign-node-runtime",
        preview_command="python -m capsula.cli preview",
        deploy_targets=["cloudflare-pages", "github-pages", "caffeine", "emergent"],
        required_files=["docs/STRUCTURE_BUILD_PROTOCOLS.md", "docs/OUR_STRUCTURES_TEMPLATE_ATLAS.md"],
        protocol_ids=["P01", "P04", "P06", "P13", "P16", "P31", "P34"],
        workflow=[
            "Define the sovereign structure",
            "Map protocol ownership",
            "Generate UI shell and local demo",
            "Attach manifest and release evidence",
            "Launch static preview",
            "Connect backend adapters only after the preview is approved",
        ],
        acceptance_checks=[
            "protocol map visible",
            "runtime lanes visible",
            "backend dependency isolated",
            "deploy plan generated",
        ],
    ),
    "integration-command-center": DemoAppTemplate(
        id="integration-command-center",
        name="Integration Command Center",
        kind="workflow",
        stage="preview",
        purpose="Show GitHub, Cloudflare, Slack/Discord, Linear/Jira, Notion/Google, Supabase, Stripe, Sentry, Figma, Expo, Caffeine, and Emergent as platform lanes.",
        structure_target="connector gallery and workflow surface",
        build_command="python -m capsula.cli create react --name integration-command-center",
        preview_command="cd web && npm run dev",
        deploy_targets=["vercel", "netlify", "cloudflare-pages"],
        required_files=["docs/INTEGRATION_FABRIC.md", "docs/CONNECTOR_GALLERY.md"],
        protocol_ids=["P06", "P07", "P10", "P24", "P31", "P35"],
        workflow=[
            "Choose app connector",
            "Pick inbound or outbound direction",
            "Define event payload and secret boundary",
            "Create demo flow",
            "Test without real credentials",
            "Enable live connector after approval",
        ],
        acceptance_checks=[
            "each connector has direction",
            "credentials never hardcoded",
            "demo mode works without secrets",
            "live mode has setup docs",
        ],
    ),
}


def list_demo_apps() -> List[Dict[str, object]]:
    return [template.to_dict() for template in DEMO_APPS.values()]


def get_demo_app(template_id: str) -> DemoAppTemplate:
    if template_id not in DEMO_APPS:
        raise KeyError(f"unknown demo app: {template_id}; available: {', '.join(sorted(DEMO_APPS))}")
    return DEMO_APPS[template_id]


def demo_launch_sequence(template_id: str) -> List[str]:
    return get_demo_app(template_id).workflow
