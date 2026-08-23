# The dev server syncs, the tool services mount

- **Status**: Accepted
- **Date**: 2026-08-22

## Context

Every Compose service shared one anchor that bind-mounted the repo at `/app` and shadowed
`/app/node_modules` with a named volume. That layout has two costs.

The dev loop paid the first. A bind mount is all-or-nothing: the host tree is the container tree,
so `node_modules` had to be masked by a volume to keep the image's Alpine install from being
overwritten by whatever the host happened to have. Vite could not see inotify events across the
mount either, so `server.watch.usePolling` was on, and every container in the compose file burned
CPU restatting the tree.

Contributors paid the second, and it looked like a code problem rather than a tooling one. Because
`node_modules` lived in a Docker volume, the host directory was an empty root-owned mountpoint. A
host TypeScript server could not resolve `react`, `@types/react`, `vitest/globals`, or the `@/*`
alias, so the editor reported an error on nearly every import in the repo while
`docker compose run --rm verify` passed clean. Every contributor gets to independently discover
that their editor is lying to them.

## Decision

**Split the two jobs, because they push in opposite directions.**

`dev` has no mount. It gets source from the image and `develop.watch` syncs edits in:

```yaml
develop:
  watch:
    - action: sync
      path: .
      target: /app
    - action: rebuild
      path: package.json
    - action: rebuild
      path: bun.lock
```

Sync honours `.dockerignore`, which already excludes `node_modules`, `dist`, `coverage`, and
`.git`. That is the whole reason this works: the exclusion is declared once, in the file the image
build already reads, and the sync cannot drift from it. The container keeps the `node_modules` the
`deps` stage installed no matter what is on the host.

Every one-shot tool service keeps the bind mount, via a second anchor that merges the first. This
is not a compromise, it is the actual distinction: **watch only pushes inward, and these services
exist to write outward.** `install` updates `bun.lock` and `node_modules`, `build` emits `dist/`
and `agent-manifest.json`, `format` rewrites source in place. None of them can be expressed as a
watch rule.

The editor problem then solves itself as a side effect. With no volume shadowing the mount,
`docker compose run --rm install` writes `node_modules` to the host, where the language server
reads it. The packages are Alpine builds and the "everything runs in Docker" rule is unchanged;
they are there to be read, not executed.

`server.watch.usePolling` is removed. Sync writes real files into the container filesystem, so
inotify fires. Verified: a CSS edit reaches the container in about two seconds and Vite logs an
`hmr update`.

Adding a `format` service alongside `lint` is part of the same change. `biome check --write` was in
`package.json` but had no way to run under the rule that nothing runs on the host, so the
auto-fixing half of the linter was effectively unreachable.

## Consequences

- `docker compose up dev` is now wrong and silently so. It starts a server that serves the image
  snapshot and never picks up an edit. `watch` is the documented command in both `AGENTS.md` and
  `README.md`, but nothing enforces it.
- Startup is slower on a cold cache. `dev` now depends on the image containing current source, so
  the first `watch` builds rather than mounting instantly.
- The `sprint_node_modules` volume is orphaned. Existing checkouts should
  `docker volume rm sprint_node_modules` and re-run `install`.
- Host `node_modules` holds musl binaries. Nothing on the host should execute them, which was
  already the rule, but the failure is now possible where before it was structurally impossible.
- CI is untouched. It builds the `ci` target, which copies source and runs `verify` inside the
  image, and never used Compose.
