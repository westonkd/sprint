import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { Button } from "@/components/Button/index.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { AgentControl, AgentLine } from "./AgentText.tsx";
import { toMarkdown } from "./markdown.ts";
import type { AgentFormatter } from "./node.ts";
import { buildAgentNode } from "./project.ts";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
  vi.restoreAllMocks();
});

const dialog = buildAgentNode({
  component: "Dialog",
  label: "Confirm purge",
  state: { open: true },
  parts: [
    {
      part: "close",
      label: "Close",
      state: { disabled: true },
      tool: "press-close",
    },
  ],
});

describe("AgentLine", () => {
  it("renders a part's state and tool, not just its label", () => {
    const view = render(<AgentLine node={dialog} />);
    expect(view.container.textContent).toContain(
      '- part `close` "Close" [disabled] → tool `press-close`',
    );
  });

  it("renders exactly what the formatter would produce for the same node", () => {
    const view = render(<AgentLine node={dialog} />);
    expect(view.container.textContent).toBe(`${toMarkdown([dialog])}\n`);
  });

  it("renders no elements of its own", () => {
    const view = render(<AgentLine node={dialog} />);
    expect(view.container.querySelectorAll("*")).toHaveLength(0);
  });

  it("indents nested lines by their depth", () => {
    const panel = buildAgentNode({ component: "Panel", label: "Billing" });
    const inner = buildAgentNode({ component: "Panel", label: "Card" });

    const view = render(
      <AgentLine node={panel}>
        <AgentLine node={inner}>
          <AgentLine node={dialog} />
        </AgentLine>
      </AgentLine>,
    );

    const lines = (view.container.textContent ?? "").split("\n");
    expect(lines[0]).toBe('- **Panel** "Billing"');
    expect(lines[1]).toBe('  - **Panel** "Card"');
    expect(lines[2]).toBe('    - **Dialog** "Confirm purge" [open]');
    expect(lines[3]).toBe(
      '      - part `close` "Close" [disabled] → tool `press-close`',
    );
  });
});

describe("AgentControl", () => {
  it("labels the control with the node's own line and nothing else", () => {
    const view = render(<AgentControl node={dialog} />);
    expect(view.container.querySelector("button")?.textContent).toBe(
      '- **Dialog** "Confirm purge" [open]',
    );
  });

  it("still renders the parts, outside the control", () => {
    const view = render(<AgentControl node={dialog} />);
    expect(view.container.textContent).toBe(`${toMarkdown([dialog])}\n`);
  });

  it("renders an anchor when asked for one", () => {
    const view = render(<AgentControl node={dialog} as="a" href="/purge" />);
    expect(view.container.querySelector("a")).toHaveAttribute("href", "/purge");
  });
});

describe("a custom formatter", () => {
  const shout: AgentFormatter = (nodes) =>
    nodes.map((node) => `${node.component.toUpperCase()}!`).join("\n");

  async function call(
    name: string,
    inputs?: Record<string, unknown>,
  ): Promise<string | null> {
    let result: string | null = null;
    await act(async () => {
      result = await mock.call(name, inputs);
    });
    return result;
  }

  it("changes what the agent view renders", () => {
    const view = render(
      <SprintProvider defaultView="agent" format={shout} pageTools={false}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    expect(view.container.textContent?.trim()).toBe("BUTTON!");
  });

  it("changes what a control is labelled with", () => {
    const view = render(
      <SprintProvider defaultView="agent" format={shout} pageTools={false}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    expect(view.container.querySelector("[data-sprint-view] button")?.textContent).toBe(
      "BUTTON!",
    );
  });

  it("changes what a tool reports after acting", async () => {
    render(
      <SprintProvider defaultView="agent" format={shout} pageTools={false}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    await expect(call("press-save")).resolves.toContain("BUTTON!");
  });

  it("changes what read-region returns, from the same one value", async () => {
    render(
      <SprintProvider format={shout}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    await expect(call("read-region", { region: "button-save" })).resolves.toContain(
      "BUTTON!",
    );
  });

  it("reaches a nested provider that declares none of its own", () => {
    const view = render(
      <SprintProvider defaultView="agent" format={shout} pageTools={false}>
        <SprintProvider label="Inner">
          <Button>Save</Button>
        </SprintProvider>
      </SprintProvider>,
    );
    expect(view.container.textContent?.trim()).toBe("BUTTON!");
  });
});
