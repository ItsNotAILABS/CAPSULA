from capsula import create_default_workspace, default_ide_panels


def test_default_ide_workspace_has_production_surfaces():
    workspace = create_default_workspace()

    assert workspace.mode == "production"
    assert "cloudflare-pages" in workspace.deploy_targets
    assert "native/cpp/wasm_kernel/main.cpp" in workspace.files
    assert any(panel.kind == "editor" for panel in workspace.panels)
    assert any(panel.kind == "terminal" for panel in workspace.panels)


def test_default_panels_have_capability_boundaries():
    panels = default_ide_panels()

    assert len(panels) >= 8
    assert all(panel.required_capability for panel in panels)
    assert {panel.kind for panel in panels} >= {"explorer", "editor", "terminal", "preview", "deploy"}
