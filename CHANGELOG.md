# Changelog

Notable changes to `@westonkd/sprint`. Each release rolls the Unreleased section into a dated
heading; `scripts/release.sh` refuses to cut a release while Unreleased is empty.

## Unreleased

- `trax` and `trax-dark` are a third register: industrial, warm, flat like the loud register but with
  doubled 2px rules, a condensed display grotesk, hazard-chevron empty states, and a pill reserved for
  Tag and Switch alone. Its depth model is a two-pass screenprint — overprint, misregistration and
  knockout — built entirely from roles the library already had, so it adds no geometry and no
  component stylesheet changed for it. `--sprint-keyline-halo` is the trick, inverted: calorie makes
  Panel's offset second outline transparent, trax turns it up in the other ink.
- `trax` is the library's first chromatic ground, a full-bleed hazard orange. Nothing bright clears AA
  on it, so every semantic role there is a near-black at maximum chroma, the muted ink is darker than
  the body ink rather than lighter, and `--sprint-inert` is the one role that goes lighter than its
  ground. Status hue collapses on that ground as a result; a status-dense screen wants `trax-dark`.
- `--sprint-keyline-width` and `--sprint-keyline-width-thick` move from `primitives.css` into the
  theme blocks, so rule weight is a register decision. `1px`/`2px` everywhere except trax, which
  doubles both. No component changed; they already read the role.
- `contour` joins the ornament vocabulary: a topographic line field, and the register's signature
  mark. `--sprint-ground-sweep` in both trax grounds is a contour rather than calorie's lighting
  falloff, which makes trax the only register that paints a pattern on the page itself.
- `trax-dark` inverts the surface ramp: panels are *darker* than the ground, so a page reads as black
  plates stamped into a lit, contoured chassis rather than lighter panels floating on black. A hue
  swap alone left it too close to `dark` at a glance; this is what separates them.
- `--sprint-keyline-halo-offset` makes the offset of Panel's and Dialog's second outline a role
  instead of a literal `2px`. Trax sets it to 5px, so the misregistration its depth model is named
  for is actually visible. Unchanged in every other theme.
- A ground sweep may only move the ground away from its ink, never toward it, because the contrast
  test measures ink against a flat token. Both trax sweeps lighten their ground for that reason; a
  black contour on the orange ground took `--sprint-ink` from 4.92:1 to about 4.16:1.
- The ornament vocabulary gains `chevron` and `barcode`. `barcode` had been named in DESIGN.md's mark
  list since it was written and never implemented.
- The workbench's theme control becomes a `Select`. Six options do not fit a segmented control in the
  sidebar; the landing page keeps its segmented control, where they do.
- Fixed: an empty `Table` showed its ornament and no label on a wide screen, in every theme. The
  wide-layout rule that hides the restacked per-cell labels also hid the empty state's knockout plate,
  which is the element carrying the label.

## v0.3.0 - 2026-09-16

- Fixed: the gloss tracker preferred the nearest `data-sprint-part` unconditionally, so on a Card it
  wrote to the `title` and `body` spans — which have no background — and the effect never ran. It now
  targets a part only when the part is the lit face (`option`, `thumb`).
- Fixed: releasing a tracked element left an empty `style=""` attribute behind in the DOM.
- `Card` takes the specular it was already being tracked for. It had the mould and the cast but no
  sheen, which made it the one large surface in the register with nothing to reflect.
- Empty states stop painting their ornament through their own label. DescriptionList and Table adopt
  the knockout plate Panel already used, so the mark stays in the dead space. This also affects
  `dark` and `light`, where the hatch previously ran under the label.
- `--sprint-empty-field` reserves a minimum height for an empty region so a discrete ornament has
  room for whole marks. `0` in `dark` and `light`, `6rem` in calorie, where a 50px field could show
  nothing but clipped pin rings.
- The shade falloff is an absolute depth derived from the control radius rather than a percentage of
  the box, so a Card no longer wears a Button's shading scaled up into a dark band across its base.
- `Alert` gains the register's depth model. It was the one block-level component with no mould, no
  cast, and no shade.
