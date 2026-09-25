# Trax is the freight register and its depth model is the printing press

- **Status**: Accepted
- **Date**: 2026-09-23
- **Depends on**: 20260914191641_the_theme_attribute_names_a_register_and_ground_cell_not_an_axis.md

## Context

Sprint had two registers. The default one is a technical readout: flat, rectilinear, uppercase mono,
acid on void. Calorie is molded plastic: rounded, lit, grotesk, one hot magenta. Both take their
reference from the same game, the default register from its general house style and calorie from one
of its in-fiction brands.

The ask was a third register built from another of those brands: an industrial one. Heavy industry,
mining, manufacturing, bulk freight, a motto about operating beyond scale, and an AI incident two
centuries back that the company has rebranded twice to outrun. It is the only warm identity in a
lineup that is otherwise green, blue, violet and magenta, and its orange is the one faction colour
that carries a real safety-signage meaning.

The trap was obvious from the start. The default register is already flat, already rectilinear,
already mono, already screenprint. Orange dropped into it is a recolour, not a register, and a
recolour is what "Trax" would have been if the only thing that changed was the hue.

## Decision

**`trax` and `trax-dark` are a third register, and the thing that makes it one is a third depth
model.** The default register stacks opaque planes and varies keyline weight. Calorie lights objects.
Trax is a two-pass screenprint, and depth is how the ink lies:

- **Overprint.** A filled face carries its keyline in `--sprint-action-mark`, the same ink laid
  heavier where the passes meet.
- **Misregistration.** `--sprint-keyline-halo` is Panel's and Dialog's offset second outline. Calorie
  sets it transparent because it reads as a registration error against a rounded corner. Trax sets it
  to the *other* ink, because a registration error is exactly what it is imitating.
- **Knockout.** Already shipped as the empty-state plate.

**All three are existing roles, so the printing model costs zero new geometry tokens and zero
component stylesheets.** Every lighting ink stays `transparent` and `--sprint-ground-sweep` stays
`none`, so calorie's geometry paints nothing here, the same no-op that keeps `dark` and `light` flat.
Trax is flat like the default register, but it is flat for a reason rather than by omission, and it
is the first register to reuse a role by inverting another register's choice rather than by adding
one.

**`--sprint-keyline-width` and `--sprint-keyline-width-thick` move from `primitives.css` into the
theme blocks.** Trax doubles the rule to 2px, which is a register decision and therefore has to be a
semantic role. Components already wrote `var(--sprint-keyline-width)`, so this is a declaration move
with no component edits: the same widening that
20260914183524_the_semantic_layer_carries_shape_type_and_motion_not_only_color.md performed for type
and motion, and the last obvious literal left outside the layer.

**The display voice is a condensed grotesk, uppercase, at negative tracking.** The serif belongs to
the default register and the heavy grotesk to calorie, so the remaining width axis is the one Trax
can own, and an extremely condensed poster grotesque is what the reference actually sets its display
type in. `--sprint-font-condensed` leads with Arial Narrow and Helvetica Neue Condensed, falls
through Liberation Sans Narrow and DejaVu Sans Condensed on Linux, and lands on `ui-sans-serif` where
none of those exist. That last case is a real degradation and it is the same one calorie recorded: a
system stack cannot promise a width any more than it can promise a face. It was still the better
trade than an expanded stack, which resolved to nothing on any of the three platforms checked.

**The UI voice stays monospace.** This is not laziness. The reference's own display face is an
uppercase monospace drawn from receipt printing and dot-matrix billing, so mono chrome is the
register's native voice rather than a carryover, and the clash Trax gets is width against width
rather than the default register's serif against mono.

**The pill is the only curve.** `--sprint-radius-control`, `-surface` and `-control-tight` are all
`0`, and `--sprint-radius-pill` is `999px`. A status chip is round and nothing else is, which is
exactly what the reference's loadout HUD does with its ammunition counter.

**Motion is a solenoid.** `steps(3, end)` at 60, 75 and 90ms, coarser and faster than the default
register's `steps(4, end)` at 80 to 160ms. A freight door, not a transition.

**The space scale is not overridden, and that is deliberate.** Density is a register choice, per the
calorie ADR, but the default register's scale is already freight-dense: 0.25rem to 1.5rem across
seven steps. There was no honest tightening left to make, and inventing one to prove the register has
opinions would have cost layout and bought nothing.

**The register's signature mark is the contour, and it is spent on the page itself.** The reference's
poster work renders a portrait entirely as stacked topographic contour lines, and that mark had no
equivalent in the vocabulary. `--sprint-ground-sweep` in both trax grounds is a contour field rather
than calorie's lighting falloff, which makes trax the only register that paints a pattern on the
page rather than only on its dead regions.

