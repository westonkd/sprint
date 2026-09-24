# A chromatic ground admits one surface value so structure is stamped not stacked

- **Status**: Accepted
- **Date**: 2026-09-23
- **Depends on**: 20260923182104_a_chromatic_ground_inverts_the_palette_and_status_becomes_a_tinted_black.md

## Context

A design review of the trax register found that on the `trax` ground a Panel is indistinguishable
from the page. Measured, the surface ramp is 1.24:1 from ground to raised and 1.26:1 from ground to
inset, against calorie's much wider ramp and the default register's opaque planes. Only the keyline
says a Panel is there.

The obvious reading was that the ramp had simply been drawn too tight and wanted widening. It does
not. The ramp is as wide as it can legally be, and the reason generalises past trax.

Rule 11 fixes the ink on a chromatic ground: the hazard orange sits at 0.222 luminance, so AA admits
only inks below about 0.0105. Run that constraint the other way and it bounds the surfaces too. An
ink at 0.0058 can only sit on a ground of at least `4.5 x (0.0058 + 0.05) - 0.05`, which is 0.2012,
and the orange itself is 0.222. Light ink does not rescue it: clearing AA above the orange would need
a luminance over 1.0, which does not exist.

**So a full-bleed chromatic ground admits exactly one surface value, the ground's own.** There is no
ramp to widen. Any panel dark enough to read as a plate cannot carry the register's ink, and any
panel light enough to read as paper cannot either.

DESIGN.md and the trax ADR both describe the register as "black plates stamped into a lit, contoured
chassis". That is true of `trax-dark`, which has a near-black ground with room above it, and false of
`trax`, where it was never reachable. The two grounds did not share a silhouette, and the document
asserted one unconditionally.

## Decision

**Structure on a chromatic ground is stamped, not stacked. Rule 13.** A register whose ground is
chromatic buys its hierarchy with rule weight, stamped bands and offset passes, because surface value
is spent. Three mechanisms carry it, all of them roles rather than component code:

**`--sprint-plate`, `--sprint-plate-ink` and `--sprint-plate-rule` name the stamped band.** Panel's
and Dialog's header band was the literal `--sprint-surface-inset`, which is the token that has no
headroom left. As a role it defaults to exactly that value in every other register, so the five
non-trax themes are unchanged, and trax spends it: a solid black band with a hazard-orange label on
the orange ground, a charcoal band with a sand label and an orange hairline rule on the charcoal one.
A page becomes a rack of placards rather than a field of keylines, which is what an industrial surface
actually looks like and what the register claimed to be. The band is deliberately *not* chromatic on
`trax-dark`: a full orange band on every Panel spends the hero hue on chrome, and the rationing rule
says the hue belongs to the action. The orange survives there as the rule under the band.

Controls live in that band, so `--sprint-plate-link`, `--sprint-plate-control-ink` and
`--sprint-plate-keyline` come with it, re-declared inside the header. Each is given a **literal value
per theme rather than an alias**, because `--sprint-link: var(--sprint-plate-link)` with
`--sprint-plate-link: var(--sprint-link)` is a cycle: the fallback would be resolved inside the header
where `--sprint-link` is the property being defined, and CSS makes both invalid at computed-value
time. Six blocks of three declarations is the price of not having a cycle.

**`--sprint-keyline-width-plate` splits rule weight into two grades.** Trax doubled every rule to 2px
and bought no hierarchy with it, because a page of nested panels became a page of identical frames.
The register now runs 1px internal rules against a 3px plate edge, a 3x gap rather than a 1.5x one,
and only a top-level Panel or Dialog gets the heavy edge. Default is `var(--sprint-keyline-width)`, so
nothing else moves.

**`--sprint-misregister` replaces the symmetric halo with a directional second pass.** The halo was an
outline ring at a uniform 5px offset on all four sides, which reads as a double rule rather than as a
press error, because a press error has a direction. It is now a solid `5px 5px` box-shadow offset
down and right in the other ink, and `--sprint-keyline-halo` goes transparent in both trax grounds.
`--sprint-keyline-halo` and `--sprint-keyline-halo-offset` stay, unchanged in the four registers that
use them.

A fourth mechanism was tried and rejected. `--sprint-overprint` put an inset sliver of the mark ink
inside a filled face, on the reasoning that the depth model named overprint and spent it only on a
keyline colour. On a Button it landed on top of the mark *ring* that
20260914211336_the_action_family_splits_into_a_field_and_a_mark_and_link_stops_borrowing_info.md
already draws, and a ring plus an offset edge in the same hue reads as a glow or a rendering fault
rather than as a second pass. The ring is the overprint; it did not need a second one. The role is
gone rather than kept unused.

**`trax`'s `--sprint-inert` recedes rather than advances.** Rule 11 forces inert lighter than the
ground, since a disabled field darker than the orange cannot carry an ink at all. It does not force it
*much* lighter, and at `#d9a38a` the disabled control was the only pale field on the page and read as
the loudest object in a variant row. `#c68a63` keeps 6.51:1 for its ink and drops to 1.33:1 against
the ground, so a dead control sits down into the chassis instead of jumping off it. Grey is still for
the inert; on a chromatic ground "grey" means a bleached version of the ground.

**DESIGN.md's claim is scoped to `trax-dark`.** The inverted surface ramp is that ground's silhouette
and is not available on the orange one. The two grounds now share a silhouette through the plate band
instead, which is reachable on both.

## Consequences

**Easier:**

- The ramp question is settled with a number rather than an opinion, and the number generalises: any
  future register with a full-bleed chromatic ground gets one surface value and has to stamp.
- `--sprint-plate`, `--sprint-keyline-width-plate` and `--sprint-misregister` are three more
  edge-treatment decisions a consumer register can make without touching a component, continuing
  what `--sprint-keyline-width` and `--sprint-keyline-halo-offset` started.
- The plate band gives both trax grounds one silhouette, which the surface ramp could not.

**Harder:**

- Five new public roles, and three of them (`--sprint-plate-link`, `--sprint-plate-control-ink`,
  `--sprint-plate-keyline`) must be declared literally in every theme block rather than aliased. A
  seventh register pays that cost again, and the cycle that forces it is not obvious from reading the
  declarations.
- `--sprint-plate-ink` is contrast-tested against `--sprint-plate`, so a register that stamps a band
  now has three more pairings to clear.
- The misregistration offset is a box-shadow rather than an outline, so it participates in layout
  overflow where the outline did not. Nested panels drop it, which is the same place the outline was
  already dropped.
