import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { Breadcrumb, type BreadcrumbItem } from "./Breadcrumb.tsx";

function catalog(): BreadcrumbItem[] {
  return [
    {
      label: "action",
      children: [
        { href: "#/Button", label: "Button" },
        { href: "#/Switch", label: "Switch" },
      ],
    },
    {
      label: "display",
      children: [{ href: "#/Table", label: "Table", active: true }],
    },
  ];
}

const ITEMS = catalog();

const STORE: readonly BreadcrumbItem[] = [
  {
    label: "Clothing",
    href: "#/clothing",
    children: [
      {
        label: "Outerwear",
        href: "#/outerwear",
        children: [
          {
            label: "Jackets",
            href: "#/jackets",
            children: [
              { label: "Rain shell", href: "#/rain-shell", active: true },
              { label: "Parka", href: "#/parka" },
            ],
          },
          { label: "Vests", href: "#/vests" },
        ],
      },
    ],
  },
  { label: "Footwear", href: "#/footwear" },
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

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Breadcrumb"));
  if (element === null) throw new Error("no Breadcrumb root found");
  return element;
}

function destinations(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(agentSelector("Breadcrumb", "destination")),
  );
}

function shown(): (string | null)[] {
  return destinations()
    .filter((item) => item.hasAttribute("data-sprint-shown"))
    .map((item) => item.textContent);
}

function crumbs(): HTMLLIElement[] {
  return Array.from(root().querySelectorAll<HTMLLIElement>("ol > li"));
}

