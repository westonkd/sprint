# Sprint

An agent-forward React component library.

Components are built so that an AI agent can find them, use them correctly, and operate
them in a live browser. That comes down to two things:

- **A manifest.** `agent-manifest.json` describes every component: what it is for, when not
  to reach for it, its props, its states, and runnable examples. It ships in the package,
  so an agent can read the library instead of guessing at it.
- **Stable DOM hooks.** Each component tags itself with `data-sprint` attributes that
  survive refactors and restyling, so browser-driving agents get selectors that do not rot.

Status: groundwork only. No components yet.

## Requirements

Docker with Compose v2. Nothing else, everything runs in containers.

## Getting started

```bash
docker compose up dev
```

The workbench serves on http://localhost:5173 and lists whatever is registered.

```bash
docker compose run --rm verify
```

Runs typecheck, lint, tests, and the library build.

## Layout

```
src/
  agent/        metadata types, attribute helpers, component registry
  components/   components live here, one directory each
  test/         Vitest setup
dev/            local workbench app, not published
scripts/        manifest generation
```

## Consuming it

```tsx
import { agentSelector } from "sprint";
import "sprint/styles.css";
```

```ts
import manifest from "sprint/agent-manifest.json" with { type: "json" };
```

See [AGENTS.md](AGENTS.md) for the contribution workflow and the agent contract.
