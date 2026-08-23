import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { Switch, type SwitchProps } from "./Switch.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
  vi.restoreAllMocks();
});

function Harness(props: Partial<SwitchProps>) {
  const [on, setOn] = useState(props.on ?? false);
  return <Switch label="Live telemetry" onChange={setOn} {...props} on={on} />;
}

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Switch"));
  if (element === null) throw new Error("no Switch root found");
  return element;
}

async function call(name: string, inputs: Record<string, unknown>) {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result as string | null;
}

describe("Switch rendering", () => {
  it("is a switch named by its label", () => {
    render(<Harness />);
    const control = screen.getByRole("switch", { name: "Live telemetry" });
    expect(control).toBe(root());
    expect(control).toHaveAttribute("aria-checked", "false");
  });

  it("toggles on click and reflects the state", () => {
    render(<Harness />);
    fireEvent.click(root());
    expect(root()).toHaveAttribute("data-sprint-on", "");
    expect(root()).toHaveAttribute("aria-checked", "true");
    fireEvent.click(root());
    expect(root()).not.toHaveAttribute("data-sprint-on");
  });

  it("disables the control", () => {
    render(<Harness disabled />);
    expect(root()).toBeDisabled();
    expect(root()).toHaveAttribute("data-sprint-disabled", "");
  });
});

describe("Switch agent tool", () => {
  it("registers one set tool named from its label", () => {
    render(<Harness />);
    expect(mock.names()).toEqual(["set-live-telemetry"]);
  });

  it("switches on through a real click and reports the new state", async () => {
    render(<Harness />);
    const result = await call("set-live-telemetry", { on: true });
    expect(root()).toHaveAttribute("data-sprint-on", "");
    expect(result).toContain("Switched on");
    expect(result).toContain("[on]");
  });

  it("treats setting the current state as success, not a toggle", async () => {
    render(<Harness on />);
    const result = await call("set-live-telemetry", { on: true });
    expect(root()).toHaveAttribute("data-sprint-on", "");
    expect(result).toContain("Already on");
  });

  it("unregisters when disabled", () => {
    const { rerender } = render(<Harness />);
    expect(mock.names()).toEqual(["set-live-telemetry"]);
    rerender(<Harness disabled />);
    expect(mock.names()).toEqual([]);
  });
});

describe("Switch agent view", () => {
  it("renders one control whose press toggles", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness />
      </SprintProvider>,
    );
    const control = screen.getByRole("button", { name: /Live telemetry/ });
    fireEvent.click(control);
    expect(container.textContent).toContain("[on]");
  });

  it("sets through the tool against the agent control", async () => {
    render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness />
      </SprintProvider>,
    );
    const result = await call("set-live-telemetry", { on: true });
    expect(result).toContain("[on]");
  });

  it("renders text only when disabled", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness disabled on />
      </SprintProvider>,
    );
    expect(container.querySelector("[data-sprint-view] button")).toBeNull();
    expect(container.textContent).toContain("[disabled, on]");
  });
});
