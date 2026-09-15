# Depth is a lighting model of mold well and cast

- **Status**: Accepted
- **Date**: 2026-09-14
- **Depends on**: 20260914183524_the_semantic_layer_carries_shape_type_and_motion_not_only_color.md

## Context

The calorie register was pivoted to a dimensional one (see
20260914211336_calorie_is_the_nucaloric_register_and_the_sprint_test_moves_off_the_serif.md). The
first design for that was an elevation scale: `--sprint-elevation-1`, `-2`, and a press. Rendered,
it produced flat cards with a shadow under them, which is not what a moulded object looks like.

A moulded object photographed under a light shows three things at once, and the drop shadow is the
least important of them: a bright specular lip along the top edge where the light catches the
moulding, a dark self-shadowed rim along the bottom where the form turns away, and a soft contact
shadow on the ground. Anything recessed shows the inverse. An elevation *scale* cannot express that,
because it treats depth as one number.

## Decision

**Depth is three ideas, not a scale.** `mold` is a thing standing out of the surface, `well` is a
thing pressed into it, and `cast` is what it throws on the ground. A component picks a role, it does
not pick a level.

```
--sprint-mold           inset top lip + inset bottom rim
--sprint-mold-pressed   both collapsed
--sprint-well           inset shadow from above + lip along the far wall
--sprint-cast           contact + ambient
--sprint-cast-high      the dialog's version
--sprint-cast-pressed   what is left when the object is held down
--sprint-sheen          the top-light gradient across a filled face
```

**Geometry is declared once; only the ink is themed.** This is the split `ornament.css` already
uses, for the same reason and with one extra property: **when the ink is `transparent`, the
geometry paints nothing.** That is the entire mechanism by which `dark` and `light` render
identically to before. The six inks — `--sprint-lip-ink`, `--sprint-rim-ink`, `--sprint-cast-ink`,
`--sprint-well-ink`, `--sprint-sheen-ink`, `--sprint-scrim` — are the only per-ground part, because
a shadow on bone and a shadow on carbon need different alphas. Adding a fifth ground costs six
lines, which is the shape a ground is supposed to have.

**The rim ink is neutral translucent black, not a per-family dark tint.** Composited over a hot pink
face it reads as deep pink; over bone, as warm grey. One token, correct on every field colour, and
no `color-mix` per tone.

**All of it lives in `semantic.css`, not a new file.** `contrast.test.ts` parses only
`primitives.css` and `semantic.css`, so a third file would be invisible to the gate that enforces
"one block equals one resolved palette". `ornament.css` earns its own file because it ships a public
`data-sprint-ornament` attribute vocabulary; depth ships no attribute, because it is a component's
decision and not a consumer's.

**`box-shadow` is a component's own channel, and a library-wide shadow is forbidden.** `outline` is
already spoken for by the global focus ring in `base.css`, which leaves `box-shadow` free — but
`Select`'s chevron is nine zero-blur `box-shadow` offsets plotting a pixel glyph, so a blanket rule
on `*` or `:where()` would destroy it. Every depth declaration lands on a named component root or a
named `data-sprint-part`. `Select.css` is untouched by this change, which is the proof.

**The sheen is a `background-image` layer, so every filled control's `background:` shorthand had to
become `background-color:`.** Button, SegmentedControl, Switch, Tag and Shell were split.
**Checkbox declines the sheen**: its check glyph is already a gradient layered in one shorthand, and
composing a second layer would need four properties with positionally aligned comma lists,
permanently, to add a falloff across an 8px box where it is invisible. The rule that generalises:
the sheen applies only to faces large enough to show a falloff.

**`:active` is written unconditionally and no-ops via `--sprint-press-shift: 0`.** Component CSS
must never key off a theme value; that is the whole point of the token layer. And the press is not
a translate with a smaller shadow — **the lip collapses and the rim goes with it**, because the
object has stopped standing proud of the surface. That is why `--sprint-mold-pressed` is its own
geometry.

