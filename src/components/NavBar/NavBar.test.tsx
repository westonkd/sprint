import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { NavBar, type NavBarGroup } from "./NavBar.tsx";

const GROUPS: readonly NavBarGroup[] = [
  {
    label: "action",
    items: [
      { href: "#/Button", label: "Button" },
      { href: "#/Switch", label: "Switch" },
    ],
  },
  {
    label: "display",
    items: [{ href: "#/Table", label: "Table", active: true }],
  },
];

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("NavBar"));
  if (element === null) throw new Error("no NavBar root found");
  return element;
}

function destinations(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(agentSelector("NavBar", "destination")),
  );
}

describe("NavBar rendering", () => {
  it("renders a navigation landmark named by its label", () => {
    render(<NavBar label="Workbench" groups={GROUPS} />);
    expect(screen.getByRole("navigation", { name: "Workbench" })).toBe(root());
  });

  it("keeps every destination in the page even when the bar is closed", () => {
    render(<NavBar label="Workbench" groups={GROUPS} />);
    expect(root()).toHaveAttribute("data-sprint-destinations", "3");
    expect(destinations()).toHaveLength(3);
    expect(root()).not.toHaveAttribute("data-sprint-open");
  });

  it("publishes each destination's group and href", () => {
    render(<NavBar label="Workbench" groups={GROUPS} />);
    const [first] = destinations();
    expect(first).toHaveAttribute("data-sprint-group", "action");
    expect(first).toHaveAttribute("data-sprint-href", "#/Button");
  });

  it("marks the current destination for assistive technology", () => {
    render(<NavBar label="Workbench" groups={GROUPS} />);
    const table = destinations().find((item) => item.textContent === "Table");
    expect(table).toHaveAttribute("aria-current", "page");
    expect(table).toHaveAttribute("data-sprint-active", "");
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLElement>();
    render(<NavBar ref={ref} label="Workbench" groups={GROUPS} id="bar" />);
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "bar");
  });
});

describe("NavBar coordinate", () => {
  it("opens the level a segment names and shows only that level", async () => {
    const user = userEvent.setup();
    render(<NavBar label="Workbench" groups={GROUPS} />);

    await user.click(screen.getByRole("button", { name: "Table" }));

    expect(root()).toHaveAttribute("data-sprint-open", "leaf");
    expect(root()).toHaveAttribute("data-sprint-matches", "1");
    const shown = destinations().filter((item) =>
      item.hasAttribute("data-sprint-shown"),
    );
    expect(shown.map((item) => item.textContent)).toEqual(["Table"]);
  });

  it("searches every destination below the coordinate, not only the open level", async () => {
    const user = userEvent.setup();
    render(<NavBar label="Workbench" groups={GROUPS} />);

    await user.click(screen.getByRole("button", { name: "Table" }));
    await user.keyboard("sw");

    const shown = destinations().filter((item) =>
      item.hasAttribute("data-sprint-shown"),
    );
    expect(shown.map((item) => item.textContent)).toEqual(["Switch"]);
    expect(root()).toHaveAttribute("data-sprint-matches", "1");
  });

  it("matches on a group name as well as a destination name", async () => {
    const user = userEvent.setup();
    render(<NavBar label="Workbench" groups={GROUPS} />);

    await user.click(screen.getByRole("button", { name: "Table" }));
    await user.keyboard("action");

    const shown = destinations().filter((item) =>
      item.hasAttribute("data-sprint-shown"),
    );
    expect(shown.map((item) => item.textContent)).toEqual(["Button", "Switch"]);
  });

  it("groups results into rows carrying the full path, and hides rows with no match", async () => {
    const user = userEvent.setup();
    render(<NavBar label="Workbench" groups={GROUPS} />);

    await user.click(screen.getByRole("button", { name: "Table" }));
    await user.keyboard("sw");

    expect(screen.getByText("Workbench / action")).toBeInTheDocument();
    const rows = Array.from(
      document.querySelectorAll<HTMLElement>('[data-sprint="NavBar"] > div > div'),
    );
    const visible = rows.filter((row) => !row.hasAttribute("hidden"));
    expect(visible).toHaveLength(1);
    expect(visible[0]?.textContent).toContain("Workbench / action");
  });

  it("says so when a filter matches nothing, without dropping the destinations", async () => {
    const user = userEvent.setup();
    render(<NavBar label="Workbench" groups={GROUPS} emptyLabel="Nothing there" />);

    await user.click(screen.getByRole("button", { name: "Table" }));
    await user.keyboard("zzz");

    expect(root()).toHaveAttribute("data-sprint-matches", "0");
    expect(screen.getByText("Nothing there")).toBeInTheDocument();
    expect(destinations()).toHaveLength(3);
  });

  it("counts a visit and reports it as depth", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<NavBar label="Workbench" groups={GROUPS} onNavigate={onNavigate} />);

    await user.click(screen.getByRole("button", { name: "Table" }));
    await user.click(screen.getByRole("link", { name: "Table" }));

    expect(onNavigate).toHaveBeenCalledWith(GROUPS[1]?.items[0]);
    expect(root()).toHaveAttribute("data-sprint-depth", "1");
  });
});

function freshGroups(): NavBarGroup[] {
  return [
    {
      label: "action",
      items: [
        { href: "#/Button", label: "Button" },
        { href: "#/Switch", label: "Switch" },
      ],
    },
    { label: "display", items: [{ href: "#/Table", label: "Table", active: true }] },
  ];
}