**`trax-dark` inverts the surface ramp, and that is what separates it from `dark`.** The first draft
was a hue swap: orange where `dark` has acid, on the same near-black ground with the same lighter
panels, and at a glance it read as the default register recoloured. Panels are now *darker* than the
ground, so a page is black plates stamped into a lit, contoured charcoal chassis rather than lighter
panels floating on black. It is the only register with that silhouette, it is what an industrial
chassis actually looks like, and it costs three token swaps.

**`--sprint-keyline-halo-offset` makes the second outline's offset a role.** Panel and Dialog both
wrote a literal `outline-offset: 2px`, which is a register decision sitting outside the token layer,
the same class of thing `--sprint-keyline-width` was. Trax sets it to 5px so the misregistration the
depth model is named for is visible rather than theoretical. Unchanged at 2px everywhere else.

**Rule 12: a ground sweep may only move the ground away from its ink, never toward it.**
`contrast.test.ts` measures ink against a flat token, and a patterned sweep makes the ground not
flat.
20260914222347_on_a_dark_ground_an_object_separates_by_edge_light_not_by_shadow.md
already flagged this as "an argument, not a test" and got away with it because calorie's sweep
lightens both of its grounds. Trax did not get away with it: a black contour at 0.26 alpha on the
orange ground takes `--sprint-ink` from 4.92:1 to about 4.16:1, below AA, because the ink there is a
near-black and darkening the ground closes the gap. So trax's sweep is a bleached line that lightens
the orange and `trax-dark`'s is an orange line that lightens the charcoal. Both are still only 0.10
to 0.12 alpha, because the other half of the constraint is that the page ground is not purely dead
space: a lede sits directly on it, and a mark that competes with body text has stopped being texture.

**The ornament vocabulary gains `chevron`, `barcode` and `contour`.** DESIGN.md calls the vocabulary closed, and
calorie set the test for extending it: a mark of manufacture, systematic rather than illustrative.
Hazard chevrons pass that test for an extraction industry the way an ejector-pin ring passed it for
moulded plastic. `barcode` is not an extension at all: DESIGN.md's ornament list has named barcode
strips since it was written and nothing ever implemented one. `contour` is the third, and it is the
one the register would be poorer without. `--sprint-ornament-empty` is the
chevron in this register, so an empty region is a striped, unloaded berth.

**`data-sprint-theme` goes to six values and stays one attribute.**
20260914191641_the_theme_attribute_names_a_register_and_ground_cell_not_an_axis.md warned that a
fifth ground would make the implicit grid worse and that the two-attribute split would start to earn
its breaking change. That warning is answered rather than ignored, and the answer has not changed:
a register-by-ground cross product still needs one CSS block per cell, so splitting the attribute
buys no lines of CSS, while `data-sprint-theme` is under a documented no-rename contract that agents
write selectors against. It breaks consumers to buy nothing. What the warning did get right is that
the grid now lives entirely in the names, and a reader has to be told it exists. DESIGN.md's table
and the philosophy guide both carry it.

## Consequences

**Easier:**

- A third register exists that is loud in a different direction from the first one, which is the
  proof that the token layer carries a register rather than a palette. It cost two `semantic.css`
  blocks, one primitives block and two ornament marks. No component stylesheet changed for the
  register.
- `--sprint-keyline-width` is themeable, so a consumer register can set its own rule weight.
- Reusing `--sprint-keyline-halo` by inverting calorie's choice is a pattern worth repeating: the
  cheapest new register is one that spends the roles already there differently. Inverting the surface
  ramp is the same move at a larger scale, and it did more for the register's identity than any of
  its colour choices.
- `--sprint-keyline-halo-offset` and `--sprint-keyline-width` between them mean a consumer register
  can now describe its own edge treatment without touching a component.

**Harder:**

- Six theme values, and the grid is entirely implicit in the names. A seventh makes this worse again
  and the split becomes hard to argue against.
- `trax`, `trax-dark`, the hull and press ramps, the hazard family and `--sprint-font-condensed` are
  all permanent public surface.
- Every new component now walks six themes, and `trax` is the one where an assumption that ink is
  darker than its ground or that a status hue is visible will show. See
  20260923182104_a_chromatic_ground_inverts_the_palette_and_status_becomes_a_tinted_black.md.
- The display face degrades to a plain sans where no condensed system face exists, which is a weaker
  guarantee than the default register's serif stack and no better than calorie's.
- The ground sweep is now a real constraint on a register rather than a free surface, and rule 12 is
  still enforced by argument rather than by a test. A sweep is a composited image and the contrast
  test reads flat tokens, so the gap the earlier ADR named is now wider and load-bearing.
