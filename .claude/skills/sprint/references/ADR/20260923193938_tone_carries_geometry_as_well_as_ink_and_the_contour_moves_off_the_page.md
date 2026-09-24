# Tone carries geometry as well as ink, and the contour moves off the page

- **Status**: Accepted
- **Date**: 2026-09-23
- **Depends on**: 20260923182104_a_chromatic_ground_inverts_the_palette_and_status_becomes_a_tinted_black.md

## Context

The chromatic-ground ADR recorded that status hue collapses on the `trax` ground, called the cost
survivable because rule 4 says everything is labelled, and predicted that danger and info would be
"told apart by their labels rather than by their colour".

Measured, it is worse than that. Every status field on the orange ground is within 1.07:1 of every
other one, and danger against info is 1.01:1. An Alert's tone is signalled by one left rule, and all
four of those rules are the same near-black. In a list of six alerts a person cannot find the failure
without reading all six, which is not the same thing as being able to read which one it is once
found. Rule 4 saved the meaning and lost the scan.

Two smaller findings from the same review belong with it, because both are a mark that was named and
then not spent:

`--sprint-ornament-chevron` was `repeating-linear-gradient(135deg, ink 0 10px, transparent 10px 20px)`.
`hatch` is the same construction at the same angle with a different duty cycle, and so are
`hatch-dense` and `shade`. The register's one new mark of manufacture was a fourth diagonal stripe.

`--sprint-ornament-barcode` was implemented and referenced by nothing, and `contour`, called the
register's signature, was spent only on the page sweep, where rule 12 holds it to 0.10 alpha and it
renders as a faint arc in two corners. The register's loudest idea was its least visible one.

## Decision

**Tone carries geometry as well as ink, in every register.** Alert's left rule becomes a `::before`
bar whose *width and fill* vary by tone, not only its colour: a hairline for neutral, the thick
keyline for info, a wider solid bar for warning, and a wider bar again filled with the alarm mark for
danger. Hue is a luxury that a chromatic ground cannot afford and that a colour-blind reader never
had; width is free on every ground. This is the generalisation of rule 4 from "everything is
labelled" to "a status channel that a ground can eat needs a second channel that it cannot", and it
is a library-wide change rather than a trax one, because the reason applies to every register.

**The alarm mark is a register choice, not trax's.** `--sprint-ornament-alarm` defaults to
`hatch-dense` and trax sets it to the chevron, the same shape `--sprint-ornament-empty` already has.
Calorie does not inherit a hazard chevron it has no reason to draw; its vocabulary is the ejector pin
and the mould seam, and a register picks from its own set.

**The chevron becomes a chevron.** Two conic wedges rather than a diagonal stripe:

```css
conic-gradient(from 135deg at 50% 0%, ink 0 90deg, transparent 0),
conic-gradient(from 135deg at 50% 50%, ink 0 90deg, transparent 0)
```

A conic wedge is a triangle that tiles from `background-size` alone, which matters because the two
ornament tokens a component may read are the image and the size; a mark that needs a
`background-position` is not expressible and the first attempt at this, the four-gradient zigzag
recipe, silently painted nothing for exactly that reason. Solid wedges rather than an outlined V is
the honest limit of gradients, and a solid arrow is what a placard uses anyway.

**The contour moves off the page ground and onto the PageHeader.** Rule 12 constrains the page
because a lede sits directly on it and the margin there is thin. A bounded band is a different
proposition, so `--sprint-header-field` paints the contour behind the page header at roughly twice
the page sweep's alpha, drawn in `--sprint-header-field-ink` so it is a lightening pass on both
grounds. On the orange ground that is a strict rule 12 move, away from the near-black ink. On the
charcoal ground an orange line does move the ground *toward* the sand ink, and the measured floor is
about 7.1:1 against an AA bar of 4.5, so **rule 12 gains a second clause: on the page ground the
direction rule holds absolutely, and on a bounded band the test is the measured floor.** The page
ground keeps its own sweep, unchanged.

**`--sprint-header-rule` puts the barcode under the page title.** DESIGN.md has listed barcode strips
in the ornament vocabulary since it was written, the trax ADR implemented one, and nothing drew it. A
7px barcode band along the bottom edge of every PageHeader is where the reference puts a serial, it
costs one `::after`, and it makes an implemented mark load-bearing instead of dead public surface.

**The condensed display voice is made real.** `--sprint-font-condensed` led with `Arial Narrow`, which
fontconfig substitutes with a non-narrow face on Linux, so the resolved stack measured 2.3% narrower
than plain `sans-serif` while `DejaVu Sans Condensed`, genuinely condensed and installed, sat further
down the list and was never reached. Reordering so the real condensed faces come first, and adding
`--sprint-display-stretch` so a width-capable face is actually asked to condense, takes the same
string to 11.5% narrower. The trax ADR claimed the width axis as the register's owned signature; it
now has one.

## Consequences

**Easier:**

- An Alert's tone survives a ground that eats hue, and survives a reader who cannot separate magenta
  from orange. Both were already true problems and only one of them was a trax problem.
- `--sprint-ornament-alarm` is the second mark slot after `--sprint-ornament-empty`, and the pattern
  is now clear: a semantic use of ornament gets a role, and each register fills it from its own
  vocabulary.
- The contour is visible, which is the only test a signature has to pass.

**Harder:**

- Alert's left rule is a `::before` rather than a border, so a consumer overriding `border-left` no
  longer changes the tone bar. This is a visual breaking change in every register.
- Rule 12 now has two clauses and the second one is enforced by measurement in an ADR rather than by
  a test, which is the same gap the rule was written to close. A sweep is a composited image and
  `contrast.test.ts` reads flat tokens.
- The chevron is drawn with conic gradients, which cannot make an outlined V. If the register ever
  wants a lighter chevron the mark has to be redrawn rather than retuned.
- The display face is still a system stack, so the width it resolves to varies by platform. It is now
  genuinely condensed where a condensed face exists rather than nominally condensed everywhere.
