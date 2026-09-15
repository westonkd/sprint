# The semantic layer carries shape, type, and motion, not only color

- **Status**: Accepted
- **Date**: 2026-09-14

## Context

`20260822235029_light_theme_as_a_semantic_token_remap_behind_data_sprint_theme.md` decided that a
theme is "nothing but a remap of the semantic layer". That was true of the light theme because light
and dark differ only in color: both are the same brutalist register, so square corners, uppercase
monospace chrome, and stepped motion are shared and never needed a token.

Building a friendly third theme made the limit obvious. What reads as polarizing about Sprint is not
the acid green. It is `border-radius: 0`, `text-transform: uppercase`, `linear` easing, and
monospace as the interface voice. Those lived outside the token layer entirely:
`text-transform: uppercase` was written literally in 39 places across 24 component files, 21 files
carried raw `line-height` numbers, `--sprint-font-mono` was referenced directly at 46 sites, and
radius was a single literal `0` in the base reset. A consumer who wanted rounded corners had to
override 30 stylesheets.

So the old ADR's claim held only because no theme had yet wanted to change anything but color.

## Decision

**The semantic layer gains roles for shape, type, and motion, and components reference those roles
the way they already reference color roles.** New in `semantic.css`:

- `--sprint-radius-control`, `--sprint-radius-surface`, `--sprint-radius-pill`
- `--sprint-font-ui`, aliasing `--sprint-font-mono` by default
- `--sprint-label-transform` and `--sprint-display-transform`, kept separate because the mono label
  voice and the serif display voice are two registers that theme independently
- `--sprint-label-tracking-wide`, the companion the existing `--sprint-label-tracking` lacked
- `--sprint-scanline-opacity`, so the loading texture can soften instead of needing a kill switch

`--sprint-leading-*` joins the primitives as a seven-step scale, chosen to be exactly the seven raw
values already in the tree so the sweep rounds nothing.

**Motion moves out of the primitives into the theme block.** `--sprint-duration-*`, `--sprint-easing`
and `--sprint-steps` were on `:root` in `primitives.css`, where a theme could only override them by
cascade and a nested theme could not reset them at all. They now live beside the color roles.
Component CSS is unchanged: the names did not move, only the block they are declared in.

**Every default reproduces the existing rendering exactly**, so dark and light are byte-for-byte
unchanged. Radius defaults to `0`, `--sprint-font-ui` resolves to the mono stack, both transform
roles are `uppercase`.

**Four sites keep `--sprint-font-mono` literally**: the code bodies in CodeBlock, Text and Table, and
the value in SecretField. Code is a voice, not a theme choice. `src/provider/SprintProvider.css` is
excluded from the sweep entirely, and `base.css`'s `text-transform: none` on `[data-sprint-agent]`
stays a literal, because the agent surface must stay theme-blind.

**`:root` gains an explicit `[data-sprint-theme="dark"]` twin.** There was no dark rule, so a dark
island inside a light subtree stamped an attribute that matched nothing. The old ADR's claim that
"nested themes fall out of the cascade for free" held in one direction only.

**The contrast test discovers themes instead of enumerating them.** Its loader split selector lists,
routes `:root` to a base map and `[data-sprint-theme="X"]` to that theme's overrides, and builds its
`describe.each` table from what it found. It still throws `Unexpected token scope` on anything else.
Two guards were added: the discovered theme names must be the expected set, and every non-base theme
must carry its own value for each contrast-tested role, so a dark value can never leak through the
overlay onto a light ground.

## Consequences

**Easier:**

- A consumer re-skins Sprint by overriding roles, not by fighting 30 component stylesheets.
- A fourth theme earns full contrast coverage with no edit to the test, which is the opposite of
  what the light-theme ADR predicted.
- Casing, leading and radius are now reviewable in one file instead of grep-able across the tree.

**Harder:**

- The new roles are public contract, as permanent as the color role names.
- A component author now has one more thing to get right: a new label must reach for
  `--sprint-label-transform`, not write `uppercase`. Nothing enforces this yet.
- `overflow: hidden` was added to Panel, Dialog, CodeBlock, Image and DescriptionList so their inner
  bands clip to a rounded corner. That is a real behavior change in every theme, not just calorie.
  SegmentedControl deliberately does *not* clip, because
  `20260823212721_only_mutually_exclusive_controls_sit_flush...` gives its options a focus ring that
  escapes the wrapper; its first and last options carry the radius instead.
- Table takes no radius. It is `border-collapse: collapse` with per-cell borders and no outer frame,
  so there is nothing to round.
