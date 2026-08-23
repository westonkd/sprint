import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { SegmentedControl, type SegmentedControlProps } from "./SegmentedControl.tsx";

const OPTIONS = [
  { value: "human", label: "human" },
  { value: "agent", label: "agent" },
];

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
  vi.restoreAllMocks();
});

function Harness(props: Partial<SegmentedControlProps>) {
  const [view, setView] = useState("human");
  return (
    <SegmentedControl
      label="Page view"
      options={OPTIONS}
      value={view}
      onChange={setView}
      {...props}
    />
  );
}

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    agentSelector("SegmentedControl"),
  );
  if (element === null) throw new Error("no SegmentedControl root found");
  return element;
}

async function call(name: string, inputs: Record<string, unknown>) {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result as string | null;
}

describe("SegmentedControl rendering", () => {
  it("is a radio group named by its label", () => {
    render(<Harness />);
    expect(screen.getByRole("radiogroup", { name: "Page view" })).toBe(root());
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("marks the selected option and reflects the value", () => {
    render(<Harness />);
    expect(root()).toHaveAttribute("data-sprint-value", "human");
    expect(screen.getByRole("radio", { name: "human" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "agent" })).not.toBeChecked();
  });

  it("keeps only the selected option in the tab order", () => {
    render(<Harness />);
    expect(screen.getByRole("radio", { name: "human" })).toHaveAttribute(
      "tabindex",
      "0",
    );
    expect(screen.getByRole("radio", { name: "agent" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("selects on click", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("radio", { name: "agent" }));
    expect(root()).toHaveAttribute("data-sprint-value", "agent");
  });

  it("moves and selects with the arrow keys", () => {
    render(<Harness />);
    fireEvent.keyDown(root(), { key: "ArrowRight" });
    expect(root()).toHaveAttribute("data-sprint-value", "agent");
    fireEvent.keyDown(root(), { key: "ArrowRight" });
    expect(root()).toHaveAttribute("data-sprint-value", "human");
    fireEvent.keyDown(root(), { key: "End" });
    expect(root()).toHaveAttribute("data-sprint-value", "agent");
  });

  it("disables every option", () => {
    render(<Harness disabled />);
    expect(root()).toHaveAttribute("data-sprint-disabled", "");
    for (const option of screen.getAllByRole("radio")) {
      expect(option).toBeDisabled();
    }
  });
});

describe("SegmentedControl agent tool", () => {
  it("registers one select tool named from its label", () => {
    render(<Harness />);
    expect(mock.names()).toEqual(["select-page-view"]);
  });

  it("enumerates the current option labels in the registered schema", () => {
    render(<Harness />);
    const descriptor = mock.find("select-page-view")?.descriptor;
    expect(descriptor?.inputSchema.properties.option?.enum).toEqual(["human", "agent"]);
  });

  it("selects by visible label and reports the new state", async () => {
    render(<Harness />);
    const result = await call("select-page-view", { option: "agent" });
    expect(root()).toHaveAttribute("data-sprint-value", "agent");
    expect(result).toContain("value=agent");
  });

  it("names the options it does offer when handed one it does not", async () => {
    render(<Harness />);
    const result = await call("select-page-view", { option: "robot" });
    expect(result).toBe('Parameter "option" must be one of: human, agent.');
    expect(root()).toHaveAttribute("data-sprint-value", "human");
  });

  it("unregisters the tool while disabled", () => {
    render(<Harness disabled />);
    expect(mock.names()).toEqual([]);
  });

  it("registers nothing when asked not to", () => {
    render(<Harness agentTool={false} />);
    expect(mock.names()).toEqual([]);
  });
});

describe("SegmentedControl agent view", () => {
  it("renders one control per option, each carrying its own line", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness />
      </SprintProvider>,
    );

    const options = container.querySelectorAll('[data-sprint-part="option"]');
    expect(options).toHaveLength(2);
    expect(container.textContent).toContain(
      '- **SegmentedControl** "Page view" [value=human] → tool `select-page-view`',
    );
    expect(container.textContent).toContain('- part `option` "human" [checked]');
  });

  it("selects when one of those controls is clicked", () => {
    render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness />
      </SprintProvider>,
    );

    const agentOption = screen.getByRole("button", { name: /"agent"/ });
    fireEvent.click(agentOption);
    expect(
      screen.getByRole("button", { name: /"agent" \[checked\]/ }),
    ).toBeInTheDocument();
  });

  it("renders text only when there is nothing to select", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness disabled />
      </SprintProvider>,
    );

    expect(container.querySelector("[data-sprint-view] button")).toBeNull();
    expect(container.textContent).toContain("[disabled, value=human]");
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(<Harness />);

    const [node] = serializeWithin(container);
    expect(node?.label).toBe("Page view");
    expect(node?.tool).toBe("select-page-view");
    expect(node?.parts).toEqual([
      { part: "option", label: "human", state: { checked: true } },
      { part: "option", label: "agent", state: {} },
    ]);
  });
});
