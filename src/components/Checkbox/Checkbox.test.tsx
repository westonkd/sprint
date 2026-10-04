import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { Checkbox, type CheckboxProps } from "./Checkbox.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
  vi.restoreAllMocks();
});

function Harness(props: Partial<CheckboxProps>) {
  const [checked, setChecked] = useState(props.checked ?? false);
  return (
    <Checkbox
      label="Accept the terms"
      onChange={setChecked}
      {...props}
      checked={checked}
    />
  );
}

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Checkbox"));
  if (element === null) throw new Error("no Checkbox root found");
  return element;
}

async function call(name: string, inputs: Record<string, unknown>) {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result as string | null;
}

describe("Checkbox rendering", () => {
  it("is a native checkbox named by its label", () => {
    render(<Harness />);
    const box = screen.getByRole("checkbox", { name: /Accept the terms/ });
    expect(box).toHaveAttribute("data-sprint-part", "input");
    expect(box).not.toBeChecked();
  });

  it("toggles on click and reflects the state", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(root()).toHaveAttribute("data-sprint-checked", "");
    fireEvent.click(screen.getByRole("checkbox"));
    expect(root()).not.toHaveAttribute("data-sprint-checked");
  });

  it("replaces the hint with the error and marks the box invalid", () => {
    render(<Harness hint="Read them first" error="Confirm before launch." />);
    expect(screen.queryByText("Read them first")).not.toBeInTheDocument();
    expect(screen.getByText("Confirm before launch.")).toHaveAttribute(
      "data-sprint-part",
      "error",
    );
    expect(root()).toHaveAttribute("data-sprint-invalid", "");
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("disables the input", () => {
    render(<Harness disabled />);
    expect(root()).toHaveAttribute("data-sprint-disabled", "");
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });
});

describe("Checkbox agent tool", () => {
  it("registers one set tool named from its label", () => {
    render(<Harness />);
    expect(mock.names()).toEqual(["set-accept-the-terms"]);
  });

  it("checks through a real click and reports the new state", async () => {
    render(<Harness />);
    const result = await call("set-accept-the-terms", { checked: true });
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(result).toContain("Checked");
    expect(result).toContain("[checked]");
  });

  it("treats setting the current state as success, not a toggle", async () => {
    render(<Harness />);
    const result = await call("set-accept-the-terms", { checked: false });
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(result).toContain("Already unchecked");
  });

  it("rejects a non-boolean with the schema's own message", async () => {
    render(<Harness />);
    const result = await call("set-accept-the-terms", { checked: "yes" });
    expect(result).toContain("boolean");
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("unregisters when disabled", () => {
    const { rerender } = render(<Harness />);
    expect(mock.names()).toEqual(["set-accept-the-terms"]);
    rerender(<Harness disabled />);
    expect(mock.names()).toEqual([]);
  });
});

describe("Checkbox agent view", () => {
  it("renders one control whose press toggles", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness />
      </SprintProvider>,
    );
    const control = screen.getByRole("button", { name: /Accept the terms/ });
    fireEvent.click(control);
    expect(container.textContent).toContain("[checked]");
    fireEvent.click(screen.getByRole("button", { name: /Accept the terms/ }));
    expect(container.textContent).not.toContain("[checked]");
  });

  it("sets through the tool against the agent control", async () => {
    render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness />
      </SprintProvider>,
    );
    const result = await call("set-accept-the-terms", { checked: true });
    expect(result).toContain("[checked]");
  });

  it("renders text only when disabled", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness disabled />
      </SprintProvider>,
    );
    expect(container.querySelector("[data-sprint-view] button")).toBeNull();
    expect(container.textContent).toContain("[disabled]");
  });
});

describe("Checkbox indeterminate", () => {
  function Group() {
    const [picked, setPicked] = useState(["pilot"]);
    return (
      <>
        <Checkbox
          label="Whole crew"
          checked={picked.length === 2}
          indeterminate={picked.length === 1}
          onChange={(next) => setPicked(next ? ["pilot", "navigator"] : [])}
        />
        <output>{picked.join(",")}</output>
      </>
    );
  }

  it("marks the native box and the agent state as mixed", () => {
    render(<Group />);
    const box = screen.getByRole("checkbox", {
      name: "Whole crew",
    }) as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
    expect(root()).toHaveAttribute("data-sprint-checked", "mixed");
  });

  it("picks everything when a mixed box is pressed", () => {
    render(<Group />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Whole crew" }));
    expect(screen.getByRole("status")).toHaveTextContent("pilot,navigator");
    const box = screen.getByRole("checkbox", {
      name: "Whole crew",
    }) as HTMLInputElement;
    expect(box.indeterminate).toBe(false);
    expect(root()).toHaveAttribute("data-sprint-checked", "");
  });

  it("sets the end state an agent asks for from mixed", async () => {
    render(<Group />);
    const result = await call("set-whole-crew", { checked: false });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(root()).not.toHaveAttribute("data-sprint-checked");
    expect(result).toContain("Unchecked");
  });
});
