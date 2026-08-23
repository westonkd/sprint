# The display voice is a high-contrast serif system stack

- **Status**: Accepted
- **Date**: 2026-08-22

## Context

DESIGN.md specified three type voices: a heavy condensed uppercase grotesque for display, the
wide-tracked uppercase monospace that carries the interface, and an optional high-contrast serif
accent "used at most once per screen." The grotesque was never implemented;
`--sprint-font-display` has aliased `--sprint-font-mono` since the token ADR, which explicitly
parked the typeface question. The serif accent existed only as prose.

The reference material argues for a different arrangement. The Marathon PERIMETER poster sets its
title in a high-contrast serif directly above uppercase mono data lines: the serif *is* the display
voice, and the register clash between it and the instrumentation mono is the signature, not a
garnish. Meanwhile the display token had exactly two consumers, Heading level 1 and PageHeader's
h1, and they already disagreed (Heading uppercases its level 1, PageHeader did not).

## Decision

The serif accent is promoted to the display voice. The condensed grotesque is deleted from the
spec, not deferred.

- `--sprint-font-serif` is a new primitive: `"Didot", "Bodoni MT", "Bodoni 72", Georgia, serif`.
  A system stack — no self-hosted files, no CDN, honouring the existing ban.
- `--sprint-font-display` moves from primitives.css to semantic.css as a role aliasing
  `--sprint-font-serif`. Same name, same `:root` scope, same `sprint.tokens` layer, so the move is
  invisible to consumers; a display role aliasing a raw face is what the semantic file is for.
- The display voice is uppercase, weight 400 (a Didone's hairlines die at 700), tracked with
  `--sprint-tracking-tight`, line-height 1.1, and one size step larger than before: a new
  `--sprint-text-2xl: 1.75rem` primitive tops the scale at the 40rem breakpoint.
- PageHeader's h1 gains the `text-transform: uppercase` it was missing, resolving the
  inconsistency with Heading level 1 in favour of the poster.
- PageHeader still does not compose Heading. Nesting one would add a second component node to the
  agent projection and surface the title twice in the outline; the nine duplicated declarations
  are all token references and drift is visible in review.
- The rationing rule stands and is now structural: the page title is the one serif moment per
  screen. The workbench brand stays mono for exactly this reason.

## Consequences

- The third voice finally exists in the rendered system, and a consumer re-themes it by overriding
  one role token.
- `--sprint-font-serif` and `--sprint-text-2xl` join the permanent token API.
- Rendering varies by OS: macOS gets Didot, Windows Bodoni MT, Linux falls through to Georgia or
  the default serif, which is lower-contrast but acceptable. Choosing a licensed, redistributable,
  self-hosted face remains open and gets its own ADR; the PRD's open typeface question now covers
  a serif and a mono, not a grotesque.
- DESIGN.md's typography section collapses from three voices to two, and rule 3 of the seven rules
  no longer describes display type as condensed and heavy.
