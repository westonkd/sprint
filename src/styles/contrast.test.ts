import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const AA_NORMAL = 4.5;

function loadTokens(): Map<string, string> {
  const tokens = new Map<string, string>();

  for (const file of ["primitives.css", "semantic.css"]) {
    const css = readFileSync(resolve(process.cwd(), "src/styles", file), "utf8");
    for (const match of css.matchAll(/(--sprint-[\w-]+)\s*:\s*([^;]+);/g)) {
      const name = match[1];
      const value = match[2];
      if (name === undefined || value === undefined) continue;
      tokens.set(name, value.trim());
    }
  }

  return tokens;
}

const tokens = loadTokens();

function resolveToken(name: string, seen = new Set<string>()): string {
  if (seen.has(name)) throw new Error(`Circular token reference at ${name}`);
  seen.add(name);

  const value = tokens.get(name);
  if (value === undefined) throw new Error(`Unknown token ${name}`);

  const reference = /^var\((--[\w-]+)\)$/.exec(value);
  return reference?.[1] === undefined ? value : resolveToken(reference[1], seen);
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
  ["--sprint-action", "--sprint-surface"],
  ["--sprint-info", "--sprint-surface"],
];

describe("token contrast", () => {
  it.each(PAIRINGS)("%s on %s meets WCAG AA", (ink, ground) => {
    const ratio = contrast(resolveToken(ink), resolveToken(ground));
    expect(
      ratio,
      `${ink} on ${ground} is ${ratio.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("keeps acid off light grounds, where it fails badly", () => {
    expect(
      contrast(
        resolveToken("--sprint-color-acid"),
        resolveToken("--sprint-color-paper"),
      ),
    ).toBeLessThan(AA_NORMAL);
  });

  it("uses void ink on danger rather than paper, which would fail", () => {
    const danger = resolveToken("--sprint-danger");
    expect(contrast(resolveToken("--sprint-color-paper"), danger)).toBeLessThan(
      AA_NORMAL,
    );
    expect(
      contrast(resolveToken("--sprint-danger-ink"), danger),
    ).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("resolves every semantic role to a literal color", () => {
    for (const [ink, ground] of PAIRINGS) {
      expect(resolveToken(ink)).toMatch(/^#[0-9a-f]{6}$/i);
      expect(resolveToken(ground)).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
