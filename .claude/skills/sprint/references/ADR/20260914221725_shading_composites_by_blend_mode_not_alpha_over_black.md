# Shading composites by blend mode not alpha over black

- **Status**: Accepted
- **Date**: 2026-09-14
- **Supersedes in part**: 20260914211336_depth_is_a_lighting_model_of_mold_well_and_cast.md
- **Depends on**: 20260914221725_a_composite_token_resolves_at_the_element_that_declares_it.md

## Context

The depth ADR decided that the rim ink is "neutral translucent black, not a per-family dark tint",
reasoning that composited over a hot pink face it reads as deep pink. It does not. Painting black at
36% alpha over a saturated colour pulls it toward grey as well as toward dark, because alpha
compositing interpolates between the face and black in straight RGB. The result on flare is a chalky
dusty pink, and on crimson a muddy brown. Real pigmented plastic does the opposite: the turning edge
goes *more* saturated, because less light is returning while the hue stays what it is.

That single compositing choice is most of what separated the register from its NuCaloric reference.
The references are photographed injection mouldings on a seamless cyc; the register was reading as
satin vinyl lit by a soft ambient.

Two supporting defects were visible once that was named. The cast shadow was a straight-down
Material-style elevation, which contradicts the specular the moment it moves off centre — a
reflection that slides left with a shadow that does not is the clearest possible tell that the gloss
is painted on. And the specular travelled to the ends of a capsule at full strength, where the
surface has turned away from the light and there is nothing left to reflect.

## Decision

**Darkening is a `multiply` background layer; the specular is a `screen` one.** The three rim
`box-shadow` insets leave `--sprint-mold` and `--sprint-mold-compact` and become `--sprint-shade` and
`--sprint-shade-compact`, background-image layers of the same geometry, blended with
`--sprint-blend-shade` and `--sprint-blend-lit`.

Multiply at alpha *a* resolves to `backdrop × (1 − a)` for a black source: a pure luminance scale
that leaves hue untouched and raises saturation, which is what the material does. Screen does the
mirror for the highlight, desaturating toward white rather than laying opaque white over the hue.
**The ink token is unchanged** — the depth ADR was right that one neutral ink serves every face, and
wrong only about how to composite it. `--sprint-rim-ink` is reused verbatim by the shade layers.

**The transparent-ink no-op survives.** A fully transparent source leaves the backdrop unchanged under
every separable blend mode, so `dark` and `light` render exactly as before and the blend-mode
declarations need no theme override. Blend mode is geometry, declared once.

**The blend lists are tokens because their length is part of the geometry.** `--sprint-blend-lit` is
four entries (sheen over three shade layers), `--sprint-blend-shade` three. A component picks the one
matching its layer stack; getting it wrong is a parse error at the declaration rather than a silent
misblend.

**The cap size is the radius, not a percentage and not a magic pixel count.**
`--sprint-shade-cap` is `calc(var(--sprint-radius-control) * 1.6)`. This resolves the
percentage-versus-absolute question the register has now got wrong three times without inventing a
fourth constant: the cap *is* the radius, so the shading that describes it should be derived from the
radius. At a 0px radius it degenerates to zero width, which is correct for the flat register.

**The falloff is an absolute depth, not a percentage of height — corrected after review.** The first
implementation faded the bottom gradient out at 26% of the box and sized the cap ellipses at 70% of
it. On a 33px Button that is an 8px turn; on a 77px Card it is a 20px band with a 54px cap smeared up
the sides, and the Card read as though something had been spilled on it. **This is the fourth
percentage-versus-absolute error in this register, committed in the same change that restated the
rule**, which is worth recording plainly: the rule is easy to state and easy to break, because a
percentage is the shorter thing to type.

`--sprint-shade-depth` is `calc(var(--sprint-radius-control) * 0.65)` — about 12px, roughly the
bottom third of a 33px control. The same 12px on a 77px Card is a soft turn at the base. One value,
correct at both, which is the property an absolute unit has and a percentage does not.

The multiplier is anchored to the Button because the Button is the object the shading describes: a
capsule turning through its full depth. Everything larger is a plate, and a plate has almost no
curvature to show.

**The shade stays out of the label band, by the same budget as the specular.** The bottom gradient
reaches zero at 26% of height (22% compact) and the cap ellipses are centred below the box. The
contrast budgets are unchanged and unchallenged: 4.4% darkening on flare, 7.6% lightening on a filled
warning Tag.

**The cast shadow swings opposite the specular.** `--sprint-cast-shift` is a registered `<length>`
written by `trackGloss` as the negation of the pointer's offset from centre, scaled to ±10px, and
multiplied up for the raised and dialog variants. At rest it is `0px`, so a static page is unchanged
and the light is directly overhead, which is where the resting sheen puts it.

**The contact shadow is its own ink.** `--sprint-cast-contact-ink` is roughly double the ambient
alpha at a 1.5px blur. A studio key gives a hard, tight contact and a longer soft ambient; one ink at
one alpha cannot be both, and the previous `0 2px 3px` first layer was neither.

**The specular dies at the caps.** `--sprint-gloss-fade` is a registered `<number>` from 1 at centre
down to 0.25 at the clamp, scaling the sheen ink through `color-mix`. A reflection is a property of
the surface normal, so it has to fall off where the normal turns away; without it the highlight slid
out to the end cap undimmed and read as a moving sticker. Three properties now come off one pointer
event, all written to the same element, all clamped.

**Alert had no depth at all, and now has the full set.** It was the only block-level component in
the register with neither a mould nor a cast — a bone-50 rectangle with a keyline, sitting among
moulded parts. It takes `--sprint-mold`, `--sprint-cast`, and the shade layer. Its tone is still
carried by a thickened left border, which is crisp at a 0px radius and tapers into a crescent at
calorie's 20px; with actual material under it that reads as a coloured rim on a moulded part rather
than as an artifact, so the border is left alone.

**Every filled face that had a rim adopts a shade layer, including the ones on a `background`
shorthand.** Card and the Switch thumb are split into `background-color` plus `background-image`,
which is the same tax the depth ADR already recorded for the sheen. SegmentedControl's option hover
becomes `background-color` for the same reason: as a shorthand it wiped the checked option's sheen at
exactly the moment the pointer was over it and the tracking mattered.

## Consequences

**Easier:**

- A saturated face shades correctly on any hue with no per-tone `color-mix` and no second ink.
- A future ground still costs one block of inks; blend mode is not part of it.

**Harder:**

- The tax from the depth ADR grows: a filled control must now remember `background-color`, the
  matching `--sprint-shade*` layer, *and* the blend list whose length matches its stack. There is
  still no test for it, and it is still invisible outside the calorie register.
- `background-blend-mode` composites the element's own layers only, so an effect that needs to blend
  with what is *behind* the element would need `mix-blend-mode` and a stacking context. Nothing wants
  that yet.
- Shading now lives in two channels — `box-shadow` for the lip and fresnel, `background-image` for the
  rim — so reading a component's lighting means reading both.
