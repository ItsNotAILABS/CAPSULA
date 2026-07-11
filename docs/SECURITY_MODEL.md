# CAPSULA Security Model

## Current Security Posture

CAPSULA is currently a local-first developer platform. The security model focuses on honesty, file-boundary safety, and clear runtime expectations.

## Current Controls

- Session files are stored inside `.capsula/`.
- Storage uses safe path joining to block path traversal.
- WASM builds are planned honestly based on detected local toolchains.
- The AI bridge exposes narrow JSON-RPC tools rather than arbitrary shell control.
- Deploy claims are only made as handoff plans unless GitHub tools confirm a push.

## Risks

### Code Execution Risk

Running generated code can be dangerous. CAPSULA should not execute untrusted user code in a production environment without sandboxing.

Mitigation roadmap:

- containerized execution
- per-session filesystem isolation
- CPU and memory limits
- network egress policy
- timeout controls
- audit logs

### Secrets Risk

Generated code or AI tools may accidentally expose secrets.

Mitigation roadmap:

- secret vault
- redaction filters
- environment allowlists
- no secrets in manifests
- GitHub secret scanning

### Dependency Risk

Generated projects may contain unsafe dependencies.

Mitigation roadmap:

- dependency scanner
- lockfile review
- package allowlists
- supply-chain provenance

### AI Tool Risk

AI agents may call tools incorrectly.

Mitigation roadmap:

- tool permissions
- confirmation gates for destructive operations
- issue-linked execution trails
- per-tool audit records

### Preview Risk

Previewing untrusted HTML or JS may expose browser risks.

Mitigation roadmap:

- iframe sandboxing
- content security policy
- origin isolation
- preview domain separation

## Production Security Requirements

Before hosted commercial launch:

1. Add authentication.
2. Add workspace authorization.
3. Add containerized execution.
4. Add audit logs.
5. Add secrets isolation.
6. Add rate limits.
7. Add dependency scanning.
8. Add signed capsule manifests.
9. Add admin controls.
10. Add incident response process.

## Security Principle

CAPSULA should always distinguish between generated code, trusted platform code, local execution, hosted execution, and deployment handoff. The platform should never hide uncertainty about runtime or security state.
