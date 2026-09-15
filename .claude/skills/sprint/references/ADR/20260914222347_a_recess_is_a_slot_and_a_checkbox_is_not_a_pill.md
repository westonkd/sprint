# A recess is a slot and a checkbox is not a pill

- **Status**: Accepted
- **Date**: 2026-09-14
- **Supersedes in part**: 20260914211336_depth_is_a_lighting_model_of_mold_well_and_cast.md

## Context

A pass over every component on one page, in both calorie grounds, found the register's raised objects
convincing and its recessed ones not. `--sprint-well` was two shadows — `inset 0 2px 4px` and a 1px
bottom lip — while `--sprint-mold` had grown to four layers plus a shade stack. So a button read as a
moulding and the field beside it read as an outlined rectangle with a smudge at the top, even though
both were nominally lit by the same model. Every form control shares that one token, so the weakest
geometry in the register was also the most repeated: TextInput, Textarea, Select, SecretField,
Checkbox, the SegmentedControl track, the CodeBlock body, and the Switch track.

The same pass found checkboxes rendering as circles. `--sprint-radius-control` is 18px in calorie and
the box is 14px, so `calc(var(--sprint-radius-control) / 2)` is 9px against a 7px half-height and the
browser clamps it to a capsule. A checkbox that is round is a radio button, which is a control-meaning
error rather than a taste one, and it had been invisible because the register that introduced it is
also the register where the clamp bites.

## Decision

**A well is the mould inverted, layer for layer.** The token gains the geometry its counterpart
already had: a hard line at the top inner edge where the wall is cut, a blurred falloff below it, a
darkening at each inner cap where the slot turns, and the bounce lip along the bottom that was
already there. Same ink, same transparent-ink no-op, no new token.

```
inset 0 1px 0                 well   the cut edge
inset 0 4px 6px -3px          well   the falloff
inset ±8px 0 8px -8px         well   the inner caps
inset 0 -1px 0                lip    the bounce
```

The cap layers are what actually sell it. A slot with only vertical shading reads as a gradient
painted on a flat rectangle, which is exactly what the field did.

**`--sprint-radius-control-tight` is a fourth radius role, and the reason is control meaning.**
The depth ADR's "short controls pill themselves" observation — one radius, correct at a 33px button
and a 100px textarea, no second role — holds for everything whose silhouette is free. It does not
hold for the checkbox, because a capsule at that size is another control's affordance. The role is
`0` in the default register, where it changes nothing, and `5px` in calorie.

This is a narrow exception, deliberately expressed as a token rather than as a `calc()` on the
existing one, so that a consumer theme has to decide it rather than inherit an arithmetic accident.
A derived value is what produced the circle.

**A selected segment stays selected while hovered.** The generic option hover rule outranked the
`aria-checked` rule, so pointing at the current selection turned it from the action colour to the
neutral hover grey — the selection appeared to move to whatever the pointer was over. A checked
option now brightens to `--sprint-action-hover` instead, which is what a glossy face does under a
light and also what every other filled control in the register already did.

## Consequences

**Easier:**

- Every recessed control in the library got deeper at once, because they had all been routed through
  the one token already. That is the token layer working.
- The radius exception is visible in `semantic.css` rather than buried in a component's `calc()`.

**Harder:**

- Four radius roles now, and a new component has to pick rather than default. The test is whether the
  control's silhouette carries meaning: a checkbox's does, a button's does not.
- The well is now five shadows on eight components. It is still one declaration, but it is no longer
  cheap enough to apply speculatively to anything that merely looks inset.
