# Navigation ships as a coordinate bar beside Nav

- **Status**: Accepted
- **Date**: 2026-09-23

## Context

Nav is the only piece of chrome in the library without register slots. Panel stamps a
plate and throws a misregistered second pass, Alert runs a width ladder into the alarm
mark, PageHeader closes itself with a rule, an empty region fills with whichever mark the
register nominates. Nav reached for the action mark and a hover ground and nothing else,
so trax stamped placards across every surface except the sidebar and calorie molded every
object except the sidebar. That is the mechanism behind the complaint that the navigation
does not belong to its theme: a missing slot set rather than a matter of taste.

Fourteen treatments were built as live prototypes and judged in the browser across all six
registers. Five restyled the stacked column in place. Nine left it: the whole catalogue on
demand, a coordinate, a query, a sequence, a fixed spatial grid, a trail, the page's own
four edges, a sheet held open by a key, and one that recombined the coordinate, the query
and the trail into a single line.

The combination won on the cost it does not charge. Its ambient footprint is one line, it
degrades to a plain breadcrumb if the field and the trail are deleted, and the three parts
each cover a gap the others leave: the coordinate cannot be browsed, the query has no idea
where you are, the trail never says what else exists.

## Decision

Ship it as **NavBar**, a new component in the navigation category. Nav and NavGroup keep
their public API, their tests and their documentation, and stay the right answer for a set
of links that fits in a rail. NavBar is the answer for a catalogue that does not.

NavBar takes destinations as data, for the reason Table and List already do: nothing can
count, filter, order or address a set it cannot see.

It reaches only for semantic roles that already exist. The prototype's seventeen `--nav-*`
slots were dropped rather than promoted, because every register filled them with roles the
library already publishes: the stamped band is `--sprint-plate` with its ink and rule, the
current destination is `--sprint-action` with its ink and `--sprint-misregister`, the mark
is `--sprint-action-mark`, the empty field is `--sprint-ornament-empty` at
`--sprint-empty-field`, the shape is `--sprint-radius-control`. A `--sprint-nav-field` that
resolves to `var(--sprint-action)` in all six registers is indirection with no behaviour.
The register complaint is answered by a navigation component that reaches for the plate and
the ornament at all, not by a new family of tokens.

NavBar registers no WebMCP tool, for the same reason Link does not: every destination is in
the page with its href published on `data-sprint-href`, so a URL is already reachable.

## Consequences

The catalogue gains a component rather than swapping one, so nothing breaks.

The workbench adopts NavBar as its own navigation, which means the documentation site is
the component's first real consumer and its rail is gone. Shell still models a sidebar and
the workbench overrides its grid from `dev/workbench.css` to run the aside as a strip; a
Shell that can be told which layout it is remains unwritten, and is the obvious follow-up.

The filter has no agent counterpart, like the copy control beside the agent stream. Before
it is beyond experimental it needs combobox semantics, a live region for the count, and
arrow-key travel; SegmentedControl's roving tabindex is the nearest precedent in the repo.
An inline segment that becomes a field also wants a label-less input, which TextInput
correctly refuses to be, so NavBar carries its own input with an aria-label.

The trail lives for as long as the component is mounted and no longer. `onNavigate` is the
seam for a consumer that wants it to outlive that.

See also the decision on what a human view may hide, which is what lets the coordinate show
one level while the page keeps all of them.
