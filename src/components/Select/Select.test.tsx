import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
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

function trigger(): HTMLElement {
  return screen.getByRole("combobox", { name: "Region" });
}

function listbox(): HTMLElement {
  return screen.getByRole("listbox", { hidden: true });
}

describe("Select rendering", () => {
  it("is a labelled combobox with one option per choice", () => {
    render(<Harness />);
    expect(screen.getAllByLabelText("Region")).toContain(trigger());
    expect(trigger()).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByRole("option", { hidden: true })).toHaveLength(2);
  });

  it("shows the placeholder while nothing is chosen", () => {
    render(<Harness placeholder="Choose a region" />);
    expect(root()).toHaveAttribute("data-sprint-empty", "");
    expect(trigger()).toHaveTextContent("Choose a region");
    expect(
      screen.queryByRole("option", { name: "Choose a region", hidden: true }),
    ).toBeNull();
  });

  it("shows the chosen label and reflects the value once chosen", async () => {
    render(<Harness placeholder="Choose a region" />);
    fireEvent.click(trigger());
    fireEvent.click(screen.getByRole("option", { name: "Northern Europe" }));
    expect(root()).toHaveAttribute("data-sprint-value", "eu-1");
    expect(root()).not.toHaveAttribute("data-sprint-empty");
    expect(trigger()).toHaveTextContent("Northern Europe");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("marks the chosen option as a checked part", () => {
    render(<Harness value="eu-1" />);
    const option = screen.getByRole("option", {
      name: "Northern Europe",
      hidden: true,
    });
    expect(option).toHaveAttribute("data-sprint-checked", "");
    expect(option).toHaveAttribute("aria-selected", "true");
  });

  it("replaces the hint with the error and marks the control invalid", () => {
    render(<Harness hint="Pick the nearest" error="Choose a region" />);
    expect(screen.queryByText("Pick the nearest")).not.toBeInTheDocument();
    expect(screen.getByText("Choose a region")).toHaveAttribute(
      "data-sprint-part",
      "error",
    );
    expect(root()).toHaveAttribute("data-sprint-invalid", "");
    expect(trigger()).toHaveAttribute("aria-invalid", "true");
    expect(trigger()).toHaveAccessibleDescription("Choose a region");
  });

  it("submits its value under a form name", () => {
    const { container } = render(<Harness name="region" value="eu-1" />);
    const field = container.querySelector<HTMLInputElement>('input[name="region"]');
    expect(field?.value).toBe("eu-1");
  });
});

describe("Select opening", () => {
  it("opens above the field when the room below is too short for the options", () => {
    render(<Harness />);
    vi.spyOn(trigger(), "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 20, y: window.innerHeight - 60, width: 200, height: 40 }),
    );
    Object.defineProperty(listbox(), "scrollHeight", {
      configurable: true,
      value: 200,
    });
    fireEvent.click(trigger());
    const layer = listbox().parentElement as HTMLElement;
    expect(layer.dataset.placement).toBe("above");
    expect(layer.style.getPropertyValue("--sprint-floating-bottom")).toBe(
      `${window.innerHeight - (window.innerHeight - 60)}px`,
    );
    expect(layer.style.getPropertyValue("--sprint-floating-top")).toBe("");
  });

  it("opens below the field when the options fit there", () => {
    render(<Harness />);
    vi.spyOn(trigger(), "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 20, y: 40, width: 200, height: 40 }),
    );
    Object.defineProperty(listbox(), "scrollHeight", {
      configurable: true,
      value: 200,
    });
    fireEvent.click(trigger());
    const layer = listbox().parentElement as HTMLElement;
    expect(layer.dataset.placement).toBe("below");
    expect(layer.style.getPropertyValue("--sprint-floating-top")).toBe("80px");
  });

  it("opens on a lone click event with no pointer events around it", () => {
    render(<Harness />);
    fireEvent.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(listbox()).not.toHaveAttribute("hidden");
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("opens on element.click()", () => {
    render(<Harness />);
    act(() => {
      trigger().click();
    });
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("opens on a full pointer sequence without toggling twice", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(trigger()).toHaveFocus();
  });

  it("chooses with the pointer and closes", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(trigger());
    await user.click(screen.getByRole("option", { name: "Northern Europe" }));
    expect(root()).toHaveAttribute("data-sprint-value", "eu-1");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveFocus();
  });

  it("closes on a second click", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(trigger());
    await user.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on a press outside", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Harness />
        <button type="button">elsewhere</button>
      </>,
    );
    await user.click(trigger());
    await user.click(screen.getByRole("button", { name: "elsewhere" }));
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("opens, moves, and chooses from the keyboard", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    trigger().focus();
    await user.keyboard("{ArrowDown}");
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    const first = screen.getByRole("option", { name: "North Atlantic" });
    expect(trigger()).toHaveAttribute("aria-activedescendant", first.id);
    await user.keyboard("{ArrowDown}");
    const second = screen.getByRole("option", { name: "Northern Europe" });
    expect(trigger()).toHaveAttribute("aria-activedescendant", second.id);
    expect(second).toHaveAttribute("data-sprint-active", "");
    await user.keyboard("{Enter}");
    expect(root()).toHaveAttribute("data-sprint-value", "eu-1");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Escape without choosing", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    trigger().focus();
    await user.keyboard("{Enter}");
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowDown}{Escape}");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(root()).toHaveAttribute("data-sprint-empty", "");
  });

  it("does not open while disabled", () => {
    render(<Harness disabled />);
    fireEvent.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Select counts", () => {
  const COUNTED = [
    { value: "read", label: "Read", count: 17 },
    { value: "write", label: "Write", count: 4 },
  ];

  it("names each option by its label and count", () => {
    render(<Harness options={COUNTED} />);
    fireEvent.click(trigger());
    expect(screen.getByRole("option", { name: "Read 17" })).toHaveAttribute(
      "data-sprint-count",
      "17",
    );
  });

  it("keeps the count out of the tool enum and in part state", async () => {
    render(<Harness options={COUNTED} />);
    const descriptor = mock.find("select-region")?.descriptor;
    expect(descriptor?.inputSchema.properties.option?.enum).toEqual(["Read", "Write"]);
    const result = await call("select-region", { option: "Write" });
    expect(root()).toHaveAttribute("data-sprint-value", "write");
    expect(result).toContain('part `option` "Write" [checked, count=4]');
  });

  it("projects the plain label, with the count as state", () => {
    const { container } = render(<Harness options={COUNTED} />);
    const [node] = serializeWithin(container);
    const options = node?.parts.filter((part) => part.part === "option");
    expect(options?.[0]?.label).toBe("Read");
    expect(options?.[0]?.state.count).toBe("17");
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