describe("Breadcrumb rendering", () => {
  it("renders a navigation landmark named by its label", () => {
    render(<Breadcrumb label="Workbench" items={ITEMS} />);
    expect(screen.getByRole("navigation", { name: "Workbench" })).toBe(root());
  });

  it("writes the path to the active item as crumbs", () => {
    render(<Breadcrumb label="Workbench" items={ITEMS} />);
    expect(root()).toHaveAttribute("data-sprint-path", "display / Table");
    expect(crumbs()[1]?.querySelector("span")?.textContent).toBe("display");
    expect(
      screen.getByRole("link", { name: "Table", current: "page" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Browse display" })).toBeInTheDocument();
  });

  it("keeps every destination in the tree in the page even when closed", () => {
    render(<Breadcrumb label="Store" items={STORE} />);
    expect(root()).toHaveAttribute("data-sprint-destinations", "7");
    expect(destinations()).toHaveLength(7);
    expect(root()).not.toHaveAttribute("data-sprint-open");
  });

  it("publishes each destination's parent and marks the path to the current page", () => {
    render(<Breadcrumb label="Store" items={STORE} />);
    const shell = destinations().find((item) => item.textContent === "Rain shell");
    const outerwear = destinations().find((item) => item.textContent === "Outerwear");
    expect(shell).toHaveAttribute(
      "data-sprint-parent",
      "Clothing / Outerwear / Jackets",
    );
    expect(shell).toHaveAttribute("data-sprint-active", "");
    expect(outerwear).toHaveAttribute("data-sprint-ancestor", "");
    expect(outerwear).not.toHaveAttribute("data-sprint-active");
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLElement>();
    render(<Breadcrumb ref={ref} label="Workbench" items={ITEMS} id="bar" />);
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "bar");
  });
});

describe("Breadcrumb crumbs", () => {
  it("opens a crumb's siblings and only them", async () => {
    const user = userEvent.setup();
    render(<Breadcrumb label="Store" items={STORE} />);

    await user.click(screen.getByRole("button", { name: "Browse Clothing" }));

    expect(root()).toHaveAttribute("data-sprint-open", "1");
    expect(shown()).toEqual(["Outerwear"]);
    expect(root()).toHaveAttribute("data-sprint-matches", "1");
  });

  it("opens the top level from the first crumb", async () => {
    const user = userEvent.setup();
    render(<Breadcrumb label="Store" items={STORE} />);

    await user.click(screen.getByRole("button", { name: "Browse Store" }));

    expect(shown()).toEqual(["Clothing", "Footwear"]);
  });

  it("drills into a branch and rewrites the crumbs to the level it browses", async () => {
    const user = userEvent.setup();
    render(<Breadcrumb label="Store" items={STORE} />);

    await user.click(screen.getByRole("button", { name: "Browse Clothing" }));
    await user.click(screen.getByRole("button", { name: "Inside Outerwear" }));

    expect(shown()).toEqual(["Jackets", "Vests"]);
    expect(root()).toHaveAttribute("data-sprint-open", "2");
    expect(root()).toHaveAttribute(
      "data-sprint-path",
      "Clothing / Outerwear / Jackets / Rain shell",
    );
  });

  it("drills into a branch that is only a level", async () => {
    const user = userEvent.setup();
    render(<Breadcrumb label="Workbench" items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: "Browse Workbench" }));
    await user.click(screen.getByRole("button", { name: "action" }));

    expect(shown()).toEqual(["Button", "Switch"]);
  });

  it("offers a trailing crumb into the children of a current page that has them", async () => {
    const user = userEvent.setup();
    const items: BreadcrumbItem[] = [
      {
        label: "Guides",
        href: "#/guides",
        active: true,
        children: [{ label: "Forms", href: "#/forms" }],
      },
    ];
    render(<Breadcrumb label="Docs" items={items} />);

    await user.click(screen.getByRole("button", { name: "Browse Guides" }));

    expect(shown()).toEqual(["Forms"]);
  });

  it("searches the whole tree, not only the open level", async () => {
    const user = userEvent.setup();
    render(<Breadcrumb label="Store" items={STORE} />);

    await user.click(screen.getByRole("button", { name: "Browse Clothing" }));
    await user.keyboard("parka");

    expect(shown()).toEqual(["Parka"]);
    expect(root()).toHaveAttribute("data-sprint-matches", "1");
  });

  it("matches on an ancestor's name as well as a destination's", async () => {
    const user = userEvent.setup();
    render(<Breadcrumb label="Workbench" items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: "Browse display" }));
    await user.keyboard("action");

    expect(shown()).toEqual(["Button", "Switch"]);
  });

  it("groups results under their full path and hides groups with no match", async () => {
    const user = userEvent.setup();
    render(<Breadcrumb label="Workbench" items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: "Browse display" }));
    await user.keyboard("sw");

    const rows = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-sprint="Breadcrumb"] > div + div > div',
      ),
    ).filter((row) => !row.hasAttribute("hidden"));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.textContent).toContain("Workbench / action");
  });

  it("says so when a filter matches nothing, without dropping the destinations", async () => {
    const user = userEvent.setup();
    render(<Breadcrumb label="Workbench" items={ITEMS} emptyLabel="Nothing there" />);

    await user.click(screen.getByRole("button", { name: "Browse display" }));
    await user.keyboard("zzz");

    expect(root()).toHaveAttribute("data-sprint-matches", "0");
    expect(screen.getByText("Nothing there")).toBeInTheDocument();
    expect(destinations()).toHaveLength(3);
  });
});

describe("Breadcrumb crumb links", () => {
  it("navigates from a crumb's text and records the visit", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Breadcrumb label="Store" items={STORE} onNavigate={onNavigate} />);

    await user.click(screen.getByRole("link", { name: "Outerwear" }));

    expect(onNavigate).toHaveBeenCalledWith(STORE[0]?.children?.[0]);
    expect(root()).toHaveAttribute("data-sprint-visited", "1");
    expect(root()).not.toHaveAttribute("data-sprint-open");
  });

  it("adds no parts for the crumbs, which repeat destinations already in the page", () => {
    render(<Breadcrumb label="Store" items={STORE} />);
    expect(destinations()).toHaveLength(7);
    expect(root().querySelectorAll("ol [data-sprint-part]")).toHaveLength(0);
  });
});

