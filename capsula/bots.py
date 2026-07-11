from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Dict, List, Literal, Optional

BotScope = Literal["github", "platform", "runtime", "security", "growth", "research", "release"]
BotMode = Literal["advisory", "automated", "approval-gated", "watch"]
BotStatus = Literal["active", "standby", "planned"]


@dataclass(frozen=True)
class BotCapability:
    name: str
    description: str
    inputs: List[str]
    outputs: List[str]

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


@dataclass(frozen=True)
class CapsulaBot:
    id: str
    name: str
    scope: BotScope
    mode: BotMode
    status: BotStatus
    mission: str
    owns: List[str]
    triggers: List[str]
    capabilities: List[BotCapability]
    handoff_to: List[str] = field(default_factory=list)
    guardrails: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, object]:
        data = asdict(self)
        data["capabilities"] = [capability.to_dict() for capability in self.capabilities]
        return data


def cap(name: str, description: str, inputs: List[str], outputs: List[str]) -> BotCapability:
    return BotCapability(name=name, description=description, inputs=inputs, outputs=outputs)


BOTS: Dict[str, CapsulaBot] = {
    "repo_sentinel": CapsulaBot(
        id="repo_sentinel",
        name="Repo Sentinel",
        scope="github",
        mode="watch",
        status="active",
        mission="Watch repository structure, missing docs, broken issue metadata, and unsafe release drift.",
        owns=["repository hygiene", "default branch watch", "file map"],
        triggers=["push", "issue opened", "manual audit"],
        capabilities=[cap("repo_scan", "Summarize repo health and missing platform assets.", ["repo tree", "commits"], ["repo health packet"])],
        handoff_to=["release_captain", "docs_architect"],
        guardrails=["never delete files automatically", "never merge without an explicit release gate"],
    ),
    "issue_triage": CapsulaBot(
        id="issue_triage",
        name="Issue Triage Bot",
        scope="github",
        mode="approval-gated",
        status="active",
        mission="Classify issues by runtime lane, severity, owner surface, and required evidence.",
        owns=["issue labels", "routing", "acceptance criteria"],
        triggers=["issue opened", "issue edited", "comment added"],
        capabilities=[cap("issue_route", "Turn raw issue text into a structured work packet.", ["issue body"], ["labels", "owner", "next question"])],
        handoff_to=["qa_gatekeeper", "release_captain"],
        guardrails=["ask for missing reproduction before escalation"],
    ),
    "pr_reviewer": CapsulaBot(
        id="pr_reviewer",
        name="PR Reviewer Bot",
        scope="github",
        mode="approval-gated",
        status="active",
        mission="Review pull requests for build risk, security boundary changes, user-facing copy, and protocol compliance.",
        owns=["PR review", "risk comments", "merge readiness"],
        triggers=["pull_request opened", "pull_request synchronize"],
        capabilities=[cap("diff_review", "Map changed files to risk categories.", ["PR diff"], ["review checklist", "blocking comments"])],
        handoff_to=["security_steward", "release_captain"],
        guardrails=["do not approve security-sensitive changes without evidence"],
    ),
    "release_captain": CapsulaBot(
        id="release_captain",
        name="Release Captain Bot",
        scope="release",
        mode="approval-gated",
        status="active",
        mission="Run release gates, version readiness, changelog readiness, and deploy handoff.",
        owns=["release gate", "version notes", "deployment checklist"],
        triggers=["release candidate", "manual release"],
        capabilities=[cap("release_gate", "Create pass/warn/fail release report.", ["manifest", "CI", "QA evidence"], ["release report"])],
        handoff_to=["qa_gatekeeper", "github_publisher"],
        guardrails=["release cannot pass with required fail checks"],
    ),
    "qa_gatekeeper": CapsulaBot(
        id="qa_gatekeeper",
        name="Commercial QA Gatekeeper",
        scope="platform",
        mode="approval-gated",
        status="active",
        mission="Verify the product is understandable, previewable, testable, and ready for a real user session.",
        owns=["commercial readiness", "demo checklist", "user acceptance"],
        triggers=["feature complete", "release candidate"],
        capabilities=[cap("qa_matrix", "Generate feature acceptance matrix.", ["feature list", "screens"], ["QA matrix"])],
        handoff_to=["release_captain", "user_activation"],
        guardrails=["no commercial-ready claim without runnable path"],
    ),
    "security_steward": CapsulaBot(
        id="security_steward",
        name="Security Steward Bot",
        scope="security",
        mode="approval-gated",
        status="active",
        mission="Protect filesystem boundaries, subprocess execution, AI provider keys, GitHub writes, and capsule exports.",
        owns=["threat model", "secrets", "sandbox boundary", "policy review"],
        triggers=["security file changed", "runtime executor changed", "MCP tool changed"],
        capabilities=[cap("security_review", "Map platform boundary changes to threats and mitigations.", ["diff", "manifest"], ["security findings"])],
        handoff_to=["pr_reviewer", "release_captain"],
        guardrails=["never print secrets", "never run untrusted code without sandbox boundary"],
    ),
    "runtime_smith": CapsulaBot(
        id="runtime_smith",
        name="Runtime Smith Bot",
        scope="runtime",
        mode="automated",
        status="active",
        mission="Maintain language lane definitions, starter files, run commands, and toolchain honesty.",
        owns=["runtime registry", "starter files", "toolchain hints"],
        triggers=["runtime request", "toolchain failure"],
        capabilities=[cap("runtime_patch", "Draft runtime additions with honest toolchain state.", ["runtime request"], ["runtime spec", "starter file"])],
        handoff_to=["wasm_cartographer", "qa_gatekeeper"],
        guardrails=["do not claim compiler support when toolchain is missing"],
    ),
    "wasm_cartographer": CapsulaBot(
        id="wasm_cartographer",
        name="WASM Cartographer Bot",
        scope="runtime",
        mode="automated",
        status="active",
        mission="Map C, C++, Rust, Python, Java, and other lanes into honest WASM/WASI possibilities.",
        owns=["WASM build plans", "WASI notes", "toolchain matrix"],
        triggers=["wasm request", "runtime changed"],
        capabilities=[cap("wasm_plan", "Produce compiler path and fallback plan.", ["source files", "runtime"], ["WASM plan"])],
        handoff_to=["runtime_smith", "security_steward"],
        guardrails=["mark experimental compilation as experimental"],
    ),
    "mcp_conductor": CapsulaBot(
        id="mcp_conductor",
        name="MCP Conductor Bot",
        scope="platform",
        mode="approval-gated",
        status="active",
        mission="Coordinate MCP-style tool calls, AI generation, and platform workers without bypassing guardrails.",
        owns=["tool contracts", "AI bridge", "tool call logs"],
        triggers=["MCP server changed", "tool contract request"],
        capabilities=[cap("tool_contract", "Define stable request/response shapes for tools.", ["tool need"], ["tool spec"])],
        handoff_to=["security_steward", "docs_architect"],
        guardrails=["tool calls must be auditable", "AI output must not be treated as executed work"],
    ),
    "github_publisher": CapsulaBot(
        id="github_publisher",
        name="GitHub Publisher Bot",
        scope="github",
        mode="approval-gated",
        status="active",
        mission="Stage generated capsules for branches, PRs, issue links, releases, and repository handoffs.",
        owns=["branch plan", "PR body", "release notes"],
        triggers=["deploy plan created", "release candidate"],
        capabilities=[cap("publish_packet", "Create branch/PR/release instructions.", ["manifest", "release gate"], ["publish packet"])],
        handoff_to=["release_captain"],
        guardrails=["direct-to-main only when explicitly requested"],
    ),
    "docs_architect": CapsulaBot(
        id="docs_architect",
        name="Docs Architect Bot",
        scope="research",
        mode="automated",
        status="active",
        mission="Keep docs, research papers, protocols, and user guides aligned with the implementation.",
        owns=["docs index", "research papers", "protocol atlas"],
        triggers=["feature added", "paper requested"],
        capabilities=[cap("doc_sync", "Generate docs from platform changes.", ["commit summary", "code map"], ["docs update"])],
        handoff_to=["research_fellow", "qa_gatekeeper"],
        guardrails=["clearly mark speculative roadmap versus implemented capability"],
    ),
    "research_fellow": CapsulaBot(
        id="research_fellow",
        name="Research Fellow Bot",
        scope="research",
        mode="advisory",
        status="active",
        mission="Deepen CAPSULA papers with falsifiable claims, evaluation methods, and architecture theory.",
        owns=["whitepapers", "benchmarks", "methodology"],
        triggers=["research update", "investor memo"],
        capabilities=[cap("research_packet", "Draft technical research sections with tests.", ["architecture claim"], ["research packet"])],
        handoff_to=["docs_architect", "eval_bench"],
        guardrails=["separate claim, evidence, and hypothesis"],
    ),
    "eval_bench": CapsulaBot(
        id="eval_bench",
        name="Evaluation Bench Bot",
        scope="platform",
        mode="automated",
        status="active",
        mission="Define and track benchmarks for latency, activation, capsule completion, and release confidence.",
        owns=["metrics", "benchmarks", "test evidence"],
        triggers=["test added", "release candidate", "activation review"],
        capabilities=[cap("bench_report", "Compile benchmark evidence.", ["test output", "telemetry"], ["benchmark report"])],
        handoff_to=["qa_gatekeeper", "release_captain"],
        guardrails=["do not inflate metrics without measurement"],
    ),
    "user_activation": CapsulaBot(
        id="user_activation",
        name="User Activation Bot",
        scope="growth",
        mode="watch",
        status="active",
        mission="Guide new users from first visit to first capsule preview and deploy plan.",
        owns=["activation funnel", "onboarding", "first-run experience"],
        triggers=["visitor", "workspace created", "preview opened"],
        capabilities=[cap("next_action", "Recommend next onboarding action.", ["activation checklist"], ["next action"])],
        handoff_to=["customer_success", "growth_operator"],
        guardrails=["make next step concrete and small"],
    ),
    "customer_success": CapsulaBot(
        id="customer_success",
        name="Customer Success Bot",
        scope="growth",
        mode="advisory",
        status="active",
        mission="Turn user feedback into support guidance, docs fixes, and roadmap signal.",
        owns=["support intake", "user education", "feedback loop"],
        triggers=["support issue", "feedback form"],
        capabilities=[cap("support_packet", "Convert feedback into support and product actions.", ["feedback"], ["support reply", "product signal"])],
        handoff_to=["issue_triage", "docs_architect"],
        guardrails=["never promise undocumented capability"],
    ),
    "growth_operator": CapsulaBot(
        id="growth_operator",
        name="Growth Operator Bot",
        scope="growth",
        mode="advisory",
        status="active",
        mission="Prepare launch copy, demo scripts, ICP learnings, and outreach sequences.",
        owns=["launch copy", "ICP notes", "outreach"],
        triggers=["launch campaign", "funding demo"],
        capabilities=[cap("campaign_packet", "Create GTM packet from feature state.", ["product state"], ["campaign packet"])],
        handoff_to=["user_activation", "docs_architect"],
        guardrails=["do not overstate implemented functionality"],
    ),
    "design_steward": CapsulaBot(
        id="design_steward",
        name="Design Steward Bot",
        scope="platform",
        mode="advisory",
        status="active",
        mission="Keep the enterprise UI polished, consistent, accessible, and calm under complexity.",
        owns=["design system", "accessibility", "UI copy", "visual QA"],
        triggers=["UI changed", "new surface added"],
        capabilities=[cap("design_review", "Review hierarchy, spacing, copy, and accessibility.", ["screen spec"], ["design review"])],
        handoff_to=["qa_gatekeeper", "front_end_builder"],
        guardrails=["readability over decoration"],
    ),
    "front_end_builder": CapsulaBot(
        id="front_end_builder",
        name="Frontend Builder Bot",
        scope="platform",
        mode="automated",
        status="active",
        mission="Build polished React surfaces for dashboards, protocols, bots, runtime lanes, and activation flows.",
        owns=["React UI", "stateful views", "component polish"],
        triggers=["screen requested", "UX flow requested"],
        capabilities=[cap("surface_build", "Create production UI surface.", ["screen need"], ["React component", "CSS"])],
        handoff_to=["design_steward", "qa_gatekeeper"],
        guardrails=["no broken imports", "no fake live status without label"],
    ),
    "data_room_curator": CapsulaBot(
        id="data_room_curator",
        name="Funding Data Room Curator",
        scope="research",
        mode="advisory",
        status="active",
        mission="Maintain investor-ready evidence, papers, demo scripts, risks, and roadmap.",
        owns=["funding room", "investor brief", "evidence map"],
        triggers=["fundraising packet", "new paper"],
        capabilities=[cap("data_room_update", "Map assets to investor questions.", ["docs", "product metrics"], ["data room index"])],
        handoff_to=["research_fellow", "growth_operator"],
        guardrails=["mark unverified metrics as targets"],
    ),
    "easter_egg_keeper": CapsulaBot(
        id="easter_egg_keeper",
        name="Easter Egg Keeper",
        scope="platform",
        mode="advisory",
        status="active",
        mission="Hide tasteful founder-only delights that do not break accessibility, trust, or user comprehension.",
        owns=["founder delight", "hidden copy", "playful details"],
        triggers=["major UI pass", "founder request"],
        capabilities=[cap("egg_drop", "Add small safe delights to product surfaces.", ["surface"], ["easter egg note"])],
        handoff_to=["design_steward"],
        guardrails=["never hide security-sensitive behavior", "never confuse core workflows"],
    ),
}


