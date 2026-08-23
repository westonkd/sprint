import { afterEach, describe, expect, it } from "vitest";
import {
  __resetToolNames,
  claimToolName,
  holdsToolName,
  MAX_NAME_LENGTH,
  slug,
  toolName,
  toolNameHolderCount,
} from "./scope.ts";

afterEach(() => {
  __resetToolNames();
});

describe("slug", () => {
  it("lowercases and hyphenates", () => {
    expect(slug("Prepare Launch")).toBe("prepare-launch");
  });

  it("strips punctuation and collapses separators", () => {
    expect(slug("  Save & Exit!! ")).toBe("save-exit");
  });

  it("strips diacritics", () => {
    expect(slug("Créer")).toBe("creer");
  });

  it("returns an empty string for symbol-only input", () => {
    expect(slug("×")).toBe("");
  });
});

describe("toolName", () => {
  it("joins verb and label when unscoped", () => {
    expect(toolName([], "press", "Launch")).toBe("press-launch");
  });

  it("prefixes the scope path", () => {
    expect(toolName(["Engine 1"], "press", "Launch")).toBe("engine-1-press-launch");
  });

  it("distinguishes identical labels in different scopes", () => {
    expect(toolName(["Billing"], "press", "Save")).toBe("billing-press-save");
    expect(toolName(["Shipping"], "press", "Save")).toBe("shipping-press-save");
  });

  it("returns null when the label carries no characters", () => {
    expect(toolName([], "press", "×")).toBeNull();
  });

  it("drops outer scope segments rather than truncating the action", () => {
    const name = toolName(
      ["Disambiguating two identical labels", "Billing"],
      "press",
      "Save",
    );
    expect(name).toBe("billing-press-save");
  });

  it("drops every scope segment before it will cut the action", () => {
    expect(toolName(["a".repeat(60)], "press", "Launch")).toBe("press-launch");
  });

  it("cuts on a separator, never mid-word, when the action alone is too long", () => {
    const name = toolName([], "press", "alpha bravo charlie delta echo foxtrot golf");
    expect(name?.length).toBeLessThanOrEqual(MAX_NAME_LENGTH);
    expect(name?.endsWith("-")).toBe(false);
    expect(name).toBe("press-alpha-bravo-charlie-delta-echo-foxtrot");
  });

  it("keeps a name that exactly fits", () => {
    const label = "x".repeat(MAX_NAME_LENGTH - "press-".length);
    expect(toolName([], "press", label)).toHaveLength(MAX_NAME_LENGTH);
  });
});

describe("claimToolName", () => {
  it("grants exclusive hold to a single claimant", () => {
    const holder = Symbol("a");
    claimToolName("press-go", holder, () => {});
    expect(holdsToolName("press-go", holder)).toBe(true);
  });

  it("denies both claimants on collision", () => {
    const first = Symbol("a");
    const second = Symbol("b");
    claimToolName("press-go", first, () => {});
    claimToolName("press-go", second, () => {});
    expect(holdsToolName("press-go", first)).toBe(false);
    expect(holdsToolName("press-go", second)).toBe(false);
    expect(toolNameHolderCount("press-go")).toBe(2);
  });

  it("notifies the incumbent when a collision appears", () => {
    const first = Symbol("a");
    let notified = 0;
    claimToolName("press-go", first, () => {
      notified += 1;
    });
    claimToolName("press-go", Symbol("b"), () => {});
    expect(notified).toBe(1);
  });

  it("restores exclusivity when the colliding claimant releases", () => {
    const first = Symbol("a");
    const second = Symbol("b");
    claimToolName("press-go", first, () => {});
    const release = claimToolName("press-go", second, () => {});
    release();
    expect(holdsToolName("press-go", first)).toBe(true);
  });

  it("forgets the name entirely once every claimant releases", () => {
    const release = claimToolName("press-go", Symbol("a"), () => {});
    release();
    expect(toolNameHolderCount("press-go")).toBe(0);
  });
});
