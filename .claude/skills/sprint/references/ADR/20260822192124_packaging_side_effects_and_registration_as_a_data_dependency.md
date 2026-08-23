# Packaging: side effects and registration as a data dependency

- **Status**: Accepted
- **Date**: 2026-08-22

## Context

`package.json` declared `"sideEffects": false` while the metadata registry was populated purely by
importing `meta.ts` for its side effect. A consumer's bundler is entitled to drop such an import.
Before this change that would only have cost a manifest entry. Now that the serializer joins the
registry for component prose (see
[the DOM projection ADR](20260822192124_agent_view_is_a_dom_projection_not_a_second_render_path.md)),
dropping it is a correctness bug: the agent view would lose every summary.

Separately, `"./styles.css"` mapped to `"./dist/sprint.css"` and `vite.config.ts` set
`cssFileName: "sprint"`, but nothing under `src/` imported CSS, so Vite never emitted the file.
`import "sprint/styles.css"` failed with `ERR_MODULE_NOT_FOUND`. The export had never worked.

## Decision

**Registration becomes a data dependency, not a side effect.** `meta.ts` exports
`buttonMeta = defineAgentMeta({...})`, and `Button.tsx` imports and *uses* it:
`agentAttributes(buttonMeta.name, ...)`. Nothing is tree-shakeable because the value is genuinely
consumed. `src/components/index.ts` needs no side-effect imports at all, and the manifest script
works by importing a barrel that exports real values.

**`"sideEffects"` becomes `["**/*.css"]`**, so per-component `import "./Button.css"` survives
bundling.

**`src/index.ts` imports the three token stylesheets**, which is the only thing that makes Vite emit
`dist/sprint.css`. It now emits at about 5 kB, and `sprint/styles.css` resolves for the first time.

**`defineAgentMeta` no longer throws on duplicates.** It warns and overwrites. Vite HMR
re-evaluates `meta.ts` on every save, producing a fresh object with the same name; throwing would
have errored the dev server on every edit to a `meta.ts`. This was latent while no component
existed and would have fired the moment Button landed. Real duplicates are still caught, by the
manifest build and by `catalog.test.ts`.

**`scripts/check-dist.ts` asserts the build output**, wired into `build` and therefore into
`verify`: `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`, `dist/sprint.css`, and
`agent-manifest.json` must all exist and be non-empty. A silently broken export is exactly what this
repo just had, and nothing would have reported it.

## Consequences

**Easier:**

- The agent view keeps its prose in a bundled consumer application.
- `sprint/styles.css` works.
- Editing a `meta.ts` no longer breaks the dev server.
- A regression in artifact emission fails `verify` rather than reaching a consumer.

**Harder:**

- `"sideEffects": ["**/*.css"]` means a consumer importing only types still pulls the stylesheet.
  Correct for a component library, but it is a real bundle cost for someone using Sprint purely for
  its agent utilities. Splitting the agent runtime into its own entry point would fix that; not
  worth doing at one component.
- Overwrite-with-warn is more permissive than the previous throw. Two components genuinely sharing a
  name now collapse into one manifest entry at runtime and are only caught in CI.
- `agent-manifest.json` is gitignored but shipped via `files`. It now changes with every component,
  so CI should verify it is regenerated. Not yet wired up.

**Follow-up:**

- Add a CI check that `agent-manifest.json` is not stale after a build.
- Reconsider a separate `sprint/agent` entry point if the CSS-free use case turns out to matter.
