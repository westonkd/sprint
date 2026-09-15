# The theme attribute names a register and ground cell, not an axis

- **Status**: Accepted
- **Date**: 2026-09-14
- **Depends on**: 20260914183524_calorie_is_a_second_register_not_a_second_ground.md

## Context

The calorie ADR closed with "There is no dark counterpart. A `calorie`-register dark theme is a
separate decision." That deferral does not survive contact with the ask calorie exists to serve: a
team picking a component library for mass appeal expects to ship a dark mode, and a register that
only has a light ground is not a theme they can adopt.

`data-sprint-theme` had three values for what is really two independent axes:

| | dark ground | light ground |
| --- | --- | --- |
| Default register | `dark` | `light` |
| Calorie register | *missing* | `calorie` |

The missing cell is the decision. How to name it is the harder half.

## Decision

**The attribute names a cell, not an axis. `calorie-dark` is a fourth value.** The alternatives were
worse:

- *Split into `data-sprint-register` and a ground attribute.* Conceptually honest, but
  `data-sprint-theme` is a documented public attribute under an explicit no-rename contract, and a
  cross product still needs one CSS block per cell. It breaks consumers to buy nothing.
- *Make `calorie` follow `prefers-color-scheme`.* Rejected on the contract. A theme value is
  documented as pure CSS you can put on any element, and a dark island resetting inside a lighter
  subtree is a stated feature. A value that resolves differently per machine cannot do either, and
  the contrast test's model of one block equals one resolved palette stops being true. The app
  chooses, the way `dev/theme.ts` already does with `matchMedia`.

**In `semantic.css` the register is declared once and the ground twice.** A block selecting both
calorie values carries shape, type, motion, space and label sizes; each value's own block carries
only the color roles and `color-scheme`. Adding a ground to a register is now one color block rather
than a copied register, which is the shape that keeps the two from drifting.

**The dark ground is the light ground's own family inverted, not the loud register's palette.** Ink
is linen `#f3efe6`, which is the light ground; the ground is bark `#171410`, a warm near-black one
step off the light register's ink. Accents are the pale siblings of calorie's own hues: indigo-pale
`#a3a8ff`, vermilion-pale `#ff9b8a`, amber-pale `#e8bb5c`, ember-pale `#ff9f45` for focus, and
cyan-pale `#7cc7d6` for info. The loud register's electric cyan was the first draft and read as an
import; on a warm ground it was the only cold thing on the page.

**Rule 8 is tested rather than asserted.** The calorie ADR claimed "every interactive boundary clears
3:1" having checked the ground and the raised surface only. `--sprint-keyline-strong` was 2.88:1 on
`--sprint-surface-inset`, which is the Panel header band and the ground under any control sitting in
one. `--sprint-color-linen-500` moves to `#867b6a`, and a new test walks keyline-strong across all
three grounds for both calorie values so the claim cannot rot.

**Every theme block declares `color-scheme`.** Without it the browser paints light scrollbars, native
`<select>` popups and autofill over a dark ground. This was already wrong for the `dark` theme and is
fixed there too.

All 19 contrast pairings pass AA in `calorie-dark`, the tightest at 5.13:1.

## Consequences

**Easier:**

- Calorie is adoptable by a product that ships a dark mode, which is most of them.
- The two-block structure means a future ground is a color block. A future *register* is still the
  expensive thing, which is the right way round.
- `color-scheme` lands for every theme, so native chrome stops betraying the ground.

**Harder:**

- Four values, and the grid is implicit in the names rather than in the attribute. A fifth ground
  would make that worse; at that point the two-attribute split becomes worth its breaking change.
- `bark`, the three pale accents and cyan-pale are permanent primitives.
- Every new component now walks four themes, and `calorie-dark` is the one where a hardcoded light
  assumption shows.
