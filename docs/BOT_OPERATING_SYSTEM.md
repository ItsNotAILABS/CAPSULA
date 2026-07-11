# CAPSULA Bot Operating System

CAPSULA uses a bot operating system to turn GitHub activity, platform work, user activation, research, release gates, and support signals into coordinated work.

## Bot classes

### GitHub bots
- Repo Sentinel
- Issue Triage Bot
- PR Reviewer Bot
- GitHub Publisher Bot

These bots keep the repository operational: file hygiene, issues, PRs, direct writes, branches, releases, and audit trail.

### Platform bots
- MCP Conductor Bot
- Design Steward Bot
- Frontend Builder Bot
- Evaluation Bench Bot

These bots maintain the platform as a coherent product rather than a scattered set of scripts.

### Runtime bots
- Runtime Smith Bot
- WASM Cartographer Bot

These bots keep language lanes honest. They never claim missing toolchains as available.

### Security bots
- Security Steward Bot
- Secret Silence protocol owner

These bots protect boundaries: filesystem, subprocess, MCP tools, AI keys, GitHub writes, and exported artifacts.

### Product/growth/support bots
- User Activation Bot
- Customer Success Bot
- Growth Operator Bot
- Funding Data Room Curator

These bots move CAPSULA toward real users: activation, onboarding, demos, support, launch motion, and investor narrative.

### Research bots
- Docs Architect Bot
- Research Fellow Bot

These bots deepen the papers and keep claims separated from evidence and roadmap speculation.

## GitHub issue flow

1. Issue opens.
2. Issue Triage Bot classifies lane, surface, severity, missing evidence, and owner bot.
3. Owner bot drafts a work packet.
4. QA Gatekeeper defines acceptance criteria.
5. Release Captain decides whether it belongs in a release gate.
6. Docs Architect updates docs if the change affects user understanding.
7. GitHub Publisher Bot prepares branch, PR, release, or direct-main packet.

## Bot safety rules

- Bots can draft, classify, route, and recommend.
- Bots can be automated only when the action is low-risk and reversible.
- Writes to GitHub require clear operator intent or a release protocol.
- Security-sensitive changes require Security Steward review.
- Claims in papers must map to evidence, tests, or clearly marked hypotheses.

## Platform-level bot rule

Every new major feature needs:

- one owner bot
- one protocol mapping
- one user-facing surface
- one test or verification path
- one doc entry

## Easter egg

A bot called `First Light` is reserved for internal product delight. It should only emit small non-blocking details, never fake status or hide risk.
