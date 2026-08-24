# Dialog is a native top-layer element, not a portal

- **Status**: Accepted
- **Date**: 2026-08-23

## Context

Phase 6 reserved "the portal path" for the first overlay component: `serializeWithin` can
reattach a root carrying `data-sprint-owner` to the node that owns it, precisely so that a
component rendered outside its owner's subtree (a React portal to `document.body`) still reads
as belonging to it.

Building Dialog surfaced a problem with actually portaling: `SprintProvider` renders the one
`data-sprint-view` container around its subtree, and the agent view is that container's text.
A portal to `document.body` escapes the container, so in agent view a portaled dialog's lines
would fall outside the readable stream and outside what the copy control captures. The portal
path works for *serialization* but breaks the *render mode*.

The platform has since given us a better mechanism than portals: `<dialog>.showModal()` puts
the element in the browser's top layer while leaving it exactly where it is in the DOM. Visual
escape without structural escape. It also brings focus containment, page inerting, and Escape
handling for free, and jsdom ≥24 implements it.

## Decision

`Dialog` renders a native `<dialog>` element inline, where the consumer placed it, and calls
`showModal()` on mount. It never portals. A closed dialog renders `null` in both views: no DOM,
no agent line, no tools.

`data-sprint-owner` stays, decoupled from portaling: it is an optional `owner` prop naming the
tool that opened the dialog, published for reading agents, with `reattachOwned` unchanged.

The dialog closes only through consumer state: the close control, Escape (via `cancel`,
prevented and forwarded to `onClose`), and the `close` tool all funnel into `onClose`, and the
consumer flips `open`. The close tool lives on the `close` part, not the node, and registers
only while open, per contextual registration. The dialog's `label` joins the agent scope, so
tools registered inside compose as `<dialog-label>-<verb>-<label>`.

## Consequences

- The render-mode half of the portal question is answered: overlay components must stay inside
  the provider's container, and the top layer is how they escape visually. A future Toast
  should follow the same shape.
- `reattachOwned` still has no in-tree caller that portals. If a genuinely portaled component
  ever appears, it must solve the view-container problem first; this ADR is the warning.
- The backdrop is a surface-colored hatch (R4.6 texture vocabulary), not an opacity scrim, and
  `::backdrop` inheriting custom properties requires Chrome 122+/modern engines. Older engines
  get no backdrop tint, which degrades acceptably.
- jsdom does not implement `showModal` at all (jsdom/jsdom#3294), so the component falls back
  to setting `open` when the method is missing: a visible, non-modal dialog. That is also the
  honest degradation for older engines, and it is what CI exercises. Top-layer stacking, focus
  containment, and real Escape behavior are therefore unverified until the Chrome 149 spike.
