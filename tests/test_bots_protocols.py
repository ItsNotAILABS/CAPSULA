from capsula.bots import BOTS, active_bots, bot_owner_summary, route_issue_to_bots
from capsula.protocols import PROTOCOLS, get_protocol, list_protocols, protocol_owner_map


def test_bot_registry_has_platform_swarm():
    bots = active_bots()
    assert len(bots) >= 18
    assert "issue_triage" in BOTS
    assert "release_captain" in BOTS
    assert "security_steward" in BOTS
    summary = bot_owner_summary()
    assert summary["github"] >= 3
    assert summary["platform"] >= 3


def test_issue_routing_detects_runtime_and_security():
    routed = route_issue_to_bots("The Python runtime leaks a token in MCP logs during deploy")
    assert "issue_triage" in routed
    assert "runtime_smith" in routed
    assert "security_steward" in routed
    assert "mcp_conductor" in routed


def test_protocol_registry_has_30_protocols():
    assert len(PROTOCOLS) == 30
    assert get_protocol("p01").name == "Workspace Genesis"
    assert get_protocol("P29").name == "Easter Egg Protocol"
    product_protocols = list_protocols("product")
    assert len(product_protocols) >= 6


def test_protocol_owner_map_connects_bots():
    owners = protocol_owner_map()
    assert "release_captain" in owners
    assert "P16" in owners["release_captain"]
    assert "design_steward" in owners
    assert "P29" in owners["design_steward"]
