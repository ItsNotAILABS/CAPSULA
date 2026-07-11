from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Dict, List, Literal, Optional

PlanTier = Literal["starter", "studio", "team", "enterprise"]
CustomerStage = Literal["visitor", "trial", "activated", "paid", "expansion"]


@dataclass(frozen=True)
class PlanLimit:
    capsules_per_month: int
    runtime_minutes: int
    team_seats: int
    private_projects: int
    support: str


@dataclass(frozen=True)
class PricingPlan:
    tier: PlanTier
    name: str
    monthly_usd: int
    target_user: str
    value_prop: str
    limits: PlanLimit
    included_surfaces: List[str]

    def to_dict(self) -> Dict[str, object]:
        payload = asdict(self)
        payload["limits"] = asdict(self.limits)
        return payload


@dataclass
class ActivationChecklist:
    user_id: str
    stage: CustomerStage = "visitor"
    completed: List[str] = field(default_factory=list)

    def mark(self, item: str) -> None:
        if item not in self.completed:
            self.completed.append(item)

    def score(self) -> int:
        required = [
            "created_workspace",
            "created_first_capsule",
            "opened_preview",
            "generated_manifest",
            "reviewed_deploy_plan",
        ]
        return int((len([item for item in required if item in self.completed]) / len(required)) * 100)

    def next_action(self) -> str:
        order = [
            ("created_workspace", "Create a workspace"),
            ("created_first_capsule", "Create the first capsule"),
            ("opened_preview", "Open the preview"),
            ("generated_manifest", "Generate the capsule manifest"),
            ("reviewed_deploy_plan", "Review the deploy plan"),
        ]
        for key, action in order:
            if key not in self.completed:
                return action
        return "Invite a teammate or publish the capsule"


PLANS: Dict[PlanTier, PricingPlan] = {
    "starter": PricingPlan(
        tier="starter",
        name="Starter",
        monthly_usd=29,
        target_user="Solo builder validating a product idea",
        value_prop="Build and preview small capsules without configuring a full dev environment.",
        limits=PlanLimit(25, 600, 1, 3, "community"),
        included_surfaces=["Web Studio", "Python Runtime", "Preview Server", "Capsule Manifest"],
    ),
    "studio": PricingPlan(
        tier="studio",
        name="Studio",
        monthly_usd=99,
        target_user="Indie studio, consultant, or AI builder shipping client prototypes",
        value_prop="Turn prompts and code sessions into polished deployable app capsules.",
        limits=PlanLimit(150, 5000, 3, 20, "priority email"),
        included_surfaces=["Web Studio", "MCP Bridge", "Expo Go", "WASM Planner", "GitHub Handoff"],
    ),
    "team": PricingPlan(
        tier="team",
        name="Team",
        monthly_usd=299,
        target_user="Product team building repeatable internal tools and AI agents",
        value_prop="Collaborative capsule building with governance, QA gates, and release discipline.",
        limits=PlanLimit(600, 20000, 10, 100, "priority support"),
        included_surfaces=["Issue Bots", "Release Gates", "Team Workspaces", "Audit Logs", "GitHub PR Flow"],
    ),
    "enterprise": PricingPlan(
        tier="enterprise",
        name="Enterprise",
        monthly_usd=0,
        target_user="Organizations needing private runtime deployment and compliance controls",
        value_prop="Private capsule infrastructure with policy, security review, and custom integrations.",
        limits=PlanLimit(999999, 999999, 999999, 999999, "dedicated"),
        included_surfaces=["Private Runtime", "SSO", "Compliance Reports", "Custom Workers", "On-premise Option"],
    ),
}


def list_plans() -> List[Dict[str, object]]:
    return [plan.to_dict() for plan in PLANS.values()]


def recommend_plan(stage: CustomerStage, expected_capsules: int, team_size: int) -> PricingPlan:
    if team_size >= 25 or expected_capsules > 600:
        return PLANS["enterprise"]
    if team_size > 3 or expected_capsules > 150:
        return PLANS["team"]
    if stage in {"activated", "paid", "expansion"} or expected_capsules > 25:
        return PLANS["studio"]
    return PLANS["starter"]
