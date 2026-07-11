from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Dict, List, Literal

ProtocolLayer = Literal["governance", "github", "runtime", "security", "release", "product", "growth", "research", "support"]
ProtocolStatus = Literal["active", "draft", "experimental"]


@dataclass(frozen=True)
class CapsulaProtocol:
    id: str
    name: str
    layer: ProtocolLayer
    status: ProtocolStatus
    purpose: str
    entry_conditions: List[str]
    required_artifacts: List[str]
    exit_criteria: List[str]
    owner_bot: str

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


PROTOCOLS: Dict[str, CapsulaProtocol] = {
    "P01": CapsulaProtocol("P01", "Workspace Genesis", "product", "active", "Create a bounded workspace before any capsule work begins.", ["new user", "new client", "new product line"], ["workspace id", "owner", "initial project"], ["workspace dashboard created", "first next action visible"], "user_activation"),
    "P02": CapsulaProtocol("P02", "Capsule Birth", "runtime", "active", "Turn an intent into a runtime session with files, starter code, and manifest path.", ["runtime selected", "session name selected"], ["session root", "starter file", "runtime spec"], ["session exists", "starter file written"], "runtime_smith"),
    "P03": CapsulaProtocol("P03", "Preview First", "product", "active", "Force every useful capsule toward a previewable output before release talk.", ["capsule created"], ["preview url", "preview type", "operator note"], ["preview opened or preview limitation documented"], "qa_gatekeeper"),
    "P04": CapsulaProtocol("P04", "Manifest Truth", "release", "active", "The manifest is the contract between code, runtime, preview, workers, and deploy.", ["files exist"], ["capsule.manifest.json"], ["manifest validates against schema"], "release_captain"),
    "P05": CapsulaProtocol("P05", "Toolchain Honesty", "runtime", "active", "Never claim unavailable compilers, SDKs, or external services.", ["compile/build request"], ["toolchain hint", "fallback plan"], ["capability marked ready, missing, or experimental"], "wasm_cartographer"),
    "P06": CapsulaProtocol("P06", "MCP Tool Boundary", "security", "active", "Every AI-callable tool must have a stable name, inputs, outputs, and guardrails.", ["tool added", "tool changed"], ["tool contract", "security note"], ["contract reviewed"], "mcp_conductor"),
    "P07": CapsulaProtocol("P07", "GitHub Direct Write", "github", "active", "Direct-to-main writes are allowed only when the operator explicitly asks for push/merge behavior.", ["repo mutation"], ["commit message", "file path", "operator instruction"], ["commit visible"], "github_publisher"),
    "P08": CapsulaProtocol("P08", "Branch and PR Handoff", "github", "draft", "Use branch and PR flow for team review, security-sensitive work, or release candidates.", ["team review needed", "security boundary changed"], ["branch", "PR body", "review checklist"], ["PR opened and linked"], "pr_reviewer"),
    "P09": CapsulaProtocol("P09", "Issue Intake", "github", "active", "Every issue becomes a structured packet with lane, surface, evidence, and next action.", ["issue opened"], ["issue template", "lane", "evidence"], ["triage packet created"], "issue_triage"),
    "P10": CapsulaProtocol("P10", "Issue Bot Swarm", "github", "active", "Route issue work across triage, QA, release, docs, security, and runtime bots.", ["issue classified"], ["bot owner", "handoff list"], ["single current owner assigned"], "repo_sentinel"),
    "P11": CapsulaProtocol("P11", "Security Review Gate", "security", "active", "Filesystem, subprocess, secrets, MCP, AI providers, and GitHub writes require boundary review.", ["security boundary changed"], ["threat note", "mitigation", "test"], ["no required fail checks"], "security_steward"),
    "P12": CapsulaProtocol("P12", "Secret Silence", "security", "active", "No token, key, or private credential should be printed in logs, docs, issues, or generated files.", ["logs emitted", "AI provider configured"], ["redaction policy"], ["no secret-like value exposed"], "security_steward"),
    "P13": CapsulaProtocol("P13", "Local-First Telemetry", "product", "active", "Collect activation evidence locally without requiring hosted analytics.", ["workspace action", "capsule action"], ["telemetry event", "workspace id"], ["event written to NDJSON"], "eval_bench"),
    "P14": CapsulaProtocol("P14", "Activation Ladder", "growth", "active", "Move users from visitor to first capsule, preview, manifest, and deploy plan.", ["visitor or trial user"], ["activation checklist"], ["next action visible"], "user_activation"),
    "P15": CapsulaProtocol("P15", "Commercial QA", "release", "active", "A feature is not commercial-ready until understandable, previewable, documented, and tested.", ["feature complete"], ["QA matrix", "screens", "docs"], ["release gate passes or warnings are accepted"], "qa_gatekeeper"),
    "P16": CapsulaProtocol("P16", "Release Gate", "release", "active", "Release requires manifest, preview evidence, security posture, docs, and CI state.", ["release candidate"], ["release gate summary"], ["required checks pass"], "release_captain"),
    "P17": CapsulaProtocol("P17", "Research Claim Discipline", "research", "active", "Separate claim, evidence, hypothesis, benchmark, limitation, and roadmap.", ["paper updated"], ["claim table", "method", "limitations"], ["speculation labeled"], "research_fellow"),
    "P18": CapsulaProtocol("P18", "Funding Room Evidence", "research", "active", "Investor material must map product claims to repo artifacts, demos, risks, and roadmap.", ["fundraising packet"], ["data room index", "demo script", "risk register"], ["evidence links exist"], "data_room_curator"),
    "P19": CapsulaProtocol("P19", "Design Calm", "product", "active", "Enterprise UI should reduce cognitive load, show status truthfully, and avoid decoration over function.", ["UI changed"], ["screen map", "copy pass", "accessibility note"], ["visual QA complete"], "design_steward"),
    "P20": CapsulaProtocol("P20", "Frontend Production Surface", "product", "active", "Every major platform concept needs a navigable, readable, polished front-end surface.", ["new platform concept"], ["view", "components", "empty state"], ["surface visible in app"], "front_end_builder"),
    "P21": CapsulaProtocol("P21", "Runtime Lane Expansion", "runtime", "draft", "New languages must include starter file, command, preview kind, target kind, and honest limitations.", ["new language requested"], ["RuntimeSpec", "starter", "test"], ["runtime listed"], "runtime_smith"),
    "P22": CapsulaProtocol("P22", "WASM/WASI Map", "runtime", "active", "Every WASM route documents compiler, target, fallback, and user expectation.", ["wasm candidate"], ["compiler path", "fallback"], ["plan generated"], "wasm_cartographer"),
    "P23": CapsulaProtocol("P23", "Docs Sync", "research", "active", "Docs must follow implementation and clearly mark pending capabilities.", ["code changed"], ["docs update", "index link"], ["docs index current"], "docs_architect"),
    "P24": CapsulaProtocol("P24", "User Support Loop", "support", "draft", "Support issues become docs updates, product fixes, or roadmap decisions.", ["support issue"], ["support reply", "product signal"], ["feedback routed"], "customer_success"),
    "P25": CapsulaProtocol("P25", "Launch Motion", "growth", "draft", "Each user-facing release has launch copy, ICP notes, demo flow, and feedback loop.", ["release planned"], ["launch packet"], ["outreach ready"], "growth_operator"),
    "P26": CapsulaProtocol("P26", "Pricing Integrity", "growth", "active", "Plans, limits, and value props must match actual product readiness.", ["pricing changed"], ["plan table", "limits"], ["pricing docs sync"], "growth_operator"),
    "P27": CapsulaProtocol("P27", "Audit Trail", "security", "draft", "Important actions should create an inspectable event, commit, issue, manifest, or log.", ["action taken"], ["event record"], ["trace available"], "repo_sentinel"),
    "P28": CapsulaProtocol("P28", "Template Marketplace", "product", "experimental", "Templates become a repeatable path for users to start useful capsules quickly.", ["template added"], ["template manifest", "starter files"], ["template listed"], "template_curator"),
    "P29": CapsulaProtocol("P29", "Easter Egg Protocol", "product", "active", "Small hidden artifacts can add delight without disrupting enterprise clarity.", ["UI pass", "docs pass"], ["hidden phrase", "non-blocking detail"], ["egg is harmless"], "design_steward"),
    "P30": CapsulaProtocol("P30", "Sovereign Exit", "governance", "draft", "Users must be able to export capsules, manifests, docs, and core project state.", ["export requested"], ["zip or repo artifact", "manifest"], ["export path documented"], "release_captain"),
}


def list_protocols(layer: ProtocolLayer | None = None) -> List[Dict[str, object]]:
    protocols = PROTOCOLS.values()
    if layer:
        protocols = [protocol for protocol in protocols if protocol.layer == layer]
    return [protocol.to_dict() for protocol in protocols]


def protocol_owner_map() -> Dict[str, List[str]]:
    owners: Dict[str, List[str]] = {}
    for protocol in PROTOCOLS.values():
        owners.setdefault(protocol.owner_bot, []).append(protocol.id)
    return owners


def get_protocol(protocol_id: str) -> CapsulaProtocol:
    key = protocol_id.upper()
    if key not in PROTOCOLS:
        raise KeyError(f"unknown protocol: {protocol_id}")
    return PROTOCOLS[key]
