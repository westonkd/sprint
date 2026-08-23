import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { Textarea, type TextareaProps } from "./Textarea.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
  vi.restoreAllMocks();
});

function Harness(props: Partial<TextareaProps>) {
  const [value, setValue] = useState(props.value ?? "");
  return (
    <Textarea label="Mission notes" onChange={setValue} {...props} value={value} />
  );
}

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Textarea"));
  if (element === null) throw new Error("no Textarea root found");
  return element;
}

async function call(name: string, inputs: Record<string, unknown>) {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result as string | null;
}

describe("Textarea rendering", () => {
  it("associates the label with a multi-line control", () => {
    render(<Harness />);
    const area = screen.getByLabelText("Mission notes");
    expect(area.tagName).toBe("TEXTAREA");
    expect(area).toHaveAttribute("data-sprint-part", "input");
    expect(area).toHaveAttribute("rows", "4");
  });

  it("reflects its content and its emptiness", () => {
    render(<Harness />);
    expect(root()).toHaveAttribute("data-sprint-empty", "");
    fireEvent.change(screen.getByLabelText("Mission notes"), {
      target: { value: "Fuel low.\nWeather turning." },
    });
    expect(root()).toHaveAttribute("data-sprint-value", "Fuel low.\nWeather turning.");
  });

  it("replaces the hint with the error and marks the area invalid", () => {
    render(<Harness hint="Keep it brief" error="State the reason" />);
    expect(screen.queryByText("Keep it brief")).not.toBeInTheDocument();
    expect(screen.getByText("State the reason")).toHaveAttribute(
      "data-sprint-part",
      "error",
    );
    expect(root()).toHaveAttribute("data-sprint-invalid", "");
    expect(screen.getByLabelText("Mission notes")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});

describe("Textarea agent tool", () => {
  it("registers one fill tool named from its label", () => {
    render(<Harness />);
    expect(mock.names()).toEqual(["fill-mission-notes"]);
  });

  it("fills multi-line content through the real element", async () => {
    render(<Harness />);
    const result = await call("fill-mission-notes", {
      value: "Fuel low.\nWeather turning.",
    });
    expect(screen.getByLabelText("Mission notes")).toHaveValue(
      "Fuel low.\nWeather turning.",
    );
    expect(result).toContain("Filled");
  });

  it("rejects a non-string value with a correctable message", async () => {
    render(<Harness />);
    const result = await call("fill-mission-notes", { value: ["a", "b"] });
    expect(result).toContain("string");
  });

  it("unregisters when disabled", () => {
    const { rerender } = render(<Harness />);
    expect(mock.names()).toEqual(["fill-mission-notes"]);
    rerender(<Harness disabled />);
    expect(mock.names()).toEqual([]);
  });
});

describe("Textarea agent view", () => {
  it("renders its line and a live textarea", () => {
    render(
      <SprintProvider defaultView="agent">
        <Harness />
      </SprintProvider>,
    );
    const surface = document.querySelector('[data-sprint-view="agent"]');
    expect(surface?.textContent).toContain('**Textarea** "Mission notes"');

    const control = screen.getByLabelText("Mission notes");
    expect(control.tagName).toBe("TEXTAREA");
    expect(control).toHaveAttribute("data-sprint-tool", "fill-mission-notes");
    fireEvent.change(control, { target: { value: "Fuel low." } });
    expect(surface?.textContent).toContain("value=Fuel low.");
  });

  it("renders text only when disabled", () => {
    render(
      <SprintProvider defaultView="agent">
        <Harness disabled />
      </SprintProvider>,
    );
    expect(screen.queryByLabelText("Mission notes")).not.toBeInTheDocument();
  });
});
