# Tone carries geometry as well as ink, and trax narrows to four hues

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

**The chevron becomes an arrowhead row.** One conic wedge, apex at the bottom of its tile, opening
upward across 36 degrees:

```css
conic-gradient(from 342deg at 50% 100%, ink 0 36deg, transparent 0)
```

A conic wedge is a triangle that tiles from `background-size` alone, which is the constraint that
decides the shape: the only two ornament tokens a component reads are the image and the size, so a
mark needing `background-position` cannot be expressed. That rules out every published CSS zigzag
recipe, all of which offset layers by half a tile; the first attempt used one and silently painted
nothing. A *stroked* V is not reachable either, because gradient layers composite over one another
and cannot subtract. Two stacked 90-degree wedges were reachable and were tried: at roughly half ink
coverage they read as a row of teeth and behaved as a field rather than as texture. A single narrow
wedge at about a quarter coverage reads as a row of downward arrowheads, which is what a freight
chevron panel actually is.

**The page ground sweep drops to roughly half strength and its lines move twice as far apart.** The
contour was the register's signature and it was tuned by argument rather than by looking at it. It
was loud enough to compete with body text, which is the line rule 12 exists to protect.

A contour field behind the PageHeader was tried at the same time and removed. The intent was to give
the signature mark somewhere bounded to be dense, on the reasoning that rule 12 protects the page
ground because a lede sits on it and a bounded band has no such constraint. In practice a header is
exactly where a lede sits, the field read as a mesh behind the title, and no alpha low enough to be
calm was high enough to be worth a role. `--sprint-header-rule` stays and `--sprint-header-field`
does not; the contour lives on the page ground alone.

**`--sprint-header-rule` puts the barcode under the page title.** DESIGN.md has listed barcode strips
in the ornament vocabulary since it was written, the trax ADR implemented one, and nothing drew it. A
7px barcode band along the bottom edge of every PageHeader is where the reference puts a serial, it
costs one `::after`, and it makes an implemented mark load-bearing instead of dead public surface.

**Trax narrows to four hues.** The register's own rule is that one hue is rationed to the action, and
between the plate band, the misregistration edge, the action, the mark, the link rule and the focus
ring the page had stopped obeying it. Four cuts, none of which touch the danger decision that
20260923182104_the_warm_wedge_is_one_hue_wide_so_danger_leaves_it.md settled with measurements:

- `--sprint-focus` in `trax-dark` moves from the house acid to the sand ink. The acid was the one
  cold element in a warm register and the only green on the page, and the rule the contrast test
  actually enforces is that focus is not the action, which sand satisfies. Acid now appears nowhere
  in trax at all, which is a simpler sentence than the one the register shipped with.
- `--sprint-warning` in `trax-dark` moves from the loud register's `#ffe800` to a warm safety amber
  `#ffc400`, 10.95:1 on the ground. The old value was a green-yellow imported from another register;
  the new one is a hazard colour in the register's own family and still separates from the orange by
  value.
- `--sprint-info` and `--sprint-warning` in `trax` collapse into the one press ink. They were a navy
  and an olive that measured 1.01:1 and 1.04:1 against the action, which is to say they were three
  tokens pretending to be three colours. Tone is carried there by the bar ladder above and by the
  label, which is what was actually happening already.
- The `trax-dark` plate band is charcoal rather than burnt orange, with the orange kept as the
  hairline rule beneath it. See the stamped-structure ADR.

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
- The contour is quiet enough to sit under body text, which is the constraint rule 12 was written
  for and which the first tuning did not actually meet.
- Trax reads as orange, sand, amber and one alarm, which is close to what a two-colour print with a
  spot alarm actually gives you.

**Harder:**

- Alert's left rule is a `::before` rather than a border, so a consumer overriding `border-left` no
  longer changes the tone bar. This is a visual breaking change in every register.
- The ornament contract is image plus size and nothing else, which is now known to exclude a whole
  class of marks. Anything needing a `background-position` requires a third token first, and that is
  a decision worth taking deliberately rather than discovering again.
- The chevron is one conic wedge, so its weight is its angle. A lighter chevron is a retune, but a
  stroked one is not reachable at all without changing the contract above.
- `trax` and `trax-dark` now disagree about what warning is, in addition to danger. Each is right for
  its ground.
- The display face is still a system stack, so the width it resolves to varies by platform. It is now
  genuinely condensed where a condensed face exists rather than nominally condensed everywhere.
