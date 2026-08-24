# The ornament vocabulary ships as tokens and attribute utilities

- **Status**: Accepted
- **Date**: 2026-08-23

## Context

DESIGN.md specifies a closed vocabulary of texture marks (hatching, dots, crosses, checkers,
scanlines) and the PRD left open whether Sprint ships them as documented utilities or components
each roll their own. What the code actually had was one mark — a 135° hatch — copy-pasted into five
component files with slightly different colors and spacings. Nothing else from the vocabulary
existed, which is a large part of why Sprint pages read as flat-and-mono but not yet as
instrumentation.

## Decision

The vocabulary ships in `src/styles/ornament.css`, in two forms that share one implementation:

- **Tokens** (`--sprint-ornament-hatch`, `-hatch-dense`, `-shade`, `-scanlines`, `-dots`,
  `-checker`, `-crosses`, plus `-size` companions where a mark needs `background-size`). Components
  reference these instead of inlining gradients. The mark color is `--sprint-ornament-ink`
  (keyline by default), overridden locally, which is how a mark draws "in the surface's own two
  colors" without a third.
- **Attribute utilities** (`[data-sprint-ornament="<mark>"]`) in the base layer, for consumers and
  for dev surfaces. `ornament` joins the reserved state keys so the serializer never reads it as
  component state.

Everything is CSS gradients (`repeating-linear-gradient`, `radial-gradient`, `conic-gradient`);
registration crosses are two tiled thin ellipses, which at 1px scale read as stroked plus marks. No
raster assets, per R4.6.

The five existing hatches were refactored onto the tokens: empty states use `hatch`, Button's
loading band uses `hatch-dense` in inert ink, Dialog's backdrop uses `shade` in surface ink.

## Consequences

- Adding a mark means adding a token pair and a utility rule in one file; using one means one
  declaration. The vocabulary stays closed because the file is the vocabulary.
- The PRD's open question on R4.6 is answered: utilities, not per-component improvisation.
- Marks stay theme-correct automatically because the ink defaults to a semantic token.
- The contrast test does not scan ornament.css; ornaments are texture, not text, and never carry
  content, so AA does not apply to them.
