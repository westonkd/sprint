# Sprint

An agent-forward React component library. Every component renders normally for people and
projects a machine-readable view for agents, from one definition.

Status: early. One component (Button) and the agent runtime behind it.

## What "agent-forward" means here

```tsx
<Button tone="action" block onClick={prepare}>Prepare launch</Button>
```

A person sees a flat acid action bar. Flip the containing provider to agent view and the same
component renders as text, with no HTML elements at all:

```
- **Button** "Prepare launch" [block, tone=action] → tool `press-prepare-launch`
```

Both renderings are built from one `AgentNode` created during the same render, so they cannot
disagree. The tool name comes from the button's own label. Nothing here is written by hand, and
switching views does not unmount anything — `press-prepare-launch` stays registered in both.

```tsx
<SprintProvider view={agentMode ? "agent" : "human"}>
```

An agent with WebMCP can flip it itself by calling `set-page-view`.

## Requirements

Docker with Compose v2. Nothing else, everything runs in containers.

## Getting started

```bash
docker compose up dev
```

The workbench serves on http://localhost:5173. It is the documentation. Component pages are
generated entirely from `agent-manifest.json` — props, state attributes, tool descriptors, and every
code snippet come from the same metadata an agent reads. Each example can be toggled between the
human and agent view, individually or a whole page at once.

Two written guides sit alongside them:

- **WebMCP** — what the platform API is, the imperative and declarative forms with examples,
  availability, its hard limits, and the security annotations.
- **Integration philosophy** — the eleven decisions behind how Sprint uses it, and what each costs.

```bash
docker compose run --rm verify
```

Runs typecheck, lint, tests, and the library build.

## Layout

```
src/
  agent/
    attributes.ts   the data-sprint* contract
    registry.ts     component metadata, manifest assembly
    view/           agent view: DOM serializer and Markdown formatter
    webmcp/         the single document.modelContext call site, plus useAgentTool
  components/       one directory each, see Button for the reference shape
  provider/         SprintProvider, AgentRegion, page-level read tools
  styles/           token primitives, semantic roles, base resets
  test/             Vitest setup and the WebMCP test double
dev/                local workbench, not published
scripts/            manifest generation, build output checks
```

## Consuming it

```tsx
import { Button, SprintProvider } from "sprint";
import "sprint/styles.css";
```

```ts
import manifest from "sprint/agent-manifest.json" with { type: "json" };
```

Wrap your app in `SprintProvider` to register the page-level `list-page-regions` and `read-region`
tools. Components work without it.

## WebMCP

Tools use the [web platform WebMCP API](https://developer.chrome.com/docs/ai/webmcp)
(`document.modelContext`), which currently ships in Chrome 149 behind an origin trial or
`chrome://flags/#enable-webmcp-testing`. Everywhere else, registration is a no-op and the components
work normally — the agent view does not depend on it.

## Documentation

- [AGENTS.md](AGENTS.md) — contribution workflow and the agent contract.
- `.claude/skills/sprint/references/PRD.md` — what this is and why.
- `.claude/skills/sprint/references/DESIGN.md` — the visual language.
- `.claude/skills/sprint/references/ADR/` — why it is built this way.
