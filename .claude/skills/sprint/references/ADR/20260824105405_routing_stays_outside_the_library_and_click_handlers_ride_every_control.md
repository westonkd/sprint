# Routing stays outside the library and click handlers ride every control

- **Status**: Accepted
- **Date**: 2026-08-24

## Context

The question of shipping a client-side router came up. Three earlier decisions already lean
against it: the PRD's non-goals say Sprint is not a framework and v1 bets on depth over
breadth; the tool-registration ADR settled navigation on URLs (`data-sprint-href` publishes
the destination, `Link` registers no tool); and the workbench ADR kept "the grid, the
sidebar, the route" in `dev/` because app chrome is not part of the library.

Compatibility with an external router was mostly there but had two gaps. The standard
integration pattern is an `onClick` that calls `preventDefault()` and hands the href to the
router, with the real `href` kept on the anchor so the agent contract stays truthful. `Link`
supported this in human view but dropped the consumer's `onClick` from its agent-view
`AgentControl`, so an agent's click was a full page load. `Card` blocked it outright: its
`onClick` was typed `() => void` with no event, and was discarded entirely whenever `href`
was set.

## Decision

Sprint does not ship a router. Navigation state reaches components as controlled props
(`Link`'s `active`), destinations are real URLs on real anchors, and the router is the
consumer's.

In exchange, every control a component renders honours the consumer's click handler, in both
views:

- `Card`'s `onClick` takes the real DOM event (`MouseEventHandler<HTMLElement>`) and
  coexists with `href`: alone it makes the card an acting button, alongside `href` the card
  stays a link and the handler rides the anchor.
- `Link` and `Card` pass `onClick` through to their agent-view `AgentControl`, whose props
  now admit anchor handlers as well as button handlers.
- Tool `execute` already drives the DOM with `element.click()`, so a tool invocation flows
  through the intercepted handler and hence through the router. This falls out of the
  existing design rather than being new mechanism.

Card's tool default is unchanged: `href` present means no tool, `agentTool` opts in.

## Consequences

- React Router and its peers integrate with the documented pattern and no wrapper
  components. Human clicks, agent-view clicks, and tool invocations all take the same path.
- The escape hatch for deeper integration (a consumer-built `RouterLink` with the full agent
  contract) remains the exported primitives: `buildAgentNode`, `agentAttributesFor`,
  `useAgentTool`, and the `AgentControl` family.
- `AgentControlProps` widened its `onClick` to a union of anchor and button handlers, which
  is loose by construction; a discriminated union over `as` would be tighter if the type
  grows another variant.
- Anyone proposing a router, scroll restoration, or route announcements later starts from
  this ADR: those belong to the app, and Sprint's job is to not fight them.
