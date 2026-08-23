# Data components take data, and are responsive by restacking

- **Status**: Accepted
- **Date**: 2026-08-22

## Context

Table and List are the first components whose content is not one label but many values.
Taking that content as children is the React-idiomatic choice and it fails here twice.

**For the agent view.** In agent view a component never renders its children, it describes
itself. A `<Table>` given rows as JSX would have to walk arbitrary React elements at
render time, or reimplement its own markup as text. Both are the drift the whole project
exists to avoid.

**For responsiveness.** A four-column props table at 375px is unusable, and the fix that
does not lie is to restack each row into a labelled block. That needs the column headers
available per cell, which means the component has to know what the columns are.

There is a third problem underneath: the accessibility tree follows CSS `display`. Setting
`display: block` on table elements silently strips their table roles in Chrome and
Firefox.

## Decision

**Data components take data.** `Table` takes `columns` and `rows`; `List` takes `items`.
Cells and items hold inline content only, flattened to text for the agent view by
`reactText()`, the React-side counterpart to `accessibleText()`. Components are not
allowed in them, and every affected component says so in `whenNotToUse`.

Each cell is an addressable part carrying `data-sprint-column` and `data-sprint-row`, so
`[data-sprint-part="cell"][data-sprint-column="kind"]` selects a column without knowing
anything about the markup. List items carry `data-sprint-index`.

**Responsiveness is a component concern, and it is mobile-first.** The narrow layout is
the base rule and the wide layout arrives in a `min-width` query, on the theory that the
constrained case is the one worth getting right first. Table's rows are blocks with each
cell repeating its column header (`aria-hidden`, since the real `<th>` still associates)
until 48rem, where it becomes a table. Stack's `collapse` turns a row into a column below
40rem. Panel tightens its padding. Coarse pointers get larger hit targets.

Explicit ARIA roles (`table`, `row`, `columnheader`, `cell`) are set on the table elements
so the restacked layout keeps its semantics. Biome's `noRedundantRoles` is disabled for
that one file, in `biome.json` with the reason attached, because the rule cannot see the
CSS that makes them necessary.

## Consequences

The agent view of a table carries every cell with its column and row, so an agent reads
the data rather than a shape. The projection from human-view DOM produces exactly the same
parts, because both are built from one node.

Tables and lists work on a phone without a horizontal scrollbar, and the whole workbench
now does: at 375px the sidebar collapses behind a Menu control and nothing overflows.

The cost is that `<Table>` is more verbose than JSX rows, and that a cell cannot hold a
Tag or a Button. That is a real limitation and it shaped the docs: the props table shows
"node · required" as text where it used to show a chip. If a cell ever genuinely needs a
component, the escape hatch to design is a per-cell describer, which is the same open
question the PRD already records for virtualized tables.

40rem and 48rem are hard-coded in the component CSS, because a custom property cannot be
used in a media query. They are effectively public, since a consumer restyling around
Sprint will need to match them, and they are not yet documented as a contract.
