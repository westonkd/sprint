import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const AA_NORMAL = 4.5;
const BOUNDARY = 3;
const BASE_SCOPE = ":root";
const THEME_SCOPE = /^\[data-sprint-theme="([\w-]+)"\]$/;
const GLOSS_SCOPE = /^\[data-sprint(-part)?\]$/;

type Tokens = Map<string, string>;

function loadOverrides(): { base: Tokens; overrides: Map<string, Tokens> } {
  const base: Tokens = new Map();
  const overrides = new Map<string, Tokens>();

  for (const file of ["primitives.css", "semantic.css"]) {
    const css = readFileSync(resolve(process.cwd(), "src/styles", file), "utf8");
    for (const block of css.matchAll(/([^{}]+?)\s*\{([^{}]*)\}/g)) {
      const selector = block[1];
      const body = block[2];
      if (selector === undefined || body === undefined) continue;

      const declarations = [...body.matchAll(/(--sprint-[\w-]+)\s*:\s*([^;]+);/g)];

      for (const part of selector.split(",").map((one) => one.trim())) {
        if (part === "" || part.startsWith("@")) continue;
        if (GLOSS_SCOPE.test(part)) continue;

        let target: Tokens;
        if (part === BASE_SCOPE) {
          target = base;
        } else {
          const named = THEME_SCOPE.exec(part)?.[1];
          if (named === undefined) throw new Error(`Unexpected token scope ${part}`);
          target = overrides.get(named) ?? new Map();
          overrides.set(named, target);
        }

        for (const match of declarations) {
          const name = match[1];
          const value = match[2];
          if (name === undefined || value === undefined) continue;
          target.set(name, value.trim());
        }
      }
    }
  }

  return { base, overrides };
}

const { base, overrides } = loadOverrides();

const THEMES: ReadonlyMap<string, Tokens> = new Map(
  [...overrides].map(([name, own]) => [name, new Map([...base, ...own])]),
);

function themeByName(name: string): Tokens {
  const tokens = THEMES.get(name);
  if (tokens === undefined) throw new Error(`Unknown theme ${name}`);
  return tokens;
}

function resolveToken(
  tokens: Map<string, string>,
  name: string,
  seen = new Set<string>(),
): string {
  if (seen.has(name)) throw new Error(`Circular token reference at ${name}`);
  seen.add(name);

  const value = tokens.get(name);
  if (value === undefined) throw new Error(`Unknown token ${name}`);

  const reference = /^var\((--[\w-]+)\)$/.exec(value);
  return reference?.[1] === undefined
    ? value
    : resolveToken(tokens, reference[1], seen);
}

function luminance(hex: string): number {
  const clean = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) => {
    const part = Number.parseInt(clean.slice(offset, offset + 2), 16) / 255;
    return part <= 0.03928 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4;
  });
  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const PAIRINGS: readonly (readonly [string, string])[] = [
  ["--sprint-ink", "--sprint-surface"],
  ["--sprint-ink", "--sprint-surface-raised"],
  ["--sprint-ink-muted", "--sprint-surface"],
  ["--sprint-ink-muted", "--sprint-surface-raised"],
  ["--sprint-action-ink", "--sprint-action"],
  ["--sprint-action-ink", "--sprint-action-hover"],
  ["--sprint-danger-ink", "--sprint-danger"],
  ["--sprint-danger-ink", "--sprint-danger-hover"],
  ["--sprint-neutral-ink", "--sprint-surface"],
  ["--sprint-neutral-ink", "--sprint-neutral-hover"],
  ["--sprint-inert-ink", "--sprint-inert"],
  ["--sprint-focus", "--sprint-surface"],
  ["--sprint-focus", "--sprint-surface-raised"],
  ["--sprint-action-mark", "--sprint-surface"],
  ["--sprint-action-mark", "--sprint-surface-raised"],
  ["--sprint-link", "--sprint-surface"],
  ["--sprint-link", "--sprint-surface-raised"],
  ["--sprint-danger", "--sprint-surface"],
  ["--sprint-info", "--sprint-surface"],
  ["--sprint-info-ink", "--sprint-info"],
  ["--sprint-warning", "--sprint-surface"],
  ["--sprint-warning-ink", "--sprint-warning"],
];

describe("theme discovery", () => {
  it("finds every theme the token files scope", () => {
    expect([...THEMES.keys()].sort()).toEqual([
      "calorie",
      "calorie-dark",
      "dark",
      "light",
      "trax",
      "trax-dark",
    ]);
  });

  it.each([...overrides.keys()].filter((name) => name !== "dark"))(
    "gives %s its own value for every contrast-tested role",
    (name) => {
      const own = overrides.get(name);
      const missing = [...new Set(PAIRINGS.flat())].filter(
        (role) => own?.has(role) !== true,
      );
      expect(
        missing,
        `${name} inherits ${missing.join(", ")} from the dark base`,
      ).toEqual([]);
    },
  );
});

