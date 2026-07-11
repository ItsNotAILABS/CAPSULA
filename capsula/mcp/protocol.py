from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Dict, Optional


@dataclass
class Request:
    id: Optional[Any]
    method: str
    params: Dict[str, Any]


class RPCError(Exception):
    def __init__(self, code: int, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def parse(line: str) -> Request:
    try:
        payload = json.loads(line)
    except json.JSONDecodeError as exc:
        raise RPCError(-32700, f"parse error: {exc}") from exc
    if not isinstance(payload, dict) or not isinstance(payload.get("method"), str):
        raise RPCError(-32600, "invalid request")
    params = payload.get("params") or {}
    if not isinstance(params, dict):
        raise RPCError(-32602, "params must be object")
    return Request(payload.get("id"), payload["method"], params)


def ok(request_id: Optional[Any], result: Any) -> str:
    return json.dumps({"jsonrpc": "2.0", "id": request_id, "result": result}, separators=(",", ":"))


def err(request_id: Optional[Any], code: int, message: str) -> str:
    return json.dumps({"jsonrpc": "2.0", "id": request_id, "error": {"code": code, "message": message}}, separators=(",", ":"))
