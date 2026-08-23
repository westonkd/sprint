# Agent view is a render mode, not only a DOM projection

- **Status**: Accepted
- **Date**: 2026-08-22
- **Supersedes**: [20260822192124_agent_view_is_a_dom_projection_not_a_second_render_path.md](20260822192124_agent_view_is_a_dom_projection_not_a_second_render_path.md)
- **Amended by**: [20260822220043_agent_controls_are_one_per_actionable_part_and_layout_renders_none.md](20260822220043_agent_controls_are_one_per_actionable_part_and_layout_renders_none.md) — "exactly one control" became one per actionable part, and layout components now render no line at all.

## Context

The superseded ADR rejected a render-mode switch, arguing that flipping a subtree into agent mode
would unmount it, fire every `AbortController`, and unregister every tool the subtree had
registered — so reading the page would destroy the ability to act on it.

**That argument was wrong.** It describes what happens when a *parent* swaps one component type for
another. It does not describe a component that branches on mode inside its own body: React
reconciles the same element type at the same position, the component instance is preserved, hooks
keep their state, and effects do not re-run. `useAgentTool`'s registration effect depends on
`[held, resolved, spec]`, none of which change when the view flips. The tool survives.

A test now asserts exactly this: flipping human → agent → human leaves `mock.history` at length 1,
meaning one registration and zero re-registrations.

The second thing the superseded ADR got wrong was scope. It treated "the agent view" as something
an agent reads *about* the page. The intended design is that the agent view is what the page *is*
while in that mode: components render as plain text, so any agent — including one with no WebMCP,
looking at the DOM or a screenshot — gets a document instead of a widget tree.

## Decision

**The agent view is a render mode held as state by a containing component**, toggled either way.
`SprintProvider` owns it (`view`, `defaultView`, `onViewChange`, plus a `set-page-view` WebMCP tool),
and `useSprintView()` reads it.

**In agent mode a component renders zero elements unless it is interactive, then exactly one.**

A first pass rendered pure text for everything, which produced a page an agent could read and could
not touch — a dead end for exactly the agents agent view exists to serve, since anything outside
Chrome 149 has no WebMCP either. WebMCP *does* allow interaction with no elements at all (`execute`
is just a function), so pure text is sufficient for a WebMCP agent. It is not sufficient for a
Playwright, vision, or Firefox agent.

Feature-detecting `document.modelContext` and stripping controls when it exists was considered and
rejected: the API being present does not mean the agent is using it, and a DOM-driving agent in
Chrome 149 would find its affordances removed. Sprint cannot detect how it is being driven.

So the rule is:

- **Non-interactive component** → zero elements. `AgentLine` emits a string and a depth context
  provider; neither produces DOM.
- **Interactive component** → exactly one element, `AgentControl`, whose text content *is* the
  Markdown line. A `<button>` for Button, an `<a>` for a future Link. It carries
  `data-sprint-agent="<Component>"` and `data-sprint-tool="<name>"` so an agent can select it, and a
  zero-specificity reset strips all UA styling so it reads as plain text.
- A component that is not currently actionable (disabled, loading) renders as text, because there is
  nothing to act on.
- `agentControls="never"` on the provider opts out entirely for a consumer who knows their agent is
  WebMCP-only and wants literally zero markup.

A Sprint subtree in agent view therefore contains at most one element per interactive component and
nothing else. Its `textContent` is the Markdown either way. Verified in the browser, not only jsdom.

**This restores R2.4.** With a real element present, `execute` calls `element.click()` again — a
genuine event, genuine bubbling, genuine synchronous flush. The direct-handler path below is now a
fallback for `agentControls="never"`, not the primary route.

### One node, two renderings

Both modes read a single `AgentNode` built once per render by `buildAgentNode()`:

- **human** — `agentAttributesFor(node)` spreads `data-sprint*` onto the real element.
- **agent** — `<AgentLine node={node} />` formats the same object as Markdown.

This is what R1.1 asked for literally, and it is stronger than either option originally considered.
The DOM attributes and the agent text are not merely consistent by discipline; they are two
projections of one value computed in one place. A state that reaches the attributes reaches the text
automatically, and vice versa.

**Both renderings are never in the DOM at once.** Rendering both and hiding one was considered and
rejected: it would *add* markup rather than remove it, double the DOM, expose hidden text to screen
readers without `aria-hidden`, and show a DOM-scraping agent two copies of every component.

### The DOM projection survives, with a narrower job

`serializeElement` / `serializeWithin` are unchanged and still used for:

- reading a page that is in **human** mode (`read-region`, `list-page-regions`)
- the state a tool reports after acting in human mode

Because attributes are generated from the node and the serializer reads those attributes, the
projection and the agent render agree by construction. In agent mode the serializer finds no
`[data-sprint]` roots, so the page tools switch to reading the text directly, where the whole page is
a single region named `page`.

## Consequences

**Easier:**

- An agent that cannot call tools — vision-based, DOM-scraping, or in any non-Chrome browser — gets a
  clean text document by flipping one flag.
- Drift between the two renderings is structurally impossible rather than merely tested.
- No serializer round-trip in agent mode: the component states its own identity directly, so nothing
  has to be inferred from attributes.

**Harder, and these are real:**

- **Under `agentControls="never"` there is nothing to click**, so the press tool calls `onClick`
  directly with a synthetic `MouseEvent`. A handler depending on a genuine React synthetic event
  (`preventDefault`, `currentTarget`) will not get one. This is the opt-out path only; the default
  renders a real control and dispatches a real click.
- **"No element" and "unmounted" are different things**, and conflating them produced a wrong
  message: pressing a button that then enters `loading` swaps its control for text, and the tool
  reported "the press removed this button from the page." It had not. Button now tracks mount state
  in a ref and only claims removal when the component genuinely unmounted.
- **The control's accessible name is its whole Markdown line**, which is verbose for a screen reader.
  Acceptable in a mode a human is not expected to be in, but it is a reason not to leave a page in
  agent view for human traffic.
- **Direct handler calls do not flush synchronously.** A real `element.click()` is a discrete event
  and React flushes before it returns, which is why the human path could read post-action state.
  Calling a handler directly schedules an async render, so the tool read stale state. Both the
  handler call and `setView` now go through `commitSync` (`flushSync`), which introduces the
  library's first `react-dom` import — previously only `react` was imported. `react-dom` was already
  a peer dependency and stays external, but Sprint is now explicitly DOM-only.
- **Consumer markup is untouched.** Agent mode strips *Sprint* elements. The application's own
  wrappers, layout divs, and text remain. "No HTML in agent view" is a property of Sprint components,
  not of the page.
- **Nested provider ownership needed a real signal.** Detecting the root provider by an empty scope
  path was wrong: an unlabeled outer provider leaves the path empty, so a nested provider also looked
  like the root and owned its own view state. The view context now carries an `owned` flag.
- Agent mode loses per-region addressing, since there are no component roots to key on. One region
  named `page` is the honest substitute.

## Follow-up

- Container components (Dialog, Panel, Table) need to render their children in agent mode with
  correct nesting. `AgentLine` already provides a depth context for this, but no component exercises
  it yet — Button is a leaf.
- Decide whether agent mode should be discoverable without WebMCP, for example via a URL parameter,
  so a vision-only agent can request it.
