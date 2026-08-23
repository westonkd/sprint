import { describe, expect, it } from "vitest";
import { toMarkdown } from "./markdown.ts";
import type { AgentNode } from "./node.ts";

function node(overrides: Partial<AgentNode> = {}): AgentNode {
  return { component: "Button", state: {}, parts: [], children: [], ...overrides };
}

describe("toMarkdown", () => {
  it("states identity, label, and state on one line", () => {
    expect(
      toMarkdown(node({ label: "Prepare launch", state: { tone: "action" } })),
    ).toBe('- **Button** "Prepare launch" [tone=action]');
  });

  it("renders disabled state as readable text", () => {
    expect(toMarkdown(node({ state: { disabled: true } }))).toContain("disabled");
  });

  it("sorts state keys for stable output", () => {
    expect(toMarkdown(node({ state: { tone: "danger", disabled: true } }))).toBe(
      "- **Button** [disabled, tone=danger] (empty)",
    );
  });

  it("names the tool that drives the component", () => {
    expect(toMarkdown(node({ label: "Go", tool: "press-go" }))).toBe(
      '- **Button** "Go" → tool `press-go`',
    );
  });

  it("includes the registry summary", () => {
    expect(toMarkdown(node({ label: "Go", summary: "A single action." }))).toBe(
      '- **Button** "Go"\n  A single action.',
    );
  });

  it("degrades gracefully when no summary is registered", () => {
    expect(toMarkdown(node({ label: "Go" }))).toBe('- **Button** "Go"');
  });

  it("omits the summary when asked", () => {
    expect(
      toMarkdown(node({ label: "Go", summary: "A single action." }), {
        includeSummary: false,
      }),
    ).toBe('- **Button** "Go"');
  });

  it("states that an unlabeled empty component is empty", () => {
    expect(toMarkdown(node({ component: "Panel" }))).toBe("- **Panel** (empty)");
  });

  it("nests parts and children under their component", () => {
    expect(
      toMarkdown(
        node({
          component: "Dialog",
          label: "Settings",
          parts: [{ part: "close", label: "Close", state: {} }],
          children: [node({ label: "Save" })],
        }),
      ),
    ).toBe(
      [
        '- **Dialog** "Settings"',
        '  - part `close` "Close"',
        '  - **Button** "Save"',
      ].join("\n"),
    );
  });

  it("flags a depth-limited subtree", () => {
    expect(
      toMarkdown(node({ component: "Panel", label: "x", truncated: true })),
    ).toContain("depth limit reached");
  });

  it("notes an unresolved portal owner", () => {
    expect(
      toMarkdown(node({ component: "Sheet", label: "x", owner: "open-settings" })),
    ).toContain("owned by `open-settings`");
  });

  it("says so when the page has no components", () => {
    expect(toMarkdown([])).toBe("No Sprint components found.");
  });
});
