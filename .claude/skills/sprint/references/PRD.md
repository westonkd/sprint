# PRD: sprint

> **Status (2026-08-22):** First slice landed. The agent runtime exists and **Button** is the first component. All three load-bearing ideas are now validated in code, not just stated: the agent view is a DOM projection ([ADR](ADR/20260822192124_agent_view_is_a_dom_projection_not_a_second_render_path.md)), tools register against `document.modelContext` with label-derived names ([ADR](ADR/20260822192124_tool_names_derive_from_the_accessible_label_and_compose_by_scope.md)), and the visual system ships as an enforced two-layer token set ([ADR](ADR/20260822192124_css_token_layer_cascade_layers_and_semantic_roles_as_public_contract.md)). 162 tests, `verify` green.
>
> **Status (2026-08-22, later):** The catalog is 12 components, and the workbench is now built out of them rather than out of hand-written markup ([ADR](ADR/20260822220043_the_workbench_is_built_from_sprint_components.md)). Stack, Panel, Heading, Text, Tag, Table, List, CodeBlock, SegmentedControl, Link, and Card landed together, driven by what a documentation page needs. 393 tests, `verify` green. Three design rules came out of it, none of which Button could have surfaced: tools register only where an agent gains something ([ADR](ADR/20260822220043_tools_are_registered_only_where_an_agent_gains_something.md)), agent controls are one per actionable part and layout renders none ([ADR](ADR/20260822220043_agent_controls_are_one_per_actionable_part_and_layout_renders_none.md)), and data components take data and restack on narrow screens ([ADR](ADR/20260822220043_data_components_take_data_and_are_responsive_by_restacking.md)).
>
> **Still unproven:** everything is jsdom. No descriptor has been accepted by a real browser. The Chrome 149 spike has not been run, and the catalog grew ahead of it deliberately, so it now has more to invalidate than it did.
>
> **Decided:** The visual system is specified in [DESIGN.md](DESIGN.md#visual-language), derived from the reference imagery in `marathon/`. R4 below was rewritten against it — an earlier draft described a near-monochrome ground with one accent, which is wrong; the real system is a wide, fully-saturated flat palette used two colors at a time.
>
> **Decided:** WebMCP means the web platform standard (`document.modelContext`, Chrome 149 origin trial), not the third-party webmcp.dev library — see [ADR 20260822183250](ADR/20260822183250_target_the_chrome_webmcp_standard_not_the_webmcp_dev_library.md). R2 below is written against that API and is no longer blocked. Phase 1 is now a spike, not a decision.

## Summary

Sprint is a React component library built for pages that are read and operated by AI agents as
often as by people. Every component has two renderings from one definition: the default human
rendering (styled DOM) and an agent rendering (a compact text form, e.g. plain Markdown) that an
agent can consume without scraping class names or reverse-engineering layout. Components also
publish their behavior as callable tools over WebMCP, so an agent connected to the page can invoke
a component's actions directly instead of synthesizing clicks. The library ships a matching visual
system so an app built from Sprint looks deliberate out of the box.

## Problem

Agents interacting with web UIs today work from the wrong artifact. They get a DOM designed for
pixels: nested wrapper divs, hashed class names, ARIA that describes accessibility semantics rather
than application intent, and state encoded in visual affordances. So agents scrape, guess, and
break on the next style refactor. The workarounds are all lossy:

- **Screenshot + vision** — expensive, slow, and blind to state the pixels don't show.
- **Raw DOM/HTML** — enormous, mostly irrelevant, and unstable across releases.
- **Accessibility tree** — better, but it describes *how to perceive* a widget, not *what it means*
  in the app or *what you can do with it*.
- **Bespoke agent APIs** — a second implementation of the app's surface that drifts from the UI.

Meanwhile the component author is the one person who knows exactly what a component means and what
it can do, and there is no conventional place to put that knowledge. Sprint's bet is that this
knowledge belongs in the component, emitted alongside the visual rendering, and kept honest by
being generated from the same props and state that draw the pixels.

Who feels this: agent authors (fragile, expensive integrations), app developers (every agent
integration is bespoke work), and end users (agent-driven flows fail in ways they can't diagnose).

## Goals

- One definition per component produces both the human rendering and the agent rendering. They
  cannot drift, because they read the same props and state.
- An agent can understand a Sprint page from text alone, without vision and without HTML scraping.
- An agent can *act* on a Sprint page through WebMCP tools the components register, rather than by
  simulating input events.
- Component authors write agent affordances declaratively, as part of normal component authoring,
  not as a parallel integration.
- Adopting Sprint requires no agent-specific work from the app developer. Using the component is
  what makes the app agent-operable.
- The library is usable as a plain component library by someone who never touches an agent. The
  agent layer is inert until something connects.
- The default look is opinionated and complete, so an app built from Sprint is presentable without
  a design pass.

## Non-goals

- **Not a general web-scraping or page-understanding tool.** Sprint improves pages built *with*
  Sprint. It does not try to make arbitrary third-party DOM legible.
- **Not an agent framework, model runtime, or prompt library.** Sprint exposes capability; deciding
  what to do with it is the agent's job.
- **Not a headless/unstyled primitive library.** That space is well served. Sprint's opinionated
  visual system is part of the product, not an afterthought to be stripped out.
- **Not a replacement for accessibility.** ARIA and semantic HTML remain required. The agent view
  is additive, and "the agent can read it" never excuses an inaccessible human view.
- **No server component.** Everything is client-side; the agent view and tool registrations exist
  in the browser alongside the rendered UI.
- **Not attempting exhaustive component coverage in v1.** Depth on the dual-render and WebMCP model
  matters more than breadth of the catalog.

## Users

- **Agent authors** — need a page they can read and drive cheaply and reliably, with stable
  affordances that survive a visual refactor.
- **App developers building agent-facing UIs** — need agent-operability to come free with the
  component, and need the human UI to stay first-class.
- **Coding agents writing Sprint apps** — need discoverable, machine-readable component docs
  (`agent-manifest.json`) so they can compose components correctly without reading source.
- **End users** — need the human UI to be fast, accessible, and good-looking; the agent layer
  should be invisible to them unless they opt into it.

## Vocabulary

- **Human view** — the default rendering: styled DOM, the thing a person sees.
- **Agent view** — the same component rendered as compact text (Markdown is the working default)
  describing what it is, its current state, and what can be done with it.
- **Dual render** — the property that both views derive from one component definition and one
  source of state.
- **Agent contract** — the existing DOM attribute conventions in `src/agent/attributes.ts`
  (`data-sprint`, `data-sprint-part`, `data-sprint-<state>`). Public API; changing one is breaking.
- **Agent manifest** — `agent-manifest.json`, generated by `bun run manifest` from the component
  registry. Design-time documentation: what components exist and how to use them.
- **WebMCP** — the web platform API by which a page registers callable tools with the browser, so
  an agent the user has connected can invoke them. Entry point is `document.modelContext`.
  Incubated at https://github.com/webmachinelearning/webmcp, documented at
  https://developer.chrome.com/docs/ai/webmcp, shipping behind a Chrome 149 origin trial. Not the
  similarly-named third-party library at webmcp.dev.
- **Tool** — a WebMCP tool descriptor published by a component instance:
  `{ name, description, inputSchema, execute, annotations? }`.
- **Runtime surface** vs **design-time surface** — WebMCP tools and the agent view are runtime
  (what a live page offers an agent right now); the manifest is design-time (what a developer or
  coding agent reads while writing code). Keep the two straight.

## Requirements

### R1 — Dual render

- **R1.1** Every component has a human view and an agent view, both built from a single `AgentNode`
  constructed once per render. In human view that node becomes the `data-sprint*` attributes on real
  DOM; in agent view it becomes plain text. Exactly one is rendered at a time, never both.
- **R1.1a** The view is a mode held as state by a containing component and toggled either way, not
  a separate artifact an agent requests.
- **R1.1c** In agent view a component renders **zero elements unless it is interactive, then exactly
  one** — a control whose text content is its own Markdown line, carrying `data-sprint-agent` and
  `data-sprint-tool` so an agent can select it. WebMCP needs no elements, but agents outside Chrome
  149 have no WebMCP and still need something to click. A component with nothing to act on right now
  (disabled, loading) renders as text. `agentControls="never"` opts out for WebMCP-only consumers.
- **R1.1b** Switching views must not unmount components. Registered WebMCP tools survive the switch
  in both directions.
- **R1.2** The agent view is derived from the same props and state as the human view. No separate
  hand-maintained description.
- **R1.3** The default agent format is plain Markdown. The format is pluggable, so a consumer can
  swap the serialization without rewriting components.
- **R1.4** The agent view conveys identity, current state, and available actions — not just visible
  text. A disabled control must read as disabled; a loading region must read as loading.
- **R1.5** Switching a subtree to the agent view is a consumer-controlled mode (context/provider),
  not a per-component prop the caller must thread manually.
- **R1.6** The agent view has zero effect on the human view's rendered output or bundle behavior
  when unused.

### R2 — WebMCP

Targets the platform API per
[ADR 20260822183250](ADR/20260822183250_target_the_chrome_webmcp_standard_not_the_webmcp_dev_library.md).

- **R2.1** Components register their actions as WebMCP tools whenever the action is meaningful to an
  agent (submit, open, select, dismiss, set value), via
  `document.modelContext.registerTool(descriptor, { signal })`.
- **R2.2** Registration is lifecycle-correct: registered on mount, unregistered on unmount by
  aborting the `AbortController` passed as `options.signal`, and stable across re-renders.
- **R2.3** Tools are addressable when multiple instances of a component are on the page. A page with
  three forms exposes three distinguishable submit tools with distinct `name`s.
- **R2.4** `execute` drives the same code path as the human interaction. No parallel logic.
- **R2.5** WebMCP is optional at runtime. If `document.modelContext` is absent — any non-Chrome
  browser, or Chrome without the origin trial — the component works normally and registration is a
  no-op. No polyfill, no fallback library, no injected connection UI.
- **R2.6** Tool `description` and parameter descriptions are written for a reader who cannot see the
  source, same bar as the manifest's `summary` / `whenToUse` / `examples`. Platform caps apply:
  500 characters per tool description, 150 per parameter description, 1.5K per tool output.
- **R2.7** One tool, one action. Follow Chrome's naming guidance: the verb states what actually
  happens, distinguishing an immediate action from one that merely starts a flow.
- **R2.8** `inputSchema` uses specific types and enums, and accepts values in the user's own terms
  rather than internal ids. The model should never have to transform or compute an argument.
- **R2.9** Every tool sets `annotations.readOnlyHint` honestly, and sets
  `annotations.untrustedContentHint` when its output can contain user-supplied or third-party
  content.
- **R2.10** Tools are registered contextually. A component unregisters tools that its current state
  makes meaningless, rather than registering everything up front and failing at call time.
- **R2.11** `execute` validates strictly and fails with a descriptive message the model can act on.
  Schemas stay permissive enough that the model can self-correct from the error.
- **R2.12** Every `document.modelContext` call site lives behind a single internal adapter module.
  The API is an origin trial and will move; a spec change must be a one-file edit.
- **R2.13** Cross-origin exposure via `exposedTo` is never set by Sprint. It is a consumer decision.

### R3 — Agent contract (existing, carried forward)

- **R3.1** `data-sprint`, `data-sprint-part`, and `data-sprint-<state>` are public API; a change is
  a breaking change.
- **R3.2** Tests assert behavior through agent selectors, never class names.
- **R3.3** Every registered component fills in `summary`, `whenToUse`, and at least one runnable
  `examples` entry.

### R4 — Visual system

Full specification in [DESIGN.md](DESIGN.md#visual-language), derived from the reference imagery in
`marathon/` at the repo root. That document is the source of truth; the requirements here are the
load-bearing constraints extracted from it.

- **R4.1** Flat, always. No gradient, drop shadow, blur, bevel, or non-zero border-radius. Depth
  comes from stacked opaque planes and keyline weight.
- **R4.2** Rectilinear only. Rectangles and rectilinear steps, notches, and insets. No curves, no
  diagonals except as hatch texture.
- **R4.3** Saturated flat color, rationed. A wide palette (acid chartreuse, ultramarine, magenta,
  cyan, warning yellow, void, paper) but at most two or three per surface, used at full strength.
  No tints or opacity ramps to fake hierarchy. Acid marks the primary action, one per view.
- **R4.4** Type has exactly three voices: heavy condensed uppercase display, wide-tracked uppercase
  monospace for all chrome and data, and an optional high-contrast serif accent used at most once
  per screen. Monospace is the default interface voice, not a code-only font.
- **R4.5** Chrome reads as instrumentation: nested keylines, corner brackets, registration crosses,
  bordered slots with corner badges, labeled panels, vertical margin text, full-bleed action bars.
  Empty slots keep their border and state their emptiness rather than collapsing.
- **R4.6** Texture comes from a closed vocabulary of small marks (dots, crosses, X's, targets,
  checkers, hatching, barcode strips, dither, scanlines) tiled in the surface's own two colors.
  Implemented as CSS gradients or inline SVG, never raster assets, never over content.
- **R4.7** Motion is mechanical: 80–160ms, `steps()` or `linear`, single-axis translation, hard
  cuts. No bounce or easing flourish. Respect `prefers-reduced-motion`.
- **R4.8** Themed entirely through CSS custom properties, per CLAUDE.md, in two layers: primitives
  mapped to semantic roles, with components referencing only the semantic layer. The custom
  property names are a public theming contract, treated with the same care as the agent attributes.
- **R4.9** WCAG AA contrast on every pairing. Aesthetic never overrides legibility. Acid on light
  grounds fails and is banned.
- **R4.10** Information density is the aesthetic. Tight padding, dense panels. Generous whitespace
  is off-system, and empty regions get marked with grid texture rather than left blank.
- **R4.11** The agent view (R1) inherits none of R4. It is plain text. A component's visual identity
  and its agent identity are independent.

### R5 — Library mechanics (existing, carried forward)

- **R5.1** TypeScript strict, `verbatimModuleSyntax`, explicit `.ts`/`.tsx` import extensions,
  `@/*` alias.
- **R5.2** `react` / `react-dom` stay peer dependencies and external to the bundle.
- **R5.3** Everything runs in Docker Compose. No host `bun`/`vite`/`vitest`.
- **R5.4** Props forwarded, `ref` accepted, rest spread onto the root, on every component.
- **R5.5** No comments in source.

## Platform assessment / spikes

Nothing spiked yet. What exists is scaffolding, not evaluation:

- The attribute contract and registry (`src/agent/`) are in place and predate this PRD.
- `agent-manifest.json` generation works.
- Docker toolchain (`dev`, `test`, `verify`, `lint`, `format`, `typecheck`, `build`) works.
- WebMCP has not been integrated in this repo, but the target is settled (ADR 20260822183250). What
  the platform gives us, for reference while designing:

  ```js
  const controller = new AbortController();
  await document.modelContext.registerTool(
    {
      name: "submit-support-request",
      description: "Submit a support request.",
      inputSchema: { type: "object", properties: { ... }, required: [...] },
      execute: async (inputs, { signal }) => "result text",
      annotations: { readOnlyHint: false, untrustedContentHint: false },
    },
    { signal: controller.signal },
  );
  controller.abort();
  ```

  Also available: `document.modelContext.getTools()`, `executeTool(tool, inputJson, options)`, and a
  `toolchange` event. Requires Chrome 149+, an origin-isolated document, the `tools` permissions
  policy (defaults to `self`), and either origin-trial registration or
  `chrome://flags/#enable-webmcp-testing` locally.

Worth prototyping before committing:

- Agent-view rendering strategy: React context mode switch vs. a serializer that walks a component's
  own describe function. Whether the agent view is real DOM or a pure string.
- Whether tool registration lives in the component body, in a hook, or is declared in `meta.ts` and
  wired by shared machinery.
- Instance addressing for R2.3.
- The **declarative form API** (`toolname`, `tooldescription`, `toolparamdescription`,
  `toolautosubmit` as `<form>` attributes) as an alternative to imperative registration for Sprint's
  form components. Cheaper and browser-managed, but a second mechanism to keep consistent with the
  first. Needs its own ADR.
- `webmcp-types` as a dev dependency for descriptor typings.
- Chrome's `usewebmcp` React package. Deliberately not adopted up front (see ADR), but worth a look
  once Sprint's own hook shape exists, to see whether the two converge.

## Open questions

Answered by the first slice, kept here for the trail: the agent view is projected from the DOM and
reachable both by reading attributes directly and via the `read-region` tool; there is no "agent
mode" to trigger, because there is no mode; components register their own tools rather than a
provider batching them; and names are label-derived and scope-composed. See the ADRs.

- Does a page's tool count stay manageable as the catalog grows? Half answered: the workbench blew
  through the ~15 tripwire on its first page, and the answer was not to raise it but to register
  only where an agent gains something
  ([ADR](ADR/20260822220043_tools_are_registered_only_where_an_agent_gains_something.md)).
  Navigation is settled. Still open for actions: a page with fifteen genuinely actionable Buttons
  would put Button's default-on registration back on the table.
- Should a lint rule catch labels containing changing values, which churn tool names?
- Localized labels produce localized tool names. Is that right, or should tool names be pinned to a
  source language?
- Does `AgentToolSpec` supersede the older `AgentActionSpec`, or do both earn their keep?
- When the first component with genuinely absent DOM appears (virtualized Table), what shape does
  the describer escape hatch take?
- Which typefaces? R4.4 needs a heavy condensed uppercase display face and a monospace, both
  self-hosted (the library cannot depend on a font CDN) and both licensable for redistribution.
  Blocks phase 3. Its own ADR.
- Does Sprint ship the ornament vocabulary (R4.6) as a documented set of CSS pattern utilities, or
  do components each roll their own?
- Is any of this useful outside React? Assume no for now; revisit only if the core proves out.

Also answered: WebMCP tools are tested in CI through `installMockModelContext()`
(`src/test/modelContext.ts`), a test double that installs a fake `document.modelContext` and tracks
registration history, active/aborted state, and execution. It verifies descriptor shape and
lifecycle but is a *guess about the real API* until the Chrome spike runs.

## Success criteria

- An agent with no vision and no HTML access can read a Sprint page's agent view and correctly
  describe the state of every component on it.
- That same agent can complete a non-trivial task (fill and submit a form, open a dialog and act
  inside it) purely through registered WebMCP tools.
- Adding a component's agent view and tools costs the author a small, bounded amount of extra code
  beyond writing the human view. If it doubles the work, the abstraction is wrong.
- A visual refactor of a component changes no agent-visible behavior: agent view, tools, and
  attributes all still pass their tests.
- A coding agent handed only `agent-manifest.json` composes a working page without reading source.
- `docker compose run --rm verify` passes on every component.

## Phasing

1. ~~**Establish the dual-render primitive.**~~ Done. `src/agent/view/` projects the agent view from
   the DOM; Button proves it.
2. ~~**Lay down the visual system.**~~ Done for what Button needs: `src/styles/` two-layer tokens,
   cascade layers, contrast enforced by test. Typeface question still open, but it blocks nothing
   until a display face is actually needed.
3. ~~**Manifest and tooling catch-up.**~~ Done. `AgentComponentMeta` carries `tools` and `agentView`;
   manifest `conventions` carries the tool attribute, owner attribute, agent view format, naming
   convention, and output limit.
4. ~~**Enough catalog to build the workbench out of Sprint.**~~ Done, and taken ahead of the
   Chrome spike on purpose
   ([ADR](ADR/20260822220043_the_workbench_is_built_from_sprint_components.md)). Eleven
   components, chosen by what a documentation page actually needs. It found three holes Button
   could not have.
5. **Spike WebMCP in Chrome 149.** Load the workbench behind
   `chrome://flags/#enable-webmcp-testing` and confirm the platform accepts Sprint's descriptors,
   that abort actually unregisters, and that the mock's shape matches reality. **This is the gate.**
   Everything to date is jsdom-verified only. SegmentedControl's per-instance `inputSchema` and its
   `enum` are new surface for the spike to check.
6. **A text input and a state-carrying container.** Dialog or Disclosure. Still the two that stress
   what nothing has yet: registration churn under per-keystroke state, and the portal path the
   serializer reserved but has never exercised.
7. **Breadth.** Once the machinery has held through the spike and those two.
