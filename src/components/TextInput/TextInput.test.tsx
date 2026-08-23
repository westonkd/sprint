import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { TextInput, type TextInputProps } from "./TextInput.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
  vi.restoreAllMocks();
});

function Harness(props: Partial<TextInputProps>) {
  const [value, setValue] = useState(props.value ?? "");
  return <TextInput label="Callsign" onChange={setValue} {...props} value={value} />;
}

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("TextInput"));
  if (element === null) throw new Error("no TextInput root found");
  return element;
}

async function call(name: string, inputs: Record<string, unknown>) {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result as string | null;
}

describe("TextInput rendering", () => {
  it("associates the label with the input", () => {
    render(<Harness />);
    expect(screen.getByLabelText("Callsign")).toHaveAttribute(
      "data-sprint-part",
      "input",
    );
  });

  it("reads as empty until it holds text", () => {
    render(<Harness />);
    expect(root()).toHaveAttribute("data-sprint-empty", "");
    fireEvent.change(screen.getByLabelText("Callsign"), { target: { value: "NOMAD" } });
    expect(root()).not.toHaveAttribute("data-sprint-empty");
    expect(root()).toHaveAttribute("data-sprint-value", "NOMAD");
  });

  it("shows the hint and links it to the input", () => {
    render(<Harness hint="Three to eight letters" />);
    const hint = screen.getByText("Three to eight letters");
    expect(hint).toHaveAttribute("data-sprint-part", "hint");
    expect(screen.getByLabelText("Callsign")).toHaveAttribute(
      "aria-describedby",
      hint.id,
    );
  });

  it("replaces the hint with the error and marks the field invalid", () => {
    render(<Harness hint="Three to eight letters" error="Too short" />);
    expect(screen.queryByText("Three to eight letters")).not.toBeInTheDocument();
    expect(screen.getByText("Too short")).toHaveAttribute("data-sprint-part", "error");
    expect(root()).toHaveAttribute("data-sprint-invalid", "");
    expect(screen.getByLabelText("Callsign")).toHaveAttribute("aria-invalid", "true");
  });

  it("marks required and disabled on the root and the input", () => {
    render(<Harness required disabled />);
    expect(root()).toHaveAttribute("data-sprint-required", "");
    expect(root()).toHaveAttribute("data-sprint-disabled", "");
    expect(screen.getByLabelText("Callsign")).toBeDisabled();
    expect(screen.getByLabelText("Callsign")).toBeRequired();
  });

  it("keeps a password's value out of the agent attributes", () => {
    render(<Harness type="password" value="hunter2" onChange={() => {}} />);
    expect(root()).not.toHaveAttribute("data-sprint-value");
    expect(root()).toHaveAttribute("data-sprint-filled", "");
  });
});

describe("TextInput agent tool", () => {
  it("registers one fill tool named from its label", () => {
    render(<Harness />);
    expect(mock.names()).toEqual(["fill-callsign"]);
  });

  it("fills through the real input and reports the new state", async () => {
    render(<Harness />);
    const result = await call("fill-callsign", { value: "NOMAD" });
    expect(screen.getByLabelText("Callsign")).toHaveValue("NOMAD");
    expect(result).toContain("Filled");
    expect(result).toContain("value=NOMAD");
  });

  it("clears the field when passed an empty string", async () => {
    render(<Harness value="NOMAD" />);
    await call("fill-callsign", { value: "" });
    expect(screen.getByLabelText("Callsign")).toHaveValue("");
    expect(root()).toHaveAttribute("data-sprint-empty", "");
  });

  it("rejects a non-string value with a correctable message", async () => {
    render(<Harness />);
    const result = await call("fill-callsign", { value: 7 });
    expect(result).toContain("string");
    expect(screen.getByLabelText("Callsign")).toHaveValue("");
  });

  it("does not re-register while a person types", () => {
    render(<Harness />);
    const before = mock.history.length;
    const input = screen.getByLabelText("Callsign");
    for (const value of ["N", "NO", "NOM", "NOMA", "NOMAD"]) {
      fireEvent.change(input, { target: { value } });
    }
    expect(mock.history.length).toBe(before);
    expect(mock.names()).toEqual(["fill-callsign"]);
  });

  it("unregisters when disabled and when agentTool is false", () => {
    const { rerender } = render(<Harness key="a" />);
    expect(mock.names()).toEqual(["fill-callsign"]);
    rerender(<Harness key="a" disabled />);
    expect(mock.names()).toEqual([]);

    render(<Harness key="b" agentTool={false} />);
    expect(mock.names()).toEqual([]);
  });

  it("never echoes a password through the tool result", async () => {
    render(<Harness type="password" />);
    const result = await call("fill-callsign", { value: "hunter2" });
    expect(result).not.toContain("hunter2");
    expect(result).toContain("filled");
  });
});

describe("TextInput agent view", () => {
  it("renders its line, its hint part, and a live input", () => {
    render(
      <SprintProvider defaultView="agent">
        <Harness hint="Three to eight letters" />
      </SprintProvider>,
    );
    const surface = document.querySelector('[data-sprint-view="agent"]');
    expect(surface?.textContent).toContain('**TextInput** "Callsign"');
    expect(surface?.textContent).toContain("`fill-callsign`");
    expect(surface?.textContent).toContain('part `hint` "Three to eight letters"');

    const control = screen.getByLabelText("Callsign");
    expect(control.tagName).toBe("INPUT");
    expect(control).toHaveAttribute("data-sprint-tool", "fill-callsign");
  });

  it("keeps typed text out of the copyable stream", () => {
    render(
      <SprintProvider defaultView="agent">
        <Harness value="NOMAD" onChange={() => {}} />
      </SprintProvider>,
    );
    const surface = document.querySelector('[data-sprint-view="agent"]');
    expect(surface?.textContent).toContain("value=NOMAD");
    expect(screen.getByLabelText("Callsign")).toHaveValue("NOMAD");
    const occurrences = (surface?.textContent?.match(/NOMAD/g) ?? []).length;
    expect(occurrences).toBe(1);
  });

  it("writes through the live control", () => {
    render(
      <SprintProvider defaultView="agent">
        <Harness />
      </SprintProvider>,
    );
    fireEvent.change(screen.getByLabelText("Callsign"), { target: { value: "NOMAD" } });
    const surface = document.querySelector('[data-sprint-view="agent"]');
    expect(surface?.textContent).toContain("value=NOMAD");
  });

  it("masks the live control for a password", () => {
    render(
      <SprintProvider defaultView="agent">
        <Harness type="password" />
      </SprintProvider>,
    );
    expect(screen.getByLabelText("Callsign")).toHaveAttribute("type", "password");
  });

  it("renders text only when disabled or when controls are off", () => {
    const { unmount } = render(
      <SprintProvider defaultView="agent">
        <Harness disabled />
      </SprintProvider>,
    );
    expect(screen.queryByLabelText("Callsign")).not.toBeInTheDocument();
    unmount();

    render(
      <SprintProvider defaultView="agent" agentControls="never">
        <Harness />
      </SprintProvider>,
    );
    expect(screen.queryByLabelText("Callsign")).not.toBeInTheDocument();
  });

  it("still fills through the tool when no element renders", async () => {
    render(
      <SprintProvider defaultView="agent" agentControls="never">
        <Harness />
      </SprintProvider>,
    );
    const result = await call("fill-callsign", { value: "NOMAD" });
    expect(result).toContain("value=NOMAD");
  });
});
