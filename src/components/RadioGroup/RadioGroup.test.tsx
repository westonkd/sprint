import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { RadioGroup, type RadioGroupProps } from "./RadioGroup.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
});

const OPTIONS = [
  { value: "viewer", label: "Viewer", description: "Sees the board." },
  { value: "editor", label: "Editor", description: "Moves people." },
  { value: "admin", label: "Admin", disabled: true },
];

function Harness(props: Partial<RadioGroupProps>) {
  const [value, setValue] = useState(props.value ?? "viewer");
  return (
    <RadioGroup
      label="Role"
      options={OPTIONS}
      onChange={setValue}
      {...props}
      value={value}
    />
  );
}

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("RadioGroup"));
  if (element === null) throw new Error("no RadioGroup root found");
  return element;
}

async function call(name: string, inputs: Record<string, unknown>) {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result as string | null;
}

describe("RadioGroup", () => {
  it("is a named group of native radios with described options", () => {
    render(<Harness />);
    expect(screen.getByRole("group", { name: "Role" })).toBe(root());
    const editor = screen.getByRole("radio", { name: "Editor" });
    expect(editor).toHaveAccessibleDescription("Moves people.");
    expect(screen.getByRole("radio", { name: "Viewer" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Admin" })).toBeDisabled();
  });

  it("selects on click and publishes the chosen label", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("radio", { name: "Editor" }));
    expect(screen.getByRole("radio", { name: "Editor" })).toBeChecked();
    expect(root()).toHaveAttribute("data-sprint-value", "Editor");
  });

  it("shares a form name across its radios", () => {
    render(<Harness name="role" />);
    for (const radio of screen.getAllByRole("radio"))
      expect(radio).toHaveAttribute("name", "role");
  });

  it("projects option labels without their descriptions folded in", () => {
    const { container } = render(<Harness />);
    const [node] = serializeWithin(container);
    expect(
      node?.parts.filter((part) => part.part === "option").map((part) => part.label),
    ).toEqual(["Viewer", "Editor", "Admin"]);
  });

  it("selects through the tool and leaves disabled options out", async () => {
    render(<Harness />);
    expect(
      mock.find("select-role")?.descriptor.inputSchema.properties.option?.enum,
    ).toEqual(["Viewer", "Editor"]);
    const result = await call("select-role", { option: "Editor" });
    expect(screen.getByRole("radio", { name: "Editor" })).toBeChecked();
    expect(result).toContain("value=Editor");
  });

  it("renders one control per enabled option in agent view", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness />
      </SprintProvider>,
    );
    expect(container.textContent).toContain('"Editor" [description=Moves people.]');
    expect(screen.queryByRole("button", { name: /Admin/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /"Editor"/ }));
    expect(container.textContent).toContain("value=Editor");
  });
});
