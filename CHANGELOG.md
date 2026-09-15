# Changelog

Notable changes to `@westonkd/sprint`. Each release rolls the Unreleased section into a dated
heading; `scripts/release.sh` refuses to cut a release while Unreleased is empty.

## Unreleased

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
