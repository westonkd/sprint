# Navigation is a breadcrumb whose separators open the level beyond them

- **Status**: Accepted
- **Date**: 2026-09-30
- **Supersedes**: 20260923233806_navigation_ships_as_a_coordinate_bar_beside_nav.md

## Context

NavBar shipped as a coordinate of exactly three segments, root, group and leaf, over destinations
passed as flat groups. Its first consumers used it as a breadcrumb and hit the shape: the root and
the groups could not be links, so a person page could not lead back to "People" or to
"People / Admin", and a catalogue deeper than two levels had nowhere to go. The trail lived in
component state and reset whenever the bar remounted. The coordinate also ordered its trail rows
through an inline custom property, which a strict style-src CSP blocks.

The interaction went through three passes in the browser. Every crumb opening its siblings made
the text a menu rather than a link, so reaching an ancestor took two clicks. An arrow beside every
crumb fixed that but put an accent mark on every crumb, and the accent means "you are here".

## Decision

Rename NavBar to **Breadcrumb** and take a tree of any depth: `items` of
`{ label, href?, active?, external?, children? }`. The crumbs are the path to the active item.

Crumb text is a link to that item; a level without an href is plain text. The **separator** is the
trigger: the `/` after a crumb opens what is inside that crumb, with the search field in place of
the next crumb, and the `/` after the root opens the top level. At rest the bar is a plain
breadcrumb in muted separators; a separator turns into the accent chevron only on hover, focus or
while open. The accent is reserved for the current page.

The root takes an optional `href`. The trail can be seeded with `defaultVisited` or owned through
`visited`, so a consumer recording visits through `onNavigate` can restore them across remounts.
Trail rows are ordered by a `data-sprint-recency` ladder, never a style attribute.

Trailing `actions` arrive as data. An action with an href is a link and registers nothing, for the
reason Link does not; an action with only `onSelect` registers one `act` tool enumerating those
actions, because an agent has no URL to reach it by. That reverses the superseded decision's
"registers no tool" for this one case.

The `depth` state, which counted visits, is now `visited`, since depth now means a level in the
tree.

## Consequences

Breaking for NavBar consumers: the export, the props and the `data-sprint="NavBar"` selector all
change, which is acceptable while the component is experimental and the library is pre-1.0.

The workbench nests a component's page sections beneath it, so the trailing separator of a
component page lists its sections, replacing the separate "On this page" group.

A human-only link on each crumb duplicates a destination part that is already in the page, so the
crumbs carry no `data-sprint-part`, and the projection and the agent rendering still agree.
