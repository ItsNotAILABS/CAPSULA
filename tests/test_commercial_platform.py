from pathlib import Path

from capsula.commercial import ActivationChecklist, list_plans, recommend_plan
from capsula.release_gate import default_release_gate
from capsula.templates import get_template, list_templates
from capsula.telemetry import TelemetrySink, activation_health
from capsula.workspace import Workspace


def test_pricing_and_activation() -> None:
    plans = list_plans()
    assert len(plans) == 4
    assert recommend_plan("trial", 10, 1).tier == "starter"
    assert recommend_plan("activated", 40, 2).tier == "studio"
    checklist = ActivationChecklist(user_id="u1")
    checklist.mark("created_workspace")
    checklist.mark("created_first_capsule")
    assert checklist.score() == 40
    assert checklist.next_action() == "Open the preview"


def test_workspace_dashboard() -> None:
    workspace = Workspace(id="w1", name="Demo Workspace")
    workspace.add_member("u1", "founder@example.com", "owner")
    project = workspace.add_project("p1", "Customer Portal", "react", "u1")
    project.transition("released")
    dashboard = workspace.dashboard()
    assert dashboard["members"] == 1
    assert dashboard["released"] == 1


def test_release_gate_templates_and_telemetry(tmp_path: Path) -> None:
    gate = default_release_gate("capsule-demo")
    assert gate.summary()["counts"]["warn"] >= 1
    assert get_template("customer-portal").runtime == "react"
    assert len(list_templates()) >= 4

    sink = TelemetrySink(tmp_path / "events.ndjson")
    sink.capture("capsule_created", "w1", "web")
    sink.capture("preview_opened", "w1", "web")
    health = activation_health(sink.read_events())
    assert health["preview_rate"] == 1.0
