# The action family splits into a field and a mark and link stops borrowing info

- **Status**: Accepted
- **Date**: 2026-09-14
- **Supersedes in part**: 20260914183524_calorie_is_a_second_register_not_a_second_ground.md

## Context

A consuming app surfaced the complaint that calorie "does not feel cohesive". The page showed a warm
linen ground carrying a cold teal wordmark and a cold indigo button, with the register's one warm
accent reachable only through keyboard focus.

The palette was the symptom. Two semantic roles were each doing two jobs:

- `--sprint-action` was both a **filled field** (Button background, SegmentedControl selected, Switch
  on-track) and **ink on the page ground** (Nav active text, Link active, List bullet, Card hover
  border, `<code>`). One hue cannot do both on a light ground. A hot pink `#ff1466` carries near-black
  ink at 4.88:1 as a field, but is 3.15:1 as text on bone.
- `--sprint-info` was both the **link colour** and the **info family** (Tag `tone="info"`, Alert's
  default tone, two CodeBlock syntax tokens), so calorie could not make links agree with the action
  without also recolouring info badges. That is *why* the wordmark was teal and the button indigo.

## Decision

**`--sprint-action-mark` is the action family drawn on the ground.**

> `--sprint-action` is a filled field and the ink that sits on it. `--sprint-action-mark` is the same
> family drawn on `--sprint-surface` or `--sprint-surface-raised` — as text, as a border, or as a
> rule.

"Mark" over `-edge` (this role is also text) and over `-text` (it is also a border). The library
already uses "mark" for a thing drawn on a ground: the ornament vocabulary is a controlled vocabulary
of marks, and Panel's offset outline is a registration mark. In the default register it aliases
`--sprint-action`, so `dark` and `light` do not move.

**Filled controls take the mark as their border.** A hot pink face with a deep pink rim is both the
molded-plastic look and the reason the fill's 3.15:1 boundary is not load-bearing — the rim clears
5.14:1. Applied at Button, Switch, Checkbox, CodeBlock and the provider's copy affordance.

**`--sprint-link` and `--sprint-link-rule` are added, and `--sprint-info` becomes the info family
only.** Fixing action and leaving info would give calorie one principled family and one unprincipled
one, and would force whoever comes next to redo this analysis. In the default register both are
aliases (`var(--sprint-info)` and `transparent`), byte-identical. In calorie a body link is
**underlined ink** rather than a second accent, so the register spends its one hue on the action and
`[data-sprint-active]` at the mark reads as a genuine state change. No `--sprint-link-hover` role:
`Link`'s hover already uses `currentcolor` and composes with both.

**The `["--sprint-action", "--sprint-surface"]` pairing is demoted, not deleted.** It existed only
because action was doing double duty as ink. Once every ink use moves to the mark, it asserts text
contrast on a role that is not text anywhere. A filled control still needs a visible boundary, which
is WCAG 1.4.11 at **3:1**. It is now a findings assertion at `BOUNDARY` that walks all four themes
rather than one row in the AA table. `action-mark` and `link` join `PAIRINGS` against both surfaces,
which — through the existing guard — forces `light`, `calorie` and `calorie-dark` to declare them.

**Two permanent guards are added**, both of which were asserted in ADR prose and tested nowhere:

1. `--sprint-action` clears 3:1 against `--sprint-surface` in every theme.
2. `--sprint-focus` never resolves equal to `--sprint-action`.

Guard 2 immediately caught `light`, which pairs an ultramarine focus with an ultramarine action. That
is a recorded exception rather than a bug: light keeps acid alive as the action *ink*, which is what
distinguishes the two. Rather than name the theme, the guard excludes themes whose `action-ink` is
acid, so the exception is stated by its cause and a future theme that reintroduces the pattern is
covered.

## Consequences

**Easier:**

- A register can now have a saturated hero colour on a light ground at all, which was previously
  impossible.
- "Where does the hue go?" has one answer per context instead of a judgement call per component.

**Harder:**

- Two more roles for every theme to declare, enforced by the contrast gate.
- A new component now has to know whether its accent is a field or a mark. Getting it wrong is
  invisible in `dark` and `light`, because both alias.
- `--sprint-action-hover` is still checked only against its ink, never against a surface.
