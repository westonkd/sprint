# A composite token resolves at the element that declares it

- **Status**: Accepted
- **Date**: 2026-09-14
- **Supersedes in part**: 20260914215003_the_specular_tracks_the_pointer_and_is_clamped_out_of_the_label_band.md

## Context

The pointer-tracked specular had never once moved. `--sprint-sheen` was declared on `:root` with
`var(--sprint-gloss-x)` inside it, and a custom property containing a `var()` has that reference
substituted **at computed-value time on the element that declares it**. On `:root`, `--sprint-gloss-x`
is at its registered initial value, so `--sprint-sheen` computed to a gradient with a literal `50%`
baked in, and that string is what inherited down. `trackGloss` wrote `--sprint-gloss-x` onto the
button, the button's own `--sprint-gloss-x` duly changed, and nothing referred to it.

Measured directly rather than reasoned about:

```
:root { --sheen: radial-gradient(70% 40% at var(--gx) -8%, red, transparent 74%); }
#a    { --gx: 90%; background-image: var(--sheen); }
→ computed backgroundImage: radial-gradient(70% 40% at 50% -8%, ...)
```

This is the same shape as the bug the depth ADR found in `--sprint-ornament-ink`, one layer deeper.
There the composite lost to its own default because of cascade order; here it loses because of
substitution *timing*. Both are cases of a token being resolved somewhere other than where its inputs
live, and neither is visible in the source.

## Decision

**A token whose value depends on a per-element input is declared on the elements that carry that
input, never on `:root`.** `--sprint-sheen`, `--sprint-sheen-compact`, and the four `--sprint-cast-*`
tokens move out of the `:root` block into a single rule selecting `[data-sprint], [data-sprint-part]`,
which is exactly the set `glossTarget` writes to. They are declared once, in `semantic.css`, and now
resolve against each element's own `--sprint-gloss-x`, `--sprint-gloss-fade`, and
`--sprint-cast-shift`.

**The scope is the tracker's target set, not `*`.** A universal custom-property declaration would
work and would put six composites on every element in the document. The attribute selectors cost
nothing extra, because every element that consumes these tokens is a component root or an addressable
part by construction.

**Inks stay on `:root` and in the theme blocks.** Only the composites move. This preserves the split
the depth ADR established — geometry declared once, ink themed — and keeps the theme blocks readable
as one resolved palette each.

**`contrast.test.ts` gains an explicit allowance rather than a loosened parser.** The parser throws on
any scope that is not `:root` or a theme attribute, which is what makes "one block equals one
resolved palette" enforceable. `GLOSS_SCOPE` skips `[data-sprint]` and `[data-sprint-part]` by name,
so an unexpected scope still throws.

**The rule to carry forward is not about gloss.** Any future token built from a runtime input —
a pointer position, a scroll offset, a measured size — inherits this constraint. If it is declared at
the root, it is a constant.

## Consequences

**Easier:**

- The specular tracking, the cap falloff, and the shadow swing all work, which they did not before.
- The failure mode now has a name, a test case, and a place to look.

**Harder:**

- Two files must agree on the scope selector: `semantic.css` declares it and `contrast.test.ts`
  exempts it. Adding a third such composite means touching both.
- `--sprint-sheen` and `--sprint-cast` are no longer available to an element outside a component.
  Shell's skip link is a plain `button` child rather than its own root, so it inherits Shell's
  computed values; that is correct for a control that is part of the Shell, and would be wrong for
  anything a consumer writes by hand.
