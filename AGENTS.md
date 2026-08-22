# Working in this repo

Sprint is an agent-forward React component library. "Agent-forward" means every component
ships machine-readable metadata and stable DOM hooks, so an AI agent can discover it,
compose it correctly, and drive it in a browser without scraping class names.

## Everything runs in Docker

Do not run `bun`, `vite`, or `vitest` on the host. Use Compose.

```bash
docker compose up dev
```

```bash
docker compose run --rm test
```

```bash
docker compose run --rm verify
```

Other one-shot services: `lint`, `typecheck`, `build`, `install`, `test-watch`, `shell`.
They live behind the `tools` profile so `docker compose up` only starts the dev server.

After changing `package.json`, run `docker compose run --rm install` so `bun.lock` and the
`node_modules` volume stay in sync.

## Stack

| Concern         | Choice                                  |
| --------------- | --------------------------------------- |
| Language        | TypeScript (strict, `verbatimModuleSyntax`) |
| Bundler         | Vite library mode + `vite-plugin-dts`   |
| Package manager | Bun                                     |
| Tests           | Vitest + Testing Library (jsdom)        |
| Lint / format   | Biome                                   |

Imports use explicit `.ts` / `.tsx` extensions and the `@/*` alias for `src/*`.

## Adding a component

1. Create `src/components/<Name>/<Name>.tsx`.
2. Spread `agentAttributes()` onto the root element and onto each interactive part.
3. Register metadata with `defineAgentMeta()` in `src/components/<Name>/meta.ts`.
4. Add `src/components/<Name>/<Name>.test.tsx` asserting behavior through the agent
   selectors, not through class names.
5. Re-export from `src/components/index.ts` and `src/index.ts`.
6. Run `docker compose run --rm verify`.

## The agent contract

Three attribute conventions, defined in `src/agent/attributes.ts`:

- `data-sprint="<ComponentName>"` marks a component root.
- `data-sprint-part="<part>"` marks an addressable sub-element (`trigger`, `close`, `input`).
- `data-sprint-<state>` reflects runtime state (`data-sprint-loading`, `data-sprint-tone="danger"`).
  Boolean state renders as a valueless attribute so `[data-sprint-loading]` matches.

These attributes are part of the public API. Changing or removing one is a breaking change,
because agents write selectors against them.

`bun run manifest` walks the registry and emits `agent-manifest.json`, the artifact an agent
reads to learn what exists. Every registered component must fill in `summary`, `whenToUse`,
and at least one runnable `examples` entry, since that text is the entire prompt an agent
gets. Write it for a reader who cannot see the source.

## Conventions

- No comments in source. Prefer clear names and small functions.
- Props are forwarded; every component takes `ref` and spreads the rest onto its root.
- Style with CSS custom properties, no CSS-in-JS runtime.
- `react` and `react-dom` are peer dependencies and stay external in the bundle.
