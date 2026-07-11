from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Dict, List, Literal

LibraryLane = Literal[
    "math",
    "science",
    "data",
    "ai",
    "visualization",
    "api",
    "storage",
    "frontend",
    "mobile",
    "deployment",
    "quality",
]


@dataclass(frozen=True)
class PlatformLibrary:
    name: str
    lane: LibraryLane
    language: str
    install: str
    purpose: str
    production_note: str

    def to_dict(self) -> Dict[str, str]:
        return asdict(self)


LIBRARIES: Dict[str, PlatformLibrary] = {
    "numpy": PlatformLibrary("numpy", "math", "python", "pip install numpy", "Vectorized numerical computing.", "Core for scientific kernels and data transforms."),
    "scipy": PlatformLibrary("scipy", "science", "python", "pip install scipy", "Scientific algorithms, optimization, signal processing.", "Use behind optional heavy runtime profile."),
    "sympy": PlatformLibrary("sympy", "math", "python", "pip install sympy", "Symbolic math and formula verification.", "Useful for research papers and proof packets."),
    "pandas": PlatformLibrary("pandas", "data", "python", "pip install pandas", "Tabular data analysis.", "Good default for business CSV and reports."),
    "polars": PlatformLibrary("polars", "data", "python", "pip install polars", "Fast dataframe engine.", "Prefer for large local files and activation telemetry."),
    "pyarrow": PlatformLibrary("pyarrow", "data", "python", "pip install pyarrow", "Columnar data and parquet interchange.", "Required for serious data-room exports."),
    "scikit-learn": PlatformLibrary("scikit-learn", "science", "python", "pip install scikit-learn", "Classical ML models and metrics.", "Use for benchmark baselines before claiming AI lift."),
    "networkx": PlatformLibrary("networkx", "science", "python", "pip install networkx", "Graph analysis.", "Maps bot handoffs, protocol graphs, and workflow dependencies."),
    "fastapi": PlatformLibrary("fastapi", "api", "python", "pip install fastapi uvicorn", "Production API server layer.", "Hosted edition should migrate stdlib API to FastAPI."),
    "pydantic": PlatformLibrary("pydantic", "api", "python", "pip install pydantic", "Typed validation schemas.", "Use for manifests, bot packets, deploy packets, and public API contracts."),
    "openai": PlatformLibrary("openai", "ai", "python", "pip install openai", "OpenAI API adapter.", "Provider keys must stay behind environment variables."),
    "anthropic": PlatformLibrary("anthropic", "ai", "python", "pip install anthropic", "Anthropic API adapter.", "Keep as optional provider adapter, not core runtime dependency."),
    "litellm": PlatformLibrary("litellm", "ai", "python", "pip install litellm", "Multi-provider model gateway.", "Useful for customer-owned provider routing."),
    "plotly": PlatformLibrary("plotly", "visualization", "python", "pip install plotly", "Interactive charts.", "Use for investor-ready metrics and benchmark visuals."),
    "matplotlib": PlatformLibrary("matplotlib", "visualization", "python", "pip install matplotlib", "Static scientific charts.", "Use for papers and reproducible benchmark figures."),
    "sqlalchemy": PlatformLibrary("sqlalchemy", "storage", "python", "pip install sqlalchemy", "Relational database ORM.", "Hosted workspaces need this or direct SQL models."),
    "redis": PlatformLibrary("redis", "storage", "python", "pip install redis", "Queue/cache/session coordination.", "Use for background workers in hosted deployments."),
    "react-query": PlatformLibrary("@tanstack/react-query", "frontend", "typescript", "npm install @tanstack/react-query", "Server-state cache and API data fetching.", "Use for API-backed dashboard surfaces."),
    "zod": PlatformLibrary("zod", "frontend", "typescript", "npm install zod", "Frontend schema validation.", "Mirror API contracts before sending user actions."),
    "zustand": PlatformLibrary("zustand", "frontend", "typescript", "npm install zustand", "Lightweight state management.", "Use for workspace/session UI state."),
    "recharts": PlatformLibrary("recharts", "frontend", "typescript", "npm install recharts", "React charts.", "Use for activation, benchmarks, and funding dashboards."),
    "framer-motion": PlatformLibrary("framer-motion", "frontend", "typescript", "npm install framer-motion", "Motion and transitions.", "Use lightly; production UI must remain fast and calm."),
    "expo": PlatformLibrary("expo", "mobile", "typescript", "npx create-expo-app", "Mobile preview runtime.", "Use Expo Go for fast live demos before native builds."),
    "eas": PlatformLibrary("eas-cli", "mobile", "typescript", "npm install -g eas-cli", "Expo cloud builds.", "Use for installable iOS/Android builds after Expo Go validation."),
    "vercel": PlatformLibrary("vercel", "deployment", "typescript", "npm install -g vercel", "Frontend deployment.", "Good for investor demo and public showcase site."),
    "cloudflare": PlatformLibrary("wrangler", "deployment", "typescript", "npm install -g wrangler", "Cloudflare Pages/Workers deployment.", "Good for edge worker demos and static studio builds."),
    "railway": PlatformLibrary("railway", "deployment", "shell", "npm install -g @railway/cli", "Hosted app/API deployment.", "Good for managed demo environments."),
    "fly": PlatformLibrary("flyctl", "deployment", "shell", "brew install flyctl", "Container deployment.", "Good for portable API runtime demos."),
    "ruff": PlatformLibrary("ruff", "quality", "python", "pip install ruff", "Python linting and formatting.", "Use in CI before release labels."),
    "mypy": PlatformLibrary("mypy", "quality", "python", "pip install mypy", "Python static typing.", "Use on stable core modules as platform hardens."),
}


def list_libraries(lane: LibraryLane | None = None) -> List[Dict[str, str]]:
    items = LIBRARIES.values()
    if lane is not None:
        items = [item for item in items if item.lane == lane]
    return [item.to_dict() for item in items]


def library_names() -> List[str]:
    return sorted(LIBRARIES)
