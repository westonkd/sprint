# The agent-view text container lives in SprintProvider

- **Status**: Accepted
- **Date**: 2026-08-22

## Context

A subtree rendered in agent view is a stream of newline-terminated text with no element
holding it, so without consumer CSS it collapses into one unreadable line. Every
consumer flipping a whole page to agent view had to discover and rebuild the same
`white-space: pre-wrap` wrapper; the knowledge lived only in the workbench's app CSS
(`.app[data-view="agent"]` and `.stage.as-text`).

Candidate homes were a new `Page` catalog component, `SprintProvider`, or the status
quo. A Page component's human-view payload is one line of CSS (max-width and centered
margins), it would be the first catalog component to emit a non-control element in
agent view, and it adds a seventeenth manifest entry that dense apps would never mount.

## Decision

`SprintProvider` always renders exactly one `<div data-sprint-view="human|agent">`
around its subtree. In human view it is `display: contents`, so it can never affect a
consumer's layout. In agent view it is the text surface: block, `pre-wrap`,
`overflow-wrap: anywhere`, mono.

The container is rendered in **both** views rather than only in agent view because a
conditional wrapper changes the children's position in the tree, and React remounts on
that. The docs promise that flipping the view re-renders without unmounting — local
state and WebMCP registrations survive — and an always-present element is what keeps
that promise cheap. The provider's old "no wrapper element" test is superseded by
"layout-neutral container" plus an explicit no-remount test.

`data-sprint-view` joins the attribute conventions in `src/agent/attributes.ts` and the
public exports. It is provider chrome, not a component root: it carries no
`data-sprint`, so the serializer walks straight through it.

No `Page` component ships. The workbench's `.doc` reading column stays two lines of app
CSS until a second consumer pattern demands a reading-width component.

## Consequences

- Full-page agent view is readable with zero consumer CSS, in any app, including every
  nested provider (the workbench's preview stages inherit it for free).
- The rule "components render no elements in agent view except controls" keeps its only
  exception outside the catalog, in mandatory chrome an agent never reasons about.
- Consumers gain a stable styling hook (`[data-sprint-view="agent"]`) for presentation
  choices like text size or ink, which is what the workbench now uses its own CSS for.
- `display: contents` strips the container from the accessibility tree in human view,
  which is the intent; anyone spelunking the DOM will find one more div per provider.
