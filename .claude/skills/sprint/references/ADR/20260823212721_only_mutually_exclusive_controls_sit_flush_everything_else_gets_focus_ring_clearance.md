# Only mutually exclusive controls sit flush, everything else gets focus ring clearance

- **Status**: Accepted
- **Date**: 2026-08-23

## Context

The focus ring is a 2px keyline at a 2px offset (`--sprint-focus-width`, `--sprint-focus-offset`),
so it reaches 4px outside whatever it rings. Any control sitting closer than 4px to a neighbour
therefore has its ring land on top of that neighbour.

SecretField's first cut put its value box and its Reveal and Copy buttons flush inside one shared
frame, dividers only. Measured, a focused button's ring crossed the group frame by 3px top and
bottom and overlapped the next button by 4px. Worse, because siblings are static and painted in
DOM order, the *later* sibling's background painted over the ring, so the ring appeared cut off
rather than merely overlapping. SegmentedControl measured identically: 3px over the group frame,
4px into the next segment, overpainted.

Three rounds of visible symptoms came out of this one geometry: a ring that looked clipped, a
hover state that changed border weight on three sides only (the flush edge had no border to
change), and rings colliding with hover fills.

## Decision

Flushness is reserved for controls that are **mutually exclusive**, where the shared frame is what
communicates "one of these". SegmentedControl qualifies. Independent actions sitting side by side
do not, however tidy the strip looks.

So SecretField's value box and its two buttons are now separate controls: each carries its own
keyline on all four sides, separated by `--sprint-space-2` (6px), which leaves the ring 2px of
clearance on each side. Hover matches Button, filling the background and brightening the whole
border, because there is now a whole border to brighten.

Where flushness is correct, the focused child takes `position: relative; z-index: 1` so its ring
paints above its neighbours instead of being overpainted by them. The ring still crosses the
group's own frame, which is intended: it is an outside keyline, and a positioned child already
paints above its parent's border.

No component overrides `--sprint-focus-width` or `--sprint-focus-offset`, and none draws an inset
ring. An inset ring was tried and rejected: sitting 2px inside a 1px border, it read as one
inconsistent thick edge.

## Consequences

- A new component placing focusable controls closer than 4px apart must either justify flushness
  as mutual exclusivity and lift the focused child, or open the gap. This is the rule to check
  when a focus ring looks wrong.
- SecretField reads as three separate instruments rather than one strip. That is also more honest,
  since Reveal and Copy are independent actions and were never a choice between two states.
- The workbench's `.stage` bleed (added when the ring was being clipped by `overflow-x: auto`)
  remains load-bearing: it is what keeps the ring's 4px reach visible in the docs.
- Nothing here is enforced by a test. Focus geometry is only checkable in a real browser, so it
  stays a review question until the catalogue justifies a visual regression harness.
