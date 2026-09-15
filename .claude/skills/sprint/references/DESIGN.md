# Design

Architecture and implementation notes for Sprint. Individual decisions go in
[references/ADR/](ADR/) via `scripts/new_adr.sh`; this file carries the connective narrative.

Component architecture (the dual-render mechanism, WebMCP adapter shape, registry design) is not
written yet, by design. It gets discovered while building the first components. What *is* settled
enough to write down is the visual language, below, because it was derived from reference material
rather than from code.

---

# Visual language

Derived from a set of local reference imagery, third-party art that is deliberately not tracked in
this repository. This section is the source of
truth for R4 in the [PRD](PRD.md); if a component's styling and this document disagree, one of them
is a bug.

The short version: **a technical readout that got art-directed.** Flat, loud, and rectilinear.
Everything looks like a printed instrument label, a terminal, or a warning placard. Nothing looks
soft, dimensional, or friendly. The system's confidence comes from saturation and density, not from
polish.

Everything below describes the **default register**, which the `dark` and `light` themes both render.
It is one of two; the other is [Calorie](#calorie-the-second-register), which deliberately breaks
most of it. When a component's styling and this section disagree in the default register, one of
them is a bug. In calorie, check the token instead.

## The seven rules

1. **Flat, always.** No gradient, no drop shadow, no blur, no bevel, no border-radius above 0. Depth
   is expressed by stacking opaque planes and by keyline weight, never by lighting.
2. **Two colors per surface.** Any given panel is a saturated field and its inverse. Not a spectrum.
   The full palette is wide, but a single component uses two, occasionally three, colors.
3. **Type is uppercase and tracked.** Small labels are uppercase monospace with wide letter-spacing.
   Display type is a high-contrast serif, uppercase and set large against the mono — a deliberate
   register clash, rationed to one moment per screen. There is no in-between voice.
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

Two voices, no others.

**Display** — a high-contrast display serif, uppercase, regular weight, set large and tightly
tracked. Used for the page title and nothing else, at most once per screen. Against the monospace
it is a deliberate register clash — the PERIMETER poster move, a serif title floating over mono
data lines — and it is the signature of the system, which is exactly why it stops working the
moment it appears twice. This is the loudest element on any screen.

**UI / data** — monospace, uppercase for labels, wide letter-spacing (0.08em–0.16em), small sizes.
This carries the majority of the interface: field labels, panel headers, coordinates, counts,
timestamps, serials, status strings. Monospace is not reserved for code here; it is the default
interface voice, and it is what makes the system read as instrumentation.

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

## Calorie, the second register

`data-sprint-theme="calorie"` and `data-sprint-theme="calorie-dark"` are a bold, dimensional register
taking the NuCaloric brand design from Bungie's Marathon as its reference: neutral bone and carbon
grounds, one hot magenta hero, heavy grotesk display type, spec-sheet micro-labels, and molded
plastic physicality. It is not a third ground in the register above, and it is not a quieter Sprint —
it breaks all seven rules, rule 1 in every clause.

**The second register's depth model is lighting. The default register's is stacking and keyline
weight.** Rule 1 has not softened; it governs the default register, and calorie is the exception it
now names.

The attribute names a cell in a two-by-two grid of register and ground, never one axis of it:

| | Dark ground | Light ground |
| --- | --- | --- |
| Default register | `dark` | `light` |
| Calorie register | `calorie-dark` | `calorie` |

A value always resolves to one complete palette, so none of them may depend on `prefers-color-scheme`
— the app chooses. In `semantic.css` the calorie register's shape, type, motion and space tokens are
declared once in a block selecting both values; only color roles and `color-scheme` are per-ground.

| | Default register | Calorie |
| --- | --- | --- |
| Ground | Void, or paper in `light` | Bone `#eceae5`, or carbon `#0d0d0c` in `calorie-dark` |
| Action field | Acid, or ultramarine in `light` | Flare `#ff1466`, with near-black ink |
| Action mark | Aliases the field | Flare-deep `#c2004b`, or flare-pale on carbon |
| Link | Aliases `info` | Ink, underlined with a keyline rule |
| Danger | Magenta | Crimson `#9b0018`, or its pale sibling |
| Depth | None; planes and keylines | Mold, well and cast — see below |
| Headings | h2-h4 are one label grade | A ramp: grotesk h2, then 1rem and 0.875rem |
| Panel edge | Keyline plus an offset halo keyline | One keyline; the halo is off |
| Corners | Square | 14px controls, 20px surfaces, pill for Tag and Switch |
| Display voice | High-contrast serif, uppercase | Heavy grotesk, sentence case, −0.03em |
| UI voice | Monospace, uppercase, 0.12em | Grotesk, uppercase labels, 0.12em |
| Motion | `linear`, `steps(4, end)`, 80–160ms | `cubic-bezier(0.2, 0, 0, 1)`, 120–240ms |
| Focus | Cyan, against acid actions | Indigo `#3a3fb8`, against flare actions |
| Press | None | The lip collapses and the object drops 1px |
| Density | Tight; whitespace reads as off-brand | ~30% roomier at every space step |

Rule 10, which calorie is the first register to need: **depth is a lighting model, not a scale.** A
molded object under a light shows a bright specular lip along its top edge, a dark self-shadowed rim
along its bottom, and a soft contact shadow on the ground; anything recessed shows the inverse. So
the vocabulary is three ideas and not a number — `--sprint-mold` for a thing standing out of the
surface, `--sprint-well` for a thing pressed into it, `--sprint-cast` for what it throws. A component
picks a role, not a level. Buttons, Cards, filled Tags and the selected segment are molded; fields,
the Switch track, the SegmentedControl wrapper and the Panel header band are wells; Panel and Dialog
only cast. Geometry is declared once and only the inks are themed, so the whole model is inert in the
default register because every ink there is `transparent`.

Two things carry across, and with the rationed hero hue they are the test of whether a future theme
is a Sprint theme at all:

- **The ornament vocabulary.** It draws in `--sprint-ornament-ink`, so hatch, dots and crosses land
  as texture rather than hazard hatching. Calorie adds `pin` and `parting` — the ejector-pin ring and
  the mould seam — which are marks of manufacture rather than illustration, and so belong to it. Empty states still say they are empty, and still say it
  with a mark. NuCaloric's own checkerboard and technical marks were already in the closed set, so
  this register leans on the vocabulary rather than merely preserving it.
- **The micro-label voice.** Chrome is a real grade below body and tracked, which is what makes a
  Sprint surface read as a spec sheet. This is the generalisation of "uppercase mono labels", and it
  is why calorie takes uppercase and 0.12em tracking back after the first draft gave both up.

The serif display voice used to be the second carryover. It is not any more. `--sprint-font-display`
is overridable, calorie spends it on a heavy grotesk, and the register clash of serif over mono is
replaced by a scale clash of heavy display over tiny tracked labels. That is a weaker signature and
the trade is deliberate: the thing calorie needed was a point of view, and a borrowed serif was not
one.

Rule 9: **a quiet register has to pay for its hierarchy in type.** The default register makes h2, h3
and h4 a single label grade because uppercase mono at 11px reads as a label whatever its level. Sans
at 11px does not, so calorie takes a real ramp through `--sprint-heading-2-font|-size|-weight|-ink`
and `--sprint-heading-3-size|-4-size`. Panel labels are styled by `Panel`, not by `Heading`, so they
stay a label grade in both registers.

Rule 8: **a register that softens its keylines has to pay for hierarchy elsewhere.** The loud
register carries hierarchy in chroma, so a 1.7:1 keyline is enough. Calorie's ground/raised/inset
ramp is wider and `--sprint-keyline-strong` clears 3:1 on all three, the inset case being the Panel
header band. The corollary is that the default register's *second* edge is surplus here: `Panel`'s
offset halo keyline reads as misregistration once corners are rounded, so `--sprint-keyline-halo` is
transparent in calorie and the surface ramp plus the cast shadow carry the depth.

`calorie-dark` is the same family inverted rather than the loud register's palette: ink is the light
ground's bone, the ground is a neutral carbon, and the marks are the pale siblings of calorie's own
hues while the flare field itself is unchanged across both grounds. Importing the loud register's
electric cyan for `info` was the first draft and it was the only cold thing on the page.

Acid appears nowhere in calorie. It is 1.24:1 on bone, and unlike `light` there is no ultramarine
field to rescue it as ink. Rule 4 (everything is labeled) and rule 6 (ornament is systematic) hold in
both registers, because they are structural rather than visual.

## Implementation notes

- Everything above is expressed as CSS custom properties per CLAUDE.md. No CSS-in-JS runtime.
- Custom properties are the theming contract for consumers, in the same way the `data-sprint-*`
  attributes are the agent contract. Name them deliberately from the start; renaming them later is
  a breaking change in practice even if not in type.
- Split the token layer: primitives (`--sprint-color-acid`) map to semantic roles
  (`--sprint-color-action`), and components only ever reference the semantic layer. Otherwise
  re-theming means rewriting every component. The semantic layer covers shape, type, and motion as
  well as color, so a component writes `border-radius: var(--sprint-radius-control)` and
  `text-transform: var(--sprint-label-transform)`, never a literal `0` or `uppercase`. The mono
  primitive is reserved for code and secret values; everything else takes `--sprint-font-ui`.
- The display face is a system serif stack (Didot / Bodoni MT / Bodoni 72 / Georgia); the library
  cannot depend on a font CDN. Choosing a licensed, self-hosted serif and monospace pair is still
  open and needs its own ADR.
- The agent view (PRD R1) inherits none of this. It is plain text. A component's visual identity and
  its agent identity are independent, which is the point.
