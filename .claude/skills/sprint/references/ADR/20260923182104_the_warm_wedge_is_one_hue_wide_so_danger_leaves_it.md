# The warm wedge is one hue wide so danger leaves it

- **Status**: Accepted
- **Date**: 2026-09-23
- **Depends on**: 20260923182104_trax_is_the_freight_register_and_its_depth_model_is_the_printing_press.md

## Context

`trax-dark` is orange on a warm near-black, and the register's whole claim is that it is the warm
one. The first draft kept every role inside that wedge, including danger, on the reasoning that
orange and red sitting one step apart is exactly the ANSI Z535 convention a freight brand would
actually use.

It does not survive the contrast gate, and the reason is worth writing down rather than rediscovering.

`--sprint-danger` has to clear 4.5:1 against the ground. On a near-black ground that forces a bright
hue. A bright warm hue then needs dark ink, which is the same polarity the orange action already has,
and it lands within about 1.1:1 of the action in luminance. Signal red `#ff3b18` measures 0.2533 and
the hazard orange `#ef5412` measures 0.2488: the same brightness, fifteen degrees apart in hue, with
identical black ink. Nothing separates them. Going deeper to separate by value fails the other way,
because a deep red cannot clear 4.5:1 on a near-black ground at all.

The separation could not come from ink polarity, and it could not come from value. Inside the warm
wedge there was nothing left.

## Decision

**`trax-dark` borrows the house magenta `#ff0f5a` for danger, with the hull black as its ink.** It is
the one cold thing the register admits, and it is 5.13:1 on the ground.

**This is deliberately the opposite call from
20260914191641_the_theme_attribute_names_a_register_and_ground_cell_not_an_axis.md**, which rejected
importing the loud register's electric cyan into `calorie-dark` because it was "the only cold thing
on the page". The difference is what each register had available. Calorie's palette is a family with
pale siblings, so `calorie-dark` could invert its own hues and stay in family. Trax's identity is one
narrow hue wedge that the field and the mark already share, so staying in family means danger and
action are the same colour. An out-of-family danger is the only way danger reads as danger, and being
the sole cold element is what makes it read as an alarm rather than as an import.

**`--sprint-focus` is the house acid `#c6f000`.** Focus may not be the action colour, which is
enforced, and acid is about 15:1 on the hull ground and maximally separated in hue from the orange.
It is also the register's one borrowed system element, which is what keeps a Trax page legible as a
Sprint page rather than as a different library. One acid moment, spent on the thing the system is
paying attention to.

**`--sprint-info` is the sand ink itself**, a printed white label on a black ground, rather than a
third hue. The register had no cold slot left after danger took one, and a white sticker is what an
industrial surface actually uses to say something neutral. `--sprint-warning` stays the house warning
yellow, which is warm, is a hazard colour in its own right, and separates from the orange by value
rather than by hue.

A test pins both halves: `trax-dark`'s action is the hazard orange and its danger is the house
magenta, so a future edit cannot fold danger back into the warm wedge without saying so.

## Consequences

**Easier:**

- Danger is unmistakable in `trax-dark`, which is the only thing danger has to be.
- The rule generalises: a register built on a narrow hue wedge has to spend that wedge on one role
  and buy the rest elsewhere. The wedge is the identity, not the palette.

**Harder:**

- The magenta is the one element in `trax-dark` that is not drawn from the reference, and it is
  visible: a magenta button next to an orange one is a loud pairing. It is the correct trade and it
  is still a trade.
- `trax` and `trax-dark` disagree about what danger is, a dark red on the orange ground and a magenta
  on the black one. Each is right for its ground and neither is right for both, which is the first
  time a Sprint register's two grounds have used different hue families for the same role.
