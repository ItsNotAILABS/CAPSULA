# CAPSULA UI/UX System

The CAPSULA interface should feel like a serious production cockpit: calm, dense enough for real work, but never confusing. It is not a toy builder. It is the visible operating system for structures, protocols, templates, connectors, and deploys.

## Experience principles

### 1. Render before backend

Every structure needs a visible surface before it asks the user for credentials, cloud accounts, or complex backend setup.

Preferred order:

```text
Static demo -> local preview -> connected backend -> public deploy
```

### 2. Proof over claims

Every capability card should show evidence:

- command
- file path
- generated artifact
- protocol gate
- deploy target
- status

### 3. One cockpit, many lanes

CAPSULA should not scatter builders across pages. The IDE cockpit should keep these lanes visible:

- Build
- Preview
- Connect
- Govern
- Deploy
- Learn

### 4. Honest blocked states

When Cloudflare, GitHub, Slack, Stripe, Supabase, or any other service needs credentials, show the exact missing requirement. Do not make the user guess.

### 5. Enterprise calm

The UI can look powerful without looking chaotic. Use strong hierarchy, high contrast, readable cards, obvious action buttons, and stable navigation.

## Core layout

```text
Left rail
  workspace
  builder
  demo apps
  connectors
  protocols
  deploy
  users
  support

Main workbench
  hero / current objective
  metrics / state cards
  primary panel
  supporting panel

Right inspector
  selected file/template/connector/protocol
  proof checklist
  next action
```

## Component inventory

### Shell components

- `AppShell`
- `WorkspaceRail`
- `CommandHero`
- `StatusMetricCard`
- `InspectorPanel`
- `EvidenceCard`

### Builder components

- `TemplatePicker`
- `FileTree`
- `EditorPane`
- `PreviewPane`
- `TerminalPane`
- `RunButton`
- `ArtifactList`

### Demo components

- `DemoAppCard`
- `StandaloneHtmlPreview`
- `LocalFileInstruction`
- `HttpPreviewCommand`
- `ProofChecklist`

### Connector components

- `ConnectorCard`
- `AuthBoundary`
- `DirectionBadge`
- `WebhookConsole`
- `SecretHealthCard`
- `EventActionMap`

### Governance components

- `ProtocolPath`
- `GateStatus`
- `RiskBoundary`
- `OwnerBadge`
- `AcceptanceCriteria`

### Deploy components

- `DeployTargetPicker`
- `BuildCommandCard`
- `DeployCommandCard`
- `SecretChecklist`
- `PublicUrlCard`
- `LogArtifactCard`

### Activation/support components

- `ActivationFunnel`
- `FeedbackInbox`
- `IssueComposer`
- `DocsFixSuggestion`
- `RoadmapItemCard`

## Visual language

- Background: deep dark studio shell.
- Accent: gold for primary brand/action and blue for preview/deployment signals.
- Success: green only for verified, ready, or shipped states.
- Panels: translucent, bordered, soft shadows.
- Motion: small elevation, no distracting animations.
- Typography: large confident hero, compact operational cards.

## State model

Every visible object should declare a state:

- `draft`
- `demo`
- `ready`
- `blocked`
- `checking`
- `failed`
- `deployed`
- `learning`

## UX release gates

Before a frontend change is shipping-ready, it must answer:

1. What job does this surface perform?
2. What user action starts it?
3. What output does it create?
4. What backend or integration does it depend on?
5. What happens when credentials are missing?
6. What proof shows it worked?
7. What is the next user action?

## Immediate UI build target

The next visual build should turn the existing dashboard into a true IDE workbench:

- left rail navigation,
- center workspace with file/editor/preview/terminal panels,
- right inspector for protocols/connectors/deploy evidence,
- demo gallery as a first-class route,
- connector gallery as a first-class route,
- deploy command center with clear external account boundaries.
