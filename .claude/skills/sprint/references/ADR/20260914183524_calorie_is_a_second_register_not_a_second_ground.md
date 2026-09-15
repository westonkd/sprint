# Calorie is a second register, not a second ground

- **Status**: Accepted
- **Date**: 2026-09-14
- **Depends on**: 20260914183524_the_semantic_layer_carries_shape_type_and_motion_not_only_color.md

## Context

DESIGN.md is the source of truth for R4 and its first rule is absolute: "No gradient, no drop shadow,
no blur, no bevel, no border-radius above 0", under a summary that says "Nothing looks soft,
dimensional, or friendly." That is deliberate and it works, but it is a house style with a narrow
audience. Both shipped themes are that style on different grounds.

The ask was a theme with mass appeal: the one a team picks when they want a component library rather
than a statement. That cannot be a fourth ground in the same register, because the register is what
polarizes.

## Decision

**`calorie` is a new register, and DESIGN.md's seven rules now describe the default register rather
than the library.** The seven rules are unchanged and still govern `dark` and `light`. They are no
longer a claim about every Sprint surface.

**The register is warm, rounded, and quiet.** A linen ground (`#faf7f2`) rather than paper white,
indigo as the action color, vermilion for danger, a humanist sans as `--sprint-font-ui`,
sentence-case labels at near-zero tracking, 8px and 14px radii, a pill for Tag and Switch, and eased
motion at 120–240ms in place of `linear` and `steps(4, end)`.

**Two elements carry across, chosen because they are what makes Sprint recognisable rather than what
makes it loud:**

1. **The ornament vocabulary.** Hatch, dots, crosses and scanlines draw in `--sprint-ornament-ink`,
   which resolves to the keyline, so they theme for free and land as soft texture on linen instead of
   hazard hatching on black. Nothing else in the component space marks its empty states this way.
2. **The serif display voice.** `--sprint-font-display` is deliberately *not* overridden. The page
   title stays a high-contrast serif over small UI type; only its casing relaxes, via
   `--sprint-display-transform`. The register clash survives; the shouting does not.

**Acid does not appear in calorie at all.** It is 1.24:1 on the linen ground. Unlike the light
theme, which kept acid alive as ink on ultramarine, calorie has no field to put it on and does not
invent one. Two findings are pinned in the contrast test: acid must not be the calorie action role,
and calorie danger takes light ink because the ground's own ink fails on vermilion at 3.03:1.

All 19 contrast pairings pass AA, the tightest at 5.35:1.

**`SprintTheme` becomes `"dark" | "light" | "calorie"`.** The workbench and landing page get the
third option; the theme control still registers no WebMCP tool, because the agent view is theme-blind
and an agent gains nothing from flipping it.

## Consequences

**Easier:**

- Sprint is adoptable by teams that want the agent contract without the house style. The two agent
  surfaces are identical under all three themes, which is the actual product.
- The ornament and serif carryover gives a cheap test for future themes: if neither survives, it is
  not a Sprint theme.

**Harder:**

- DESIGN.md is no longer a single coherent voice. It describes one register in detail and names a
  second, and the two disagree by design. A reader has to know which one a component is being judged
  against.
- `calorie` is a permanent public value, and the linen ramp, indigo and vermilion are permanent
  primitives.
- Every new component now has three themes to walk, and the third is the one where a missing
  `--sprint-radius-*` declaration shows.
- There is no dark counterpart. A `calorie`-register dark theme is a separate decision.
