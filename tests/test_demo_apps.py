from capsula.demo_apps import get_demo_app, list_demo_apps, structure_launch_sequence


def test_demo_app_registry_contains_capsula_studio_html():
    demos = list_demo_apps()
    ids = {demo["id"] for demo in demos}
    assert "capsula-studio-html" in ids


def test_capsula_studio_html_has_static_demo_gate():
    demo = get_demo_app("capsula-studio-html")
    assert demo.preview_mode == "file-html"
    assert "examples/demo-apps/capsula_studio.html" in demo.files
    assert "static-demo-gate" in demo.protocols
    assert demo.launch_stage == "prelaunch"


def test_structure_launch_sequence_is_ordered():
    sequence = structure_launch_sequence()
    assert sequence[0] == "structure-intake"
    assert sequence[-1] == "live-launch"
    assert "standalone-demo" in sequence
