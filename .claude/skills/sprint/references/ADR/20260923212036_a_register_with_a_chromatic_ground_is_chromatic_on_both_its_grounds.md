# A register with a chromatic ground is chromatic on both its grounds

- **Status**: Accepted
- **Date**: 2026-09-23
- **Supersedes**: 20260923203855_on_a_near_black_ground_the_placard_is_stamped_in_the_light_ink.md
- **Depends on**: 20260923193938_a_chromatic_ground_admits_one_surface_value_so_structure_is_stamped_not_stacked.md

## Context

`trax-dark` kept reading as the loud `dark` theme with an orange accent, and two rounds of token work
did not fix it. The plate was stamped in the light ink and the placard silhouette came back; the
register narrowed from four hues to three. Both were improvements and neither moved the actual
impression, which was also that `trax-dark` felt unrelated to `trax`.

The reason both rounds missed is that they treated the symptom. `trax` reads as `trax` because **its
ground is the hero hue, full bleed**: every mark on the page is a tint of one colour, so the page is
a printed object. `trax-dark`'s ground was a warm charcoal `#1c1917` — a neutral. A neutral dark page
with panels a step off it and one chromatic accent is *precisely* the construction of the default
`dark` theme, so no accent tuning could separate them, and nothing structural tied it to its sibling.
The register was one chromatic ground and one ordinary dark theme wearing its hue.

The assumption never tested was that a dark ground has to be neutral. Rule 11 derived the orange
ground's ink cap from its 0.222 luminance, and that derivation was read as though chromatic grounds
were inherently bright. They are not. A deep burnt orange `#2b1006` sits at 0.0090, *lower* than the
charcoal's 0.0100, and every contrast-gated role gains a little headroom against it: magenta danger
4.64:1 against 4.55, the hazard action 5.04:1 against 4.95, `keyline-strong` 3.35:1 against 3.29.

A chromatic dark ground was free the whole time.

## Decision

**`trax-dark`'s ground is a charred burnt orange, not a warm charcoal.** The surface trio is
`char` `#2b1006`, `char-hi` `#331408` and `char-lo` `#210c04`: one value with a hair of separation,
which is what rule 13 already demands of `trax`. The register is now a chromatic ground on both
grounds, and rule 13 covers both of them for the same reason instead of one by rule and one by
accident.

Every remaining neutral goes with it. Keylines are `char-rule` and `char-edge`, muted ink is `clay`,
the inert field is `char-inert`, and the ornament ink is `char-edge`. **`trax` has no neutrals**, on
either ground: every value in the register is a tint of one hue family plus the sand ink, the action
hue, and the one alarm.

The plate decision from the superseded ADR survives unchanged and is now the pair's shared
construction rather than a repair: `trax` stamps black on bright orange, `trax-dark` stamps bone on
charred orange. Same band, opposite polarity, one register printed on two stocks.

**The inverted surface ramp is dropped.** It existed to separate `trax-dark` from `dark` and it never
did the job — 1.13:1 against `dark`'s 1.09:1 in the other direction is not a visible difference. With
a chromatic ground there is nothing left for it to buy, and rule 13 says a chromatic ground admits
one surface value anyway. Panels are the same field as the page, exactly as in `trax`.

The eight-step `hull` neutral ramp and the caution yellow are deleted rather than left unused.

## Consequences

**Easier:**

- The two grounds are legible as one register at a glance, which is the thing three attempts were
  trying to buy. A page is a burnt field with bone placards or a bright field with black ones.
- The rule generalises past trax: **a register whose identity is a ground hue keeps that ground on
  every stock it ships.** Swapping to a neutral for the dark variant hands the page back to whatever
  the default dark theme already looks like.
- Rule 11's cap is now understood correctly. It is a consequence of the orange ground's *luminance*,
  not of chroma, and a chromatic ground can sit anywhere on the value scale.
- Deleting the `hull` ramp removes the temptation to reach for a neutral inside this register.

**Harder:**

- `trax-dark` is a much more committed page than a dark theme usually is, and a consumer who wanted
  "trax, but neutral" no longer has it. That is the correct reading of what a register is, and it is
  still a loss of an option.
- The magenta alarm now sits on a warm chromatic field rather than a neutral one. It reads better
  there, but it is still the one out-of-family hue, for the reasons the warm-wedge decision measured.
- Every `trax-dark` value moved at once, so any consumer overriding an individual token against the
  old charcoal will need to re-derive it.
