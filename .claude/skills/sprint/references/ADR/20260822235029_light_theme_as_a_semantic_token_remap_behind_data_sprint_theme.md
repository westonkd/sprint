# Light theme as a semantic token remap behind data-sprint-theme

- **Status**: Accepted
- **Date**: 2026-08-22

## Context

DESIGN.md says the system is not committed to dark-mode-only: Paper is named as a light ground for
"inverted surfaces and print-like blocks". But there was only one semantic mapping, and it assumes a
void ground. The blocker for any light mapping is R4.9 plus the design rule it encodes: acid on a
light ground is 1.18:1 and banned, while `--sprint-action` is used by components both as a fill
(Button, Shell's skip bar, SegmentedControl) and as on-surface ink (Link, Nav's active edge, Text,
Table sort markers). One token serves both uses, so light mode cannot keep acid as the action color
at all.

There was also no mechanism for scoping a second mapping, and the contrast test only knew how to
read a flat `:root`.

## Decision

**Light mode is nothing but a remap of the semantic layer.** Components, the agent view, and the
manifest are untouched; the primitives gain a paper ramp (`--sprint-color-paper-100..600`, mirroring
the panel ramp's direction of travel toward ink) and three print-density chroma variants
(`--sprint-color-magenta-deep`, `--sprint-color-cyan-deep`, `--sprint-color-warning-deep`).

**The scope is an attribute, `data-sprint-theme="light"`.** It joins the attribute contract next to
`data-sprint-view`: pure CSS, placeable on any element including `<html>`, overriding the `:root`
defaults inside `@layer sprint.tokens` by source order. `SprintProvider` takes an optional
`theme` prop that stamps the attribute on the view container it already renders, so React consumers
never hand-write the attribute; when the prop is absent nothing is stamped and the cascade decides.
`view` and `theme` join `part`/`tool`/`owner` as reserved state keys so a component state can never
collide with provider chrome.

**The light mapping is the print register, anchored on ultramarine.** Acid cannot sit on paper, so
the action role flips to the other signature pairing the design names: `--sprint-action` becomes
ultramarine and `--sprint-action-ink` becomes acid (7.83:1). On-surface action ink is ultramarine on
paper at 9.26:1. Danger, info, and warning move to their deep variants with paper ink; focus follows
action to ultramarine because cyan dies on paper. Hovers darken where the dark theme's hovers
lighten.

**The contrast test now resolves both themes.** It parses selector-scoped blocks (`:root` builds the
dark map, the light block overlays it) and runs every pairing against each theme, plus the pairing
this work surfaced as missing: `--sprint-danger` as ink on `--sprint-surface`, which Tag and Text
already render. Two theme-specific findings are pinned: dark danger takes void ink because paper
fails on magenta (3.84:1), and light danger takes paper ink because void fails on deep magenta
(2.93:1). The ink flips direction between themes; a shared literal would ship one of them broken.

The workbench gets a dark/light SegmentedControl in the Shell bar. It registers no WebMCP tool: the
agent view is theme-blind, so an agent gains nothing from flipping it. The workbench also mirrors
the attribute onto `<html>` so its own body chrome and `color-scheme` follow.

## Consequences

**Easier:**

- Consumers theme a subtree with one attribute or one prop, and nested themes fall out of the
  cascade for free.
- Every light pairing is enforced by the same test that enforces the dark ones; a light-mode
  contrast regression fails `verify`.

**Harder:**

- `data-sprint-theme`, the paper ramp, and the deep chroma primitives are all public contract now,
  as permanent as the semantic role names.
- The light theme has no acid-on-paper moment by construction. If a future component wants an acid
  accent in light mode it must build itself a dark or ultramarine field to put it on, not reach for
  a new token.
- The contrast test's parser now understands exactly two scopes and throws on any other selector in
  the token files. A third theme means touching the test as well as the CSS, which is intended.
