# On a near-black ground the placard is stamped in the light ink

- **Status**: Accepted, premise superseded
- **Superseded by**: 20260923212036_a_register_with_a_chromatic_ground_is_chromatic_on_both_its_grounds.md
- **Date**: 2026-09-23

> The decision here — that `trax-dark`'s plate stamps in the light ink — stands, and is now the
> construction both trax grounds share. What the later ADR supersedes is everything this one assumed
> about the ground it stamps onto: `trax-dark` is no longer a warm charcoal, its surface ramp is no
> longer inverted, and the measurements below against `#1c1917` and the `hull` ramp describe a
> palette that no longer exists.
- **Depends on**: 20260923193938_a_chromatic_ground_admits_one_surface_value_so_structure_is_stamped_not_stacked.md

## Context

Rule 13 settled that a trax page is a rack of placards and that hierarchy is bought with the plate
band rather than with a surface ramp. On the orange ground it worked: the plate is pure black on
hazard orange, 5.42:1, and a Panel unmistakably reads as a stamped placard.

On the charcoal ground it did not. `--sprint-plate` was `hull-300` over a `hull-200` page and a
`hull` panel body, which measures **1.16:1**. The silhouette rule 13 claims both grounds share was
in practice trax's alone, and `trax-dark` fell back on the only strong signal it had left: a 5px
misregistration in `hazard-deep` on every Panel. That put the hero hue on chrome, which is the exact
thing rule 13 refused to let the plate band do, and it meant the register's identity was carried by
its quietest mechanism.

The result read as the loud `dark` theme with an orange accent. Measured, that impression is fair:
`trax-dark`'s panel-to-ground step is 1.13:1 and `dark`'s is 1.09:1 in the other direction. The
inverted surface ramp is real but it is not a *visible* difference at that size, so the registers
were separated by hue alone.

The obvious repair, widening the ramp, is not available. Lifting the page ground one step to
`#221f1c` drops `--sprint-danger` to 4.27:1 and `--sprint-keyline-strong` to 3.08:1; another step
puts both clearly under. **The charcoal ground is at its ceiling too**, for a different reason than
the orange one: rule 11 caps the orange ground from above because its ink must be near-black, and the
register's own hues cap the charcoal ground from below because magenta and the hazard orange are
already spending the whole margin against it. Neither ground has a ramp to widen, which is why rule
13 generalises to the register rather than to chromatic grounds specifically.

## Decision

**`--sprint-plate` in `trax-dark` is the sand ink, with the hull black as its label.** 15.44:1
against the panel body it caps, against 1.16:1 before. A Panel is now a black plate capped by a bone
placard, which is the inverse polarity of trax's black band on orange and the same construction.

This is what a near-black ground leaves. Value is the only channel a stamp can use, the panel body is
already at the bottom of it, and so the band has to go up. It is also what the reference object does:
an industrial surface carries a printed white label riveted to dark machinery, not a darker patch of
the machinery.

Two supporting moves fall out of it:

**`--sprint-misregister` drops to `hull-500`**, a warm grey second pass, because the plate now carries
the hierarchy the orange offset was standing in for. Orange rations back to the action, which is what
rule 13 wanted in the first place and could not afford.

**`--sprint-ground-sweep` inverts to a black contour.** The orange line at 0.06 was invisible on
charcoal, and it moved the ground *toward* its sand ink, which rule 12 forbids; the DESIGN.md
paragraph stating trax-dark's sweep moves away from its ink was simply wrong about which ink. A black
contour at 0.6 resolves to `hull` over the page ground, so the contour lines are the same black the
panels are, and it obeys rule 12 by construction. It is also the true inverse of trax's bleached line
rather than a differently-coloured version of it.

**`--sprint-info` staying the sand ink stops being an accident.** The warm-wedge decision called it
"a printed white label" while `--sprint-neutral-ink` was also sand, so the two tones differed only by
the width ladder. With sand now established as the placard colour, an info Alert is a small instance
of the same printed label, and the alias is the point rather than a collision.

**Warning leaves the caution yellow for `amber-pale`, and `--sprint-ornament-ink` drops to
`hull-500`.** With the plate fixed, what still separated the two grounds by eye was hue count rather
than structure: `trax` reads as one colour because its ground *is* the hue, so every mark on it is
tonal, while on charcoal any chroma reads as an accent. The yellow was the brightest thing on the
page at 10.95:1 and the only one outside the warm ramp apart from the alarm; `amber-pale` reads as a
warm sand, folds into the bone vocabulary the plate just established, and keeps the separation from
the action the yellow had (1.97:1 against 2.21:1). Ornament ink was `hazard-deep`, which on the
orange ground is a darker orange and therefore tonal, and on charcoal was a visible orange; `hull-500`
is the tonal equivalent. `trax-dark` is now one warm ramp plus one alarm.

Danger stays the house magenta. The measurement in
`20260923182104_the_warm_wedge_is_one_hue_wide_so_danger_leaves_it.md` has not changed, and nothing
here gives the warm wedge a second hue to spend. The reason is sharper than that ADR recorded,
though, and worth pinning: `--sprint-danger` is not only a field. `Alert` uses it as the *title ink*
on the panel ground, so it has to clear 4.5:1 as an ink, not merely 3:1 as a field. Every warm red
that clears it lands within 1.09:1 of the hazard action, and every one that separates from the action
by value reads 1.81–2.68:1 as ink. Magenta's 5.15:1 is what buys the role.

## Consequences

**Easier:**

- Both trax grounds now share a construction rather than a hue: a high-contrast band capping every
  Panel, a contour field on the page, a barcode strip closing the header, a misregistered second
  pass. What separates `trax-dark` from `dark` is how a page is built, not what colour it is.
- The hero hue is rationed again. Orange appears on the action, the plate rule, the link rule and the
  ornament ink, and nowhere structural.
- The generalisation is portable: a register whose plate must stamp on a dark ground stamps in the
  light ink, because value is the only channel left and the surface is already at the bottom of it.

**Harder:**

- A bone band on every Panel is a loud page at density. The workbench is the worst case and it holds,
  but a consumer stacking many small Panels will feel it more than trax's black band on orange.
- `--sprint-plate-link` and `--sprint-plate-control-ink` had to leave sand, since they now sit *on*
  it. They are `hazard-deep` (4.94:1) and `hull` (15.44:1).
- The register's two grounds now disagree about plate polarity as well as about danger. That is the
  second role where each ground is right for itself and neither is right for both.