**Reduced motion keeps the press and drops only the transition.** A press is a state change, not a
flourish, and the degradation target both the PRD and DESIGN.md set is "an instant state change".

Two existing inconsistencies were fixed because a dimensional register exposes them:

- `Dialog` hardcoded `--sprint-keyline` for the offset registration outline that `Panel` routes
  through `--sprint-keyline-halo`, so in calorie the panel correctly dropped its halo while the
  dialog kept one — the exact misregistration the halo role exists to prevent. Dialog now uses the
  role.
- `Dialog`'s `::backdrop` had no `background-color` at all, only an ornament stripe, so a floating
  modal had nothing for its shadow to fall on. It now paints `--sprint-scrim` under the stripe,
  `transparent` in the default register.

**An inset child gets its own corners; it does not borrow the parent's clip.**
`--sprint-radius-surface-inner` and `--sprint-radius-control-inner` are the container's radius less
its border width, clamped at zero. Panel and Dialog headers, the CodeBlock header, the Image caption
and the SegmentedControl's end options previously relied on the parent's `overflow: hidden` to round
them, which was invisible at a 0px radius and merely imprecise at 14px. With a well on the header it
became a defect: the inset shadow hugs a square top edge, so the parent's clip sliced the stroke and
left a dark notch in the corner. It was obvious on carbon and nearly invisible on bone only because
that ground's well ink is a third the alpha. Concentric corners are geometry a component should state,
not a side effect of clipping. The same role fixes `Button`'s loading hatch, an `inset: 0` overlay
that had no radius because until now no register gave a button one.

**The label band carries no shading at all, and that is a contrast requirement before it is a
taste one.** Lighting a face changes the colour underneath the text, and the contrast test measures
ink against the flat token. Measured both directions, the headroom is almost nil:

| | budget before AA breaks |
| --- | --- |
| darkening flare under near-black ink | **4.4%** |
| lightening amber under light ink (filled warning Tag) | **7.6%** |

So the curvature is confined to the top third and the bottom eighth, and reaches zero across the
middle where the glyphs sit. The measured ratio is then the ratio at the glyphs, which is what makes
`contrast.test.ts` mean anything once a register has lighting. This happens to be physically right as
well — a cylinder is flattest across its centre — but the constraint is the contrast gate, not the
physics, and a future register must respect it whatever it looks like.

That budget is also why the specular is white-only. Darkening is what the action tone cannot afford;
lightening it *improves* the ratio. The gloss therefore does all its work with `--sprint-lip-ink` and
`--sprint-sheen-ink`, and `--sprint-rim-ink` is spent only below the label.

**Curvature is blur, not a band.** The first implementation used hard `inset 0 1.5px 0` and
`inset 0 -3px 0` edges, which is a bevel: the face still read flat. A form reads as curved only when
the falloffs are blurred and the specular is a band inset from the edge rather than starting at it —
a crisp 1px catch on the top edge, a gap, then a soft band; darkened side caps; and a bounce-light
line along the bottom. `--sprint-mold-compact` and `--sprint-sheen-compact` are the same shape scaled
for Tag, the Switch thumb and a SegmentedControl option, whose label would otherwise sit inside the
falloff.

**Lighting that describes a cap must be measured in the cap's own units, which are absolute.** The
first gloss placed its end-cap highlights at 13% and 87% of the width and sized them at 38% of it.
A cap's radius is a function of *height*, not width — 16.5px on a 33px control — so a 38% blob was
more than twice the cap and smeared across the flat body, and on a wide block button the catch landed
ninety pixels from the end. The silhouette was a mathematically exact capsule the whole time and it
still read as a flat-fronted rounded rect, because nothing in the shading acknowledged the ends.
Percentages are the wrong unit for any cap-relative effect.

The correction was not to reposition those catches, though. **Roundness is carried by shading, not by
speculars, and there is one light.** Absolute-positioned catches on both ends fixed the geometry and
produced a worse result: two symmetric bright dots imply two light sources, and on a saturated face
they read as headlights. The tell was that the `neutral` tones already looked right — their face is
the near-white raised surface, so a white specular on them is invisible and all that remains is the
cap and bottom shading. That version was the correct one all along.

