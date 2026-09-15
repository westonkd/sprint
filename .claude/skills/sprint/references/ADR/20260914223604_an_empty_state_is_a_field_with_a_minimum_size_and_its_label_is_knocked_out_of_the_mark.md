# An empty state is a field with a minimum size and its label is knocked out of the mark

- **Status**: Accepted
- **Date**: 2026-09-14
- **Depends on**: 20260823221425_the_ornament_vocabulary_ships_as_tokens_and_attribute_utilities.md

## Context

DESIGN.md's ornament rule says a mark never sits over content. Three components broke it —
DescriptionList, Table, and Panel all painted `--sprint-ornament-empty` directly on the element
holding the empty label — and nobody noticed, because in the default register that ornament is
`hatch`: 1px diagonals at 8px pitch, invisible enough behind six words that the violation read as
texture.

`pin` made it visible. A 32px tile of 10px rings ran straight through `NONE GENERATED`, and because
the field was 50px tall with the tiling centred, the one row that would have been whole was the one
behind the label. Every ring actually on screen was a clipped one. It looked like a rendering fault
rather than like ejector-pin marks, which is the opposite of what the mark was added for.

Panel was the exception and already had the answer: its empty label is wrapped in a `<span>` that
paints the panel ground, knocking a plate out of the field behind it. The pattern existed, in the
library, unused by the two components next to it.

## Decision

**The empty label is always a knockout plate, in every component that marks an empty field.**
DescriptionList and Table adopt Panel's `<span>` with the ground colour and a small horizontal
padding. Table's ground is `var(--sprint-panel-ground, var(--sprint-surface))`, since the custom
property Panel sets on itself inherits to a Table inside it and the fallback covers a Table that is
not in one.

This is a knockout rather than a mask on the ornament because the plate is the better read anyway: a
stamped label on a blank moulded face is what the reference photography does, and a hole cut in a
texture is what it would otherwise be.

**An ornament that is a discrete mark needs a field big enough to hold whole ones.**
`--sprint-empty-field` is a minimum height on the empty region: `0` in the default register, where
`hatch` tiles at 8px and has no such requirement, and `6rem` in calorie, which fits three rows of the
32px pin tile with the label plate over the middle one.

The minimum is a token rather than a fixed value because it is a property of the register's chosen
mark, not of the component. A register whose empty mark is a fine texture should not be forced to
reserve six rems of nothing.

**The empty region centres its label rather than relying on `text-align`.** With a minimum height the
text would otherwise sit at the top of a tall box. Three `display: flex` declarations, no layout
change where the minimum is `0`.

**This changes the default register, slightly, and that is accepted.** DescriptionList and Table now
knock their empty label out of the hatch where previously the hatch ran under it. It is a small
legibility gain, it makes all three components agree, and the alternative was to gate a correctness
fix on a theme.

## Consequences

**Easier:**

- The ornament rule is now true of every component rather than of one of them.
- A register can pick a bold empty mark without auditing every component that might be too short for
  it.

**Harder:**

- Three components now render a wrapper element they did not before. It contributes nothing to
  `textContent`, so the agent stream and the copyable Markdown are unchanged, but a consumer styling
  the empty label by its parent selector will see it.
- The knockout hardcodes which ground the label sits on. Panel routes through
  `--sprint-panel-ground`, DescriptionList through `--sprint-surface-raised`, Table through both. A
  component that paints a different ground under its empty state has to say so.
