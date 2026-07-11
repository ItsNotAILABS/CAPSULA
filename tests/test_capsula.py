from pathlib import Path

from capsula import CapsulaOrchestrator
from capsula.expo import ExpoCapsule, create_expo_capsule
from capsula.storage import CapsuleStorage
from capsula.wasm import WasmBuilder


def test_python_session_manifest(tmp_path: Path) -> None:
    orchestrator = CapsulaOrchestrator(CapsuleStorage(tmp_path / "studio"))
    session = orchestrator.create_session("python", "demo")
    assert session.id == "demo"
    assert (session.root / "main.py").exists()
    result = orchestrator.run_session("demo")
    assert result["ok"] is True
    manifest = orchestrator.build_manifest("demo")
    assert manifest.id == "capsula-demo"
    assert "github" in manifest.targets


def test_html_preview_session(tmp_path: Path) -> None:
    orchestrator = CapsulaOrchestrator(CapsuleStorage(tmp_path / "studio"))
    session = orchestrator.create_session("html", "web")
    assert session.preview_url == "http://127.0.0.1:8785/preview/web/"
    assert orchestrator.run_session("web")["ok"] is True


def test_wasm_plan_honest(tmp_path: Path) -> None:
    source = tmp_path / "main.cpp"
    source.write_text("int main(){return 0;}\n", encoding="utf-8")
    plan = WasmBuilder().plan(source, "cpp")
    assert plan.source.endswith("main.cpp")
    assert plan.output.endswith("main.wasm")


def test_expo_capsule_generator(tmp_path: Path) -> None:
    files = create_expo_capsule(tmp_path / "mobile", ExpoCapsule("Demo", "demo"))
    assert "App.tsx" in files
    assert (tmp_path / "mobile" / "app.json").exists()
