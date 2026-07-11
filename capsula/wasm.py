from __future__ import annotations

import shutil
import subprocess
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, List, Optional


@dataclass
class WasmPlan:
    source: str
    output: str
    compiler: str
    command: List[str]
    available: bool
    note: str

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


class WasmBuilder:
    def plan(self, source: Path, kind: str = "cpp", output: Optional[Path] = None) -> WasmPlan:
        output = output or source.with_suffix(".wasm")
        emcc = shutil.which("emcc")
        clang = shutil.which("clang++" if kind == "cpp" else "clang")
        if emcc:
            return WasmPlan(str(source), str(output), "emcc", [emcc, str(source), "-O2", "-s", "WASM=1", "-o", str(output)], True, "Emscripten available")
        if clang:
            return WasmPlan(str(source), str(output), f"{Path(clang).name} wasm32-wasi", [clang, "--target=wasm32-wasi", str(source), "-O2", "-o", str(output)], True, "clang available; WASI sysroot may be required")
        return WasmPlan(str(source), str(output), "missing", [], False, "Install Emscripten or clang with WASI SDK")

    def build(self, plan: WasmPlan, cwd: Path, timeout_seconds: int = 30) -> Dict[str, object]:
        if not plan.available:
            return {"ok": False, "error": plan.note, "plan": plan.to_dict()}
        result = subprocess.run(plan.command, cwd=cwd, text=True, capture_output=True, timeout=timeout_seconds, check=False)
        return {"ok": result.returncode == 0, "returncode": result.returncode, "stdout": result.stdout, "stderr": result.stderr, "plan": plan.to_dict()}
