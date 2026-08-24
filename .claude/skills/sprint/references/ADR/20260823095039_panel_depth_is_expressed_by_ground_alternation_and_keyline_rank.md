# Panel depth is expressed by ground alternation and keyline rank

- **Status**: Accepted
- **Date**: 2026-08-23

## Context

Nested panels rendered identically at every depth: the same raised ground, the same keyline
weight, the same full-width inset header band. Three levels of nesting (a guide page framing a
preview framing a form) produced three concentric, visually equal frames, and a reader had to
count borders to know where they were. Panel's own `whenNotToUse` admitted this by forbidding
nesting past two deep "or the keylines stop meaning anything."

DESIGN.md rule 1 already names the mechanism the system uses for depth: stacking opaque planes
and keyline weight, never lighting. The panels were simply not using it.

The constraint from the agent side: none of this may touch the agent contract. WebMCP scope comes
from `AgentRegion` and `SprintProvider`, not from Panel, and the agent view expresses depth
through `AgentLine`'s depth context. What must survive is `data-sprint="Panel"` on the root and a
visible label, because tool naming leans on DESIGN.md rule 4 ("everything is labeled") to derive
names from what is already on screen.

## Decision

Depth styles itself in CSS, keyed off panel-within-panel nesting selectors. No new props, no
depth context in the human view, no change to the rendered DOM.

- **Ground alternation.** A panel's field is `--sprint-panel-ground`, raised at the top level and
  alternating with inset at every nesting step, without limit. Chained descendant selectors
  cannot alternate indefinitely (and the workbench already mounts specimens two panels deep, so a
  fixed chain visibly ran out inside the docs); instead each panel publishes its ground as
  `--sprint-panel-ground-role` and a `@container style()` query reads the parent's role to take
  the opposite one. Browsers without style queries fall back to every panel raised, keeping the
  keyline rank and header demotion, which still separate the levels. The empty-state label patch
  uses the same ground variable so it always knocks out the hatching in the panel's own field.
- **Keyline rank.** The outermost panel carries a doubled keyline: its border plus a 1px outline
  offset 2px, the "1px, sometimes doubled with a gap" frame from DESIGN.md. Nested panels drop
  the outline; depth two and beyond demotes its border to a new `--sprint-keyline-muted` token
  (panel-300 dark, paper-200 light).
- **Header demotion.** Only the top-level panel keeps the inset header band. Nested headers go
  transparent and their bottom rule turns dashed, keeping the label without repeating the
  full-width band that made stacked headers read as noise.

Alternatives considered: corner ticks instead of a full box at depth two or more (kept in reserve
as a possible `frame` variant; more implementation surface for the same signal), and a
manifest-style scope path in the header (rejected for now because Panel does not join the WebMCP
scope, so the breadcrumb would show a path that tool names do not use; merging Panel and
`AgentRegion` is a separate decision).

## Consequences

**Easier:**

- Nesting to three deep is legible without counting borders, so the `whenNotToUse` prohibition
  relaxes to guidance.
- Consumers get the treatment for free; there is no API to hold wrong.

**Harder:**

- The doubled keyline is an `outline`, which draws 3px outside the border and does not reserve
  layout space. A top-level panel flush against an `overflow: hidden` edge will have its outer
  line clipped; containers need that much breathing room, which the workbench's padding already
  provides.
- `--sprint-panel-ground` and `--sprint-keyline-muted` join the token contract, with the renaming
  cost that implies.
- Depth is derived from the DOM, so a consumer portalling a panel's children re-enters at depth
  zero. Acceptable: a portal is a new surface.
- `@container style()` is the newest CSS this library uses. If a supported browser ever
  misbehaves here, the fallback is the fixed selector chain this replaced, at the cost of
  alternation stopping at a hard depth.
