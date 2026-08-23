import { act, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { Button } from "@/components/Button/index.ts";
import { AgentRegion, SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
  vi.restoreAllMocks();
});

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

describe("agent view rendering", () => {
  it("renders exactly one element inside the text container, the control an agent can click", () => {
    const view = render(
      <SprintProvider defaultView="agent" pageTools={false}>
        <Button tone="action">Prepare launch</Button>
      </SprintProvider>,
    );
    const container = view.container.querySelector("[data-sprint-view]");
    expect(container).toHaveAttribute("data-sprint-view", "agent");
    const elements = container?.querySelectorAll("*") ?? [];
    expect(elements).toHaveLength(1);
    expect(elements[0]?.tagName).toBe("BUTTON");
  });

  it("renders no elements beyond the text container when controls are turned off", () => {
    const view = render(
      <SprintProvider defaultView="agent" agentControls="never" pageTools={false}>
        <Button tone="action">Prepare launch</Button>
      </SprintProvider>,
    );
    expect(view.container.firstElementChild?.querySelectorAll("*")).toHaveLength(0);
  });

  it("renders the component as one Markdown line", () => {
    const view = render(
      <SprintProvider defaultView="agent" pageTools={false}>
        <Button tone="action">Prepare launch</Button>
      </SprintProvider>,
    );
    expect(view.container.textContent?.trim()).toBe(
      '- **Button** "Prepare launch" [tone=action] → tool `press-prepare-launch`',
    );
  });

  it("renders the human view by default", () => {
    const view = render(
      <SprintProvider pageTools={false}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    expect(view.container.querySelector("button")).not.toBeNull();
  });

  it("keeps the tool registered across a mode switch", () => {
    function Toggle() {
      const [agent, setAgent] = useState(false);
      return (
        <>
          <SprintProvider view={agent ? "agent" : "human"} pageTools={false}>
            <Button>Save</Button>
          </SprintProvider>
          <button type="button" onClick={() => setAgent((value) => !value)}>
            flip
          </button>
        </>
      );
    }

    const view = render(<Toggle />);
    expect(mock.names()).toEqual(["press-save"]);

    fireEvent.click(view.getByText("flip"));
    expect(mock.names()).toEqual(["press-save"]);

    fireEvent.click(view.getByText("flip"));
    expect(mock.names()).toEqual(["press-save"]);
    expect(mock.history).toHaveLength(1);
  });

  it("indents nested regions and keeps scoped tool names", () => {
    const view = render(
      <SprintProvider defaultView="agent" pageTools={false}>
        <AgentRegion label="Billing">
          <Button>Save</Button>
        </AgentRegion>
      </SprintProvider>,
    );
    expect(view.container.textContent).toContain("billing-press-save");
  });

  it("reports disabled state as text", () => {
    const view = render(
      <SprintProvider defaultView="agent" pageTools={false}>
        <Button disabled>Save</Button>
      </SprintProvider>,
    );
    expect(view.container.textContent).toContain("disabled");
    expect(view.container.textContent).not.toContain("→ tool");
  });

  it("inherits the view into a nested provider", () => {
    const view = render(
      <SprintProvider defaultView="agent" pageTools={false}>
        <SprintProvider label="Inner">
          <Button>Save</Button>
        </SprintProvider>
      </SprintProvider>,
    );
    expect(view.container.querySelector("button")).not.toBeNull();
    expect(view.container.textContent).toContain("**Button**");
  });
});

describe("agent view interactivity", () => {
  it("lets a DOM-driving agent click the control without WebMCP", () => {
    mock.uninstall();
    const onClick = vi.fn();
    const view = render(
      <SprintProvider defaultView="agent" pageTools={false}>
        <Button onClick={onClick}>Save</Button>
      </SprintProvider>,
    );
    const control = view.container.querySelector("[data-sprint-view] button");
    if (control === null) throw new Error("no control rendered");
    fireEvent.click(control);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("labels the control with its own Markdown line", () => {
    const view = render(
      <SprintProvider defaultView="agent" pageTools={false}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    expect(view.container.querySelector("[data-sprint-view] button")?.textContent).toBe(
      '- **Button** "Save" [tone=neutral] → tool `press-save`',
    );
  });

  it("marks the control so an agent can select it", () => {
    const view = render(
      <SprintProvider defaultView="agent" pageTools={false}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    const control = view.container.querySelector("[data-sprint-view] button");
    expect(control).toHaveAttribute("data-sprint-agent", "Button");
    expect(control).toHaveAttribute("data-sprint-tool", "press-save");
  });

  it("renders a disabled button as text, with nothing to click", () => {
    const view = render(
      <SprintProvider defaultView="agent" pageTools={false}>
        <Button disabled>Save</Button>
      </SprintProvider>,
    );
    expect(view.container.firstElementChild?.querySelectorAll("*")).toHaveLength(0);
  });

  it("still renders a control for a button that registers no tool", () => {
    const view = render(
      <SprintProvider defaultView="agent" pageTools={false}>
        <Button agentTool={false}>Save</Button>
      </SprintProvider>,
    );
    const control = view.container.querySelector("button");
    expect(control).not.toBeNull();
    expect(control).not.toHaveAttribute("data-sprint-tool");
  });
});

describe("agent view tool execution", () => {
  it("clicks the rendered control", async () => {
    const onClick = vi.fn();
    render(
      <SprintProvider defaultView="agent" pageTools={false}>
        <Button onClick={onClick}>Save</Button>
      </SprintProvider>,
    );
    await call("press-save");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("falls back to the handler when no control is rendered", async () => {
    const onClick = vi.fn();
    render(
      <SprintProvider defaultView="agent" agentControls="never" pageTools={false}>
        <Button onClick={onClick}>Save</Button>
      </SprintProvider>,
    );
    await call("press-save");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("says so when a control-free button has no handler", async () => {
    render(
      <SprintProvider defaultView="agent" agentControls="never" pageTools={false}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    await expect(call("press-save")).resolves.toContain("no control");
  });

  it("reports the resulting state after an agent-view press", async () => {
    function Saving() {
      const [saving, setSaving] = useState(false);
      return (
        <Button loading={saving} onClick={() => setSaving(true)}>
          Save
        </Button>
      );
    }

    render(
      <SprintProvider defaultView="agent" pageTools={false}>
        <Saving />
      </SprintProvider>,
    );
    await expect(call("press-save")).resolves.toContain("loading");
  });
});

describe("set-page-view", () => {
  it("switches the page to agent view and returns the text", async () => {
    const view = render(
      <SprintProvider>
        <Button>Prepare launch</Button>
      </SprintProvider>,
    );
    expect(view.container.querySelector("button")).not.toBeNull();

    const result = await call("set-page-view", { view: "agent" });
    expect(result).toContain("agent view");
    expect(result).toContain("**Button**");
    expect(view.container.textContent).toContain("**Button**");
  });

  it("switches back to the human view", async () => {
    const view = render(
      <SprintProvider defaultView="agent">
        <Button>Save</Button>
      </SprintProvider>,
    );
    await call("set-page-view", { view: "human" });
    expect(view.container.querySelector("button")).not.toBeNull();
  });

  it("rejects a view outside the enum", async () => {
    render(
      <SprintProvider>
        <Button>Save</Button>
      </SprintProvider>,
    );
    await expect(call("set-page-view", { view: "sideways" })).resolves.toContain(
      "agent, human",
    );
  });

  it("notifies a controlling consumer instead of self-updating", async () => {
    const onViewChange = vi.fn();
    render(
      <SprintProvider view="human" onViewChange={onViewChange}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    await call("set-page-view", { view: "agent" });
    expect(onViewChange).toHaveBeenCalledWith("agent");
  });

  it("reads the whole page as one region while in agent view", async () => {
    render(
      <SprintProvider defaultView="agent">
        <Button>Save</Button>
      </SprintProvider>,
    );
    const result = await call("read-region", { region: "page" });
    expect(result).toContain("**Button**");
    expect(result).toContain("page 1 of 1");
  });

  it("explains the single region when asked for an unknown one in agent view", async () => {
    render(
      <SprintProvider defaultView="agent">
        <Button>Save</Button>
      </SprintProvider>,
    );
    await expect(call("read-region", { region: "button-save" })).resolves.toContain(
      'named "page"',
    );
  });
});
