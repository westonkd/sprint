# CSS token layer, cascade layers, and semantic roles as public contract

- **Status**: Accepted
- **Date**: 2026-08-22

## Context

DESIGN.md specifies the visual language but nothing implemented it; there was no CSS in `src/` at
all. R4.8 requires two layers (primitives mapped to semantic roles, components referencing only the
semantic layer) and states that the custom property names are a public theming contract whose
renaming is breaking in practice.

## Decision

Three stylesheets under `src/styles/`, imported explicitly from `src/index.ts` rather than chained
through `@import`, so the public theming contract does not depend on postcss-import ordering:

- `primitives.css` — raw values. `--sprint-color-acid: #c6f000`, the panel ramp, type scale, spacing,
  keyline widths, durations, easings.
- `semantic.css` — roles. `--sprint-action`, `--sprint-action-ink`, `--sprint-danger`,
  `--sprint-inert`, `--sprint-focus`, `--sprint-keyline`.
- `base.css` — `:where([data-sprint])` resets: `border-radius: 0` per R4.1, monospace per R4.4,
  tabular numerals, and the offset focus keyline.

Components reference **only** the semantic layer.

**Cascade layers**: `@layer sprint.tokens, sprint.base, sprint.components;`, declared once at the top
of `primitives.css`. Consumers override without a specificity war, which is what makes "custom
properties are a public contract" usable rather than aspirational.

**Components are styled through the agent attributes**, not class names: `[data-sprint="Button"]`,
`[data-sprint-tone="action"]`, `[data-sprint-loading]`. The same hooks tests assert against and
agents select against are the styling hooks. There is no second naming system to keep in sync, and
`data-sprint-tone="danger"` cannot be styled without also being visible to an agent.

**Fonts stay unresolved.** `--sprint-font-mono` is a system stack; `--sprint-font-display` currently
aliases it. Button needs only the mono voice, so the open typeface question blocks nothing.

### Contrast is enforced, not asserted

R4.9 requires WCAG AA on every pairing. `src/styles/contrast.test.ts` parses the two token
stylesheets, resolves `var()` references to literals, and checks every semantic pairing at 4.5:1. It
also asserts the two negative cases the design depends on: acid on a light ground fails, and paper
ink on danger fails. This makes the rule a build failure rather than a claim.

Two findings from writing it:

- **`tone="danger"` uses void ink on magenta, not white.** Paper on `#ff0f5a` is 3.84:1 and fails;
  `#0a0a0a` on magenta is 5.16:1 and passes. This is the kind of thing that ships wrong.
- **Disabled ink was `--sprint-color-panel-500` at 3.16:1 against the inert fill.** WCAG exempts
  inactive controls from contrast requirements, but R4.9 is deliberately stricter than WCAG, so it
  moved to `panel-600` at 5.99:1. Disabled-ness still reads from the flat inert fill and the cursor.

## Consequences

**Easier:**

- Re-theming is a matter of overriding the semantic layer; components never see a raw color.
- A contrast regression fails `verify`.
- Attribute-based styling means the agent contract and the style contract cannot drift apart.

**Harder:**

- **The semantic role names are now public API in practice.** Renaming `--sprint-action` breaks
  consumer themes silently, with no type error. They were chosen deliberately for that reason, but
  the set is small and will need extending; each addition is effectively permanent.
- **Attribute selectors carry higher specificity than a class**, so a consumer overriding a
  component style needs an equally specific selector or a later cascade layer. The layer declaration
  is what makes this workable, and consumers must know to use it.
- The token set is sized for one component. Panels, inputs, and tables will each want roles that do
  not exist yet, and adding them piecemeal risks an incoherent set. Worth a deliberate pass before
  the catalog grows.
- The contrast test parses CSS with a regular expression. Adequate for a flat `:root` block; it
  would need a real parser if the token layer ever grows conditional blocks.
