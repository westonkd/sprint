# One formatter serves the render mode and the page tools

- **Status**: Accepted
- **Date**: 2026-08-22

## Context

R1.3 says the agent format is pluggable, so a consumer can swap the serialization without rewriting
components. It was only half true.

`SprintProvider`'s `format` prop reached exactly one consumer, `usePageTools`, which used it for
`list-page-regions` and `read-region`. The agent *render* mode never saw it: `AgentLine`,
`AgentControl`, and `Button`'s `execute` each imported `nodeLine` from `markdown.ts` directly. A
consumer passing `format` therefore changed what a tool returned about the page while the page
itself kept rendering Markdown, and the tool that reports a button's state after pressing it
disagreed with the line the button had just rendered. Three hardcoded call sites at one component;
every component added another.

Worse, `AgentText.tsx` had its own private `partLines()` alongside the shared `partLine()` in
`markdown.ts`, and the two did not agree. The shared one emits a part's label, state, and tool. The
private one emitted the label only. So a Dialog's close part would render as actionable in the human
view and as inert text in the agent view — a direct contradiction of the "two projections of one
value" guarantee in
[the render-mode ADR](20260822195730_agent_view_is_a_render_mode_not_only_a_dom_projection.md).

Nothing caught it. Button is a leaf with no parts, and `AgentText.tsx` was the only file under
`src/agent/view/` with no test file. The guarantee held by accident, for exactly as long as the
catalogue contained nothing with a part in it.

## Decision

**The formatter is a context value, resolved once per provider, and it is the only way an
`AgentNode` becomes text.**

- `SprintViewValue` carries `format: AgentFormatter`, defaulting to `defaultAgentFormat`
  (`toMarkdown`). `useAgentFormat()` reads it.
- `SprintProvider` resolves `format ?? inherited.format ?? defaultAgentFormat` once and puts the same
  function into the context and into `usePageTools`. There is no longer a second place that picks a
  default; `UsePageToolsOptions.format` is required.
- `AgentLine` and `AgentControl` call `useAgentFormat()` and indent its output by
  `useAgentDepth()`. `AgentControl` takes the first line as the control's text content and renders
  the rest as sibling text, which is what it already did — just no longer with its own idea of how a
  part is written.
- `Button.execute` reads the formatter from a ref, alongside the existing `onClickRef`, so the
  post-press report is in the consumer's format too.

**`AgentText`'s private `partLines()` is deleted.** Formatting a node is `markdown.ts`'s job, or the
consumer's. It is not something a render component reimplements.

Rejected: keeping `nodeLine` as a fast path for single-line components. It is exactly the shortcut
that produced the divergence, and "this component only ever renders one line" stops being true the
first time someone adds a part to it.

## Consequences

**Easier:**

- Swapping the serialization now changes the page, the tool results, and `read-region` together,
  which is what R1.3 was asking for.
- A part's state and tool survive into the agent view, so container and multi-part components can be
  written without discovering this first.
- One place to change when the format grows a feature.

**Harder, and these are real:**

- **A custom formatter now has more responsibility than it used to.** It is called per node in the
  render path, not only for whole-page reads, and its first line becomes a control's accessible
  name. A formatter that returns something unreadable degrades the DOM affordance, not just a tool
  response.
- **Formatting moved into render.** `AgentLine` calls the formatter on every render rather than
  concatenating a couple of strings. Negligible at Markdown, but a formatter doing real work is now
  on the render path and a consumer can make the page slow in a way they previously could not.
- **`(empty)` is still computed from `node.children`, which is always `[]` in render mode**, because
  children arrive through React rather than on the node. An unlabelled container therefore reads as
  empty when it is not. Not triggered by anything in the catalogue today — Button is a leaf, and a
  labelled container reads correctly — but it is the next thing of this shape to go wrong.

**Follow-up:**

- Decide, when the first container component lands, whether `AgentNode` needs a signal that React
  children exist, or whether containers are simply required to carry a label.
