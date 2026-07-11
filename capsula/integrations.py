from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Dict, List, Literal

IntegrationCategory = Literal[
    "code",
    "deploy",
    "communication",
    "product",
    "data",
    "payments",
    "design",
    "observability",
    "identity",
    "ai",
]

IntegrationDirection = Literal["capsula_uses_app", "app_uses_capsula", "bidirectional"]
IntegrationMaturity = Literal["ship_now", "adapter_ready", "planned"]


@dataclass(frozen=True)
class IntegrationAction:
    name: str
    description: str
    input_contract: List[str]
    output_contract: List[str]

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


@dataclass(frozen=True)
class Integration:
    id: str
    name: str
    category: IntegrationCategory
    direction: IntegrationDirection
    maturity: IntegrationMaturity
    user_value: str
    auth_model: str
    required_secrets: List[str]
    actions: List[IntegrationAction]
    evidence: List[str]
    notes: str = ""
    guardrails: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, object]:
        data = asdict(self)
        data["actions"] = [action.to_dict() for action in self.actions]
        return data


def action(name: str, description: str, inputs: List[str], outputs: List[str]) -> IntegrationAction:
    return IntegrationAction(name=name, description=description, input_contract=inputs, output_contract=outputs)


INTEGRATIONS: Dict[str, Integration] = {
    "github": Integration(
        id="github",
        name="GitHub",
        category="code",
        direction="bidirectional",
        maturity="ship_now",
        user_value="CAPSULA can turn work into branches, PRs, issues, release notes, deploy evidence, and repo handoffs.",
        auth_model="GitHub App or token scoped to target repositories",
        required_secrets=["GITHUB_TOKEN or GitHub App installation"],
        actions=[
            action("create_issue_packet", "Create structured issue work packets from product needs.", ["title", "scope", "acceptance"], ["issue url", "labels", "owner"]),
            action("publish_capsule", "Prepare branch, files, manifest, PR, and release handoff.", ["capsule manifest", "repo target"], ["branch", "PR", "release notes"]),
        ],
        evidence=["merged PR", "commit SHA", "GitHub Actions run", "release artifact"],
        guardrails=["never write secrets", "separate generated output from source of truth"],
    ),
    "cloudflare": Integration(
        id="cloudflare",
        name="Cloudflare Pages + Workers",
        category="deploy",
        direction="bidirectional",
        maturity="adapter_ready",
        user_value="Users can publish the CAPSULA Studio front-end and later connect Workers for edge APIs and capsule preview routing.",
        auth_model="Cloudflare API token and account ID stored in GitHub secrets",
        required_secrets=["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"],
        actions=[
            action("deploy_pages", "Build web/dist and publish it to Cloudflare Pages.", ["project name", "web build"], ["deployment url", "build log"]),
            action("edge_route_plan", "Prepare Worker routing for API, preview, and webhook surfaces.", ["route map"], ["worker plan", "env vars"]),
        ],
        evidence=["Cloudflare deployment URL", "Pages build log", "wrangler config"],
        guardrails=["token must stay in GitHub secrets", "public build must not include private API keys"],
    ),
    "slack": Integration(
        id="slack",
        name="Slack",
        category="communication",
        direction="bidirectional",
        maturity="adapter_ready",
        user_value="Teams can receive capsule build updates, approve release gates, and turn support messages into issues.",
        auth_model="Slack bot token and signing secret",
        required_secrets=["SLACK_BOT_TOKEN", "SLACK_SIGNING_SECRET"],
        actions=[
            action("post_release_update", "Post release gate status into a channel.", ["release report", "channel"], ["message timestamp"]),
            action("capture_work_request", "Turn Slack message context into a CAPSULA issue packet.", ["message url", "thread"], ["issue packet"]),
        ],
        evidence=["posted message", "issue backlink", "approval record"],
        guardrails=["do not ingest private channels without explicit workspace configuration"],
    ),
    "discord": Integration(
        id="discord",
        name="Discord",
        category="communication",
        direction="bidirectional",
        maturity="adapter_ready",
        user_value="Builder communities can request capsules, preview demos, and receive deploy announcements.",
        auth_model="Discord bot token and guild allowlist",
        required_secrets=["DISCORD_BOT_TOKEN"],
        actions=[action("demo_drop", "Publish demo links and release notes to a channel.", ["demo url", "notes"], ["message id"])],
        evidence=["message id", "demo URL", "feedback thread"],
        guardrails=["guild allowlist required before automation"],
    ),
    "linear": Integration(
        id="linear",
        name="Linear",
        category="product",
        direction="bidirectional",
        maturity="adapter_ready",
        user_value="Product teams can move CAPSULA work through real roadmaps, cycles, and issue states.",
        auth_model="Linear API key or OAuth app",
        required_secrets=["LINEAR_API_KEY"],
        actions=[action("sync_issue", "Mirror CAPSULA work packets to Linear issues.", ["work packet"], ["Linear issue URL", "status"])],
        evidence=["Linear issue", "GitHub backlink", "status sync"],
    ),
    "jira": Integration(
        id="jira",
        name="Jira",
        category="product",
        direction="bidirectional",
        maturity="adapter_ready",
        user_value="Enterprise users can route capsule work into existing Jira workflows instead of changing process.",
        auth_model="Atlassian API token and site URL",
        required_secrets=["JIRA_BASE_URL", "JIRA_EMAIL", "JIRA_API_TOKEN"],
        actions=[action("create_ticket", "Create ticket with repo, manifest, acceptance criteria, and release evidence.", ["work packet"], ["ticket URL"])],
        evidence=["Jira ticket", "release field", "linked PR"],
    ),
    "notion": Integration(
        id="notion",
        name="Notion",
        category="product",
        direction="bidirectional",
        maturity="adapter_ready",
        user_value="Users can keep capsules, specs, demo notes, investor evidence, and customer feedback in familiar workspaces.",
        auth_model="Notion integration token and database IDs",
        required_secrets=["NOTION_TOKEN"],
        actions=[action("write_capsule_page", "Publish manifest, screenshots, docs, and deployment links into Notion.", ["capsule manifest"], ["page URL"])],
        evidence=["Notion page", "source repo link", "deployment URL"],
    ),
    "google-drive": Integration(
        id="google-drive",
        name="Google Drive",
        category="data",
        direction="bidirectional",
        maturity="planned",
        user_value="Teams can import docs/assets and export final packets without leaving their existing file system.",
        auth_model="Google OAuth app",
        required_secrets=["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
        actions=[action("export_packet", "Export docs, manifests, and release evidence to Drive folders.", ["release packet"], ["folder URL"])],
        evidence=["folder URL", "file manifest", "hash list"],
    ),
    "supabase": Integration(
        id="supabase",
        name="Supabase",
        category="data",
        direction="bidirectional",
        maturity="adapter_ready",
        user_value="CAPSULA apps can ship with auth, database, storage, and realtime without building every backend from scratch.",
        auth_model="Supabase project URL and service role key",
        required_secrets=["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
        actions=[action("provision_schema", "Generate SQL and environment map for capsule apps.", ["schema plan"], ["migration SQL", "env map"])],
        evidence=["migration file", "project URL", "schema receipt"],
        guardrails=["service role key must never enter browser builds"],
    ),
    "stripe": Integration(
        id="stripe",
        name="Stripe",
        category="payments",
        direction="bidirectional",
        maturity="adapter_ready",
        user_value="Commercial capsule apps can accept payments, subscriptions, and customer portal handoffs.",
        auth_model="Stripe secret key and webhook signing secret",
        required_secrets=["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
        actions=[action("billing_handoff", "Generate checkout and customer portal integration plan.", ["pricing plan"], ["checkout route", "webhook plan"])],
        evidence=["test checkout", "webhook event", "customer portal link"],
        guardrails=["start in Stripe test mode", "webhooks must be verified"],
    ),
    "figma": Integration(
        id="figma",
        name="Figma",
        category="design",
        direction="bidirectional",
        maturity="adapter_ready",
        user_value="Design files can become capsules, and CAPSULA can generate implementation-ready UI specs back to design teams.",
        auth_model="Figma token or OAuth app",
        required_secrets=["FIGMA_TOKEN"],
        actions=[action("design_intake", "Convert Figma links into UI implementation packets.", ["Figma URL"], ["component map", "implementation checklist"])],
        evidence=["Figma link", "screen map", "implemented component list"],
    ),
    "sentry": Integration(
        id="sentry",
        name="Sentry",
        category="observability",
        direction="app_uses_capsula",
        maturity="adapter_ready",
        user_value="Apps can report errors into existing observability pipelines and feed fixes back into CAPSULA issues.",
        auth_model="Sentry DSN and API token for issue sync",
        required_secrets=["SENTRY_DSN", "SENTRY_AUTH_TOKEN"],
        actions=[action("error_to_issue", "Turn production error context into a GitHub issue packet.", ["Sentry event"], ["issue packet", "fix scope"])],
        evidence=["Sentry issue", "GitHub issue", "fix PR"],
    ),
    "openai-compatible": Integration(
        id="openai-compatible",
        name="OpenAI-compatible AI Providers",
        category="ai",
        direction="capsula_uses_app",
        maturity="ship_now",
        user_value="Builders can use AI generation/review inside the CAPSULA tool loop while keeping provider choice explicit.",
        auth_model="Provider API key stored as environment secret",
        required_secrets=["CAPSULA_AI_PROVIDER", "OPENAI_API_KEY optional"],
        actions=[action("ai_generate", "Generate code/docs/review text through a provider adapter.", ["prompt", "context"], ["candidate output", "review notes"])],
        evidence=["tool call log", "generated diff", "human approval"],
        guardrails=["AI output is not executed work until committed and verified"],
    ),
}


def list_integrations() -> List[Dict[str, object]]:
    return [integration.to_dict() for integration in INTEGRATIONS.values()]


def get_integration(integration_id: str) -> Integration:
    if integration_id not in INTEGRATIONS:
        raise KeyError(f"unknown integration: {integration_id}; available: {', '.join(sorted(INTEGRATIONS))}")
    return INTEGRATIONS[integration_id]


def shipping_integrations() -> List[Dict[str, object]]:
    return [integration.to_dict() for integration in INTEGRATIONS.values() if integration.maturity in {"ship_now", "adapter_ready"}]
