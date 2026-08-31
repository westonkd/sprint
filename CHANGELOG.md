# Changelog

Notable changes to `@westonkd/sprint`. Each release rolls the Unreleased section into a dated
heading; `scripts/release.sh` refuses to cut a release while Unreleased is empty.

## Unreleased

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
