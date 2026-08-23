# Landmarks are distinct components, not a polymorphic region

- **Status**: Accepted
- **Date**: 2026-08-22

## Context

Stack and Panel covered arrangement and labelled regions, but a full semantic page also
needs landmarks: a navigation rail, the main/complementary split, a page title block.
The workbench proved the gap by hand-writing exactly that markup (`<aside>`, `<nav
aria-label>`, `<main>`, a repeated `doc-head` header) under the "app shell" carve-out in
CLAUDE.md, and a `nav-label` class was quietly doing the job of a missing component.

Two shapes were on the table: one polymorphic `Region as="nav|aside|main|header"`
component, or distinct components per landmark. A polymorphic Region concentrates every
landmark's branching into one file: each `as` value wants different agent-view
behaviour, different props, and different chrome, so the component becomes a stack of
prop-driven if/else blocks, and its meta.ts has to document a union of unrelated
surfaces.

## Decision

Ship distinct components, each with one job and one agent-view behaviour:

- **Nav** — a labelled `<nav>` landmark. Emits one line in agent view (like Panel: the
  label says what the links inside are for), and styles descendant Links as a rail.
- **NavGroup** — a labelled cluster inside a Nav (`role="group"`). One line, children
  nested.
- **Shell** — the sidebar-plus-main frame. Owns the landmark wiring (`<aside>`,
  `<main>`), the skip-to-content control (focus-based, so it survives hash routing),
  and the mobile drawer with its menu button. Silent in agent view, like Stack: it
  renders bar, side, and children in reading order and no frame, because its regions
  speak for themselves.
- **PageHeader** — the page's h1, Tag chips, an optional page-level control, and the
  lede. One line in agent view, children nested.

The dividing rule is unchanged from the Stack/Panel decision: a component emits an
agent-view line when its label carries meaning an agent would lose (Nav, NavGroup,
PageHeader), and nothing when it is pure arrangement (Shell). Internal structure is raw
elements styled through the component's own attribute selectors, following Panel, so
the DOM projection and the agent render keep agreeing; reuse happens at the composition
level (Shell embeds Button for its drawer toggle, the workbench composes all four).

## Consequences

- The workbench app shell shrinks to a routing switch and a brand link; the CLAUDE.md
  carve-out for hand-written `aside`/`nav`/`main` markup is obsolete and the philosophy
  guide's user-facing half needs no change (the decision extends, rather than revises,
  the recorded agent-view rules).
- Consumers get landmarks, a skip link, and drawer behaviour without wiring; a page can
  now be built to the document-outline and landmark floor out of the box.
- Four new manifest entries instead of one, which is the intended pressure: each one
  documents a single surface.
- Shell has no label anywhere, but the DOM projection of a human-mode page derives
  labels from stray text, so a serialized Shell can pick up its skip-control text as a
  junk label. Tolerated for now; a serializer heuristic for label-less frames is
  follow-up work if it bothers a real agent.
