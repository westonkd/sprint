# Labelled landmarks are regions and page reading recurses into them

- **Status**: Accepted
- **Date**: 2026-08-23

## Context

`list-page-regions` derived its regions from the top-level `data-sprint` roots under
`document.body`. On any page framed by `Shell` — including the workbench itself — that is exactly
one region. The workbench reports one region named `shell` containing 127 components, so the
discovery tool degenerates to "there is one region", and `read-region` becomes a linear crawl
through 1460-character pages with no way to jump to the panel an agent actually wants. The 1.5K
platform cap on tool output is fixed; the granularity of what we offer to read is not.

The information needed for better granularity already exists: Sprint requires the meaningful
containers — `Shell`, `Panel`, `Nav`, `PageHeader`, `Dialog` — to announce what they are, and most
of them carry labels.

## Decision

A component may declare itself a **region** when building its agent node (`region: true` on
`buildAgentNode`). The flag renders as a new reserved attribute, `data-sprint-region`, on the
component root in human view, and joins the public agent contract alongside `part`, `tool`, and
`owner`. The DOM projection reads it back, so the projection and the render agree by construction.

`list-page-regions` now lists the top-level roots plus every region-flagged descendant, in document
order, each under a key derived from its component and label (`panel-props`, `nav-workbench`).
Regions nest and overlap deliberately: reading `shell` still reads the whole page, reading
`panel-props` reads one panel. `read-region` is unchanged apart from accepting the new keys.

The components that stamp the flag are the landmark-shaped ones: `Shell`, `Panel`, `Nav`,
`PageHeader`, and `Dialog`. Layout primitives (`Stack`) and leaf components do not; a region is a
place an agent might want to read on its own, not any container.

## Consequences

- An agent's first `list-page-regions` call on a Shell-framed page now returns a table of contents
  instead of a single entry, and it can read the one panel it cares about within the output cap.
- `data-sprint-region` is public API; adding it to a component is additive, removing it is
  breaking.
- Region keys are label-derived, so two identically-labelled sibling panels get positional suffixes
  (`panel-details-2`), with the same stability caveats as tool names.
- The manifest's `conventions` block gains `regionAttribute` so an agent learns the marker without
  reading source.
