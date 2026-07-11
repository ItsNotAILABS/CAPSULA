from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Literal, Optional

WorkspaceRole = Literal["owner", "admin", "builder", "viewer"]
ProjectStatus = Literal["draft", "active", "review", "released", "archived"]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class WorkspaceMember:
    user_id: str
    email: str
    role: WorkspaceRole
    joined_at: str = field(default_factory=now_iso)

    def to_dict(self) -> Dict[str, str]:
        return asdict(self)


@dataclass
class CapsuleProject:
    id: str
    name: str
    runtime: str
    status: ProjectStatus = "draft"
    owner_id: str = "local"
    repository: str = "github://ItsNotAILABS/CAPSULA"
    created_at: str = field(default_factory=now_iso)
    updated_at: str = field(default_factory=now_iso)
    tags: List[str] = field(default_factory=list)

    def transition(self, status: ProjectStatus) -> None:
        self.status = status
        self.updated_at = now_iso()

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


@dataclass
class Workspace:
    id: str
    name: str
    members: List[WorkspaceMember] = field(default_factory=list)
    projects: List[CapsuleProject] = field(default_factory=list)
    created_at: str = field(default_factory=now_iso)

    def add_member(self, user_id: str, email: str, role: WorkspaceRole = "builder") -> WorkspaceMember:
        existing = next((member for member in self.members if member.user_id == user_id), None)
        if existing:
            existing.role = role
            return existing
        member = WorkspaceMember(user_id=user_id, email=email, role=role)
        self.members.append(member)
        return member

    def add_project(self, project_id: str, name: str, runtime: str, owner_id: str = "local") -> CapsuleProject:
        project = CapsuleProject(id=project_id, name=name, runtime=runtime, owner_id=owner_id)
        self.projects.append(project)
        return project

    def dashboard(self) -> Dict[str, object]:
        status_counts: Dict[str, int] = {}
        for project in self.projects:
            status_counts[project.status] = status_counts.get(project.status, 0) + 1
        return {
            "workspace": self.name,
            "members": len(self.members),
            "projects": len(self.projects),
            "status_counts": status_counts,
            "released": status_counts.get("released", 0),
        }

    def to_dict(self) -> Dict[str, object]:
        return {
            "id": self.id,
            "name": self.name,
            "members": [member.to_dict() for member in self.members],
            "projects": [project.to_dict() for project in self.projects],
            "created_at": self.created_at,
        }
