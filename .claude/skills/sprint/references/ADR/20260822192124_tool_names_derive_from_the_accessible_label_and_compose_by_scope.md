# Tool names derive from the accessible label and compose by scope

- **Status**: Accepted
- **Date**: 2026-08-22

## Context

R2.3 requires that multiple instances of a component on one page be separately addressable. A tool's
name plus description is the entire prompt the model gets, so `button-3` is worse than useless, but
requiring authors to hand-name every tool contradicts the PRD goal that "adopting Sprint requires no
agent-specific work from the app developer."

An earlier proposal was opt-in-by-labeling: register a tool only when the author passes a semantic
label prop. That was rejected. It makes agent-operability per-instance work, and the failure is
*silent* — the author gets a working button and no tool, with nothing indicating why.

## Decision

**The accessible label already is the semantic label.** `<Button>Prepare launch</Button>` registers
`press-prepare-launch` with no extra author work.

**Addressability comes from composition, not from a per-instance prop.** A scope context
(`src/agent/webmcp/scope.ts`) contributes path segments, so two "Save" buttons under
`<AgentRegion label="Billing">` and `<AgentRegion label="Shipping">` become `billing-press-save` and
`shipping-press-save` for free. DESIGN.md rule 4 ("everything is labeled") already puts that label
on screen. The scope context was built now, while no container components exist, specifically to
avoid a rewrite at Dialog and Form time.

The convention is `<scope>-<verb>-<label-slug>`, published in the manifest as `toolNaming`.

Escape hatches: `agentName` overrides the derived label; `agentTool={false}` opts out entirely.

### Label resolution

`agentName` wins. Otherwise, string children are used directly. Otherwise the label is read from the
rendered DOM via `accessibleText`, in a layout effect. That third path matters:
`<Button><Icon/><span>Prepare launch</span></Button>` is a common shape and would otherwise get no
tool. It costs one extra render on mount.

### Collisions register neither claimant

When two components resolve to the same name, **neither registers a tool** and a warning names the
conflict. The rejected alternatives:

- *Silent numeric suffixing* reintroduces `button-3`.
- *First-wins* is mount-order-dependent, and hands the agent a tool that presses an arbitrary one of
  two identical controls. Silently pressing the wrong button is worse than pressing nothing.

If a name is ambiguous to a machine it is ambiguous to a human, so this fails loud. Implementing it
required the claim table to be a subscribable store rather than a counter: the incumbent has already
registered by the time the second claimant arrives, so it must be notified to withdraw. When the
colliding sibling unmounts, the survivor's tool comes back automatically.

### Contextual registration

Per R2.10, a Button registers nothing while `disabled` or `loading`, and re-registers when it
recovers. An agent therefore cannot double-submit a form whose button has entered a loading state.

## Consequences

**Easier:**

- Tool names read like intent: `billing-press-save`, not `button-3`.
- Zero author work in the common case, which is what the PRD goal requires.
- Nested scopes compose without any component knowing about its ancestors.

**Harder:**

- **A label carrying changing state churns the tool name.** `<Button>Increment ({count})</Button>`
  renames its tool on every click, unregistering and re-registering, and staling any name the agent
  already holds. This surfaced immediately in the workbench. `agentName` is the fix, and it is now
  documented in Button's `agentName` prop description and demonstrated as its own manifest example.
  It remains a real footgun that a future lint rule could catch.
- **Names are capped at 48 characters.** The first implementation truncated the joined name, which
  building the docs site immediately proved wrong: scoping an example by its title produced
  `disambiguating-two-identical-labels-billing-pres`, cut mid-word, and two long scopes could
  truncate to the same string and then collide — costing *both* their tools.

  **Amended the same day**: overflow now drops scope segments from the outermost inward, keeping
  `<verb>-<label>` intact, because the outermost scope is the least identifying part. Only if the
  verb and label alone still overflow is the name cut, and then on a separator rather than mid-word.
  A dropped scope segment can still cause a collision, but the collision handler catches that and
  the surviving name stays readable, which truncation did not.
- **Localized labels produce localized tool names.** A page in French exposes French tool names.
  Not addressed; `agentName` is the workaround.
- The claim table is module-global, so tests must call `__resetToolNames()`.

### The default-on risk, and its tripwire

Registering a tool for every Button is the right default per the PRD goal, but pressing a button is
also the one thing an agent can already do by clicking. The high-value tools are semantic
(`submit-support-request`) and belong on composed components, not primitives. A dense page could
flood the tool list and depress agent success rates.

**Tripwire: if a realistic page exceeds roughly 15 registered tools, revisit and consider flipping
Button to opt-in.** Better to have the threshold written down now than to discover it at component
eight.

### StrictMode

React 19 double-invokes effects (setup → cleanup → setup). Claiming a name during *render* would
make the second mount collide with itself and silently lose the tool. Claims therefore happen in the
effect body and release in its cleanup, never during render. There is an explicit StrictMode test,
and the dev workbench runs in StrictMode, so this is verified in both places.
