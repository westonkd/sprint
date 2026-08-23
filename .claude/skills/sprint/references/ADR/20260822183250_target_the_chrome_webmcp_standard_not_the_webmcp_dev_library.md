# Target the Chrome WebMCP standard, not the webmcp.dev library

- **Status**: Accepted
- **Date**: 2026-08-22

## Context

"WebMCP" names two unrelated things, and Sprint's entire runtime agent surface depends on which
one it means.

1. **https://webmcp.dev/** — a third-party drop-in JavaScript library. You include a script, do
   `new WebMCP({...})`, and call `mcp.registerTool(name, description, schema, handler)`, plus
   `registerPrompt` and `registerResource`. It renders its own connection widget into the page.
   Works in any browser today because it is just a library.
2. **The web platform standard** — incubated at
   https://github.com/webmachinelearning/webmcp, shipping behind an origin trial in Chrome 149,
   documented at https://developer.chrome.com/docs/ai/webmcp. The page registers tools with the
   browser itself through `document.modelContext`; the browser mediates between the page and
   whatever agent the user has connected.

The first draft of the PRD cited the webmcp.dev URL and flagged the ambiguity as the phase-1
blocker for all of R2. The user has since clarified: Sprint targets the standard.

The two are not interchangeable. They differ in entry point (`document.modelContext` vs. a library
instance), descriptor shape, lifecycle (`AbortController` signal vs. library-managed), trust model
(browser-mediated, origin-gated vs. in-page script), and who owns the connection UI.

## Decision

Sprint targets the web platform WebMCP standard as documented for Chrome. Concretely:

- Tools are registered with `document.modelContext.registerTool(descriptor, options)`.
- The descriptor is `{ name, description, inputSchema, execute, annotations? }`, where
  `inputSchema` is JSON Schema (`{ type: 'object', properties, required }`) and `execute` is
  `async (inputs, { signal }) => string | null`.
- Unregistration goes through an `AbortController` passed as `options.signal`, which maps cleanly
  onto a React effect cleanup and onto R2.2's lifecycle requirement.
- `annotations.readOnlyHint` and `annotations.untrustedContentHint` are set per tool, not left off.
- Sprint does **not** vendor, bundle, or depend on the webmcp.dev library, and does not fall back
  to it where the standard is unavailable.

Sprint writes against the standard directly rather than adopting the `usewebmcp` React package that
Chrome's docs point at. Sprint's registration is driven by component metadata and the dual-render
model, so the hook layer is something Sprint has to own regardless; a third-party hook would sit
awkwardly between the component and its `meta.ts`. This is worth revisiting if `usewebmcp`
stabilizes and the shapes converge. The `webmcp-types` package is a reasonable dependency for
descriptor typings and should be evaluated separately.

Reasons for the standard over the library:

- **Trust model.** Browser-mediated registration with origin isolation, a `tools` permissions
  policy, and `exposedTo` origin gating is a materially better security story than an in-page
  script, and Sprint is a library other people ship to their users.
- **No UI ownership conflict.** The webmcp.dev library injects its own connection widget. Sprint
  has an opinionated visual system (R4); a component library that plants a foreign floating widget
  in every consumer's app is not acceptable.
- **Durability.** Betting on the platform API means Sprint's agent surface stays correct as the
  standard ships, rather than tracking one vendor's library.
- **Fits the existing shape.** `AbortController`-based unregistration and JSON Schema descriptors
  map onto React lifecycle and onto Sprint's `meta.ts` registry with no impedance mismatch.

## Consequences

**Easier:**

- R2.2 (lifecycle-correct registration) becomes a normal `useEffect` returning `controller.abort()`.
- R2.5 (WebMCP optional at runtime) becomes a single feature check for `document.modelContext`.
  No integration, no widget, no bundle cost when absent.
- Tool descriptions inherit the manifest's existing quality bar (R2.6, R3.3), and Chrome's
  best-practice guidance on naming and schema design is directly applicable.

**Harder:**

- **Availability is narrow.** Chrome 149+, origin trial or `chrome://flags/#enable-webmcp-testing`.
  Every consumer on another browser gets a no-op agent layer. Sprint must be genuinely useful
  without it, which raises the stakes on the agent view (R1) as the browser-independent half of
  the story.
- **Origin isolation and the `tools` permissions policy** are deployment constraints Sprint cannot
  satisfy on its consumers' behalf. They need documenting, not solving.
- **Testing.** jsdom has no `document.modelContext`. Sprint needs a test double that asserts
  descriptor shape and registration lifecycle; end-to-end tool invocation is not testable in the
  existing Vitest setup. Open question in the PRD, unresolved by this ADR.
- **Hard platform limits** flow into the API design: 500 characters per tool description, 150 per
  parameter description, 1.5K per tool output. The agent view (R1) must therefore be chunked or
  paginated rather than returned as one large document from a tool.
- **The API may change.** It is an origin trial, not a shipped standard. Sprint should isolate
  every `document.modelContext` call behind one internal module so a spec change is a single-file
  edit.

**Follow-up:**

- Spike registration on a throwaway component behind the Chrome testing flag before building the
  real machinery.
- Decide whether the declarative form API (`toolname` / `tooldescription` /
  `toolparamdescription` / `toolautosubmit` on `<form>`) is the right mechanism for Sprint's form
  components, or whether everything goes through the imperative path for consistency. Its own ADR.
- Evaluate `webmcp-types` as a dev dependency.
