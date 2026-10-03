# Ambient is the quiet register and controls get their own voice

- **Status**: Accepted
- **Date**: 2026-10-02
- **Depends on**: 20260914191641_the_theme_attribute_names_a_register_and_ground_cell_not_an_axis.md

## Context

Sprint had three registers and every one of them was a statement: the loud readout, calorie's molded
plastic, trax's freight placards. All three ask the host app to adopt a point of view. The ask was a
fourth that does the opposite, one that blends into the background of a product and looks like what
people already use every day, while still being recognisably Sprint.

Two things stood in the way. The first is the Sprint test recorded in DESIGN.md: the ornament
vocabulary, the micro-label voice, and one rationed hue. A register that drops all three is a
generic theme, not a Sprint register. The second was structural. Every control in the library spoke
the label voice: a Button, a SegmentedControl option and a field placeholder all read
`--sprint-label-size`, `--sprint-label-tracking` and `--sprint-label-transform`. Sentence-case
buttons, which is the single strongest signal of a familiar interface, could only be had by giving
up the uppercase micro-label everywhere else, which is the Sprint signature calorie's first draft
already lost and had to take back.

## Decision

**`ambient` and `ambient-dark` are a fourth register, the quiet one.** System sans for both voices,
6px controls and 10px surfaces, a soft cast shadow for depth, eased motion, a cool-neutral fog ground
with white panels, or a graphite ground with panels a step lighter. Flat in every other respect: the
mold, well, sheen and ground sweep are all inert.

**The action is achromatic.** The primary button fills with the ink itself, near-black on fog and
near-white on graphite, and `--sprint-action-mark` follows it, so selection marks and checked states
are the ink too. The register's one hue, an ultramarine descended from the `light` theme's action
field, is rationed to links and focus. Putting it on the action edge was the first draft, and it made
every primary button look focused, because focus is the same hue.

**Controls get their own voice.** New semantic roles `--sprint-control-size`, `-size-small`,
`-tracking`, `-transform` and `-weight` cover text a person clicks or types into: Button, the
Shell's skip control, SegmentedControl options, ChoiceGrid tiles, Pagination, Nav links, Breadcrumb
destinations, Checkbox and Switch labels, Disclosure toggles, Card titles, copy and reveal buttons,
placeholders and field errors. In every existing register they alias the label roles, so nothing
there changes. Ambient sets them to sentence case, no tracking, 13px, medium weight.

The Sprint test holds through what ambient keeps rather than what it adds:

- **The micro-label voice.** Panel headers, field labels, table headers, NavGroup titles and Alert
  titles stay uppercase and tracked, at 0.06em rather than 0.12em, which is about what a familiar
  product does for its section eyebrows anyway.
- **The ornament vocabulary.** Empty fields carry a faint dot grid, a danger Alert keeps its hatched
  alarm bar, and a Divider band is a row of dots.
- **One rationed hue,** spent on links and focus and nowhere else. The contrast test enforces that
  the action and action mark are the ink and that no structural or status role is the hue.

Acid appears nowhere in ambient.

## Consequences

- Any component whose text is a control rather than a label should read the control roles. The
  split is a judgement per selector; field labels stay on the label roles, field errors moved.
- A `light` island nested inside an ambient subtree inherits ambient's control voice and radii,
  because the `light` block redeclares only colour and leaves shape to `:root`. A `dark` island
  resets, since `dark` shares the `:root` block. This was already true of calorie and trax and is
  not fixed here.
- Ambient is the first register a consumer might reasonably choose for reasons other than taste, so
  its palette is the one most likely to be asked for a brand-colour override. The hue is two
  primitives (`signal`, `signal-pale`) for that reason.
