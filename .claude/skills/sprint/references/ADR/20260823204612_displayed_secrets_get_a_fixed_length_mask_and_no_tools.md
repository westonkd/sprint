# Displayed secrets get a fixed-length mask and no tools

- **Status**: Accepted
- **Date**: 2026-08-23

## Context

The form ADR (20260823083431) established that secrets stay off the agent surface for *entry*:
a password TextInput publishes `filled`, never the value. The identity-service catalog needs
the display half: handing a person an API key, a recovery code, a signing secret. CodeBlock is
the wrong home because its content is `textContent`, which the agent view, the copy stream, and
`read-region` all consume.

## Decision

`SecretField` shows a secret the page holds, and the value reaches exactly two places: the
clipboard (the copy control) and the pixels while revealed. It never appears in agent
attributes, the agent view, tool results, or the agent view's copyable stream, in either
revealed state.

Three specifics:

- The mask is a fixed twelve bullets regardless of value length, so the mask leaks nothing,
  not even how long the secret is.
- Reveal and copy are human affordances with no WebMCP tools, and the component registers
  nothing. The test is what an agent gains: a reveal tool changes pixels the agent cannot see,
  and a copy tool writes a clipboard the agent does not hold. Both fail it. This follows the
  provider's view-copy precedent: controls that serve only humans get no tools and no agent
  controls.
- The agent view is a plain line carrying `filled` and `revealed`, so an agent can still tell
  the person "your key is on screen, revealed" without ever holding the key.

## Consequences

- An agent cannot exfiltrate a SecretField value through any Sprint surface; a consumer who
  wants an agent-readable value should use DescriptionList or CodeBlock instead, and the
  `whenNotToUse` copy points both ways.
- An agent also cannot help a user copy a key. That is deliberate; revisit only if a real
  workflow shows the human-affordance rule wrong here.
- `revealed` is published state, so a page-reading agent knows a secret is on screen. That is
  a feature (it can warn before screen-sharing) and the closest this component comes to a leak.
