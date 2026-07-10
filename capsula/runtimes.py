from __future__ import annotations

from typing import Dict

from .models import RuntimeSpec

RUNTIMES: Dict[str, RuntimeSpec] = {
    "python": RuntimeSpec("python", "Python Agent Capsule", "python", "main.py", ["python", "main.py"], "terminal", ["wasi", "native", "github"], ["agent", "service", "capsule"], True, True, "CPython locally; Pyodide/WASI when installed."),
    "html": RuntimeSpec("html", "HTML Web Capsule", "html", "index.html", ["serve-static"], "web", ["browser", "web-worker", "github"], ["app", "worker", "capsule"], True, False, "Served by preview server."),
    "react": RuntimeSpec("react", "React App Capsule", "react", "src/App.tsx", ["npm", "run", "dev"], "web", ["browser", "web-worker", "github"], ["app", "worker", "capsule"], True, False, "Vite/npm required for full local run."),
    "node": RuntimeSpec("node", "Node Service Capsule", "node", "main.js", ["node", "main.js"], "api", ["node", "web-worker", "github"], ["service", "agent", "capsule"], True, False, "Node.js required."),
    "cpp": RuntimeSpec("cpp", "C++ WASM Capsule", "cpp", "main.cpp", ["c++", "-std=c++17", "main.cpp", "-o", "main"], "terminal", ["wasm", "wasi", "native", "web-worker", "github"], ["worker", "agent", "capsule"], False, True, "C++ compiler locally; Emscripten/WASI SDK for WASM."),
    "c": RuntimeSpec("c", "C WASM Capsule", "c", "main.c", ["cc", "main.c", "-o", "main"], "terminal", ["wasm", "wasi", "native", "web-worker", "github"], ["worker", "agent", "capsule"], False, True, "C compiler locally; Emscripten/WASI SDK for WASM."),
    "java": RuntimeSpec("java", "Java Agent Capsule", "java", "Main.java", ["javac", "Main.java"], "terminal", ["native", "wasm", "github"], ["agent", "service", "capsule"], True, True, "JDK locally; TeaVM/CheerpJ-style bridge for web targets."),
    "julia": RuntimeSpec("julia", "Julia Scientific Capsule", "julia", "main.jl", ["julia", "main.jl"], "notebook", ["native", "github"], ["service", "capsule"], True, False, "Julia runtime required."),
    "matlab": RuntimeSpec("matlab", "MATLAB/Octave Capsule", "matlab", "main.m", ["octave", "main.m"], "artifact", ["native", "github"], ["service", "capsule"], True, False, "Octave-compatible runner; MATLAB engine can attach externally."),
    "expo": RuntimeSpec("expo", "Expo Go Mobile Capsule", "react", "App.tsx", ["npm", "run", "start"], "mobile", ["expo-go", "browser", "github"], ["mobile", "app", "capsule"], True, False, "Expo CLI/npm required; preview with Expo Go QR code."),
}


def get_runtime(key: str) -> RuntimeSpec:
    if key not in RUNTIMES:
        raise KeyError(f"unknown runtime: {key}; available: {', '.join(sorted(RUNTIMES))}")
    return RUNTIMES[key]
