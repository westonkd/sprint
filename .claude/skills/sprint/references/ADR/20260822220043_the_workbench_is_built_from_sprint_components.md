# The workbench is built from Sprint components

- **Status**: Accepted
- **Date**: 2026-08-22

## Context

The workbench generated every component page from the registry, but rendered them with
hand-written `div`s and 500 lines of `dev/workbench.css`. The documentation for an
agent-forward library was not itself agent-readable: switching a page to agent view
produced a few Markdown lines for the specimens, surrounded by an ordinary DOM nobody
could read as text.

That also meant the library was being designed against exactly one consumer, Button, and
Button is the easiest possible case: one action, no data, no parts, no layout.

The PRD phases the Chrome 149 spike as the gate before catalog breadth, and names a text
input and a state-carrying container as components two and three. This decision runs
ahead of that gate deliberately.

## Decision

The workbench is an application built out of Sprint, and the catalog grows to whatever
that application needs. Eleven components landed at once for it: Stack, Panel, Heading,
Text, Tag, Table, List, CodeBlock, SegmentedControl, Link, and Card.

The rule going forward: no hand-written markup in `dev/` where a component could exist.
`dev/` may keep the app shell (the grid, the sidebar, the route), because a documentation
site's chrome is not part of the library.

The page-level view switch drives the root `SprintProvider`, so flipping it renders the
entire documentation page as text, not only its specimens.

Phasing is now: build what the workbench needs, then spike Chrome 149, then breadth.

## Consequences

The library gets a demanding first consumer, and it paid immediately. Three decisions
below exist only because a documentation page needed them: the tool-registration rule, the
per-part control rule, and the data-in-props rule. Button could not have surfaced any of
them.

Documentation cannot rot in the direction that matters most: a component that renders
badly in agent view now makes the docs themselves unreadable.

The cost is real and stated in the philosophy guide. Ten components now depend on a
descriptor shape no browser has accepted, so the Chrome 149 spike, when it runs, can
invalidate more than it would have a day ago. The mitigation is that every WebMCP call
still goes through the single adapter, so a shape change is one file plus whatever the
tests say.

`dev/lib/highlight.ts` moved into `src/components/CodeBlock/`, because the syntax
highlighter is now library code.
