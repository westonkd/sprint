# Tool specs are declared once and shared by runtime and manifest

- **Status**: Accepted
- **Date**: 2026-08-22

## Context

`agent-manifest.json` is design-time documentation; WebMCP tools are a runtime capability. The
obvious way to document tools in the manifest is a hand-written `tools` block in `meta.ts`. That is
a trap: it would be a design-time *description* of runtime behavior, maintained separately from the
descriptor actually registered, and it would drift. Drift between what a component claims and what
it does is the precise failure this project exists to prevent.

Related: `execute` must report something useful, and the platform caps output at 1.5K, descriptions
at 500 characters, and parameter descriptions at 150.

## Decision

**One `AgentToolSpec`, two consumers.** `src/components/Button/tool.ts` exports `PRESS_TOOL`, fully
JSON-serializable:

```ts
interface AgentToolSpec {
  verb: string;
  description: string;
  inputSchema: JsonSchemaObject;
  readOnly: boolean;
  untrustedContent: boolean;
  registeredWhen: string;
  unregisteredWhen?: string;
}
```

`meta.ts` embeds it, so it serializes into the manifest. `useAgentTool` consumes it and adds only
`name` (scope + verb + label) and `execute`. Drift is impossible by construction rather than
discouraged by convention. `catalog.test.ts` asserts the invariants across every registered
component: description lengths within platform limits, every `required` key declared in
`properties`, and clean JSON round-tripping.

`registeredWhen` / `unregisteredWhen` are prose, because R2.10's conditional registration is
otherwise invisible to a reader of the manifest. An agent reading the manifest learns that a
Button's press tool disappears while loading.

### `execute` calls `element.click()`

Not the `onClick` prop. This makes R2.4 ("same code path as the human interaction, no parallel
logic") true by construction rather than by discipline: it dispatches a real click, respects
`disabled`, bubbles to parent listeners, and submits an enclosing form. All three are tested,
including that a *parent* element's listener fires.

### `execute` returns the resulting state

The tool returns the component's own serialized subtree after the press, so the agent closes the
loop without a follow-up read. This needs an explicit commit barrier: `setState` is batched, so a
naive implementation serializes pre-action DOM and reports it as the result — silently, plausibly,
and wrongly. `afterCommit()` (double `requestAnimationFrame`, `setTimeout` fallback) sits between
the click and the read, and a test asserts a handler that sets `loading` produces a result
mentioning loading.

Async work started by the press is **not** awaited. The result describes the loading state, which is
honest and more useful than a hang.

Only the component's own subtree is serialized, never the page. A Button is about 100 bytes; a page
is not 1.5K. For more, the agent calls `read-region`.

### Platform limits are enforced in the adapter

R2.12 already requires a single `document.modelContext` call site, so `src/agent/webmcp/adapter.ts`
is also where output truncation, input validation, and error formatting happen once for every tool.

- Over-long descriptions **throw at registration**, not at call time. They are programming errors and
  should fail where the mistake is.
- Over-long output is clamped with a visible marker.
- A throwing `execute` **resolves to a descriptive string** rather than rejecting, so the model can
  read the failure and self-correct.
- Inputs are validated against the schema before `execute` runs, with messages that name the
  offending parameter and list the valid ones (R2.11).

### Annotations

Anything returning serialized DOM sets `untrustedContentHint: true`, because the DOM contains
consumer and end-user content. Button's press tool is `readOnlyHint: false`; both page tools are
`readOnlyHint: true`.

## Consequences

**Easier:**

- The manifest documents the runtime tool surface accurately, for free.
- Every tool gets validation, clamping, and error formatting without opting in.
- A component author writes one spec object and one `execute`.

**Harder:**

- `AgentToolSpec` overlaps `AgentActionSpec`, which predates it and describes click-driven
  affordances by selector. Both are kept for now; the overlap is real and should be resolved once a
  second component exists and the shape of the redundancy is clear.
- `execute` returning post-action state means every tool call pays a two-frame delay. Imperceptible
  for a press, worth re-examining for a high-frequency tool.
- The 1.5K clamp is enforced but a component returning near-limit output will be truncated
  mid-structure. The page tools paginate instead; component tools do not.
