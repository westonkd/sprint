# The specular tracks the pointer and is clamped out of the label band

- **Status**: Accepted
- **Date**: 2026-09-14
- **Depends on**: 20260914211336_depth_is_a_lighting_model_of_mold_well_and_cast.md

## Context

The calorie register reads as molded but not as *glossy*. A static highlight is a painted-on
highlight; what distinguishes gloss is that the specular moves when you move, because it is a
reflection of the light source rather than a property of the paint. Every other plastic cue in the
register is static, so the surface reads as satin however bright the sheen is made.

## Decision

**The tight specular tracks the pointer; the broad ambient band does not.** Only the sharp highlight
is a reflection. `--sprint-gloss-x` and `--sprint-gloss-y` are registered with `@property` as
`<percentage>` and drive the position of the tight gradient in `--sprint-sheen`; the broad ellipse
keeps its fixed position, which is what a diffuse ambient does.

**The travel is clamped so the specular can never reach the label.** `y` is clamped to 2–16% and `x`
to 8–92% of the control, so a pointer anywhere in the lower two thirds pins the highlight at 16% and
it never crosses the text. This is not polish — it is the only thing that keeps
`contrast.test.ts` meaningful. That test measures static tokens; a highlight free to wander under a
glyph would change the effective background at runtime and break AA with nothing to catch it, and the
budgets are tiny (4.4% darkening on the action tone, 7.6% lightening on a filled warning Tag). Any
future pointer-reactive effect inherits this constraint: **shading may respond to input only where
text is not.**

**A reflection band scales with the object; only a specular *dot* is a fixed size.** Sizing the
highlight in pixels was an over-correction from the end-cap fix. The top reflection on a capsule is a
cylinder's highlight running its whole length, so a 609px button and a 73px segment showed
near-identical reflections and neither read as the length it was. The register now has **one**
reflection, proportional at 70% of width, pinned above the label, and it is the thing that tracks.
The units rule is therefore narrower than first written: a *feature of the geometry* — a corner, a
cap — is absolute; a *reflection of the form* scales with the form.

**Only `x` is tracked.** Vertical travel was clamped to 2–16% to stay clear of the label, which made
it imperceptible, and a cylinder's specular slides along its length anyway. Dropping `--sprint-gloss-y`
also strengthens the legibility guarantee from a clamp to a geometric fact: the reflection's vertical
position is fixed in the token, so it *cannot* move under a glyph regardless of what the tracker does.

**Superseded within this decision: a specular is a fixed physical size, so it is sized in pixels.** Sizing it as a percentage of width
made it 183px wide on a 609px block button and 29px on a small one, so on a wide control it was a
broad wash brightening half the face rather than a streak travelling across it — and the movement was
nearly invisible as a result. It is now `52px 7px` (`30px 5px` compact). **This is the third
percentage-versus-absolute error in this register**, after the concentric corners and the end-cap
highlights. The rule generalises: anything describing a *feature of the material* — a corner, a cap,
a reflection — is sized in absolute units or in terms of the control's height. Percentages are for
things that genuinely scale with the box.

**The travel is eased, not snapped.** Tracking the pointer exactly reads as "the highlight is simply
there" rather than as motion. A 120ms linear transition on the registered properties makes the
movement legible without perceptible lag, which is only possible because `@property` gives them a
type to interpolate.

**Only glossy components are tracked.** `glossTarget` matches a small named set — Button, Card, Tag,
SegmentedControl, Switch, Shell — and prefers the nearest `data-sprint-part` within it, so a
SegmentedControl option gets its own highlight rather than the wrapper's. Without the set, hovering
anywhere wrote inline properties onto whatever `[data-sprint]` root was nearest, usually a `Panel`
that has no sheen at all: harmless to render, but pointless `style` churn on containers.

**A part is preferred only when the part is the lit face — corrected after review.** The rule as first
written preferred the nearest `data-sprint-part` unconditionally, justified by the SegmentedControl,
where the option genuinely is the moulded surface. It is wrong everywhere the parts are text: a
Card's `title` and `body` are spans with no background, they cover nearly the whole card, and every
pointer event over them wrote the gloss onto a span that could not paint it while the card's own
values sat at their defaults. **The effect had therefore never worked on a Card**, in the same way and
for a neighbouring reason to the substitution bug.

`LIT_PARTS` names the two parts that carry a lit face — `option` and `thumb` — and everything else
resolves to the root. The general rule: the tracker targets the element whose background shows the
reflection, and that is a fact about the component's CSS, not about the DOM's nesting.

**A released target loses its `style` attribute, not just its properties.** `removeProperty` on the
last declaration leaves `style=""` behind, which then sits in the DOM of every component the pointer
has ever crossed. Nothing renders differently, but the agent contract's whole premise is that the DOM
is read, and an empty attribute is noise in what gets read.

**One delegated listener in `SprintProvider`, not a handler per component.** The provider already
renders the view container, so `onPointerMove` and `onPointerOut` there cover every descendant
through one React listener. This was chosen over per-component handlers because it touches no
component's props — no merging with a consumer's own `onPointerMove`, no new prop, and nothing to
remember when adding a component. It also means the effect cannot leak into the agent view: the
provider knows the view and attaches nothing when it is `agent`.

**It writes two custom properties on the nearest `[data-sprint]` root and nothing else.** No new
attribute: a `data-sprint-gloss` marker would have read as component state to an agent, and the
agent contract reserves that namespace. Components that do not use the properties simply ignore them.

**It is off for touch and for reduced motion.** A tracked highlight has no meaning without a
hovering pointer, and it is motion. `pointerType === "touch"` and
`prefers-reduced-motion: reduce` both bail before any write. Gating in JS rather than CSS is
deliberate — an inline style would win over a media query.

## Consequences

**Easier:**

- Gloss is now a property of the register rather than of each component, and a new molded component
  gets it by existing.

**Harder:**

- This is the library's first pointer listener and its first `@property`. `@property` is Chrome 85+,
  Safari 16.4+, Firefox 128+; without it the custom properties still work, they just cannot
  interpolate, so the effect degrades to a snap rather than disappearing.
- Writing inline custom properties on hover means a component's `style` attribute now changes during
  interaction. Anything asserting on `style` will see it.
- The clamp is a real constraint on future design and is easy to widen without realising what it
  protects. It is stated here so that widening it is a decision rather than an accident.
