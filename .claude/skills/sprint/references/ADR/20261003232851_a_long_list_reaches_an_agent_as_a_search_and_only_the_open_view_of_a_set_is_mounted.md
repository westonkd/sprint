# A long list reaches an agent as a search and only the open view of a set is mounted

- **Status**: Accepted
- **Date**: 2026-10-03
- **Depends on**: 20261003225406_floating_surfaces_open_in_place_in_the_top_layer_and_a_tooltip_is_a_human_affordance.md

## Context

The calling planner's remaining gaps were mostly components Sprint did not have: a searchable
combobox over hundreds of members, tabs, a radio group with descriptions, a toast with an undo
action, an avatar, rendered Markdown, an inline spinner, key caps and screen-reader-only text.
Several of them stretch the agent contract in ways earlier components did not. A combobox over
three hundred options cannot enumerate them in a tool schema or render three hundred controls in
the agent view. Tabs hold panels of arbitrary components that should not all be mounted at once.
A toast's action is a whole Button.

## Decision

**A long list reaches an agent as a search, not an enum.** Combobox's `choose` tool takes a string.
An exact label, compared without case or accents, selects; a search with one match selects it; a
search with several returns up to ten labels with their groups and asks for an exact one; an empty
string clears a clearable field. The registered schema has no enum. In the agent view the component
lists at most fifty enabled options as controls, the chosen one first, and publishes `options` with
the total and `listed` with how many it showed, so an agent knows the list is partial and that the
tool is the way through.

**Only the open view of a set is mounted.** Tabs renders the selected tab's panel and nothing else,
in both views. Mounting every panel would register every panel's tools and run every panel's
effects. The tabs themselves are parts with `selected`, the agent view puts the panel's own lines
after them, and the `select` tool's result says to read the page again. This differs from Menu,
whose items stay in the DOM while closed: a menu item is a part of the Menu, while a panel is a
subtree of other components.

**An action inside a transient surface is a real component.** Toast's action is data,
`{ label, onSelect, shortcut? }`, rendered as a small Button, so it registers its own press tool
(`press-undo`) and the agent view nests the Button's own line under the toast. The toast adds only
a dismiss part. A shortcut is shown with Kbd and published as `aria-keyshortcuts`; the page binds
the key.

**Rendered Markdown keeps its source for agents.** Prose styles plain HTML a page renders however it
likes. Given `source`, the agent view carries that Markdown verbatim as the `content` part instead of
the flattened text, because lists, links and emphasis survive in Markdown and do not survive
flattening. Sprint still ships no Markdown parser.

**Presentational options publish state only when they differ from the default.** Text `weight`,
`align`, `lines` and `italic`, Stack `padding`, Heading `size`, Button and Spinner `size`, Dialog
`size`, Progress `tone`: each is a data attribute so the stylesheet can map it under a strict CSP,
and each is omitted at its default so the agent line for ordinary content does not grow. Text's line
clamp is CSS only; the agent view and screen readers always get the whole text.

**A Tag marks something provisional with a dashed keyline, not a custom colour.** The planner's
scenario badge wanted its own colour to tell a scenario from the live roster. A consumer colour
would go through a style attribute and outside the contrast-tested palette. `provisional` says what
the colour was standing in for, and an agent reads it.

**A radio group names each radio by its label alone.** The option's description is linked with
`aria-describedby`, and the part attributes sit on the label text rather than the `<label>`, so the
accessible name, the tool enum and the projection all say "Editor" and not "Editor Moves people".

## Consequences

- An agent choosing from a Combobox may need two calls, and the tool description says so.
- Switching tabs changes which tools exist on the page. An agent holding a tool name from another
  panel will find it gone, which is the same contract as a Dialog's tools.
- `theme="auto"` on SprintProvider, also on the planner's list, is not done: AGENTS.md records that a
  theme is never keyed off `prefers-color-scheme`. Portaled content losing the theme, the other half
  of that row, no longer arises, because Sprint's floating surfaces render in place.
