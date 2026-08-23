# Working in this repo

Sprint is an agent-forward React component library. "Agent-forward" means every component
ships machine-readable metadata and stable DOM hooks, so an AI agent can discover it,
compose it correctly, and drive it in a browser without scraping class names.

## Everything runs in Docker

Do not run `bun`, `vite`, or `vitest` on the host. Use Compose.

```bash
docker compose up dev
```

```bash
docker compose run --rm test
```

```bash
docker compose run --rm verify
```

Other one-shot services: `lint`, `typecheck`, `build`, `install`, `test-watch`, `shell`.
They live behind the `tools` profile so `docker compose up` only starts the dev server.

After changing `package.json`, run `docker compose run --rm install` so `bun.lock` and the
`node_modules` volume stay in sync.

## Stack

| Concern         | Choice                                  |
| --------------- | --------------------------------------- |
| Language        | TypeScript (strict, `verbatimModuleSyntax`) |
| Bundler         | Vite library mode + `vite-plugin-dts`   |
| Package manager | Bun                                     |
| Tests           | Vitest + Testing Library (jsdom)        |
| Lint / format   | Biome                                   |

Imports use explicit `.ts` / `.tsx` extensions and the `@/*` alias for `src/*`.

## Adding a component

Use `src/components/Button/` as the reference. Six files, in this order:

1. `tool.ts` — one `AgentToolSpec` per tool, if the component has any. Declared once and shared
   by the runtime descriptor and the manifest, so the two cannot drift.
2. `meta.ts` — `export const <name>Meta = defineAgentMeta({...})`, embedding the specs from
   `tool.ts`. Export the value; do not rely on import side effects.
3. `<Name>.tsx` — spread `agentAttributes(<name>Meta.name, { state })` onto the root and each
   interactive part. Call `useAgentTool` for each action. Import `<name>Meta` and *use* it, which
   is what keeps the registration from being tree-shaken.
4. `<Name>.css` — style through the agent attributes (`[data-sprint="Button"]`), never class
   names, inside `@layer sprint.components`. Reference only semantic tokens.
5. `<Name>.test.tsx` — assert through `agentSelector()`, never class names. Cover the tool
   lifecycle, not just rendering.
6. `index.ts` — re-export, then add it to `src/components/index.ts` and `src/index.ts`.
7. `dev/specimens/<Name>.tsx` — a live node per `examples[].title`, plus an optional `gallery`
   showing every variant. Register it in `dev/specimens/index.ts`.

Then `docker compose run --rm verify`.

## The workbench is the docs

`docker compose up dev` serves documentation generated entirely from the registry. There are no
hand-written component pages: props tables, state tables, tool descriptors, code snippets, and the
agent view all come from `meta.ts`. Adding a component adds its documentation.

This means **`meta.ts` is read by humans as well as agents**. Writing it badly produces bad docs and
a bad agent prompt at the same time, which is the intended pressure. `examples[].code` is rendered
verbatim as the snippet, so it must be real, runnable code.

The only thing written twice is the live specimen in `dev/specimens/`, which cannot be derived from
a code string. The docs flag any example missing one.

`dev/pages/GuideWebMCP.tsx` and `dev/pages/GuidePhilosophy.tsx` are the two hand-written pages:
background on the platform API, and the reasoning behind Sprint's use of it. Add a guide by
appending to `GUIDES` in `dev/Workbench.tsx`. When a decision recorded in an ADR changes, the
philosophy guide is the user-facing half of it and needs updating too.

## The agent contract

Attribute conventions, defined in `src/agent/attributes.ts`:

- `data-sprint="<ComponentName>"` marks a component root.
- `data-sprint-part="<part>"` marks an addressable sub-element (`trigger`, `close`, `input`).
- `data-sprint-<state>` reflects runtime state (`data-sprint-loading`, `data-sprint-tone="danger"`).
  Boolean state renders as a valueless attribute so `[data-sprint-loading]` matches.
- `data-sprint-tool="<name>"` names the WebMCP tool that drives this element.
- `data-sprint-owner="<tool-name>"` marks a portaled root as belonging to another component.

`part`, `tool`, and `owner` are reserved and never read as state. These attributes are part of the
public API. Changing or removing one is a breaking change, because agents write selectors against
them, and because the agent view is projected from them.

## The two agent surfaces

**The agent view** is a render mode. Build one `AgentNode` per render with `buildAgentNode()`, then
branch:

```tsx
const node = buildAgentNode({ component: meta.name, label, tool, state: { tone, loading } });
if (useSprintView() === "agent") return <AgentLine node={node} />;
return <button {...agentAttributesFor(node)}>{children}</button>;
```

Both renderings come from that one node, so they cannot disagree. Never render both at once.

In agent view a component emits **no elements unless it is interactive, then exactly one**:

- `AgentLine` — strings and a depth context provider, zero DOM. Use for anything not actionable.
- `AgentControl` — one `<button>` or `<a>` whose text content is the Markdown line, so a
  DOM-driving agent has something to click. Use when the component is actionable right now.

WebMCP itself needs no elements, but agents outside Chrome 149 have no WebMCP, so a control is the
only affordance they get. Render `AgentLine` when the component is disabled or busy, and respect
`useAgentControls() === "never"` for consumers who want literally zero markup.

`serializeElement` / `serializeWithin` still project the agent view from the DOM, but only for
reading a page that is in *human* mode. Because attributes are generated from the node, the
projection and the agent render agree by construction.

**Tools** register with `document.modelContext` through the single adapter in
`src/agent/webmcp/adapter.ts` — the only place that API may be touched. Names derive from the
accessible label and compose with the surrounding scope (`billing-press-save`). A tool's `execute`
should drive the real DOM (`element.click()`) rather than call a prop, and should return the
component's state after the action.

WebMCP is Chrome 149+ only. Everything must work without it; registration is a no-op when
`document.modelContext` is absent.

`bun run manifest` walks the registry and emits `agent-manifest.json`, the artifact an agent
reads to learn what exists. Every registered component must fill in `summary`, `whenToUse`,
and at least one runnable `examples` entry, since that text is the entire prompt an agent
gets. Write it for a reader who cannot see the source. `src/components/catalog.test.ts` enforces
the floor.

## Conventions

- No comments in source. Prefer clear names and small functions.
- Props are forwarded; every component takes `ref` and spreads the rest onto its root.
- Style with CSS custom properties, no CSS-in-JS runtime. Components reference only the semantic
  layer in `src/styles/semantic.css`, never a raw color from `primitives.css`.
- Every color pairing meets WCAG AA. `src/styles/contrast.test.ts` enforces it.
- `react` and `react-dom` are peer dependencies and stay external in the bundle.
- The project skill in `.claude/skills/sprint/` holds the PRD, the visual language, and the
  decision log. Read it before making an architectural change, and record decisions with
  `.claude/skills/sprint/scripts/new_adr.sh`.
