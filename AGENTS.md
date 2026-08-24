# Working in this repo

Sprint is an agent-forward React component library. "Agent-forward" means every component
ships machine-readable metadata and stable DOM hooks, so an AI agent can discover it,
compose it correctly, and drive it in a browser without scraping class names.

## Load the project skill first

`.claude/skills/sprint/` is the project skill. Load it at the start of every session, not only
when a change looks architectural, because by the time a change looks architectural you have
usually already made it.

- `references/PRD.md` — what Sprint is for, its requirements, and its open questions.
- `references/DESIGN.md` — the visual language.
- `references/ADR/` — one file per decision, filename-sorted. Read the recent ones first.
  Superseded decisions are kept rather than deleted, so an old file is not automatically wrong.

Most of what looks arbitrary here is a decision recorded in an ADR. Record new ones with the
script rather than editing the PRD in place:

```bash
.claude/skills/sprint/scripts/new_adr.sh "Title of the decision"
```

## Everything runs in Docker

Do not run `bun`, `vite`, or `vitest` on the host. Use Compose.

```bash
docker compose watch dev
```

`watch`, not `up`. The dev server gets its source from the image and Compose syncs your edits in;
without `watch` you are serving a snapshot that never changes. Editing `package.json` or `bun.lock`
rebuilds the image automatically.

```bash
docker compose run --rm test
```

```bash
docker compose run --rm verify
```

Biome is both the linter and the formatter, and `verify` fails on either. To apply every safe
fix, reformat, and sort imports:

```bash
docker compose run --rm format
```

Other one-shot services: `lint`, `format`, `typecheck`, `build`, `install`, `test-watch`, `shell`.
They live behind the `tools` profile so `docker compose up` only starts the dev server.

After changing `package.json`, run `docker compose run --rm install` so `bun.lock` and
`node_modules` on your host stay in sync.

### Why `dev` and the tool services mount differently

`dev` has no bind mount and uses `develop.watch`. Sync is one-way, host to container, and honours
`.dockerignore`, so the container keeps the `node_modules` built into the image and your host tree
never leaks into it.

Every tool service does bind-mount the repo at `/app`, because each one exists to write something
back: `install` updates `bun.lock` and `node_modules`, `build` emits `dist/` and
`agent-manifest.json`, `format` rewrites source. Watch cannot do that; it only pushes inward.

The bind mount is also what puts `node_modules` on your host, which is the only reason a host
editor's TypeScript server can resolve `react`, `vitest/globals`, or the `@/*` alias. If your
editor lights up with unresolved imports, run `docker compose run --rm install`. Those packages
are Alpine builds and are there to be read, not executed.

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

Use `src/components/Button/` as the reference. Seven files, in this order:

1. `tool.ts` — one `AgentToolSpec` per tool, if the component has any. Declared once and shared
   by the runtime descriptor and the manifest, so the two cannot drift.
2. `meta.ts` — `export const <name>Meta = defineAgentMeta({...})`, embedding the specs from
   `tool.ts`. Export the value; do not rely on import side effects.
3. `<Name>.tsx` — build one `AgentNode` per render with `buildAgentNode()` and spread
   `agentAttributesFor(node)` onto the root, `agentPartAttributesFor(part)` onto each addressable
   part. Call `useAgentTool` for each action, and only where an agent gains something a URL or the
   agent view does not already give it. Import `<name>Meta` and *use* it, which is what keeps the
   registration from being tree-shaken.
4. `<Name>.css` — style through the agent attributes (`[data-sprint="Button"]`), never class
   names, inside `@layer sprint.components`. Reference only semantic tokens. Mobile first: the
   narrow layout is the base rule, wider layouts arrive in `min-width` queries (40rem for a row
   that collapses, 48rem for a table that restacks).
5. `<Name>.test.tsx` — assert through `agentSelector()`, never class names. Cover the tool
   lifecycle, not just rendering.
6. `index.ts` — re-export, then add it to `src/components/index.ts`. `src/index.ts` re-exports that
   barrel wholesale, so it needs no edit.
7. `dev/specimens/<Name>.tsx` — a live node per `examples[].title`, plus an optional `gallery`
   showing every variant. Register it in `dev/specimens/index.ts`.
   `dev/specimens/coverage.test.ts` fails `verify` if an example has no specimen, or a specimen no
   example.

Then `docker compose run --rm verify`.

## The workbench is the docs

`docker compose watch dev` serves documentation generated entirely from the registry. There are no
hand-written component pages: props tables, state tables, tool descriptors, code snippets, and the
agent view all come from `meta.ts`. Adding a component adds its documentation.

This means **`meta.ts` is read by humans as well as agents**. Writing it badly produces bad docs and
a bad agent prompt at the same time, which is the intended pressure. `examples[].code` is rendered
verbatim as the snippet, so it must be real, runnable code.

The only thing written twice is the live specimen in `dev/specimens/`, which cannot be derived from
a code string. The docs flag any example missing one.

**The workbench is also built out of Sprint.** Every panel, table, chip, list, and snippet on these
pages is a component from the catalog, so no hand-written markup goes into `dev/` where a component
could exist, and flipping the page-level view switch renders the entire documentation page as agent
text. Even the frame is the library: `Shell` owns the sidebar-and-main grid, `Nav` and `NavGroup`
the sidebar links, `PageHeader` the top of every page. `dev/` keeps only the route switch and the
brand. If a page needs something the library does not have, that is a missing component, not a
`div`.

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
- `data-sprint-region` marks a labelled landmark (`Shell`, `Panel`, `Nav`, `PageHeader`, `Dialog`)
  as a readable region. `list-page-regions` lists every region-flagged element alongside the
  top-level roots, so an agent can read one panel instead of paginating the whole page. Set it via
  `region: true` on `buildAgentNode`; a region is a place worth reading on its own, not any
  container.