- `--sprint-well` becomes the mould inverted: a cut edge, a falloff, inner cap darkening, and the
  bounce lip. Every recessed control deepens at once — fields, the SegmentedControl track, the
  CodeBlock body, the Switch track. Inert in `dark` and `light`.
- `--sprint-radius-control-tight` gives Checkbox its own corner. At calorie's 18px control radius a
  14px box clamped to a circle, so a checkbox rendered as a radio button. `0` in `dark` and `light`.
- `--sprint-ground-sweep` paints a lighting falloff behind the page from `Shell`. `none` in `dark`
  and `light`, and `Shell` still sets no background colour of its own.
- `calorie-dark` raises its lip and fresnel inks above the bone ground's, because a black shadow on a
  near-black ground separates nothing and the edge light has to do that work instead.
- Fixed: hovering the selected option in a SegmentedControl turned it neutral grey, so the selection
  appeared to follow the pointer. It now brightens to `--sprint-action-hover`.

- Fixed: the pointer-tracked specular never moved. `--sprint-sheen` was declared on `:root`, so
  `--sprint-gloss-x` was substituted there against its initial value and the resulting literal
  inherited down. The gloss composites now live on `[data-sprint], [data-sprint-part]` and resolve
  per element.
- Shading composites by blend mode instead of alpha over black. The rim insets leave `--sprint-mold`
  and become `--sprint-shade` / `--sprint-shade-compact`, background layers multiplied under a
  screened specular, so a saturated face darkens toward its own hue rather than toward grey.
  `--sprint-blend-lit` and `--sprint-blend-shade` are the matching blend lists.
- `--sprint-cast-shift` swings the cast shadow opposite the tracked specular, and
  `--sprint-gloss-fade` drops the specular to a quarter strength as it reaches a cap. Both are
  registered properties, both rest at a neutral value, and both are inert without a hovering pointer.
- `--sprint-cast-contact-ink` separates the tight contact shadow from the long ambient one. It is
  `transparent` in `dark` and `light`.

- `calorie` and `calorie-dark` are rebuilt as a bold, dimensional register rather than a quiet beige
  one: neutral bone and carbon grounds, a hot magenta action, a heavy grotesk display voice, larger
  radii, and molded-plastic depth with a real pressed state. Breaking for anyone who had adopted the
  linen palette.
- Depth is a new semantic category. `--sprint-mold`, `--sprint-well`, `--sprint-cast` and their inks
  are inert in `dark` and `light`, which are unchanged.
- `--sprint-action-mark` splits the action family into a filled field and a mark drawn on the page
  ground, and `--sprint-link` / `--sprint-link-rule` stop links from borrowing `--sprint-info`. All
  three alias their old values in `dark` and `light`.
- `--sprint-display-weight` and `--sprint-display-tracking` join the type roles.
- `--sprint-radius-surface-inner` and `--sprint-radius-control-inner` give inset children their own
  concentric corners instead of relying on the parent's clip, fixing a notched corner where a header
  band met a rounded panel. Both resolve to `0` in `dark` and `light`.
- Calorie's molded faces are curved rather than bevelled: one soft specular in the upper body, caps
  that shade away from that single light, and a bounce-light along the bottom. Shading is
  confined above and below the label band, because a filled control has under 8% of contrast headroom
  where its text sits. Short controls now pill themselves via radius clamping.
- Gloss: a tight specular over the broad sheen, a fresnel hairline around the rim, a press that
  squashes as well as drops, and a hover lift. The tight specular tracks the pointer, clamped so it
  can never cross a label and change its contrast at runtime; off for touch and reduced motion.
- `pin` and `parting` join the ornament vocabulary: the ejector-pin ring and the mould seam. The new
  `--sprint-ornament-empty` role lets a theme choose the empty-state mark, and calorie takes `pin`.
- Fixed: a theme's `--sprint-ornament-ink` override never applied, because `ornament.css` declared
  the default on `:root` and is imported after `semantic.css` at equal specificity. Calorie's tinted
  ornament has never rendered until now.
- `Button`'s loading hatch is clipped to the button's corners. It was a square overlay, which only
  showed once a register gave controls a radius.
