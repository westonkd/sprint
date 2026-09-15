# Changelog

Notable changes to `@westonkd/sprint`. Each release rolls the Unreleased section into a dated
heading; `scripts/release.sh` refuses to cut a release while Unreleased is empty.

## Unreleased

- `calorie`: an optional third theme, and the first that is a different register rather than a
  different ground. Warm linen surfaces, indigo actions, rounded corners, a humanist sans, sentence
  case, and eased motion, keeping the ornament vocabulary and the serif display voice so it still
  reads as Sprint. Set it with `data-sprint-theme="calorie"` or `<SprintProvider theme="calorie">`.
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
