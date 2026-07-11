# CAPSULA Research Agenda

## Purpose

This research agenda defines the questions CAPSULA Studio must answer as it moves from prototype to fundable commercial platform.

## Research Question 1: Capsule Identity

How should generated software artifacts preserve durable identity across prompt, code, run, preview, manifest, issue, release, and deployment stages?

Hypothesis: a manifest-centered capsule identity reduces confusion and increases trust in AI-generated software workflows.

Evaluation:

- number of artifacts with complete manifests
- number of sessions that can be reproduced
- number of deploy plans with enough evidence for a new user
- reduction in lost or ambiguous generated code

## Research Question 2: Multi-Language Runtime Routing

How should a studio route code across Python, React, Node, C/C++, Java, Expo Go, and scientific runtimes without overpromising toolchain support?

Hypothesis: explicit runtime lanes with ready/toolchain/planned states create better user trust than claiming universal execution.

Evaluation:

- successful run rate per runtime lane
- missing toolchain clarity
- user comprehension of preview state
- time to first working capsule

## Research Question 3: Web Workers as Agent Capsules

Can web workers become a practical deployment target for lightweight agents, local copilots, scoring engines, and preview routers?

Hypothesis: worker capsules improve responsiveness and create a portable browser-side agent model.

Evaluation:

- worker startup time
- UI responsiveness during worker jobs
- job completion reliability
- browser compatibility

## Research Question 4: AI Tooling and MCP Interfaces

How should local AI clients safely operate coding sessions, file writes, run commands, and manifest generation?

Hypothesis: a narrow JSON-RPC/MCP-style tool layer creates a safe and testable boundary for AI-assisted building.

Evaluation:

- tool-call success rate
- invalid request rate
- file boundary violations blocked
- code generation usefulness

## Research Question 5: Commercial User Readiness

What makes a capsule studio fundable and usable by real users?

Hypothesis: users need visible proof of run state, preview route, docs, release gate, and deploy path before they trust generated software.

Evaluation:

- onboarding completion
- activation rate
- first capsule creation rate
- preview success rate
- GitHub push success rate

## Research Question 6: Expo Go as Mobile Preview Surface

Can Expo Go become the fastest path for users to experience generated mobile app capsules on real devices?

Hypothesis: QR-code mobile preview improves perceived product reality and investor demos.

Evaluation:

- generated Expo project success rate
- Expo start success rate
- QR scan success rate
- mobile preview engagement

## Research Question 7: Issue Bots as Operating System

Can issue bots become a lightweight operating layer for a small software lab?

Hypothesis: issue bots encode product operations before full automation exists, reducing founder overhead.

Evaluation:

- triage completeness
- duplicate issue reduction
- release gate clarity
- documentation coverage

## Research Roadmap

### Sprint 1

Validate that a new user can clone the repo, run the web app, run the Python API, create a Python capsule, generate a manifest, and understand the UI.

### Sprint 2

Add persistent session storage, WebSocket logs, hosted preview, and better issue bot automation.

### Sprint 3

Run pilot users through Python, React, and Expo Go capsule creation flows.

### Sprint 4

Attach paid alpha users, measure usage, and prepare seed funding materials.

## Research Outputs

- whitepaper
- technical paper
- product requirements document
- investor brief
- user guide
- security model
- go-to-market plan
- release checklist
- benchmark plan

## Conclusion

CAPSULA's research program is not theoretical only. It is directly tied to product adoption, user trust, funding readiness, and execution evidence.
