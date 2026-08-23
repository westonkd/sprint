import { describe, expect, it } from "vitest";
import { serializeElement, serializeWithin } from "./serialize.ts";

function fixture(markup: string): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = markup;
  return host;
}

function first(markup: string): Element {
  const element = fixture(markup).firstElementChild;
  if (element === null) throw new Error("fixture produced no element");
  return element;
}

const noMeta = { lookupMeta: () => undefined };

describe("serializeElement", () => {
  it("returns null for an element that is not a component root", () => {
    expect(serializeElement(first("<div>plain</div>"), noMeta)).toBeNull();
  });

  it("reads identity and label", () => {
    const node = serializeElement(
      first('<button data-sprint="Button">Prepare launch</button>'),
      noMeta,
    );
    expect(node?.component).toBe("Button");
    expect(node?.label).toBe("Prepare launch");
  });

  it("reads valueless state as true and valued state as a string", () => {
    const node = serializeElement(
      first(
        '<button data-sprint="Button" data-sprint-loading data-sprint-tone="danger"></button>',
      ),
      noMeta,
    );
    expect(node?.state).toEqual({ loading: true, tone: "danger" });
  });

  it("ignores reserved state keys", () => {
    const node = serializeElement(
      first(
        '<button data-sprint="Button" data-sprint-tool="press-go" data-sprint-owner="x"></button>',
      ),
      noMeta,
    );
    expect(node?.state).toEqual({});
    expect(node?.tool).toBe("press-go");
    expect(node?.owner).toBe("x");
  });

  it("reads native and aria state", () => {
    const node = serializeElement(
      first(
        '<button data-sprint="Button" disabled aria-busy="true" aria-expanded="false"></button>',
      ),
      noMeta,
    );
    expect(node?.state).toEqual({ disabled: true, loading: true });
  });

  it("keeps non-boolean aria values", () => {
    const node = serializeElement(
      first('<div data-sprint="Check" aria-checked="mixed"></div>'),
      noMeta,
    );
    expect(node?.state.checked).toBe("mixed");
  });

  it("collects parts with their own state", () => {
    const node = serializeElement(
      first(
        '<div data-sprint="Dialog"><button data-sprint-part="close" disabled>Close</button></div>',
      ),
      noMeta,
    );
    expect(node?.parts).toEqual([
      { part: "close", label: "Close", state: { disabled: true } },
    ]);
  });

  it("treats a nested component root as a child, not as text", () => {
    const node = serializeElement(
      first('<div data-sprint="Panel">Header<span data-sprint="Badge">3</span></div>'),
      noMeta,
    );
    expect(node?.label).toBe("Header");
    expect(node?.children).toHaveLength(1);
    expect(node?.children[0]?.component).toBe("Badge");
  });

  it("does not collect parts that belong to a nested component", () => {
    const node = serializeElement(
      first(
        '<div data-sprint="Panel"><div data-sprint="Dialog"><b data-sprint-part="close">x</b></div></div>',
      ),
      noMeta,
    );
    expect(node?.parts).toEqual([]);
    expect(node?.children[0]?.parts).toHaveLength(1);
  });

  it("stops at maxDepth and flags truncation", () => {
    const node = serializeElement(
      first(
        '<div data-sprint="A"><div data-sprint="B"><div data-sprint="C"></div></div></div>',
      ),
      { ...noMeta, maxDepth: 1 },
    );
    expect(node?.children[0]?.component).toBe("B");
    expect(node?.children[0]?.children).toEqual([]);
    expect(node?.children[0]?.truncated).toBe(true);
  });

  it("joins the registry for summary prose", () => {
    const node = serializeElement(first('<button data-sprint="Button"></button>'), {
      lookupMeta: (name) =>
        name === "Button" ? ({ summary: "A single action." } as never) : undefined,
    });
    expect(node?.summary).toBe("A single action.");
  });

  it("omits summary when the component is unregistered", () => {
    const node = serializeElement(first('<div data-sprint="Ghost"></div>'), noMeta);
    expect(node).not.toHaveProperty("summary");
  });
});

describe("serializeWithin", () => {
  it("returns top-level roots only, never a nested root twice", () => {
    const nodes = serializeWithin(
      fixture(
        '<section><div data-sprint="Panel"><span data-sprint="Badge">3</span></div></section><div data-sprint="Button"></div>',
      ),
      noMeta,
    );
    expect(nodes.map((node) => node.component)).toEqual(["Panel", "Button"]);
    expect(nodes[0]?.children.map((child) => child.component)).toEqual(["Badge"]);
  });

  it("returns an empty array when nothing is registered", () => {
    expect(serializeWithin(fixture("<p>nothing here</p>"), noMeta)).toEqual([]);
  });

  it("reattaches an owned root under the component holding that tool", () => {
    const nodes = serializeWithin(
      fixture(
        '<div data-sprint="Dialog" data-sprint-tool="open-settings"></div><div data-sprint="Sheet" data-sprint-owner="open-settings"></div>',
      ),
      noMeta,
    );
    expect(nodes).toHaveLength(1);
    expect(nodes[0]?.component).toBe("Dialog");
    expect(nodes[0]?.children[0]?.component).toBe("Sheet");
  });

  it("leaves an owned root in place when its owner is absent", () => {
    const nodes = serializeWithin(
      fixture('<div data-sprint="Sheet" data-sprint-owner="missing"></div>'),
      noMeta,
    );
    expect(nodes).toHaveLength(1);
    expect(nodes[0]?.owner).toBe("missing");
  });
});
