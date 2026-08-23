# Text entry renders a live field as its agent control

- **Status**: Accepted
- **Date**: 2026-08-23
- **Extends**: 20260822220043_agent_controls_are_one_per_actionable_part_and_layout_renders_none.md

## Context

The agent-view control rule to date says an actionable component renders a control *whose text
content is its own Markdown line* — a `<button>` or an `<a>`. That works because every actionable
component so far is activated, not edited: pressing, selecting, opening. A text field breaks the
rule at its foundation. An agent without WebMCP drives the DOM, and there is nothing it can type
into if the only element on offer is a button. Rendering no control would make text entry the one
capability that silently requires Chrome 149, which contradicts the principle that everything must
work without WebMCP.

The competing constraint is the text stream. The agent view is a readable Markdown stream, and the
provider's copy control copies the container's `textContent` verbatim. Any element a text-entry
component adds must not corrupt that stream.

## Decision

A new agent-view primitive, `AgentFieldControl`, joins `AgentLine`, `AgentControl`, and
`AgentControlGroup`. It renders the node's formatted lines as plain text — so the stream still
carries the field's identity, state, and current value — followed by exactly one live form element
(`<input>` or `<textarea>`) carrying `data-sprint-agent` and `data-sprint-tool`, labelled via
`aria-label` from the node's label, with its value synced both ways to the component's controlled
value.

This works with the stream rather than against it because a form element's value is not part of
`textContent`. The copied stream is identical with or without the control; the element is pure
affordance, exactly like the buttons `AgentControl` renders, and `agentControls="never"` removes it
the same way.

Masked fields render the live control with `type="password"` so a shoulder-surfing human is no
worse off in agent view than in human view.

## Consequences

- The control rule generalises from "a control whose text content is its Markdown line" to "one
  control per actionable part, contributing nothing to the stream beyond the node's own lines."
  Buttons satisfy this by *being* the line; fields satisfy it by contributing no text at all.
- A DOM-driving agent fills a field in agent view by targeting `[data-sprint-tool="fill-…"]` and
  typing, the same selector shape it uses for every other control.
- The human-view `<input>` carries `data-sprint-part="input"` per the attribute contract, but the
  node itself holds no `input` part; serialising the human DOM will therefore show an `input` part
  line the agent render does not emit. Accepted: the part exists only as a DOM addressing hook,
  and inventing a part line with nothing to say would pad every field's agent text.
- The philosophy guide's description of agent controls needs its one-control wording updated.
