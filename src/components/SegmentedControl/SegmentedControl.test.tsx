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

describe("SegmentedControl counts", () => {
  const COUNTED = [
    { value: "read", label: "Read", count: 17 },
    { value: "never", label: "Never signed in", count: 30 },
  ];

  function Counted() {
    const [value, setValue] = useState("read");
    return (
      <SegmentedControl
        label="Members"
        options={COUNTED}
        value={value}
        onChange={setValue}
      />
    );
  }

  it("names each option by its label and count, and shows the count apart", () => {
    render(<Counted />);
    const option = screen.getByRole("radio", { name: "Never signed in 30" });
    expect(option).toHaveAttribute("data-sprint-count", "30");
    expect(option.querySelector('[aria-hidden="true"]')).toHaveTextContent("30");
  });

  it("keeps the count out of the tool enum and selects by plain label", async () => {
    render(<Counted />);
    const descriptor = mock.find("select-members")?.descriptor;
    expect(descriptor?.inputSchema.properties.option?.enum).toEqual([
      "Read",
      "Never signed in",
    ]);
    const result = await call("select-members", { option: "Never signed in" });
    expect(root()).toHaveAttribute("data-sprint-value", "never");
    expect(result).toContain('part `option` "Never signed in" [checked, count=30]');
  });

  it("agrees with its projection, plain label and count as state", () => {
    const { container } = render(<Counted />);
    const [node] = serializeWithin(container);
    expect(node?.parts).toEqual([
      { part: "option", label: "Read", state: { checked: true, count: "17" } },
      { part: "option", label: "Never signed in", state: { count: "30" } },
    ]);
  });
});

describe("SegmentedControl width", () => {
  it("keeps its own width by default", () => {
    render(<Harness />);
    expect(root()).not.toHaveAttribute("data-sprint-block");
  });

  it("publishes block when asked to fill its container", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness block />
      </SprintProvider>,
    );
    expect(container.textContent).toContain("[block, value=human]");
  });

  it("marks the root for a full-width layout", () => {
    render(<Harness block />);
    expect(root()).toHaveAttribute("data-sprint-block", "");
  });
});

describe("SegmentedControl staged change", () => {
  const ACCESS = [
    { value: "read", label: "Read" },
    { value: "write", label: "Write" },
  ];

  function Staged(props: Partial<SegmentedControlProps>) {
    const [value, setValue] = useState("read");
    return (
      <SegmentedControl
        label="Access"
        options={ACCESS}
        value={value}
        savedValue="read"
        onChange={setValue}
        hint="Currently Read. Nothing changes until you confirm."
        {...props}
      />
    );
  }

  it("is clean while the selection matches the saved value", () => {
    render(<Staged />);
    expect(root()).not.toHaveAttribute("data-sprint-dirty");
    expect(screen.getByRole("radio", { name: "Read" })).toHaveAttribute(
      "data-sprint-saved",
      "",
    );
  });

  it("marks itself dirty and keeps the saved option marked after a change", () => {
    render(<Staged />);
    fireEvent.click(screen.getByRole("radio", { name: "Write" }));
    expect(root()).toHaveAttribute("data-sprint-dirty", "");
    expect(screen.getByRole("radio", { name: "Write" })).toBeChecked();
    const saved = screen.getByRole("radio", { name: "Read" });
    expect(saved).not.toBeChecked();
    expect(saved).toHaveAttribute("data-sprint-saved", "");
  });

  it("links the hint to the group", () => {
    render(<Staged />);
    expect(
      screen.getByRole("radiogroup", { name: "Access" }),
    ).toHaveAccessibleDescription("Currently Read. Nothing changes until you confirm.");
  });

  it("carries the saved option, dirty state, and hint into the agent view", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Staged value="write" />
      </SprintProvider>,
    );
    expect(container.textContent).toContain(
      '- **SegmentedControl** "Access" [dirty, value=write] → tool `select-access`',
    );
    expect(container.textContent).toContain('- part `option` "Read" [saved]');
    expect(container.textContent).toContain(
      '- part `hint` "Currently Read. Nothing changes until you confirm."',
    );
    expect(container.querySelectorAll("[data-sprint-view] button")).toHaveLength(2);
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(<Staged value="write" />);
    const [node] = serializeWithin(container);
    expect(node?.state).toMatchObject({ dirty: true, value: "write" });
    expect(node?.parts).toEqual([
      { part: "option", label: "Read", state: { saved: true } },
      { part: "option", label: "Write", state: { checked: true } },
      {
        part: "hint",
        label: "Currently Read. Nothing changes until you confirm.",
        state: {},
      },
    ]);
  });
});

describe("SegmentedControl disabled options", () => {
  const STATUS = [
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted", disabled: true },
    { value: "deferred", label: "Deferred" },
  ];

  function Status() {
    const [status, setStatus] = useState("pending");
    return (
      <SegmentedControl
        label="Interview"
        options={STATUS}
        value={status}
        onChange={setStatus}
      />
    );
  }

  it("disables only that option and skips it with the arrow keys", () => {
    render(<Status />);
    const accepted = screen.getByRole("radio", { name: "Accepted" });
    expect(accepted).toBeDisabled();
    expect(accepted).toHaveAttribute("data-sprint-disabled", "");
    expect(screen.getByRole("radio", { name: "Pending" })).toBeEnabled();

    fireEvent.keyDown(screen.getByRole("radio", { name: "Pending" }), {
      key: "ArrowRight",
    });
    expect(root()).toHaveAttribute("data-sprint-value", "deferred");
    expect(screen.getByRole("radio", { name: "Deferred" })).toHaveFocus();
  });

  it("leaves a disabled option out of the tool's enum", () => {
    render(<Status />);
    const descriptor = mock.find("select-interview")?.descriptor;
    expect(descriptor?.inputSchema.properties.option?.enum).toEqual([
      "Pending",
      "Deferred",
    ]);
  });

  it("renders a disabled option as text, not a control, in agent view", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Status />
      </SprintProvider>,
    );
    expect(container.textContent).toContain('- part `option` "Accepted" [disabled]');
    expect(screen.queryByRole("button", { name: /"Accepted"/ })).toBeNull();
    expect(screen.getByRole("button", { name: /"Deferred"/ })).toBeInTheDocument();
  });
});
