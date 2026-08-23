# Agent controls are one per actionable part, and layout renders none

- **Status**: Accepted
- **Date**: 2026-08-22
- **Amends**: 20260822195730_agent_view_is_a_render_mode_not_only_a_dom_projection.md

## Context

R1.1c says a component in agent view renders **zero elements unless it is interactive,
then exactly one**. That was written against Button, which has one action.

Two components broke it in opposite directions.

**SegmentedControl** has one action but several targets. One control cannot express
choosing between three options; an agent driving the DOM needs something to click *per
option*. Making the group's single button cycle would be a fiction no agent would guess.

**Stack** is interactive-adjacent and means nothing. Under the old rule it renders zero
elements, which is right, but it still emitted a Markdown line and pushed a depth level,
so a page wrapped in three Stacks indented its real content three levels and told an
agent nothing in exchange.

## Decision

The rule becomes: **a component renders one control per addressable part that can be
acted on right now, and no elements otherwise.** For a component with a single action the
part is the component, so Button is unchanged.

`AgentControlGroup` implements it: the node's own line renders as text, and each
actionable part's line renders inside a real `<button>` carrying `data-sprint-agent` and
`data-sprint-part`. The lines still come from `useAgentFormat()`, so the one-formatter
rule holds.

Control count and tool count are decoupled. SegmentedControl renders one control per
option and registers one tool with an enum. Elements serve agents without WebMCP; tools
serve agents with it; they are sized by different pressures.

Separately: **a component that carries no meaning renders nothing at all in agent view,
not even a line.** Stack returns its children and no depth provider. Panel does render a
line, because a labelled region tells an agent what the things inside it have to do with
each other. The test is whether deleting the component would lose an agent anything.

## Consequences

Multi-target components are now expressible, which unblocks the tab strips, radio groups,
and toolbars the catalog will need.

The agent view of a real page got substantially shorter and flatter, because layout
wrappers are free.

The cost: "one element" was a rule you could check by looking. "One per actionable part"
requires knowing which parts are actionable, and a component author can get it wrong in a
way no test catches automatically. Each component's own test asserts its control count.

`agentPartAttributesFor` was fixed while doing this. It emitted `data-sprint` alongside
`data-sprint-part`, which made the serializer classify every part as a nested component
root. Nothing used it yet, so nothing broke; it now emits the part attributes only.
