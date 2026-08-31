# Contributing

Thanks for your interest in Sprint.

The full contribution workflow lives in [AGENTS.md](AGENTS.md): the Docker-only toolchain, the
seven-file component shape, the agent contract, and the verification commands. Read it before
opening a pull request; it is short and everything in it is enforced by `verify`.

The quick loop:

```bash
docker compose watch dev
docker compose run --rm verify
```

Design decisions are recorded as ADRs under `.claude/skills/sprint/references/ADR/`. If your change
alters a recorded decision, add a new ADR rather than editing old ones:

```bash
.claude/skills/sprint/scripts/new_adr.sh "Title of the decision"
```

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE).
