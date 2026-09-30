# A human view may reveal less than the page contains but never contain less than the agent view

- **Status**: Accepted
- **Date**: 2026-09-23

## Context

Table condenses in the agent's direction: a person reads rows, an agent receives one
Markdown pipe table. Every component so far compresses that way, and the two agent surfaces
stay in step because both are projected from one node.

A navigation bar compresses the other way. Its whole argument is that a person should be
offered one level rather than a catalogue of forty-eight, and that a filter should narrow
what they are offered further still. Taken naively that inverts the invariant: the human
view would carry less than the agent view, and worse, `serializeElement` reading a page in
human mode would project less than the same component renders in agent mode. The two agent
surfaces would disagree, which is the one thing the projection is built not to do.

## Decision

Separate *containing* from *revealing*.

A component's human rendering must contain every addressable part its agent rendering
emits, in the same order, with the same state. What it may do is reveal only some of them.
Concealment is CSS and nothing else: the parts stay in the DOM, keep their
`data-sprint-part`, their label and their published state, and a concealed part carries a
documented state attribute saying so. NavBar is the first component to use this: all of its
destinations are in the page at all times, `data-sprint-shown` marks the ones the current
coordinate is offering, and the stylesheet hides the rest.

Concealment through CSS `display` rather than the `hidden` attribute is load-bearing.
`accessibleText` treats `hidden` and `aria-hidden` as absent, so a part hidden that way
would lose its label in the projection; `display: none` removes it from the accessibility
tree, which is what a person and a screen reader should both experience, while leaving the
projection whole.

Human-only affordances remain exempt, and are marked by the absence of
`data-sprint-part` rather than by a rule. The filter input and the trail control carry no
part, the same way the copy control beside the agent stream does not, because an agent
reading the page gains nothing from a control whose only job is to hide things from someone
who cannot read forty-eight names at once.

## Consequences

A component may now compress in the human's direction without either agent surface
noticing, which is what makes a filter, a coordinate, or a disclosure expressible at all.

The cost is that concealment can no longer be implemented with the `hidden` attribute on a
part, and that a component hiding parts must publish a state attribute for it or the DOM
becomes unreadable to anyone debugging why a part is invisible.

It also sets a floor worth testing: a component that conceals parts should assert that its
projection and its agent rendering carry the same parts. NavBar's suite does, and that
assertion is the thing to copy the next time a component wants to hide something.
