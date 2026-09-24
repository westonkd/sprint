# A chromatic ground inverts the palette and status becomes a tinted black

- **Status**: Accepted
- **Date**: 2026-09-23
- **Depends on**: 20260923182104_trax_is_the_freight_register_and_its_depth_model_is_the_printing_press.md

## Context

Every Sprint ground so far has been a neutral: void, paper, bone, carbon. DESIGN.md has always said
the ground may be the signature colour run full bleed, and no theme had ever taken it up.

The Trax reference has two faces. In the interface it is orange ink on black. On the poster it is a
saturated orange field with black ink, printed as two passes. The second one is the more interesting
half and it is the one nothing in the library had ever expressed, so `trax` is the orange field and
`trax-dark` is the black ground.

## Decision

**`trax` is a saturated orange ground, and the arithmetic of that decides the rest of the palette.**

`--sprint-color-hazard-field` is `#e2510b`, relative luminance about 0.222. WCAG AA at 4.5:1 admits
only inks below about 0.0105 luminance. That is darker than `#2a2a2a`. Nothing bright passes: not
acid, not the house magenta, not the orange itself, not white. A light ink cannot be rescued by
picking a better light ink, because the ceiling is a property of the ground.

So **on a chromatic ground every semantic role is a near-black, and hierarchy runs the opposite way
from every other Sprint ground**: the muted ink is *darker* than the body ink, not lighter, and
status is carried by tinted blacks rather than by hue.

- `--sprint-action` is `#14100c`, a plain black field with the ground's own orange as its ink. The
  poster's button is a black bar with orange letters knocked out of it.
- `--sprint-danger` is `#380000`, `--sprint-info` is `#001347`, `--sprint-warning` is `#1c1400`.
  Each is pushed to the maximum chroma its luminance budget allows rather than being a neutral black
  with a hint in it.
- `--sprint-ink-muted` is `#291203`, a red-brown. It clears 4.5:1 on the ground at 4.59:1 and sits
  1.3:1 from `--sprint-ink`, so the grade between body and chrome is a hue shift rather than a value
  step.
- `--sprint-focus` is `#000000`, the densest ink on the page, which is both the most visible focus
  ring available and distinct from the action black, satisfying the focus-is-not-action guard.
- `--sprint-inert` is `#d9a38a`, a bleached patch. It is the one role that has to go *lighter*, and
  it has to: a disabled field darker than the ground cannot carry an ink at 4.5:1 at all, because the
  required ink luminance comes out negative. An inert control is a place the second pass did not
  take, which is a better story than the arithmetic that forced it.

**This is not a workaround for the contrast gate. It is what two-colour screenprinting does.** The
second colours in a two-pass print are the black pass laid over the spot at varying density, so a
palette of tinted blacks over one saturated field is the honest rendering of the reference rather
than a compromise with it. It also coheres with the register's depth model, which is the same two
passes seen from the side.

**The cost is recorded rather than argued away: on the orange ground, status hue collapses.** All 22
pairings pass AA, and the four status tints are at maximum chroma for their luminance, but at the 2px
rule an Alert uses they are hard to tell apart. A danger Alert and an info Alert are distinguished by
their labels, not by their colour. This is survivable only because DESIGN.md rule 4 has always said
everything is labelled and every Alert carries one. It would not be survivable in a register that
relied on colour alone to carry state, and a consumer picking `trax` for a status-dense screen should
pick `trax-dark` instead, where the same roles are bright hues with room between them.

Two new tests pin the finding. One asserts that every status role in `trax` resolves darker than its
ground, so a future edit cannot quietly reintroduce a light status ink that fails. The other is the
existing keyline-strong sweep, now extended across all three of the register's grounds.

## Consequences

**Easier:**

- A chromatic ground is a thing Sprint can now do, and the rule for doing another one is written
  down: compute the ceiling first, then design under it.
- The register's most distinctive screen is also its most honest to the reference.

**Harder:**

- `trax` is the first theme where a component that carries meaning in a hue and nowhere else will
  fail, and no test can catch that, because the tokens pass AA.
- Anyone adding a semantic colour role now has to think about what it does on a ground where only
  near-blacks are legal. The obvious first draft of any new role will be a bright hue and it will
  fail in exactly one theme.
- `--sprint-inert` going lighter than its ground in one theme and darker in five is a genuine
  inconsistency in the role's meaning. It is the arithmetic, not a preference.