describe("NavBar trail", () => {
  it("remembers a visit across a re-render that rebuilds the destinations", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<NavBar label="Workbench" groups={freshGroups()} />);

    await user.click(screen.getByRole("button", { name: "Table" }));
    await user.click(screen.getByRole("link", { name: "Table" }));

    rerender(<NavBar label="Workbench" groups={freshGroups()} />);

    await user.click(screen.getByRole("button", { name: "Visited, 1" }));

    expect(root()).toHaveAttribute("data-sprint-matches", "1");
    const shown = destinations().filter((item) =>
      item.hasAttribute("data-sprint-shown"),
    );
    expect(shown.map((item) => item.textContent)).toEqual(["Table"]);
  });

  it("counts a destination once however often it is visited", async () => {
    const user = userEvent.setup();
    render(<NavBar label="Workbench" groups={GROUPS} />);

    await user.click(screen.getByRole("button", { name: "Table" }));
    await user.click(screen.getByRole("link", { name: "Table" }));
    await user.click(screen.getByRole("button", { name: "Table" }));
    await user.click(screen.getByRole("link", { name: "Table" }));

    expect(root()).toHaveAttribute("data-sprint-depth", "1");
  });

  it("keeps saying nothing is visited only while the trail is empty", async () => {
    const user = userEvent.setup();
    render(<NavBar label="Workbench" groups={GROUPS} />);

    await user.click(screen.getByRole("button", { name: "Table" }));
    await user.click(screen.getByRole("link", { name: "Table" }));
    await user.click(screen.getByRole("button", { name: "Visited, 1" }));
    await user.keyboard("zzz");

    expect(screen.getByText("No match")).toBeInTheDocument();
  });
});

describe("NavBar keyboard", () => {
  it("travels from the field into the results and back", async () => {
    const user = userEvent.setup();
    render(<NavBar label="Workbench" groups={GROUPS} />);

    await user.click(screen.getByRole("button", { name: "Table" }));
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement?.textContent).toBe("Table");

    await user.keyboard("{ArrowUp}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Search Workbench");
  });

  it("returns a typed character to the field when it lands in the results", async () => {
    const user = userEvent.setup();
    render(<NavBar label="Workbench" groups={GROUPS} />);

    await user.click(screen.getByRole("button", { name: "Table" }));
    await user.keyboard("{ArrowDown}");
    await user.keyboard("s");

    expect(document.activeElement?.getAttribute("aria-label")).toBe("Search Workbench");
    expect(root()).toHaveAttribute("data-sprint-open", "leaf");
  });

  it("closes on escape and on a press outside itself", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <NavBar label="Workbench" groups={GROUPS} />
        <button type="button">Elsewhere</button>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Table" }));
    await user.keyboard("{Escape}");
    expect(root()).not.toHaveAttribute("data-sprint-open");

    await user.click(screen.getByRole("button", { name: "display" }));
    expect(root()).toHaveAttribute("data-sprint-open", "group");
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(root()).not.toHaveAttribute("data-sprint-open");
  });

  it("says nothing has been visited rather than reporting no match", async () => {
    const user = userEvent.setup();
    render(<NavBar label="Workbench" groups={GROUPS} />);

    await user.click(screen.getByRole("button", { name: "Visited, 0" }));

    expect(screen.getByText("Nothing visited yet")).toBeInTheDocument();
  });
});

describe("NavBar control", () => {
  it("recalls the trail when the field takes an arrow up, like a console", async () => {
    const user = userEvent.setup();
    render(<NavBar label="Workbench" groups={GROUPS} />);

    await user.click(screen.getByRole("button", { name: "Table" }));
    expect(root()).toHaveAttribute("data-sprint-open", "leaf");

    await user.keyboard("{ArrowUp}");

    expect(root()).toHaveAttribute("data-sprint-open", "trail");
  });

  it("opens the segment an owner asks for and reports what it wants", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <NavBar
        label="Workbench"
        groups={GROUPS}
        open="closed"
        onOpenChange={onOpenChange}
      />,
    );
    expect(root()).not.toHaveAttribute("data-sprint-open");

    rerender(
      <NavBar
        label="Workbench"
        groups={GROUPS}
        open="leaf"
        onOpenChange={onOpenChange}
      />,
    );
    expect(root()).toHaveAttribute("data-sprint-open", "leaf");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Search Workbench");

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith("closed");
  });
});

describe("NavBar agent surface", () => {
  it("carries every destination as a part, whatever the coordinate shows", () => {
    render(
      <SprintProvider view="agent">
        <NavBar label="Workbench" groups={GROUPS} />
      </SprintProvider>,
    );
    const text = document.body.textContent ?? "";
    expect(text).toContain('- **NavBar** "Workbench"');
    expect(text).toContain('part `destination` "Button"');
    expect(text).toContain("group=action");
    expect(text).toContain("href=#/Table");
  });

  it("renders one control per destination", () => {
    render(
      <SprintProvider view="agent">
        <NavBar label="Workbench" groups={GROUPS} />
      </SprintProvider>,
    );
    const controls = document.querySelectorAll('[data-sprint-part="destination"]');
    expect(controls).toHaveLength(3);
    expect(controls[0]?.tagName).toBe("BUTTON");
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(<NavBar label="Workbench" groups={GROUPS} />);

    const [node] = serializeWithin(container);
    expect(node?.component).toBe("NavBar");
    expect(node?.label).toBe("Workbench");
    expect(node?.parts.map((part) => part.label)).toEqual([
      "Button",
      "Switch",
      "Table",
    ]);
    expect(node?.parts[2]?.state.group).toBe("display");
  });
});
