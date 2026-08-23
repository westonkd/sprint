import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { Select, type SelectProps } from "./Select.tsx";

const OPTIONS = [
  { value: "na-1", label: "North Atlantic" },
  { value: "eu-1", label: "Northern Europe" },
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

function Harness(props: Partial<SelectProps>) {
  const [value, setValue] = useState(props.value ?? "");
  return (
    <Select
      label="Region"
      options={OPTIONS}
      onChange={setValue}
      {...props}
      value={value}
    />
  );
}

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Select"));
  if (element === null) throw new Error("no Select root found");
  return element;
}

async function call(name: string, inputs: Record<string, unknown>) {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result as string | null;
}

describe("Select rendering", () => {
  it("is a labelled native select with one option per choice", () => {
    render(<Harness />);
    const select = screen.getByLabelText("Region");
    expect(select.tagName).toBe("SELECT");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("shows a disabled placeholder while nothing is chosen", () => {
    render(<Harness placeholder="Choose a region" />);
    expect(root()).toHaveAttribute("data-sprint-empty", "");
    const placeholder = screen.getByRole("option", { name: "Choose a region" });
    expect(placeholder).toBeDisabled();
    expect(screen.getByLabelText("Region")).toHaveValue("");
  });

  it("drops the placeholder and reflects the value once chosen", () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("Region"), { target: { value: "eu-1" } });
    expect(root()).toHaveAttribute("data-sprint-value", "eu-1");
    expect(root()).not.toHaveAttribute("data-sprint-empty");
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("marks the chosen option as a checked part", () => {
    render(<Harness value="eu-1" />);
    expect(screen.getByRole("option", { name: "Northern Europe" })).toHaveAttribute(
      "data-sprint-checked",
      "",
    );
  });

  it("replaces the hint with the error and marks the control invalid", () => {
    render(<Harness hint="Pick the nearest" error="Choose a region" />);
    expect(screen.queryByText("Pick the nearest")).not.toBeInTheDocument();
    expect(screen.getByText("Choose a region")).toHaveAttribute(
      "data-sprint-part",
      "error",
    );
    expect(root()).toHaveAttribute("data-sprint-invalid", "");
    expect(screen.getByLabelText("Region")).toHaveAttribute("aria-invalid", "true");
  });
});

describe("Select agent tool", () => {
  it("registers one select tool that enumerates the option labels", () => {
    render(<Harness />);
    expect(mock.names()).toEqual(["select-region"]);
    const descriptor = mock.find("select-region")?.descriptor;
    expect(descriptor?.inputSchema.properties.option?.enum).toEqual([
      "North Atlantic",
      "Northern Europe",
    ]);
  });

  it("selects by visible label through the real element", async () => {
    render(<Harness />);
    const result = await call("select-region", { option: "Northern Europe" });
    expect(root()).toHaveAttribute("data-sprint-value", "eu-1");
    expect(result).toContain("Selected");
    expect(result).toContain("value=eu-1");
  });

  it("names the options it does offer when handed one it does not", async () => {
    render(<Harness />);
    const result = await call("select-region", { option: "Atlantis" });
    expect(result).toBe(
      'Parameter "option" must be one of: North Atlantic, Northern Europe.',
    );
    expect(root()).toHaveAttribute("data-sprint-empty", "");
  });

  it("unregisters when disabled", () => {
    const { rerender } = render(<Harness />);
    expect(mock.names()).toEqual(["select-region"]);
    rerender(<Harness disabled />);
    expect(mock.names()).toEqual([]);
  });
});

describe("Select agent view", () => {
  it("renders one control per option and selects through it", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness />
      </SprintProvider>,
    );
    const surface = container.querySelector('[data-sprint-view="agent"]');
    expect(surface?.textContent).toContain('**Select** "Region"');

    const option = screen.getByRole("button", { name: /Northern Europe/ });
    fireEvent.click(option);
    expect(surface?.textContent).toContain("value=eu-1");
  });

  it("renders the error as text, not as a control", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness error="Choose a region" />
      </SprintProvider>,
    );
    const controls = container.querySelectorAll("[data-sprint-view] button");
    expect(controls).toHaveLength(OPTIONS.length);
    const surface = container.querySelector('[data-sprint-view="agent"]');
    expect(surface?.textContent).toContain('part `error` "Choose a region"');
  });

  it("renders text only when disabled", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness disabled value="eu-1" />
      </SprintProvider>,
    );
    expect(container.querySelector("[data-sprint-view] button")).toBeNull();
  });
});
