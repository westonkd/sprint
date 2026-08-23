# Agent view is a DOM projection, not a second render path

> **Superseded by
> [20260822195730_agent_view_is_a_render_mode_not_only_a_dom_projection.md](20260822195730_agent_view_is_a_render_mode_not_only_a_dom_projection.md).**
> The argument below against a render-mode switch — that flipping modes unmounts the subtree and
> unregisters its tools — is **wrong**. It holds only when a parent swaps component types, not when
> a component branches on mode inside its own body, where React preserves the instance and its
> effects. The agent view is now a render mode. The serializer described here still exists and is
> still used for human-mode reads; the `children: ReactNode` argument against a per-component
> `describe(props)` also still stands. Read this file for that reasoning, not for the conclusion.

- **Status**: Superseded
- **Date**: 2026-08-22

## Context

R1 says every component has a human view and an agent view produced from one definition. Three
mechanisms could deliver that:

1. **Per-component `describe(props)`** — each component implements a second function returning its
   agent representation.
2. **Render-mode context switch** — a provider flips a subtree into agent mode, and each component
   returns text instead of DOM.
3. **DOM projection** — one generic serializer walks the rendered DOM and reconstructs the agent
   view from the `data-sprint*` attributes R3 already mandates.

## Decision

Sprint takes option 3. `src/agent/view/` holds a serializer (`serializeElement`,
`serializeWithin`) producing an `AgentNode` tree, and a formatter (`toMarkdown`) rendering it. No
component writes agent-view code. Button contains not one line of it.

Two arguments decide this, and neither is aesthetic.

**Sprint components accept `children: ReactNode`.** A per-component `describe(props)` would have to
walk a React element tree containing function components, `memo`, context consumers, and fragments,
and either not render them (garbage output for anything non-trivial) or render them, at which point
it has re-implemented React badly. The DOM is the only place where "what this component actually
contains" exists. That is structural, not a preference.

**The render-mode switch is incompatible with R2.** If an agent flips a subtree to agent mode, that
subtree unmounts, effects clean up, `AbortController`s fire, and every tool the subtree registered
unregisters. The act of reading the page would destroy the ability to act on it. It also breaks
R1.6 by construction, since every component would carry a context subscription and a branch paid for
by every human-only consumer, and the two branches are separate code paths that drift, which is
exactly what R1.2 forbids.

### The serializer joins the registry

Attributes do not carry the whole semantic load. `serializeElement` reads `data-sprint` and calls
`getAgentMeta(name)`, so the agent view is assembled from two sources:

- **identity and prose** from `meta.ts` (design-time, one copy, zero DOM cost)
- **current state** from `data-sprint-*` on the instance (runtime)
- **the driving tool** from `data-sprint-tool` on the instance

This makes the registry a *runtime* dependency, which it was not before. See
[the packaging ADR](20260822192124_packaging_side_effects_and_registration_as_a_data_dependency.md).

### Where state belongs

The rule is cost incidence: **an attribute is paid for by every human-view user on every render,
forever; a describer is paid for only when an agent reads.**

- **Attribute** when low-cardinality, discrete, stable, and plausibly selector-matched:
  `data-sprint-loading`, `data-sprint-tone="danger"`.
- **Never an attribute**: prose, user content, derived summaries. `data-sprint-description="..."`
  is both a drift vector and a permanent DOM tax; descriptions live in `meta.ts` once.
- **Describer**: only when the answer is in neither the DOM nor meta, such as a virtualized list's
  absent rows. **Not built.** There is no evidence for the extension point yet, and keying it by
  component name would mean a second module-level registry with the same import-side-effect problem
  already being fixed. When it is built it belongs on `AgentComponentMeta`, since `JSON.stringify`
  drops functions silently and the manifest stays clean.

### Additional decisions inside the serializer

- **A small native/ARIA allowlist is read** (`disabled`, `aria-disabled`, `aria-busy`,
  `aria-expanded`, `aria-checked`, `aria-selected`, `aria-pressed`, `aria-invalid`, `open`,
  `readonly`, `required`), so a consumer setting `disabled` directly still gets a correct agent view
  where Sprint's own mirroring is imperfect.
- **Text extraction implements four rules, not the accname spec**: prefer
  `aria-label`/`aria-labelledby`, skip `aria-hidden` and `hidden` subtrees, skip nested
  `[data-sprint]` roots (they recurse as children, not text), normalize whitespace. The full spec is
  not worth the weight and would be wrong in different ways.
- **Portals are handled now, before Dialog exists.** `data-sprint-owner` is reserved and carries the
  tool name of the owning component; `serializeWithin` re-attaches an owned root under whichever
  node holds that tool. Tool names are already unique by the claim table, so this needs no new id
  scheme. Retrofitting the attribute later would have touched every call site.
- **Format is pluggable** (`AgentFormatter`), satisfying R1.3. `toMarkdown` is one implementation;
  `SprintProvider` takes `format`.

## Consequences

**Easier:**

- R1.2 holds structurally rather than by discipline. The views cannot drift because one is derived
  from the other.
- R1.6 is free. Unused, the serializer costs nothing; there is no branch in any component.
- The agent view works in every browser, which matters a great deal given WebMCP is Chrome-149-only.
  It is the browser-independent half of the product.
- Consumer DOM interleaved with Sprint components serializes correctly, since the walk is
  structural rather than component-driven.

**Harder:**

- **R1.1's letter is not satisfied.** One definition produces one view and *infers* the second.
  The intent (no drift, no second maintenance surface) holds. The PRD wording should be amended to
  say "one definition, from which both views derive" rather than "produces"; leaving it as-is means
  the PRD quietly disagrees with the code.
- **No SSR agent view.** The DOM must exist. The PRD already says "no server component", so this is
  documented rather than solved.
- **Rich content is inexpressible** until a describer exists. A chart's underlying data cannot be
  read from its DOM.
- Components must reflect meaningful state into attributes. This is already R3, but the serializer
  raises the cost of forgetting: unreflected state is invisible to agents.

**Follow-up:**

- Amend PRD R1.1 wording.
- Revisit the describer escape hatch when the first component with genuinely absent DOM appears
  (Table with virtualization is the likely trigger).
