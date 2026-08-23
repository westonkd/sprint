# The provider renders a copy control beside the agent text surface

- **Status**: Accepted
- **Date**: 2026-08-23

## Context

A page in agent view is a Markdown document a human often wants to carry somewhere else —
into a prompt, an issue, a transcript. Selecting the whole stream by hand is clumsy, and
every consumer that wanted a copy affordance would have to find the view container and
rebuild the same button. `SprintProvider` already owns the view state and the one container
that holds the stream (see
`20260822231147_the_agent_view_text_container_lives_in_sprintprovider.md`), so it is the
only place that can offer this once for everyone.

Two questions had answers that were not obvious:

- **What gets copied.** The candidate was the container's `innerHTML`, but the agent view
  is a text stream by construction: `AgentLine` renders strings, and a control's text
  content is its Markdown line. The container's `textContent` therefore *is* the formatted
  document, and it is already what `pageText()` hands to the WebMCP page tools. `innerHTML`
  would add `<button>` tags and `data-sprint-agent` attributes that no consumer of the
  clipboard wants.
- **How the control stays out of the stream.** A visible text label would leak into
  `document.body.textContent`, which is exactly what `pageText()` returns to an agent
  reading the page. Chrome for humans must not add noise to the surface built for agents.

## Decision

The view-owning `SprintProvider` renders one `<button data-sprint-view-copy>` as the
preceding sibling of the view container, only while the effective view is `agent` and
`agentControls` is not `"never"`. Providers that merely inherit the view render nothing, so
a page has one control per view boundary, not one per provider.

Clicking it copies the container's `textContent`, normalised the same way as `pageText()`
(runs of blank lines collapsed, ends trimmed), via `navigator.clipboard`. The button
carries no text content: its accessible name is `aria-label` ("Copy agent view", swapping
to "Copied" for 1.2s, mirroring CodeBlock's timing), and its visible label is CSS-generated
from that attribute with `content: attr(aria-label)`. CSS content never appears in
`textContent`, so the control is invisible to `pageText()`, to the serializer (it carries
no `data-sprint`), and to the copied text itself.

It registers no WebMCP tool, for the reason CodeBlock's copy control never does: putting
text on a person's clipboard does nothing for an agent that can already read the page.
`data-sprint-view-copy` joins the attribute conventions and the public exports, and
`view-copy` joins the reserved state keys.

## Consequences

- Every app in agent view gains a copy affordance with zero consumer code, and the copied
  artifact is the same document `read-region` would return, not markup.
- The container ADR's "one exception outside the catalog" becomes two: the view container
  and its copy control, both provider chrome an agent never reasons about.
- The visible label lives in CSS `content`, which cannot be translated independently of
  `aria-label`; if localisation ever matters, both come from the same attribute, so a
  future label prop changes one place.
- Screen readers announce the swap because the name of the focused button changes, the
  same pattern as a play/pause toggle; there is no live region because there is no text
  node to observe.