def list_bots(scope: Optional[BotScope] = None) -> List[Dict[str, object]]:
    bots = BOTS.values() if scope is None else [bot for bot in BOTS.values() if bot.scope == scope]
    return [bot.to_dict() for bot in bots]


def get_bot(bot_id: str) -> CapsulaBot:
    if bot_id not in BOTS:
        raise KeyError(f"unknown bot: {bot_id}")
    return BOTS[bot_id]


def route_issue(surface: str, body: str = "") -> Dict[str, object]:
    text = f"{surface} {body}".lower()
    labels = ["bot:triage"]
    owners = ["issue_triage"]
    if any(token in text for token in ["security", "secret", "sandbox", "permission"]):
        labels.append("surface:security")
        owners.append("security_steward")
    if any(token in text for token in ["wasm", "wasi", "c++", "cpp", "c "]):
        labels.append("runtime:wasm")
        owners.append("wasm_cartographer")
    if any(token in text for token in ["expo", "mobile", "qr"]):
        labels.append("surface:mobile")
        owners.append("user_activation")
    if any(token in text for token in ["ui", "frontend", "design", "screen"]):
        labels.append("surface:web")
        owners.append("front_end_builder")
    if any(token in text for token in ["release", "deploy", "merge", "ship"]):
        labels.append("surface:release")
        owners.append("release_captain")
    return {"labels": sorted(set(labels)), "owners": sorted(set(owners)), "needs_evidence": "reproduction steps or acceptance criteria"}
