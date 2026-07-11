from __future__ import annotations

import json
import os
import urllib.request
from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass
class AIMessage:
    role: str
    content: str


@dataclass
class AIResult:
    ok: bool
    content: str
    provider: str
    error: Optional[str] = None


class LocalProvider:
    name = "local"

    def complete(self, messages: List[AIMessage], system: str = "") -> AIResult:
        last = messages[-1].content if messages else ""
        content = "\n".join([
            "CAPSULA local AI bridge response.",
            "Attach OpenAI-compatible credentials for real model generation.",
            "",
            "Request:",
            last[:2500],
        ])
        return AIResult(True, content, self.name)


class OpenAICompatibleProvider:
    name = "openai-compatible"

    def __init__(self) -> None:
        self.base_url = os.getenv("CAPSULA_AI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
        self.api_key = os.getenv("OPENAI_API_KEY") or os.getenv("CAPSULA_AI_API_KEY")
        self.model = os.getenv("CAPSULA_AI_MODEL", "gpt-4.1-mini")

    def complete(self, messages: List[AIMessage], system: str = "") -> AIResult:
        if not self.api_key:
            return AIResult(False, "", self.name, "missing OPENAI_API_KEY or CAPSULA_AI_API_KEY")
        payload_messages = []
        if system:
            payload_messages.append({"role": "system", "content": system})
        payload_messages.extend({"role": msg.role, "content": msg.content} for msg in messages)
        data = json.dumps({"model": self.model, "messages": payload_messages, "temperature": 0.2}).encode("utf-8")
        request = urllib.request.Request(
            f"{self.base_url}/chat/completions",
            data=data,
            method="POST",
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {self.api_key}"},
        )
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                payload = json.loads(response.read().decode("utf-8"))
            return AIResult(True, payload["choices"][0]["message"]["content"], self.name)
        except Exception as exc:
            return AIResult(False, "", self.name, str(exc))


class CapsulaAI:
    def __init__(self) -> None:
        provider = os.getenv("CAPSULA_AI_PROVIDER", "local").lower()
        self.provider = OpenAICompatibleProvider() if provider in {"openai", "api", "openai-compatible"} else LocalProvider()

    def generate_code(self, prompt: str, language: str, context: str = "") -> AIResult:
        system = "You are CAPSULA Studio's production code generation engine. Return usable code and file boundaries. Never claim deployment unless a tool confirms it."
        return self.provider.complete([AIMessage("user", f"Language: {language}\nContext:\n{context}\n\nRequest:\n{prompt}")], system)

    def review_manifest(self, manifest: Dict[str, object]) -> AIResult:
        system = "Review this CAPSULA manifest for deployment gaps, runtime risks, and missing toolchain details."
        return self.provider.complete([AIMessage("user", json.dumps(manifest, indent=2))], system)
