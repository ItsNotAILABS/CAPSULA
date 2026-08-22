from capsula.ecosystem import capability_descriptor, make_artifact, make_handoff, validate_task


def _task(action="capsula.session.run"):
    return {
        "schema": "nexus.task.v1",
        "request_id": "req-1",
        "action": action,
        "scope": {"project_id": "project-1", "tenant_id": "tenant-1"},
        "payload": {},
        "budget": {"schema": "nexus.budget.v1", "limits": {"max_changed_bytes": 1000, "wall_seconds": 30}},
    }


def test_capability_boundary():
    c = capability_descriptor()
    assert c["schema"] == "nexus.capability.v1"
    assert c["component"] == "capsula"
    assert c["limits"]["direct_production_deploy"] is False
    assert c["limits"]["operator_approval_for_external_deploy"] is True


def test_run_requires_project_and_budget():
    assert validate_task(_task())["ok"] is True
    no_scope = _task()
    no_scope["scope"] = {}
    assert "project_scope_required" in validate_task(no_scope)["errors"]
    no_budget = _task()
    no_budget.pop("budget")
    assert "budget_required" in validate_task(no_budget)["errors"]


def test_unsupported_action_rejected():
    result = validate_task(_task("capsula.production.deploy_now"))
    assert result["ok"] is False
    assert "unsupported_action" in result["errors"]


def test_artifact_and_handoff_are_traceable():
    a = make_artifact(artifact_id="a1", kind="manifest", content=b"hello", request_id="r1")
    assert a["schema"] == "nexus.artifact.v1"
    assert len(a["sha256"]) == 64
    h = make_handoff(request_id="r1", to="pocket", reason="preview ready", artifacts=["a1"])
    assert h["schema"] == "nexus.handoff.v1"
    assert h["to"] == "pocket"
