# On a dark ground an object separates by edge light not by shadow

- **Status**: Accepted
- **Date**: 2026-09-14
- **Depends on**: 20260914221725_shading_composites_by_blend_mode_not_alpha_over_black.md

## Context

`calorie` and `calorie-dark` were given the same six inks at different alphas, on the assumption that
a ground is a set of alphas. On bone that produced correctly seated objects. On carbon the panels and
cards read as outlines: a black cast shadow on a near-black ground is invisible, so the only thing
separating a surface from the page was its keyline, and a keyline is a drawing, not a lighting model.

The reference photography does not solve this with shadow either. A dark product shot separates the
object from the ground with a rim — the edge catches the key and the fill, and the shadow does almost
no work. The register had the mechanism for this already, in `--sprint-fresnel-ink` and
`--sprint-lip-ink`, tuned as if they were minor.

Separately, the ground itself was a flat fill. Every reference is shot on a seamless cyc with a
falloff from the top, and a flat `#0d0d0c` behind a lit object is the one remaining thing on screen
saying "web page" rather than "photograph".

## Decision

**On a dark ground the edge inks do the separating, so they are not scaled down from the light
ground's.** `--sprint-lip-ink` goes 0.22 → 0.30 and `--sprint-fresnel-ink` 0.12 → 0.20 in
`calorie-dark`. Those two are now stronger than their bone counterparts relative to their ground,
which is the opposite of what a uniform alpha scale would produce and is the point: **a ground's inks
express how that ground lights, not how dark it is.**

**The page ground is a sweep, and it is Shell's.** `--sprint-ground-sweep` is a full background-image
value — `none` in the default register, a radial falloff from above in both calorie grounds — painted
by `[data-sprint="Shell"]` with `background-attachment: fixed` so it behaves as a backdrop rather
than scrolling with an 11,000px page.

It is a whole image rather than an ink plus a shared geometry because a ground's sweep is the one
lighting element with no object to describe: there is no cap, no lip, no form for the geometry to be
correct about. A register that wants a linear wall, a vignette, or nothing should say so directly.

**Shell paints no `background-color`.** The page colour stays wherever the consuming app already put
it, and `none` in the default register means the declaration is inert. Shell had no background at all
before this, and giving it one would have been a change to every register rather than to the two that
asked for it.

## Consequences

**Easier:**

- A future dark ground has a worked example of the inversion, and the rule is stated rather than left
  to be rediscovered.
- A consumer can put their own sweep behind the whole app by setting one token.

**Harder:**

- `contrast.test.ts` measures ink against flat tokens, and the ground is now not flat. The sweep is
  confined to the top of the viewport and lightens rather than darkens on the dark ground, so it
  cannot break a measured pairing in the direction the test cares about — but that is an argument,
  not a test, and a register that swept downward or darkened would need one.
- Two of the six inks are now tuned per ground on a different principle from the other four, which is
  an inconsistency in the model even though it is the physically correct one.
