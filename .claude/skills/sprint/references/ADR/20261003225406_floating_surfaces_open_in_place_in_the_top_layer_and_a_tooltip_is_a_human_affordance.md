# Floating surfaces open in place in the top layer and a tooltip is a human affordance

- **Status**: Accepted
- **Date**: 2026-10-03

## Context

The calling planner, the first app ported onto Sprint from Mantine, built its own Menu, Tooltip
and Combobox, each with its own anchored surface. Two of its findings were about floating
surfaces in general rather than any one component. A `Dialog` opens with `showModal()`, which
inerts everything outside it, so a menu portaled to `document.body` sits behind the backdrop and
cannot be clicked whatever its z-index. And Sprint's own `Select` always opened downward, so a
field low on the screen put its options below the viewport.

Sprint's `Select` already avoided the first problem by accident: its listbox lives inside the
component's DOM and opens as a `popover="manual"`. Nothing exported let anyone else do the same.

## Decision

**A floating surface renders inside its owner's DOM and opens as a manual popover.** It is never
portaled. The popover puts it in the top layer, above a modal dialog and outside any ancestor's
`overflow: hidden`, while staying a DOM descendant of the dialog so it is not inert. Tokens and
theme inherit through the DOM, so a surface inside a themed subtree is themed without mirroring the
theme onto `<html>`.

**`useFloating` is the one positioning primitive, and it is exported.** It shows and hides the
popover, places it against an anchor with `position: fixed`, flips to the other side when the
preferred side lacks room for the surface's natural height (capped at 16rem), clamps it inside the
viewport horizontally, aligns to the anchor's start, centre or end, and dismisses on a pointer
outside the anchor, the surface and an optional boundary. It writes only custom properties
(`--sprint-floating-top|-bottom|-left|-width|-room`) through `style.setProperty`, which a strict
CSP allows, and the chosen side as `data-placement`. Each component's stylesheet maps those
properties. `Select`, `Tooltip` and `Menu` all use it; an app's own floating UI can too.

**A rounded scrolling surface is a clipping box around an inner scroller.** The popover carries the
border, radius, shadow and `overflow: hidden`; the child with the role (`listbox`, `menu`) scrolls.
Putting `overflow-y: auto` and a radius on one element lets a classic scrollbar cut the corners,
and `clip-path` would fix that only by clipping the shadow too.

**A tooltip is a human affordance, not a component node.** In agent view `Tooltip` renders only its
child. In human view neither its wrapper nor its bubble carries `data-sprint` or
`data-sprint-part`, so the projection never sees it; both are styled through a new reserved
attribute, `data-sprint-tooltip`. The rule that makes this safe is in `whenNotToUse`: a tooltip may
only repeat what its element already says. This is the same split as the view-copy control and the
breadcrumb filter: an affordance whose only job is to help a person see is marked by the absence of
a part.

**An icon-only control is a Button with `hideLabel`, not a new component.** To an agent it is a
button with a label and a press tool, and nothing about the icon changes that. `hideLabel` keeps the
label in the DOM visually hidden, so the accessible name, the tool name and the projection are
unchanged, and adds a Tooltip with `describe={false}` so a screen reader does not hear the name
twice. Button also gains `size="small"` and `icon` / `iconEnd` slots.

**A component's human-only trigger can wear the Button look through `data-sprint-control="button"`.**
Menu's trigger is a human affordance: an agent chooses items directly through the choose tool or the
agent view's item controls, so the trigger carries no part. Rendering a real `Button` would put a
second node in the projection. Instead `Button.css` matches
`:is([data-sprint="Button"], [data-sprint-control="button"])`, and the trigger carries that hook and
`data-sprint-size`, which the projection ignores because the element is neither a root nor a part.

**Menu holds items as data** (`{ label, onSelect?, href?, checked?, tone?, disabled?, group?,
icon? }`) and keeps every item in the DOM while closed, concealed by the popover rather than
removed, so its human rendering contains every part its agent rendering emits. It registers one
`choose` tool enumerating enabled items without an href; link items are reachable by URL, the same
reasoning Link and Breadcrumb's actions follow. An item with `checked` becomes a `menuitemradio`.

## Consequences

- `data-sprint-tooltip` joins the reserved attributes, which is an additive change to the public
  contract.
- A component that wants to float something must render the surface in place. Code that needs a
  surface far from its anchor in the DOM is not served by this, and should not be written.
- Combobox, the remaining floating component the planner asked for, should be built on
  `useFloating` and the clipping-box structure rather than extending Select.
- The `data-sprint-control` hook is internal markup. It is not reserved because it never appears on
  a root or a part, but renaming it would restyle any consumer who copied it, so treat it as stable.