describe("Breadcrumb root and trail seeding", () => {
  it("makes the root a link when given an href, and publishes it", () => {
    render(<Breadcrumb label="People" href="#/people" items={ITEMS} />);
    expect(screen.getByRole("link", { name: "People" })).toHaveAttribute(
      "href",
      "#/people",
    );
    expect(root()).toHaveAttribute("data-sprint-href", "#/people");
  });

  it("leaves the root as text without an href", () => {
    render(<Breadcrumb label="Workbench" items={ITEMS} />);
    expect(screen.queryByRole("link", { name: "Workbench" })).toBeNull();
    expect(root()).not.toHaveAttribute("data-sprint-href");
  });

  it("seeds the trail from defaultVisited", async () => {
    const user = userEvent.setup();
    render(
      <Breadcrumb label="Workbench" items={ITEMS} defaultVisited={["#/Switch"]} />,
    );
    expect(root()).toHaveAttribute("data-sprint-visited", "1");

    await user.click(screen.getByRole("button", { name: "Visited, 1" }));

    expect(shown()).toEqual(["Switch"]);
  });

  it("follows a trail its owner keeps", () => {
    const { rerender } = render(
      <Breadcrumb label="Workbench" items={ITEMS} visited={["#/Button"]} />,
    );
    expect(root()).toHaveAttribute("data-sprint-visited", "1");
    rerender(
      <Breadcrumb label="Workbench" items={ITEMS} visited={["#/Button", "#/Table"]} />,
    );
    expect(root()).toHaveAttribute("data-sprint-visited", "2");
  });

  it("orders trail groups by recency without a style attribute", async () => {
    const user = userEvent.setup();
    render(
      <Breadcrumb
        label="Workbench"
        items={ITEMS}
        defaultVisited={["#/Table", "#/Button"]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Visited, 2" }));

    const ranked = Array.from(
      root().querySelectorAll<HTMLElement>("[data-sprint-recency]"),
    ).map((row) => [
      row.getAttribute("data-sprint-recency"),
      row.firstChild?.textContent,
    ]);
    expect(ranked).toEqual([
      ["1", "Workbench / action"],
      ["2", "Workbench / display"],
    ]);
    expect(root().querySelectorAll("[style]")).toHaveLength(0);
  });
});

describe("Breadcrumb folding", () => {
  it("folds the middle of a path longer than maxCrumbs", () => {
    render(<Breadcrumb label="Store" maxCrumbs={3} items={STORE} />);
    const hidden = crumbs()
      .filter((crumb) => crumb.hasAttribute("hidden"))
      .map((crumb) => crumb.textContent);
    expect(hidden).toEqual(["Outerwear", "Jackets"]);
  });

  it("unfolds the path from the ellipsis", async () => {
    const user = userEvent.setup();
    render(<Breadcrumb label="Store" maxCrumbs={3} items={STORE} />);

    await user.click(screen.getByRole("button", { name: "Show the whole path" }));

    expect(crumbs().filter((crumb) => crumb.hasAttribute("hidden"))).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Show the whole path" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("never folds the crumb that is open", () => {
    render(<Breadcrumb label="Store" maxCrumbs={3} items={STORE} open={1} />);
    expect(crumbs().filter((crumb) => crumb.hasAttribute("hidden"))).toHaveLength(0);
  });

  it("folds nothing when the path fits", () => {
    render(<Breadcrumb label="Store" items={STORE} />);
    expect(crumbs().filter((crumb) => crumb.hasAttribute("hidden"))).toHaveLength(0);
  });
});

describe("Breadcrumb trail", () => {
  it("counts a visit and reports it", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Breadcrumb label="Workbench" items={ITEMS} onNavigate={onNavigate} />);

    await user.click(screen.getByRole("button", { name: "Browse display" }));
    await user.click(screen.getByRole("link", { name: "Table" }));

    expect(onNavigate).toHaveBeenCalledWith(ITEMS[1]?.children?.[0]);
    expect(root()).toHaveAttribute("data-sprint-visited", "1");
  });

  it("remembers a visit across a re-render that rebuilds the tree", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Breadcrumb label="Workbench" items={catalog()} />);

    await user.click(screen.getByRole("button", { name: "Browse display" }));
    await user.click(screen.getByRole("link", { name: "Table" }));
    rerender(<Breadcrumb label="Workbench" items={catalog()} />);
    await user.click(screen.getByRole("button", { name: "Visited, 1" }));

    expect(root()).toHaveAttribute("data-sprint-open", "trail");
    expect(shown()).toEqual(["Table"]);
  });

  it("counts a destination once however often it is visited", async () => {
    const user = userEvent.setup();
    render(<Breadcrumb label="Workbench" items={ITEMS} />);

    for (const _ of [1, 2]) {
      await user.click(screen.getByRole("button", { name: "Browse display" }));
      await user.click(screen.getByRole("link", { name: "Table" }));
    }

    expect(root()).toHaveAttribute("data-sprint-visited", "1");
  });

  it("says nothing has been visited rather than reporting no match", async () => {
    const user = userEvent.setup();
    render(<Breadcrumb label="Workbench" items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: "Visited, 0" }));

    expect(screen.getByText("Nothing visited yet")).toBeInTheDocument();
  });
});

