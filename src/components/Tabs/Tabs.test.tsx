import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { type TabItem, Tabs } from "./Tabs.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
});

const TABS: TabItem[] = [
  { value: "upcoming", label: "Coming up", count: 4, panel: <p>Four talks ahead</p> },
  { value: "past", label: "Past", panel: <p>Thirty-one talks</p> },
  { value: "audit", label: "Audit", disabled: true, panel: <p>Audit log</p> },
  { value: "member", label: "By member", panel: <p>Pick a member</p> },
];

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Tabs"));
  if (element === null) throw new Error("no Tabs root found");
  return element;
}

async function call(name: string, inputs: Record<string, unknown>) {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result as string | null;
}

describe("Tabs rendering", () => {
  it("is a tablist whose selected tab labels the one mounted panel", () => {
    render(<Tabs label="Speakers" tabs={TABS} />);
    expect(screen.getByRole("tablist", { name: "Speakers" })).toBeInTheDocument();
    const first = screen.getByRole("tab", { name: "Coming up" });
    expect(first).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Coming up" })).toHaveTextContent(
      "Four talks ahead",
    );
    expect(screen.queryByText("Thirty-one talks")).toBeNull();
    expect(root()).toHaveAttribute("data-sprint-value", "Coming up");
  });

  it("switches on click and with the arrow keys, skipping disabled tabs", () => {
    render(<Tabs label="Speakers" tabs={TABS} />);
    fireEvent.click(screen.getByRole("tab", { name: "Past" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Thirty-one talks");
    fireEvent.keyDown(screen.getByRole("tab", { name: "Past" }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "By member" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Pick a member");
    fireEvent.keyDown(screen.getByRole("tab", { name: "By member" }), { key: "Home" });
    expect(screen.getByRole("tab", { name: "Coming up" })).toHaveFocus();
  });

  it("follows a controlled value and reports changes", () => {
    function Controlled() {
      const [value, setValue] = useState("past");
      return (
        <>
          <Tabs label="Speakers" tabs={TABS} value={value} onChange={setValue} />
          <output>{value}</output>
        </>
      );
    }
    render(<Controlled />);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Thirty-one talks");
    fireEvent.click(screen.getByRole("tab", { name: "By member" }));
    expect(screen.getByRole("status")).toHaveTextContent("member");
  });

  it("falls back to the first enabled tab for a disabled value", () => {
    render(<Tabs label="Speakers" tabs={TABS} defaultValue="audit" />);
    expect(screen.getByRole("tab", { name: "Coming up" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("puts actions beside the tablist", () => {
    render(
      <Tabs
        label="Speakers"
        tabs={TABS}
        actions={<button type="button">Add</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });
});

describe("Tabs agent tool and view", () => {
  it("enumerates enabled tabs and switches through the real tab", async () => {
    render(<Tabs label="Speakers" tabs={TABS} />);
    const descriptor = mock.find("select-speakers")?.descriptor;
    expect(descriptor?.inputSchema.properties.tab?.enum).toEqual([
      "Coming up",
      "Past",
      "By member",
    ]);
    const result = await call("select-speakers", { tab: "Past" });
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Thirty-one talks");
    expect(result).toContain('part `tab` "Past" [selected]');
  });

  it("renders a control per other enabled tab, then the panel", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Tabs label="Speakers" tabs={TABS} />
      </SprintProvider>,
    );
    expect(container.textContent).toContain(
      '- part `tab` "Coming up" [count=4, selected]',
    );
    expect(screen.queryByRole("button", { name: /Coming up/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Audit/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /"Past"/ }));
    expect(container.textContent).toContain("Thirty-one talks");
  });
});
