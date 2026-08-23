# Panel labels join the heading outline through headingLevel

- **Status**: Accepted
- **Date**: 2026-08-22

## Context

Panel names its region with `aria-label` on a `section`, and Heading's guidance steered
authors away from putting a Heading inside a panel's header band. Both were reasonable on
their own, and together they produced documentation pages whose only heading was the h1:
every section of a workbench page is a Panel, so navigating by headings, the most common
screen-reader strategy, found nothing between the page title and the h3s inside Examples.

Landmark navigation worked the whole time. That is not enough, because heading navigation
is the strategy people actually reach for first.

## Decision

Panel takes an optional `headingLevel` (2, 3, or 4). When set, the label renders as the
matching heading element in the header band, styled exactly as before; when unset, the
label stays a `span` and the region participates only as a landmark.

The default stays span, because Panel cannot know its own outline depth and a wrong
heading level is worse than none. The rule for pages is the inverse of the default: every
panelled section of a page sets `headingLevel`, and only chrome, such as the workbench's
per-example preview frames, leaves it unset or nests deeper (the preview panels sit under
h3 example titles and use 4).

The workbench adopts it everywhere: top-level page panels at 2, the per-tool panels
inside "WebMCP tools" at 3, preview frames at 4.

## Consequences

A workbench page now has the outline it always looked like it had: h1 title, h2 sections,
h3 examples and tool names, h4 preview frames.

The agent view is unchanged. Outline depth is a human-navigation concern, and the agent
line already carries the label; nesting depth in the rendered text carries the structure.

The cost is a second way to put a heading on a page, and an author has to keep Panel
levels consistent with any bare Headings around them. The meta guidance on both
components says which to use where: Heading for titles that are not region labels, Panel
`headingLevel` for everything with a keyline around it.