- `data-sprint-view="human|agent"` marks the one container `SprintProvider` always renders around
  its subtree: `display: contents` in human view so it never affects layout, and the block that
  makes the text stream readable (`pre-wrap`, mono) in agent view. It is provider chrome, not a
  component root, and it is why flipping the view re-renders without remounting.
- `data-sprint-view-copy` marks the copy control the view-owning `SprintProvider` renders as the
  container's preceding sibling in agent view. It puts the container's `textContent` — the exact
  Markdown stream — on the clipboard, a human affordance with no WebMCP tool. Its visible label is
  CSS-generated from `aria-label`, so it contributes nothing to the page text an agent reads;
  `agentControls="never"` removes it along with every other control.
- `data-sprint-ornament="hatch|hatch-dense|shade|scanlines|dots|checker|crosses"` paints one mark
  from the ornament vocabulary (`src/styles/ornament.css`) onto an element, drawn in
  `--sprint-ornament-ink` (keyline by default — set it locally for another ink). Pure CSS texture
  for dead space and state bands; it never carries meaning, never sits over content, and the agent
  view ignores it entirely. Components reference the `--sprint-ornament-*` tokens directly.
- `data-sprint-theme="dark|light"` selects the semantic token mapping for everything beneath it.
  Pure CSS: put it on any element, or pass `theme` to `SprintProvider` to stamp it on the view
  container. Dark is the `:root` default. The light mapping keeps acid off light grounds by making
  ultramarine the action color with acid as its ink. The agent view ignores theme entirely.

`part`, `tool`, `owner`, `region`, `view`, `view-copy`, and `theme` are reserved and never read as state. These attributes are part of the
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

In agent view a component emits **one control per addressable part it can act on right now, and no
elements otherwise**:

- `AgentLine` — strings and a depth context provider, zero DOM. Use for anything not actionable.
- `AgentControl` — one `<button>` or `<a>` whose text content is the Markdown line, so a
  DOM-driving agent has something to click. Use when the component has a single action.
- `AgentControlGroup` — the node's line as text, then one `<button>` per actionable part. Use when
  the component has several targets, like a SegmentedControl's options.
- `AgentFieldControl` — the node's lines as text, then one live `<input>` or `<textarea>` synced to
  the component's value, because a button cannot receive typed text. A form element's value is not
  part of `textContent`, so the copyable stream is unchanged; the field is pure affordance.

Control count and tool count are independent: a SegmentedControl renders one control per option and
registers one tool with an `enum`. Elements serve agents without WebMCP; tools serve agents with it.

A component that carries no meaning renders **nothing at all**, not even a line: `Stack` returns its
children and no depth provider, because an agent does not care how a region is arranged. `Panel`
does render a line, because a labelled region says what the things inside it have to do with each
other. The test is whether deleting the component would lose an agent anything.

WebMCP itself needs no elements, but agents outside Chrome 149 have no WebMCP, so a control is the
only affordance they get. Render `AgentLine` when the component is disabled or busy, and respect
`useAgentControls() === "never"` for consumers who want literally zero markup.

**Components hold data, not children, when they hold more than a label.** `Table` takes `columns`
and `rows`, `List` takes `items`. In agent view a component never renders its children, so content
it needs to describe has to be reachable as data; `reactText()` flattens inline cell content the way
`accessibleText()` flattens DOM. Components are not allowed inside those props, and each such
component says so in `whenNotToUse`.

Never turn an `AgentNode` into text yourself. `AgentLine`, `AgentControl`, and anything a tool
returns all go through `useAgentFormat()`, the one formatter `SprintProvider` resolves for the whole
subtree. Markdown is only its default; a consumer passing `format` must change the rendered page and
`read-region` together, and calling `nodeLine` or `toMarkdown` directly is what breaks that.
A custom formatter also has a shape to honour: `AgentControlGroup` maps its node's formatted lines
back onto part controls positionally, so a formatter must emit the node's own line (plus the
summary's lines when a summary is present) followed by exactly one line per part, in part order.
A summary may span multiple lines only on a node with no parts — tabular data uses this: a node
whose parts are all `cell` parts with `column`/`row` state is condensed by `condenseCells` into a
part-less node whose summary is a Markdown pipe table, in the render mode and the DOM projection
alike.

`serializeElement` / `serializeWithin` still project the agent view from the DOM, but only for
reading a page that is in *human* mode. Because attributes are generated from the node, the
projection and the agent render agree by construction.

**Tools** register with `document.modelContext` through the single adapter in
`src/agent/webmcp/adapter.ts` — the only place that API may be touched. Names derive from the
accessible label and compose with the surrounding scope (`billing-press-save`). A tool's `execute`
should drive the real DOM (`element.click()`) rather than call a prop, and should return the
component's state after the action. Pass `inputSchema` to `useAgentTool` when a value set is only
known at runtime; the prose still lives once in `tool.ts`.

Registration is justified per component, not automatic. Ask what an agent can do with the tool that
it could not do without it: `Button` registers by default, `Link` does not (a URL is reachable, and
`data-sprint-href` publishes it), `Card` follows whether it acts or navigates, and `CodeBlock` never
does. A tool-less component is still fully present in the agent view.

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
- Commit messages are short. A subject line and nothing else. Reach for a body only when the
  change is genuinely inexplicable without one, which is rare, because the reasoning belongs
  in an ADR where it can be found later and revised.