describe.each([...THEMES])("token contrast in the %s theme", (_theme, tokens) => {
  it.each(PAIRINGS)("%s on %s meets WCAG AA", (ink, ground) => {
    const ratio = contrast(resolveToken(tokens, ink), resolveToken(tokens, ground));
    expect(
      ratio,
      `${ink} on ${ground} is ${ratio.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("resolves every semantic role to a literal color", () => {
    for (const [ink, ground] of PAIRINGS) {
      expect(resolveToken(tokens, ink)).toMatch(/^#[0-9a-f]{6}$/i);
      expect(resolveToken(tokens, ground)).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe("theme-specific findings", () => {
  it("keeps acid off light grounds, where it fails badly", () => {
    expect(
      contrast(
        resolveToken(themeByName("dark"), "--sprint-color-acid"),
        resolveToken(themeByName("dark"), "--sprint-color-paper"),
      ),
    ).toBeLessThan(AA_NORMAL);
  });

  it("keeps acid off the light action role, so it survives only as ink on ultramarine", () => {
    expect(resolveToken(themeByName("light"), "--sprint-action")).not.toBe(
      resolveToken(themeByName("light"), "--sprint-color-acid"),
    );
    expect(resolveToken(themeByName("light"), "--sprint-action-ink")).toBe(
      resolveToken(themeByName("light"), "--sprint-color-acid"),
    );
  });

  it("uses void ink on dark danger rather than paper, which would fail", () => {
    const danger = resolveToken(themeByName("dark"), "--sprint-danger");
    expect(
      contrast(resolveToken(themeByName("dark"), "--sprint-color-paper"), danger),
    ).toBeLessThan(AA_NORMAL);
    expect(
      contrast(resolveToken(themeByName("dark"), "--sprint-danger-ink"), danger),
    ).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("keeps acid off the calorie ground, where it fails as badly as on paper", () => {
    expect(
      contrast(
        resolveToken(themeByName("calorie"), "--sprint-color-acid"),
        resolveToken(themeByName("calorie"), "--sprint-surface"),
      ),
    ).toBeLessThan(AA_NORMAL);
    for (const role of ["--sprint-action", "--sprint-action-mark"]) {
      expect(resolveToken(themeByName("calorie"), role)).not.toBe(
        resolveToken(themeByName("calorie"), "--sprint-color-acid"),
      );
    }
  });

  it.each([...THEMES.keys()])(
    "keeps the %s filled action distinguishable from its ground at 3:1",
    (name) => {
      const tokens = themeByName(name);
      const ratio = contrast(
        resolveToken(tokens, "--sprint-action"),
        resolveToken(tokens, "--sprint-surface"),
      );
      expect(
        ratio,
        `${name} action on surface is ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(BOUNDARY);
    },
  );

  it.each(
    [...THEMES.keys()].filter(
      (name) =>
        resolveToken(themeByName(name), "--sprint-action-ink") !==
        resolveToken(themeByName(name), "--sprint-color-acid"),
    ),
  )(
    "never spends the %s focus hue on the action, so attention stays distinct",
    (name) => {
      const tokens = themeByName(name);
      expect(resolveToken(tokens, "--sprint-focus")).not.toBe(
        resolveToken(tokens, "--sprint-action"),
      );
    },
  );

  it("uses a light ink on calorie danger, where the ground's own ink would fail", () => {
    const danger = resolveToken(themeByName("calorie"), "--sprint-danger");
    expect(
      contrast(resolveToken(themeByName("calorie"), "--sprint-ink"), danger),
    ).toBeLessThan(AA_NORMAL);
    expect(
      contrast(resolveToken(themeByName("calorie"), "--sprint-danger-ink"), danger),
    ).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it.each(["calorie", "calorie-dark", "trax", "trax-dark"])(
    "clears 3:1 for every %s boundary, on every ground its register offers",
    (name) => {
      const tokens = themeByName(name);
      const strong = resolveToken(tokens, "--sprint-keyline-strong");
      for (const ground of [
        "--sprint-surface",
        "--sprint-surface-raised",
        "--sprint-surface-inset",
      ]) {
        const ratio = contrast(strong, resolveToken(tokens, ground));
        expect(
          ratio,
          `${name} keyline-strong on ${ground} is ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(BOUNDARY);
      }
    },
  );

  it("carries every trax status role in a tinted black, because the ground is chromatic", () => {
    const tokens = themeByName("trax");
    const ground = luminance(resolveToken(tokens, "--sprint-surface"));
    for (const role of [
      "--sprint-action",
      "--sprint-danger",
      "--sprint-info",
      "--sprint-warning",
      "--sprint-focus",
      "--sprint-link",
    ]) {
      const ink = luminance(resolveToken(tokens, role));
      expect(ink, `trax ${role} is lighter than its ground`).toBeLessThan(ground);
    }
  });

  it("spends the trax hero hue on the action and leaves the warm wedge for danger", () => {
    const tokens = themeByName("trax-dark");
    expect(resolveToken(tokens, "--sprint-action")).toBe(
      resolveToken(tokens, "--sprint-color-hazard"),
    );
    expect(resolveToken(tokens, "--sprint-danger")).toBe(
      resolveToken(tokens, "--sprint-color-magenta"),
    );
  });

  it("uses paper ink on light danger, where void would fail", () => {
    const danger = resolveToken(themeByName("light"), "--sprint-danger");
    expect(
      contrast(resolveToken(themeByName("light"), "--sprint-color-void"), danger),
    ).toBeLessThan(AA_NORMAL);
    expect(
      contrast(resolveToken(themeByName("light"), "--sprint-danger-ink"), danger),
    ).toBeGreaterThanOrEqual(AA_NORMAL);
  });
});
