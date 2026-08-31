# The docs site is a two-entry static build published to a gh-pages branch

- **Status**: Accepted
- **Date**: 2026-08-31

## Context

The workbench only existed as a dev server. `vite build` is library mode and emits `dist/`,
so nothing about the documentation was publishable, and the agent surfaces (`agent-manifest.json`,
`llms.txt`, `components/<Name>.md`) were dev-server middleware rather than files.

Two things were missing at once. A published home for the docs, and a first page for someone
arriving from a link who has not decided to read a component reference yet. The workbench opens
onto a sidebar of 26 components and an Overview panel, which answers "what is in here" before it
answers "what is this".

## Decision

The site is a static Vite build with two HTML entries, configured in `vite.docs.config.ts` and
run as `bun run docs` (the `docs` compose service):

- `index.html` mounts `dev/pages/Landing.tsx`, the landing page.
- `workbench.html` mounts the workbench unchanged.

`base` is `"./"` and routing stays hash-based, so the site is path-agnostic: it works at the
domain root, at `/sprint/`, and from the filesystem, without knowing the repository name.
Cross-page links are relative (`workbench.html#/`, `agent-manifest.json`).

The agent surfaces become emitted assets. `bun run docs` regenerates `agent-manifest.json` first,
then a build plugin emits it, `llms.txt`, and one Markdown page per component from that same file,
reusing `scripts/manifest-markdown.ts`. The dev-server middleware and the build plugin therefore
share the formatter, and neither evaluates the component tree twice.

Publishing is a `docs-site` Docker stage, extracted by `.github/workflows/pages.yml` on every push
to `main` and pushed to the `gh-pages` branch. A branch rather than the artifact-based Pages
deployment, because the built site is then inspectable and revertable as ordinary git history.

The landing page is built from Sprint components like every other page, and owns its own
`SprintProvider` with a view switch. Flipping it renders the pitch itself as agent text, which is
the claim the page is making.

## Consequences

Adding a page to the workbench needs no build change; adding a second top-level page does, since
entries are listed explicitly.

The landing page is the one page whose prose is hand-written and not derived from the registry, so
it can drift from the library the way `GuideWebMCP` and `GuidePhilosophy` can. Its component count
and version come from the registry, but its claims do not.

The published site is a snapshot of `main`, not of a release. A user reading it is reading
unreleased behaviour, and the version tag on the landing page is the package version, not the
published npm version.
