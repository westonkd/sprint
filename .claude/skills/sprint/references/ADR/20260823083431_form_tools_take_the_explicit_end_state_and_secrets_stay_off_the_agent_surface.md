# Form tools take the explicit end state and secrets stay off the agent surface

- **Status**: Accepted
- **Date**: 2026-08-23

## Context

The first form components (TextInput, Textarea, Select, Checkbox, Switch) need tool shapes. Two
tempting shapes fail R2.8's rule that a model should never have to transform or compute an
argument: a `toggle` tool with no input forces the agent to read current state, negate it, and
hope nothing changed in between; an `append`-style text tool forces it to reconstruct the final
string from a value it may hold stale. Both turn every call into a read-modify-write.

Separately, a text field's value is agent-visible three ways — the `data-sprint-value` attribute,
the agent-view Markdown line, and every tool result that returns formatted state. A password
typed by a person would leak through all three, and the provider's copy control would put it on
the clipboard.

This slice is also PRD phase 6's churn question: does per-keystroke state destabilise tool
registration?

## Decision

Every state-writing form tool takes the explicit end state and replaces, never mutates:

- `fill` takes `{ value }`, the full text the field should contain. Empty string clears.
- `select` takes `{ option }` by visible label, with the current labels as an enum, exactly as
  SegmentedControl established.
- `set` takes `{ checked }` (Checkbox) or `{ on }` (Switch) as a boolean. Setting the state it
  already has is a success, not an error.

Calls are therefore idempotent and safe to retry, and the result text returns the component's
formatted state so a follow-up read is unnecessary.

Masked fields (`type="password"`) never reflect their value on any agent surface. State carries
`filled` or `empty` instead of `value`, which flows identically into the DOM attributes, the
agent-view line, and tool results, because all three project from the same node. The `fill` tool
still works; it is write-only.

## Consequences

- No registration churn under typing: `useAgentTool` re-registers only on name, spec, or schema
  change, and a field's value is in none of them. A keystroke updates `data-sprint-value` and the
  agent line but touches no tool. Phase 6's open question is answered by construction, and
  TextInput's tests pin it.
- An agent can drive a form with no reads between writes.
- `set` on a toggle means Checkbox and Switch tool names collide when their labels match
  (`set-subscribe`); the existing claim machinery already surfaces that, and `agentName` resolves
  it.
- A component cannot opt a password field into value reflection; consumers who want a visible
  secret can use `type="text"` and own the consequence.
