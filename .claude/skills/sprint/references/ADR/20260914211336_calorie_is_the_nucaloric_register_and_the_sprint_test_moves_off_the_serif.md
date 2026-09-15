# Calorie is the NuCaloric register and the Sprint test moves off the serif

- **Status**: Accepted
- **Date**: 2026-09-14
- **Supersedes in part**: 20260914183524_calorie_is_a_second_register_not_a_second_ground.md

## Context

`calorie` was specified as the theme "a team picks when they want a component library rather than a
statement": warm linen, indigo action, humanist sans, rounded, roomier. Its own ADR recorded the risk
in the act of fixing it, noting that a first pass "left calorie reading as a competent but anonymous
beige admin theme".

Seen in a real consuming app it read that way anyway. The brief was the problem, not the execution.
A register whose goal is inoffensiveness has no way to be good, because there is nothing it is trying
to be.

## Decision

**Calorie stops chasing mass appeal and becomes a second statement register**, taking the NuCaloric
brand design from Bungie's Marathon as its reference: neutral bone and carbon grounds, one hot
magenta hero, heavy grotesk display in sentence case at negative tracking, tiny uppercase tracked
micro-labels, and molded-plastic physicality.

The name is kept. `calorie` and `calorie-dark` are public values, and the name now means something
it did not before.

**The grounds go neutral.** Warm linen `#f3efe6` and bark are replaced by bone `#eceae5` and carbon
`#0d0d0c`. The warmth was the single largest contributor to the beige read, and the references are
achromatic. The linen and bark primitives are kept rather than deleted; removing a shipped primitive
is churn, and deleting them is a separate call.

**Radii go up substantially** — control `8px` to `14px`, surface `14px` to `20px`. A 14px radius on a
44px control is what separates "moulded" from "rounded rectangle".

**Focus moves from ember to indigo.** The calorie ADR chose ember specifically because it was
maximally separated in hue from indigo. Against a hot pink, ember is a weak separation and an ember
ring around a pink button reads as a rendering artifact. Indigo is freed by the action change, so
this is reuse rather than invention, and the register gains a cold focus against a warm hero: 6.76:1
on bone, 8.89:1 on carbon.

**`--sprint-font-display` is overridable, which supersedes the named carryover.** The prior ADR said
the serif "is not overridden" and called it, with the ornament vocabulary, "the test of whether a
future theme is a Sprint theme at all". That test is replaced, because a font claim is both
unenforceable and the wrong thing to have been testing.

**The replacement is three-part, and two thirds of it are machine-checked:**

1. **The ornament vocabulary survives and is visible.** Unchanged, and still the strongest signal —
   no other component library marks its empty states with a tiled house mark. NuCaloric's
   checkerboard and technical marks are already in the closed set, so this register leans on the
   vocabulary rather than merely preserving it.
2. **Chrome speaks in a micro-label voice: a real grade below body, tracked.** This is the
   generalisation of "uppercase mono labels". What carries across is that Sprint chrome reads as a
   spec sheet, which is exactly what the references' `DOSE: 200MG` micro-type is. Calorie takes
   uppercase and label tracking back, having previously given both up.
3. **One rationed hero hue, and focus is not it.** Now enforced, in
   20260914211336_the_action_family_splits_into_a_field_and_a_mark_and_link_stops_borrowing_info.md.

**The ornament vocabulary gains two molding tells.** `pin` is the ejector-pin ring left where a part
is pushed out of its mould; `parting` is the seam where the two halves of the mould met. Both are in
the reference's own language, and extending a vocabulary DESIGN.md calls closed is a deliberate act
rather than a drive-by: they qualify because they are *systematic marks of manufacture*, which is
what rule 6 asks of ornament, and not illustration. They are the cheapest way for the register to say
"moulded" rather than merely "glossy", and they cost nothing at runtime.

**Be honest about what is lost.** The register clash — a high-contrast serif floating over uppercase
mono, rationed to one moment per screen — is gone from calorie. What replaces it is a *scale* clash:
heavy grotesk at −0.03em over tiny tracked micro-labels. That is a weaker signature than the register
clash, and this ADR does not pretend otherwise. It is the right trade because the thing calorie
needed was a point of view, and a borrowed serif was not one.

**The display voice is a grotesk, not a geometric sans.** The first implementation used a
Futura-first stack. On a machine without Futura or Avenir it fell through to a plain UI sans and the
display voice vanished entirely. The references are neo-grotesk rather than geometric, so
`--sprint-font-grotesk` leads with Inter and Helvetica Neue, which is both more accurate and far more
available. `--sprint-display-weight` and `--sprint-display-tracking` are new roles; lifting them out
of the hardcoded values in `Heading.css` and `PageHeader.css` is byte-identical in the default
register.

## Consequences

**Easier:**

- Calorie is now a reason to choose Sprint rather than a concession, which is what a second register
  is for.
- The "is this a Sprint theme?" test is now mostly a test rather than an assertion.

**Harder:**

- DESIGN.md's rule 1 is broken in every clause by the second register, where previously only the
  radius clause was. The rule still governs the default register and the calorie section now says
  explicitly that the second register's depth model is lighting where the default's is stacking and
  keyline weight.
- Bone, carbon, flare, crimson and slate are permanent primitives, and linen, bark, indigo,
  vermilion and ember are now partly unused.
- The display face is a system stack with no guaranteed member, so the register looks materially
  different on a machine with neither Inter nor Helvetica Neue. A self-hosted pair remains the open
  question it already was.
