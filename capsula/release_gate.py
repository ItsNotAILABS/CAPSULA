from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Dict, List, Literal

GateStatus = Literal["pass", "warn", "fail"]


@dataclass(frozen=True)
class GateCheck:
    name: str
    status: GateStatus
    evidence: str
    required: bool = True

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


@dataclass
class ReleaseGate:
    capsule_id: str
    version: str
    checks: List[GateCheck] = field(default_factory=list)

    def add(self, name: str, status: GateStatus, evidence: str, required: bool = True) -> None:
        self.checks.append(GateCheck(name=name, status=status, evidence=evidence, required=required))

    def passed(self) -> bool:
        return all(check.status == "pass" for check in self.checks if check.required)

    def summary(self) -> Dict[str, object]:
        counts = {"pass": 0, "warn": 0, "fail": 0}
        for check in self.checks:
            counts[check.status] += 1
        return {
            "capsule_id": self.capsule_id,
            "version": self.version,
            "passed": self.passed(),
            "counts": counts,
            "checks": [check.to_dict() for check in self.checks],
        }


def default_release_gate(capsule_id: str, version: str = "0.1.0") -> ReleaseGate:
    gate = ReleaseGate(capsule_id=capsule_id, version=version)
    gate.add("manifest_exists", "warn", "capsule.manifest.json must exist before release")
    gate.add("preview_verified", "warn", "web, api, terminal, mobile, or artifact preview must be checked")
    gate.add("runtime_command_documented", "pass", "runtime command is stored in the runtime registry")
    gate.add("security_review", "warn", "filesystem, subprocess, AI, and deploy boundaries must be reviewed")
    gate.add("commercial_copy_reviewed", "warn", "homepage, docs, and onboarding must be user-readable")
    gate.add("ci_green", "warn", "GitHub Actions should pass before release")
    return gate