So the gloss is a single soft ellipse in the upper body, offset off-centre toward the light and
faded well before the caps; the caps read as spherical because each carries a lower-outer shadow that
turns it away from that one light. Discrete cap highlights are gone. A specular can only sell a form
that the shading has already established, and two of them cannot.

**Short controls pill themselves.** `--sprint-radius-control` is 18px in calorie, which exceeds half
the height of a 33px button, so the browser's own radius clamping renders it as an exact capsule
while a 100px Textarea stays a rounded rect. One value, correct at both sizes, no second role.

**Gloss is two speculars, and compliance is a squash.** A single broad highlight is satin; gloss is a
small sharp streak sitting inside a broad dim one, so `--sprint-gloss-ink` was added alongside
`--sprint-sheen-ink`. Thickness comes from `--sprint-fresnel-ink`, a faint hairline riding the whole
rim under the dark bottom edge, so light wraps the perimeter instead of stopping at the top. And
because plastic gives under a finger, the press adds `--sprint-press-scale` to the existing drop;
`--sprint-cast-raised` lifts a hovered control between the resting and pressed states.

**A themed token declared outside `semantic.css` silently loses to its own default.**
`--sprint-ornament-ink` was declared on `:root` in `ornament.css` and overridden in the calorie
blocks in `semantic.css`. Both selectors have specificity 0,1,0, `ornament.css` is imported after
`semantic.css`, so the default won and **calorie's tinted ornament had never once rendered** — the
ember tint the calorie ADR records as its fix for "the ornament was invisible" was invisible for a
different reason the whole time, and its 16% was tuned against something that was never on screen.
Both ornament roles now default in `semantic.css` alongside the theme blocks that override them.
This is the same rule the elevation tokens follow and the reason for it is now demonstrated rather
than asserted: **every themed default belongs in `semantic.css`.**

**An ornament that does not tile itself needs a size role.** `--sprint-ornament-empty` lets a theme
swap the empty-state mark — hatch by default, `pin` in calorie, so an empty region reads as ejector
pin marks on a moulded part. `hatch` is a `repeating-linear-gradient` and tiles on its own; `pin` is
a `radial-gradient` and rendered as one page-sized blob until it got
`--sprint-ornament-empty-size` to pair with it, mirroring the existing `-dots-size` and
`-checker-size` tokens.

**A vocabulary wired to nothing is not a feature.** `pin` and `parting` were added to the ornament
set and consumed by no component, so they could not be seen. `pin` now backs the empty state;
`parting` remains vocabulary for consumers, as `checker`, `dots` and `scanlines` already are.

**A cast shadow needs room, and a clipping ancestor is where it runs out.** The workbench's specimen
stage sized its bleed for a focus ring, four pixels, and set `overflow-x: auto` — which per spec
forces the other axis to `auto` as well, so it clipped the shadow flat four pixels below the control.
Any `overflow: hidden` container does this, `Panel` included; the fix is to give the shadow at least
as much room as the container's own padding, not to shrink the shadow.

**Only the outermost `Panel` is lit.** Three stacked shadows on alternating grounds read as mud and
fight the decision that makes ground alternation the nested-depth model, and a nested shadow would
spill past the parent's `overflow: hidden` and hard-cut. The suppression rides on the rule that
already kills the halo outline on nested panels — one added declaration, no new selector.

## Consequences

**Easier:**

- A register can be dimensional or flat without a single `[data-sprint-theme=...]` selector reaching
  into component CSS.
- A future ground declares six inks and gets correct lighting for free.

**Harder:**

- Every new filled control must remember `background-color`, not `background`, or it silently drops
  the sheen. There is no test for this; it shows up only in the calorie register.
- `box-shadow: 0 1px 2px transparent` is not literally `box-shadow: none` — it creates a paint
  record. Visually identical, no layout effect, and the alternative (attribute-gated component CSS)
  is far worse.
- Depth is now a thing a new component has to decide about: mold, well, cast, or nothing.
