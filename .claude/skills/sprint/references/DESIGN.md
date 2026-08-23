# Design

Architecture and implementation notes for Sprint. Individual decisions go in
[references/ADR/](ADR/) via `scripts/new_adr.sh`; this file carries the connective narrative.

Component architecture (the dual-render mechanism, WebMCP adapter shape, registry design) is not
written yet, by design. It gets discovered while building the first components. What *is* settled
enough to write down is the visual language, below, because it was derived from reference material
rather than from code.

---

# Visual language

Derived from the reference imagery in `marathon/` at the repo root. This section is the source of
truth for R4 in the [PRD](PRD.md); if a component's styling and this document disagree, one of them
is a bug.

The short version: **a technical readout that got art-directed.** Flat, loud, and rectilinear.
Everything looks like a printed instrument label, a terminal, or a warning placard. Nothing looks
soft, dimensional, or friendly. The system's confidence comes from saturation and density, not from
polish.

## The seven rules

1. **Flat, always.** No gradient, no drop shadow, no blur, no bevel, no border-radius above 0. Depth
   is expressed by stacking opaque planes and by keyline weight, never by lighting.
2. **Two colors per surface.** Any given panel is a saturated field and its inverse. Not a spectrum.
   The full palette is wide, but a single component uses two, occasionally three, colors.
3. **Type is uppercase and tracked.** Small labels are uppercase monospace with wide letter-spacing.
   Display type is condensed, heavy, and tight. There is no in-between voice.
4. **Everything is labeled.** Panels announce what they are in a tiny header. Values are prefixed
   with a unit or a glyph. Empty states say they are empty rather than rendering nothing.
5. **The grid is visible.** Keylines, corner ticks, registration crosses, and slot borders are shown
   rather than implied. Whitespace is marked, not blank.
