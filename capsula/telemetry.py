from __future__ import annotations

import json
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional


@dataclass(frozen=True)
class TelemetryEvent:
    event: str
    workspace_id: str
    session_id: Optional[str]
    surface: str
    properties: Dict[str, object]
    timestamp_ms: int

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


class TelemetrySink:
    """Local-first product analytics sink.

    CAPSULA should be user-ready without requiring a hosted analytics vendor.
    This sink records structured events to newline-delimited JSON. A hosted
    edition can replace the sink with Postgres, ClickHouse, BigQuery, or a vendor
    destination while preserving the same event contract.
    """

    def __init__(self, path: str | Path = ".capsula/telemetry/events.ndjson") -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def capture(self, event: str, workspace_id: str, surface: str, properties: Optional[Dict[str, object]] = None, session_id: Optional[str] = None) -> TelemetryEvent:
        item = TelemetryEvent(
            event=event,
            workspace_id=workspace_id,
            session_id=session_id,
            surface=surface,
            properties=properties or {},
            timestamp_ms=int(time.time() * 1000),
        )
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(item.to_dict(), separators=(",", ":")) + "\n")
        return item

    def read_events(self) -> List[TelemetryEvent]:
        if not self.path.exists():
            return []
        events: List[TelemetryEvent] = []
        for line in self.path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            payload = json.loads(line)
            events.append(TelemetryEvent(**payload))
        return events


def funnel_counts(events: Iterable[TelemetryEvent]) -> Dict[str, int]:
    counts: Dict[str, int] = {}
    for event in events:
        counts[event.event] = counts.get(event.event, 0) + 1
    return counts


def activation_health(events: Iterable[TelemetryEvent]) -> Dict[str, object]:
    counts = funnel_counts(events)
    created = counts.get("capsule_created", 0)
    previewed = counts.get("preview_opened", 0)
    manifested = counts.get("manifest_generated", 0)
    deployed = counts.get("deploy_plan_created", 0)
    denominator = max(created, 1)
    return {
        "created": created,
        "previewed": previewed,
        "manifested": manifested,
        "deployed": deployed,
        "preview_rate": round(previewed / denominator, 3),
        "manifest_rate": round(manifested / denominator, 3),
        "deploy_plan_rate": round(deployed / denominator, 3),
    }
