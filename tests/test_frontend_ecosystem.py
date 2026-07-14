from capsula.frontend_ecosystem import get_frontend_surface, list_frontend_surfaces, shipping_surface_sequence


def test_frontend_ecosystem_has_shipping_surfaces():
    surfaces = list_frontend_surfaces()
    ids = {surface["id"] for surface in surfaces}
    assert "workspace-ide" in ids
    assert "demo-gallery" in ids
    assert "connector-gallery" in ids
    assert "deployment-command" in ids


def test_surface_tracks_components_and_backends():
    surface = get_frontend_surface("workspace-ide")
    assert "EditorPane" in surface.components
    assert "capsula.orchestrator" in surface.connected_backends
    assert surface.primary_action == "create capsule workspace"


def test_shipping_sequence_starts_with_visible_workflow():
    sequence = shipping_surface_sequence()
    assert sequence[0] == "workspace-ide"
    assert "demo-gallery" in sequence
    assert "template-marketplace" in sequence
