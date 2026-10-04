import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import {
  Combobox,
  type ComboboxOption,
  type ComboboxProps,
  matchesQuery,
} from "./Combobox.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
});

const MEMBERS: ComboboxOption[] = [
  { value: "ada", label: "Ada Okafor", group: "Elders quorum" },
  { value: "ben", label: "Ben Lind", group: "Elders quorum" },
  { value: "chen", label: "Chen Amaral", group: "Relief Society", keywords: ["Mei"] },
  { value: "dina", label: "Dína Novak", group: "Relief Society", disabled: true },
  { value: "eli", label: "Eli Reyes", group: "Primary", description: "Moved in March" },
];

function Harness(props: Partial<ComboboxProps>) {
  const [value, setValue] = useState(props.value ?? "");
  return (
    <>
      <Combobox
        label="Member"
        options={MEMBERS}
        onChange={setValue}
        {...props}
        value={value}
      />
      <output>{value}</output>
    </>
  );
}

function field(): HTMLInputElement {
  return screen.getByRole("combobox", { name: "Member" }) as HTMLInputElement;
}

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Combobox"));
  if (element === null) throw new Error("no Combobox root found");
  return element;
}

function shown(): string[] {
  return screen.queryAllByRole("option").map((option) => option.textContent ?? "");
}

async function call(name: string, inputs: Record<string, unknown>) {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result as string | null;
}

describe("matchesQuery", () => {
  it("matches every word against label, description and keywords, ignoring accents", () => {
    expect(matchesQuery(MEMBERS[0] as ComboboxOption, "oka ada")).toBe(true);
    expect(matchesQuery(MEMBERS[2] as ComboboxOption, "mei")).toBe(true);
    expect(matchesQuery(MEMBERS[3] as ComboboxOption, "dina")).toBe(true);
    expect(matchesQuery(MEMBERS[4] as ComboboxOption, "march")).toBe(true);
    expect(matchesQuery(MEMBERS[0] as ComboboxOption, "lind")).toBe(false);
  });
});

describe("Combobox interaction", () => {
  it("is a labelled combobox that filters as you type", () => {
    render(<Harness />);
    fireEvent.change(field(), { target: { value: "am" } });
    expect(field()).toHaveAttribute("aria-expanded", "true");
    expect(shown()).toEqual(["Chen Amaral"]);
  });

  it("groups options under labelled headings", () => {
    render(<Harness />);
    fireEvent.click(field());
    expect(screen.getByRole("group", { name: "Relief Society" })).toBeInTheDocument();
  });

  it("moves with the arrows past disabled options and chooses with Enter", () => {
    render(<Harness />);
    fireEvent.keyDown(field(), { key: "ArrowDown" });
    expect(field().getAttribute("aria-activedescendant")).toBe(
      screen.getByRole("option", { name: "Ada Okafor" }).id,
    );
    fireEvent.keyDown(field(), { key: "ArrowDown" });
    fireEvent.keyDown(field(), { key: "ArrowDown" });
    fireEvent.keyDown(field(), { key: "ArrowDown" });
    expect(field().getAttribute("aria-activedescendant")).toBe(
      screen.getByRole("option", { name: "Eli Reyes Moved in March" }).id,
    );
    fireEvent.keyDown(field(), { key: "Enter" });
    expect(screen.getByRole("status")).toHaveTextContent("eli");
    expect(field()).toHaveValue("Eli Reyes");
    expect(field()).toHaveAttribute("aria-expanded", "false");
  });

  it("restores the chosen label on Escape", () => {
    render(<Harness value="ada" />);
    fireEvent.change(field(), { target: { value: "zz" } });
    expect(screen.getByText("No matches")).toBeInTheDocument();
    fireEvent.keyDown(field(), { key: "Escape" });
    expect(field()).toHaveValue("Ada Okafor");
  });

  it("chooses on click and clears with the clear control", () => {
    render(<Harness />);
    fireEvent.click(field());
    fireEvent.click(screen.getByRole("option", { name: "Ben Lind" }));
    expect(screen.getByRole("status")).toHaveTextContent("ben");
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("is not clearable when required", () => {
    render(<Harness value="ada" required />);
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("limits each group and says how many more there are", () => {
    render(<Harness groupLimit={1} />);
    fireEvent.click(field());
    expect(shown()).toEqual(["Ada Okafor", "Chen Amaral", "Eli ReyesMoved in March"]);
    expect(screen.getAllByText("1 more; keep typing to narrow")).toHaveLength(2);
  });

  it("trusts the options as given when filter is false and reports the query", () => {
    const onQueryChange = vi.fn();
    render(<Harness filter={false} onQueryChange={onQueryChange} />);
    fireEvent.change(field(), { target: { value: "zz" } });
    expect(onQueryChange).toHaveBeenLastCalledWith("zz");
    expect(shown()).toHaveLength(5);
  });

  it("draws options with renderOption while keeping the label as the name", () => {
    render(
      <Harness
        renderOption={(option) => (
          <b aria-hidden="true">{option.label.toUpperCase()}</b>
        )}
      />,
    );
    fireEvent.click(field());
    expect(screen.getByText("ADA OKAFOR")).toBeInTheDocument();
  });

  it("shows a spinner while loading", () => {
    render(<Harness loading />);
    expect(root()).toHaveAttribute("data-sprint-loading", "");
    expect(screen.getByText("Loading options")).toBeInTheDocument();
  });

  it("carries label, hint, error and a form name", () => {
    const { container } = render(
      <Harness name="member" hint="Anyone on the roster" error="Pick one" />,
    );
    expect(field()).toHaveAccessibleDescription("Pick one");
    expect(container.querySelector('input[name="member"]')).toHaveValue("");
  });
});

describe("Combobox agent tool", () => {
  it("chooses an exact label", async () => {
    render(<Harness />);
    const result = await call("choose-member", { option: "ben lind" });
    expect(screen.getByRole("status")).toHaveTextContent("ben");
    expect(result).toContain("value=Ben Lind");
  });

  it("chooses a unique search match and lists several", async () => {
    render(<Harness />);
    const several = await call("choose-member", { option: "a" });
    expect(several).toContain("matches 3 options");
    expect(several).toContain('- "Ada Okafor" (Elders quorum)');
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    await call("choose-member", { option: "reyes" });
    expect(screen.getByRole("status")).toHaveTextContent("eli");
  });

  it("clears with an empty string unless required", async () => {
    const view = render(<Harness value="ada" />);
    await call("choose-member", { option: "" });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    view.unmount();
    __resetToolNames();
    render(<Harness value="ada" required />);
    expect(await call("choose-member", { option: "" })).toContain("cannot be cleared");
  });

  it("never chooses a disabled option", async () => {
    render(<Harness />);
    expect(await call("choose-member", { option: "Dína Novak" })).toContain(
      "No option matches",
    );
  });
});

describe("Combobox agent view", () => {
  it("lists options as controls and caps a long list", () => {
    const many = Array.from({ length: 80 }, (_, index) => ({
      value: String(index),
      label: `Member ${index}`,
    }));
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness options={many} />
      </SprintProvider>,
    );
    expect(container.textContent).toContain("listed=50");
    expect(container.textContent).toContain("options=80");
    expect(
      container.querySelectorAll('button[data-sprint-part="option"]'),
    ).toHaveLength(50);
    fireEvent.click(screen.getByRole("button", { name: /"Member 3"/ }));
    expect(screen.getByRole("status")).toHaveTextContent("3");
  });
});
