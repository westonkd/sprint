import { describe, expect, it } from "vitest";
import { accessibleText } from "./text.ts";

function html(markup: string): Element {
  const host = document.createElement("div");
  host.innerHTML = markup;
  const first = host.firstElementChild;
  if (first === null) throw new Error("fixture produced no element");
  return first;
}

describe("accessibleText", () => {
  it("prefers aria-label over content", () => {
    expect(accessibleText(html('<button aria-label="Close">×</button>'))).toBe("Close");
  });

  it("resolves aria-labelledby", () => {
    const host = document.createElement("div");
    host.innerHTML =
      '<span id="t">Prepare</span><button aria-labelledby="t">×</button>';
    document.body.append(host);
    const button = host.querySelector("button");
    if (button === null) throw new Error("missing button");
    expect(accessibleText(button)).toBe("Prepare");
    host.remove();
  });

  it("normalizes whitespace", () => {
    expect(accessibleText(html("<button>  Prepare\n  launch </button>"))).toBe(
      "Prepare launch",
    );
  });

  it("skips aria-hidden subtrees", () => {
    expect(
      accessibleText(html('<button><span aria-hidden="true">▶</span>Play</button>')),
    ).toBe("Play");
  });

  it("skips hidden subtrees", () => {
    expect(accessibleText(html("<button><span hidden>no</span>yes</button>"))).toBe(
      "yes",
    );
  });

  it("does not descend into nested component roots", () => {
    expect(
      accessibleText(
        html('<div data-sprint="Panel">Header<span data-sprint="Badge">3</span></div>'),
      ),
    ).toBe("Header");
  });

  it("uses a descendant aria-label in place of its content", () => {
    expect(
      accessibleText(html('<button><span aria-label="Loading">···</span></button>')),
    ).toBe("Loading");
  });

  it("returns undefined for empty content", () => {
    expect(accessibleText(html("<button>   </button>"))).toBeUndefined();
  });
});
