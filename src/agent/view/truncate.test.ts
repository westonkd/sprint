import { describe, expect, it } from "vitest";
import { clamp, paginate, TRUNCATION_MARKER } from "./truncate.ts";

describe("clamp", () => {
  it("leaves text within the limit untouched", () => {
    expect(clamp("short", 10)).toBe("short");
  });

  it("stays within the limit and marks the cut", () => {
    const result = clamp("x".repeat(200), 50);
    expect(result.length).toBeLessThanOrEqual(50);
    expect(result.endsWith(TRUNCATION_MARKER)).toBe(true);
  });

  it("prefers a line boundary when one is close to the limit", () => {
    const result = clamp(`${"a".repeat(40)}\n${"b".repeat(40)}`, 60);
    expect(result).toBe(`${"a".repeat(40)}${TRUNCATION_MARKER}`);
  });
});

describe("paginate", () => {
  it("returns a single page when the text fits", () => {
    expect(paginate("one\ntwo", 100)).toEqual(["one\ntwo"]);
  });

  it("splits on line boundaries", () => {
    expect(paginate("aaa\nbbb\nccc", 7)).toEqual(["aaa\nbbb", "ccc"]);
  });

  it("keeps every page within the limit", () => {
    const text = Array.from({ length: 40 }, (_, index) => `line ${index}`).join("\n");
    for (const page of paginate(text, 30)) {
      expect(page.length).toBeLessThanOrEqual(30);
    }
  });

  it("hard-splits a single line that exceeds the limit", () => {
    expect(paginate("x".repeat(25), 10)).toEqual([
      "x".repeat(10),
      "x".repeat(10),
      "xxxxx",
    ]);
  });

  it("never returns an empty list", () => {
    expect(paginate("", 10)).toEqual([""]);
  });
});
