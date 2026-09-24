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
It is one of three; the others are [Calorie](#calorie-the-second-register), which deliberately breaks
most of it, and [Trax](#trax-the-freight-register), which keeps the flatness and spends its
difference on colour, width and ornament. When a component's styling and this section disagree in
the default register, one of them is a bug. In calorie or trax, check the token instead.

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

The attribute names a cell in a grid of register and ground, never one axis of it:

| | Dark ground | Light ground |
| --- | --- | --- |
| Default register | `dark` | `light` |
| Calorie register | `calorie-dark` | `calorie` |
| Trax register | `trax-dark` | `trax` |

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

## Trax, the freight register

`data-sprint-theme="trax"` and `data-sprint-theme="trax-dark"` are the industrial register, taking
the orange-and-black faction identity from the same game as their reference: heavy industry, mining
and bulk freight, hazard signage, and a corporation with a two-century-old incident it has rebranded
twice to outrun. It keeps the default register's flatness and its monospace chrome, because the
reference's own display face is an uppercase monospace drawn from receipt printing, and spends its
difference on colour, width, rule weight and ornament.

**The third depth model is the printing press.** The default register stacks planes, calorie lights
objects, and trax is a two-pass screenprint: overprint, misregistration and knockout. All three are
roles the library already had, so the model costs no new geometry. `--sprint-keyline-halo` is the
whole trick, inverted: calorie makes Panel's offset second outline transparent because it reads as a
registration error, and trax turns it up in the other ink for exactly that reason.

| | Default register | Trax |
| --- | --- | --- |
| Ground | Void, or paper in `light` | Full-bleed and chromatic on both stocks: a charred burnt orange `#2b1006`, or a hazard orange `#e2510b` in `trax` |
| Panels | Lighter than the ground | The same field as the page, capped by a stamped plate band: black on the bright orange, bone on the charred |
| Page texture | None | A contour field: a bleached line on the bright orange, a black one on the charred |
| Action field | Acid, or ultramarine in `light` | Hazard orange with charred ink, or a black field with the orange knocked out |
| Action mark | Aliases the field | Amber `#ff923d` |
| Danger | Magenta | Magenta on the black ground, a red-black `#380000` on the orange one |
| Info | Cyan | The sand ink itself: a printed white label |
| Focus | Cyan | Acid, the one borrowed element, or pure black on the orange ground |
| Depth | None; planes and keylines | Overprint, misregistration, knockout |
| Panel edge | Keyline plus a 2px offset halo | A solid second pass offset 5px down and right, in black on the bright orange and a burnt tan on the charred |
| Rule weight | 1px | 1px internal, 3px at a plate edge |
| Corners | Square | Square, except a true pill for Tag and Switch |
| Display voice | High-contrast serif, uppercase | Condensed grotesk, uppercase, -0.03em |
| UI voice | Monospace, uppercase, 0.12em | The same |
| Motion | `linear`, `steps(4, end)`, 80-160ms | `steps(3, end)`, 60-90ms |
| Empty mark | Hatch | Hazard chevrons, over a 3rem field |
| Alarm mark | Dense hatch | The same hazard chevron |
| Page header | Plain rule | A contour field, closed by a barcode strip |
| Ornament added | — | `chevron`, `barcode`, `contour` |
| Density | Tight | The same; there was no honest tightening left |

Rule 11, which trax is the first register to need: **a chromatic ground inverts the palette.** On an
orange field at 0.222 luminance, AA admits only inks below about 0.0105, which is darker than
`#2a2a2a`. Nothing bright passes, so every semantic role on that ground is a near-black pushed to the
maximum chroma its budget allows, the muted ink is *darker* than the body ink rather than lighter,
and `--sprint-inert` is the one role that has to go lighter, because a disabled field darker than the
ground cannot carry an ink at all. This is what a two-colour print actually does: the second colours
are the black pass laid over the spot at varying density.

The register's signature mark is the **contour**: the topographic line field that runs through the
reference's poster work, where a portrait is rendered entirely as stacked contour lines. It is the
one place trax spends ornament on a surface as large as the page. `--sprint-ground-sweep` is a
contour field rather than calorie's lighting falloff, and the surface ramp is inverted to give it
somewhere to live: trax is the only register whose panels are *darker* than the ground, so a page is
black plates stamped into a lit, contoured chassis rather than lighter panels floating on black.
That inversion is most of what separates `trax-dark` from `dark` at a glance, because a hue swap on
its own does not.

Rule 12, which the contour forced: **a ground sweep may only move the ground away from its ink,
never toward it.** `contrast.test.ts` measures ink against a flat token, and a patterned sweep makes
the ground not flat, so a sweep that darkens a dark-ink ground silently eats the margin the test
thinks it proved. On the orange ground a black contour at 0.26 drops `--sprint-ink` from 4.92:1 to
about 4.16:1, below AA, so trax's sweep is a *bleached* line that lightens the orange, and
`trax-dark`'s is a black line that darkens the charred orange, away from its sand ink. The first
draft lightened it with orange, which moved the ground toward its ink and was invisible besides. Calorie's
sweep already obeyed this by accident, being a highlight from above on both of its grounds; trax is
where it had to become a rule.

Rule 14 is what three passes at `trax-dark` finally produced: **a register whose identity is a ground
hue keeps that ground on every stock it ships.** `trax-dark` was a warm charcoal for its first three
drafts, and a neutral dark page with panels a step off it and one chromatic accent is exactly the
construction of the default `dark` theme — so no amount of accent tuning could separate the two, and
nothing structural tied `trax-dark` to `trax`. The assumption that a dark ground must be neutral was
never tested: a charred burnt orange `#2b1006` sits at 0.0090 luminance, *below* the charcoal's
0.0100, and every gated role gains headroom against it. A chromatic dark ground was free. Rule 11's
cap follows from the bright orange's luminance, not from chroma, so a chromatic ground may sit
anywhere on the value scale.

The register therefore has no neutrals on either stock. Keylines, muted ink, the inert field and the
ornament ink are all tints of the one hue family, and the eight-step `hull` neutral ramp was deleted
rather than left unused. `trax` stamps black plates on bright orange and `trax-dark` stamps bone
plates on charred orange: one register printed on two stocks, at opposite polarity.

Rule 13, which the review of this register forced: **on a chromatic ground, structure is stamped
rather than stacked.** Rule 11 caps the ink at 0.0105 luminance, and running that cap backwards bounds
the surfaces too: an ink that dark can only sit on a ground of at least 0.2012, and the orange is
0.222. A full-bleed chromatic ground therefore admits exactly one surface value, its own, and there is
no ramp to widen. Hierarchy is bought instead with `--sprint-plate` (a stamped header band),
`--sprint-keyline-width-plate` (1px internal rules against a 3px plate edge) and
`--sprint-misregister` (a solid second pass offset down and right, replacing the symmetric halo). A
trax page is a rack of placards, and that is the silhouette both grounds share.

Rule 15 is the corollary, and the dark stock took two passes to reach it: **a plate stamps in
whichever ink its ground has room for.** The rule-13 draft gave `trax-dark` a dark band with an
orange hairline, reasoning that a full orange band spends the hero hue on chrome. The reasoning holds
and the band did not: it measured 1.16:1 against the panel it capped, so the placard silhouette was
trax's alone and the register's identity fell back on an orange misregistration, putting the hero hue
on chrome by the other door. Neither stock has a surface ramp to widen, by rule 13, so value is the
only channel a stamp has, and on a dark stock it only runs upward. `trax-dark`'s plate is the sand
ink with a charred label, 13.2:1 against the panel it caps, the inverse polarity of trax's black on
bright orange and the same construction. The misregistration drops to a burnt tan once the plate
carries the hierarchy, and the hero hue rations back to the action.

Status hue still collapses on the orange ground, and it collapses further than the first draft
recorded: every status field there is within 1.07:1 of every other, and danger against info is
1.01:1. Labels alone do not fix a scan, so **tone now carries geometry as well as ink**, in every
register. An Alert's left bar runs a four-step width ladder, hairline through solid to the alarm mark,
which is `--sprint-ornament-alarm`: dense hatch by default and the hazard chevron in trax. The chevron
itself is a single conic wedge that tiles into a row of downward arrowheads, rather than the diagonal
stripe it shipped as, because `hatch`, `hatch-dense` and `shade` were already that stripe at three
duty cycles. A stroked V is not reachable: the ornament contract is a background image and a size, so
a mark needing a `background-position` cannot be expressed, and gradient layers composite rather than
subtract.

The contour stays on the page ground and got quieter there, roughly half its first alpha with its
lines twice as far apart, because it was loud enough to compete with body text. Alpha is per ground,
though: the black line on the charred stock needs far more of it than the bleached line on the
bright one, because it is darkening a ground that is already dark. A dense version behind
the PageHeader was tried and removed: a header is exactly where a lede sits. `--sprint-header-rule`
closes the header with a 7px barcode strip instead, which is the first thing to draw a mark the
vocabulary has listed since it was written.

The register also narrowed to four hues, because between the plate, the edge, the action, the mark and
the focus ring it had stopped rationing anything. Focus in `trax-dark` is the sand ink rather than the
house acid, so acid appears nowhere in trax at all; warning is a warm safety amber `#ffc400` rather
than the loud register's green-yellow; and `trax`'s info and warning collapse into the one press ink,
because a navy at 1.01:1 and an olive at 1.04:1 against the action were three tokens pretending to be
three colours. `trax-dark` then went to three, because four was still one more than the bright stock
carries: warning is `amber-pale`, a warm sand inside the bone vocabulary rather than a hue of its own,
and the ornament ink is a tint of the ground so texture is tonal on both stocks. What stays chromatic
there is one warm ramp and one alarm. Danger stays magenta on the dark stock, for the reasons the
warm-wedge decision measured; it is the register's only out-of-family hue, and `--sprint-danger` has
to clear AA as an *ink* rather than only as a field, because `Alert` paints its title with it. Every
warm red that clears that gate lands within 1.09:1 of the action.

The two Sprint carryovers both hold. The ornament vocabulary gains `chevron` and `barcode`: the
first is a mark of manufacture for an extraction industry, the same test that admitted calorie's
ejector-pin ring, and the second was named in the vocabulary above from the beginning and had simply
never been implemented. The micro-label voice is unchanged, because it was already this register's
native voice. One hue is rationed to the action and focus is never it: in `trax-dark` focus is the
house acid, which is also the one system element the register borrows, and it is what keeps a trax
page legible as a Sprint page.

Acid appears nowhere else in trax, and the hazard orange appears nowhere in the other two registers.

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
  cannot depend on a font CDN. A width the stack names is not a width it gets: `--sprint-font-condensed`
  led with `Arial Narrow`, which fontconfig substitutes with a non-narrow face, and resolved 2.3%
  narrower than plain sans until the genuinely condensed faces moved to the front and
  `--sprint-display-stretch` asked a width-capable face to condense. It is now 11.5% narrower. Choosing a licensed, self-hosted serif and monospace pair is still
  open and needs its own ADR.
- The agent view (PRD R1) inherits none of this. It is plain text. A component's visual identity and
  its agent identity are independent, which is the point.