6. **Ornament is systematic, not decorative.** Texture comes from a controlled vocabulary of small
   marks (dots, crosses, X's, targets, checkers, dashes) tiled into fields, never from illustration.
7. **Motion is mechanical.** Steps, cuts, and linear translation. Never bounce, spring, or ease-out
   flourish.

## Color

The ground is usually near-black, occasionally a deep saturated blue, occasionally the acid green
itself run full-bleed. All three read as "ground"; the system is not committed to dark-mode-only.

| Role | Approx. | Notes |
| --- | --- | --- |
| Acid | `#C6F000` | The signature. Chartreuse green-yellow. Primary actions, active state, selection, the "you are here" color. Used as a full field or as text on black. |
| Void | `#0A0A0A` | Default ground. Not pure black, but close. |
| Ultramarine | `#1A1AC8` | Alternate ground. Poster fields and terminal surfaces. Acid on ultramarine is a signature pairing. |
| Magenta | `#FF0F5A` | Alert, destructive, version/build chips, "attention" without meaning error. |
| Cyan | `#00D4FF` | Informational, secondary data class. |
| Warning yellow | `#FFE800` | Distinct from Acid. Caution bands, hazard hatching. |
| Paper | `#F2F2F2` | Light ground for inverted surfaces and print-like blocks. Not pure white. |
| Panel | `#161616` – `#242424` | Neutral greys for inert chrome, empty slots, and disabled state. |

Rules:

- Acid is a **rationed** color. If everything is acid, nothing is. One primary action per view.
- Saturated colors are used flat and at full strength. No tints, no opacity ramps to fake hierarchy;
  hierarchy comes from a different swatch or from type weight.
- Grey is for the inert. Anything the user or an agent can act on is chromatic or keylined.
- Acid-on-void and void-on-acid are both first-class. Inverting a component's ground is a legitimate
  emphasis mechanism.
- Every pairing meets WCAG AA. Acid on white fails badly and is banned; acid on void is the
  intended direction (R4.9 in the PRD is not negotiable for aesthetic reasons).

## Typography

Three voices, no others.

**Display** — condensed, very heavy, uppercase, flat-sided grotesque with squared and clipped
terminals. Tracking is tight, letters nearly touching. Used for page and section titles, wordmarks,
and nothing else. This is the loudest element on any screen.

**UI / data** — monospace, uppercase for labels, wide letter-spacing (0.08em–0.16em), small sizes.
This carries the majority of the interface: field labels, panel headers, coordinates, counts,
timestamps, serials, status strings. Monospace is not reserved for code here; it is the default
interface voice, and it is what makes the system read as instrumentation.

**Serif accent** — a high-contrast display serif, used sparingly against the monospace for a single
title or mark. It is a deliberate register clash and it stops working the moment it is used twice on
a screen. Optional; a Sprint app that never uses it is still correct.

Conventions:

- Sentence-case body text is allowed, but it lives inside content areas, never in chrome.
- Numeric readouts are monospace and tabular, prefixed with their unit or a glyph rather than
  suffixed.
- Long strings truncate rather than wrap in chrome contexts.
- Metadata lines read like a manifest: `SERIAL: NU-TYPE-CORE-A1 / ISSUED: 2744.07.22 / UNIT: …`.
  Slash-separated, uppercase, mono, small. This is a repeating pattern worth a component.

## Structure and layout

- **Rectilinear only.** Every shape is a rectangle or a rectilinear step. Notches, insets, and
  stair-stepped edges are how forms get interest; curves and diagonals are not.
- **Nested keylines.** Frames within frames, 1px, sometimes doubled with a gap. A panel border and
  an inner content border is a normal amount of structure here, not clutter.
- **Corner ticks and brackets.** Instead of drawing a full border, mark the four corners with short
  L-brackets. Reads as a targeting reticle, costs less visual weight than a box.
- **Registration crosses.** Small `+` marks at grid intersections, filling otherwise-empty regions.
  These make the grid legible and stop empty space reading as unfinished.
- **Slot grids.** Repeating bordered cells, each with a tiny corner badge for count or state. Empty
  slots keep their border and show a faint diagonal slash or crosshair. Never collapse an empty
  slot.
- **Vertical margin text.** Rotated uppercase mono running up a left or right edge for build
  strings, section names, or IDs.
- **Full-bleed action bars.** The primary action is a wide flat acid bar with black uppercase label,
  anchored at the bottom of its region. It does not look like a rounded button.
- **Dense over airy.** Padding is tight. Information density is the aesthetic; generous whitespace
  reads as off-brand here.

## Ornament vocabulary

A closed set of small marks, tiled or scattered into fields:

circles, ringed circles, targets, X's, plus signs, filled and hollow squares, checkerboards,
dot grids, diagonal hatching, dashed rules, barcode strips, pixel dither, scanlines.

Rules:

- These are texture, drawn in the surface's own two colors. Never a third color.
- They fill dead space, band a boundary, or texture an inactive region. They never sit on top of
  content.
- Density is the variable: a sparse dot field and a dense checker read as different intensities of
  the same mark.
- Implement as CSS `repeating-linear-gradient` / `radial-gradient` patterns or tiled inline SVG so
  they theme from custom properties. No raster assets.

## Iconography

Constructed on a coarse pixel or modular grid, out of the same rectangles the letterforms are built
from. Monoline where a line is needed. No rounded joints, no filled organic shapes, no two-tone
icons. An icon should look like it was drawn by the same tool that set the type.

## Motion

- Durations 80–160ms. Anything slower reads as sedate and breaks the instrument-panel feel.
- `steps()` and `linear` easing. Stepped reveals, hard cuts, and translation on one axis.
- State changes may flash the acid or magenta for one frame rather than transitioning.
- Scanline, dither, and glitch treatments are permitted as loading and pending affordances, and are
  the one place texture may animate.
- All of it respects `prefers-reduced-motion` and degrades to an instant state change (R4.6).

## Implementation notes

- Everything above is expressed as CSS custom properties per CLAUDE.md. No CSS-in-JS runtime.
- Custom properties are the theming contract for consumers, in the same way the `data-sprint-*`
  attributes are the agent contract. Name them deliberately from the start; renaming them later is
  a breaking change in practice even if not in type.
- Split the token layer: primitives (`--sprint-color-acid`) map to semantic roles
  (`--sprint-color-action`), and components only ever reference the semantic layer. Otherwise
  re-theming means rewriting every component.
- Display and monospace faces need to be either self-hosted or fall back gracefully to a stack. The
  library cannot depend on a font CDN. Font choice is unresolved and needs its own ADR.
- The agent view (PRD R1) inherits none of this. It is plain text. A component's visual identity and
  its agent identity are independent, which is the point.