describe("Breadcrumb keyboard", () => {
  it("travels from the field into the results and back", async () => {
    const user = userEvent.setup();
    render(<Breadcrumb label="Workbench" items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: "Browse display" }));
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement?.textContent).toBe("Table");

    await user.keyboard("{ArrowUp}");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Search Workbench");
  });

  it("returns a typed character to the field when it lands in the results", async () => {
    const user = userEvent.setup();
    render(<Breadcrumb label="Workbench" items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: "Browse display" }));
    await user.keyboard("{ArrowDown}s");

    expect(document.activeElement?.getAttribute("aria-label")).toBe("Search Workbench");
    expect(shown()).toEqual(["Switch", "Table"]);
  });

  it("drills with Enter when the first result is a level", async () => {
    const user = userEvent.setup();
    render(<Breadcrumb label="Workbench" items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: "Browse Workbench" }));
    await user.keyboard("{Enter}");

    expect(shown()).toEqual(["Button", "Switch"]);
  });

  it("closes on escape and on a press outside itself", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Breadcrumb label="Workbench" items={ITEMS} />
        <button type="button">Elsewhere</button>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Browse display" }));
    await user.keyboard("{Escape}");
    expect(root()).not.toHaveAttribute("data-sprint-open");

    await user.click(screen.getByRole("button", { name: "Browse Workbench" }));
    expect(root()).toHaveAttribute("data-sprint-open", "0");
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(root()).not.toHaveAttribute("data-sprint-open");
  });

  it("recalls the trail when the field takes an arrow up, like a console", async () => {
    const user = userEvent.setup();
    render(<Breadcrumb label="Workbench" items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: "Browse display" }));
    await user.keyboard("{ArrowUp}");

    expect(root()).toHaveAttribute("data-sprint-open", "trail");
  });
});

describe("Breadcrumb control", () => {
  it("opens the crumb an owner asks for and reports what it wants", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Breadcrumb
        label="Workbench"
        items={ITEMS}
        open="closed"
        onOpenChange={onOpenChange}
      />,
    );
    expect(root()).not.toHaveAttribute("data-sprint-open");

    rerender(
      <Breadcrumb
        label="Workbench"
        items={ITEMS}
        open={0}
        onOpenChange={onOpenChange}
      />,
    );
    expect(root()).toHaveAttribute("data-sprint-open", "0");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Search Workbench");

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith("closed");
  });

  it("clamps a depth past the end of the path to the last crumb", () => {
    render(<Breadcrumb label="Workbench" items={ITEMS} open={9} />);
    expect(root()).toHaveAttribute("data-sprint-open", "1");
  });
});