- `Dialog`'s registration outline now routes through `--sprint-keyline-halo` like `Panel`'s, and its
  backdrop paints a scrim.

## v0.2.0 - 2026-09-14

- `calorie`: an optional third theme, and the first that is a different register rather than a
  different ground. Warm linen surfaces, indigo actions, rounded corners, a humanist sans, sentence
  case, and eased motion, keeping the ornament vocabulary and the serif display voice so it still
  reads as Sprint. Set it with `data-sprint-theme="calorie"` or `<SprintProvider theme="calorie">`.
- `Heading` levels 2, 3, and 4 take their size from the semantic layer
  (`--sprint-heading-2-font|-size|-weight|-ink`, `--sprint-heading-3-size`, `--sprint-heading-4-size`)
  instead of sharing one label grade. `dark` and `light` map all three back to the label size and are
  unchanged; `calorie` takes a real ramp, with the serif display voice at level 2.
- `--sprint-keyline-halo` names the offset second keyline `Panel` draws. It is the keyline by default
  and transparent in `calorie`, where a doubled edge on a rounded corner reads as misregistration.
- Checkbox, Switch, Nav, Card, Table, and List read `--sprint-label-size` rather than the
  `--sprint-text-2xs` primitive, so every chrome label in a theme moves together. No change in `dark`
  or `light`.
- `calorie` warning moves off the light theme's olive to amber `#8c6100`, and its ornament ink warms
  toward ember, so hatch and crosses are visible texture rather than another shade of tan.
- `NavGroup` stacks its own links instead of relying on `Nav` to do it, so a group used on its own no
  longer runs its links together on one line.
- `calorie-dark`: the calorie register on a warm dark ground, so the register is usable in a product
  that ships a dark mode. `data-sprint-theme` now takes `dark|light|calorie|calorie-dark`, naming a
  cell in a register-by-ground grid; no value reads `prefers-color-scheme`, so the app still chooses.
- Every theme sets `color-scheme`, so scrollbars, native `<select>` popups, and autofill match the
  ground instead of rendering light chrome over a dark one. This also fixes `dark`.
- `calorie` raises `--sprint-keyline-strong` so a control boundary clears 3:1 on the inset surface as
  well as the ground and raised ones. The Panel header band is inset, so this was every control
  sitting in one.
- The semantic token layer now carries shape, type, and motion as well as color:
  `--sprint-radius-control|-surface|-pill`, `--sprint-font-ui`, `--sprint-label-transform`,
  `--sprint-display-transform`, `--sprint-label-tracking-wide`, `--sprint-scanline-opacity`, and the
  `--sprint-leading-*` scale. Defaults reproduce the existing rendering, so `dark` and `light` are
  unchanged.
- Text fields, textareas, selects and secret values take a stronger rest boundary, matching the
  ranking Checkbox and Switch already used. Their old border fell short of the 3:1 WCAG asks of a
  control boundary in every theme.
- `data-sprint-theme="dark"` now resets the dark mapping explicitly, so a dark subtree nested inside
  a lighter one works. Previously only `:root` carried it.

- Image: a framed picture whose alt text is its entire agent rendering, with the source URL
  published as `data-sprint-src`, an empty alt declaring the picture meaningless and rendering
  nothing in agent view, and a slot that keeps its border and states its condition while loading
  or after a failure.

## v0.1.3 - 2026-08-31

- The agent view paints its own ink and surface from the tokens, instead of inheriting the
  browser-default black text that was near-invisible on a dark ground.

## v0.1.2 - 2026-08-31

- Landing page loads the design token stylesheets, fixing the unstyled docs site deploy.
- Shell pins its grid rows to `auto minmax(0, 1fr)` below the desktop breakpoint, so the
  collapsed sidebar no longer inflates to absorb leftover viewport height on short pages.

## v0.1.1 - 2026-08-31

- README aligned with the landing page: the three-pillar framing and the agent-facing surfaces.

- Initial public catalog: 26 components with human and agent render modes, WebMCP tool
  registration, the `data-sprint*` attribute contract, and `agent-manifest.json`.
- Workbench documentation site generated from the component registry, published to GitHub Pages.
- Package renamed to `@westonkd/sprint`.