describe("Breadcrumb actions", () => {
  it("renders link actions and pressable actions at the end of the bar", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Breadcrumb
        label="Docs"
        items={ITEMS}
        actions={[
          { label: "Copy link", onSelect },
          { label: "Source", href: "https://example.com", external: true },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Copy link" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    const source = screen.getByRole("link", { name: "Source" });
    expect(source).toHaveAttribute("data-sprint-part", "action");
    expect(source).toHaveAttribute("data-sprint-href", "https://example.com");
  });

  it("registers a tool enumerating only the actions without an href", () => {
    render(
      <Breadcrumb
        label="Docs"
        items={ITEMS}
        actions={[
          { label: "Copy link", onSelect: () => {} },
          { label: "Source", href: "https://example.com" },
        ]}
      />,
    );
    const tool = mock.find("act-docs");
    expect(tool).toBeDefined();
    expect(tool?.descriptor.inputSchema.properties.action).toMatchObject({
      enum: ["Copy link"],
    });
    expect(root()).toHaveAttribute("data-sprint-tool", "act-docs");
  });

  it("runs an action through the tool by driving its button", async () => {
    const onSelect = vi.fn();
    render(
      <Breadcrumb
        label="Docs"
        items={ITEMS}
        actions={[{ label: "Copy link", onSelect }]}
      />,
    );

    let result: string | null = null;
    await act(async () => {
      result = await mock.call("act-docs", { action: "Copy link" });
    });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(result).toContain("**Breadcrumb**");
  });

  it("names the actions it has when asked for one it does not", async () => {
    render(
      <Breadcrumb
        label="Docs"
        items={ITEMS}
        actions={[{ label: "Copy link", onSelect: () => {} }]}
      />,
    );
    const result = await mock.call("act-docs", { action: "Delete" });
    expect(result).toContain("Copy link");
  });

  it("registers no tool with only link actions, or when told not to", () => {
    const { rerender } = render(
      <Breadcrumb
        label="Docs"
        items={ITEMS}
        actions={[{ label: "Source", href: "#/x" }]}
      />,
    );
    expect(mock.names()).toEqual([]);

    rerender(
      <Breadcrumb
        label="Docs"
        items={ITEMS}
        agentTool={false}
        actions={[{ label: "Copy link", onSelect: () => {} }]}
      />,
    );
    expect(mock.names()).toEqual([]);
  });

  it("unregisters the tool when its last pressable action goes away", () => {
    const { rerender } = render(
      <Breadcrumb
        label="Docs"
        items={ITEMS}
        actions={[{ label: "Copy link", onSelect: () => {} }]}
      />,
    );
    expect(mock.names()).toEqual(["act-docs"]);

    rerender(<Breadcrumb label="Docs" items={ITEMS} />);
    expect(mock.names()).toEqual([]);
  });
});

describe("Breadcrumb agent surface", () => {
  it("leads with the path and carries every destination as a part", () => {
    render(
      <SprintProvider view="agent">
        <Breadcrumb label="Workbench" items={ITEMS} />
      </SprintProvider>,
    );
    const text = document.body.textContent ?? "";
    expect(text).toContain(
      '- **Breadcrumb** "Workbench" [destinations=3, path=display / Table',
    );
    expect(text).toContain('part `destination` "Button"');
    expect(text).toContain("parent=action");
    expect(text).toContain("href=#/Table");
  });

  it("renders one control per action and destination", () => {
    render(
      <SprintProvider view="agent">
        <Breadcrumb
          label="Workbench"
          items={ITEMS}
          actions={[{ label: "Copy link", onSelect: () => {} }]}
        />
      </SprintProvider>,
    );
    expect(document.querySelectorAll('[data-sprint-part="destination"]')).toHaveLength(
      3,
    );
    expect(document.querySelectorAll('[data-sprint-part="action"]')).toHaveLength(1);
  });

  it("runs an action from its agent control", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SprintProvider view="agent">
        <Breadcrumb
          label="Workbench"
          items={ITEMS}
          actions={[{ label: "Copy link", onSelect }]}
        />
      </SprintProvider>,
    );
    const control = document.querySelector<HTMLElement>('[data-sprint-part="action"]');
    if (control === null) throw new Error("no action control");
    await user.click(control);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(
      <Breadcrumb
        label="Store"
        items={STORE}
        actions={[{ label: "Copy link", onSelect: () => {} }]}
      />,
    );

    const [node] = serializeWithin(container);
    expect(node?.component).toBe("Breadcrumb");
    expect(node?.label).toBe("Store");
    expect(node?.parts.map((part) => part.label)).toEqual([
      "Copy link",
      "Clothing",
      "Footwear",
      "Outerwear",
      "Jackets",
      "Vests",
      "Rain shell",
      "Parka",
    ]);
    expect(node?.parts[6]?.state.parent).toBe("Clothing / Outerwear / Jackets");
  });
});
