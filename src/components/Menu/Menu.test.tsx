import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { Dialog } from "@/components/Dialog/index.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { Menu, type MenuItem, type MenuProps } from "./Menu.tsx";

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
  const element = document.querySelector<HTMLElement>(agentSelector("Menu"));
  if (element === null) throw new Error("no Menu root found");
  return element;
}

function trigger(name = "Card actions"): HTMLElement {
  return screen.getByRole("button", { name });
}

function menu(): HTMLElement {
  return screen.getByRole("menu", { hidden: true });
}

function item(name: string): HTMLElement {
  return screen.getByRole("menuitem", { name, hidden: true });
}

async function call(name: string, inputs: Record<string, unknown>) {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result as string | null;
}

function Actions(props: Partial<MenuProps> & { log?: string[] }) {
  const { log = [], ...rest } = props;
  const items: MenuItem[] = [
    { label: "Edit", onSelect: () => log.push("edit") },
    { label: "Duplicate", disabled: true, onSelect: () => log.push("duplicate") },
    { label: "Delete", tone: "danger", onSelect: () => log.push("delete") },
    { label: "Open in planner", href: "/planner" },
  ];
  return <Menu label="Card actions" items={items} {...rest} />;
}

function Picker() {
  const [planner, setPlanner] = useState("Lind");
  return (
    <Menu
      label="Planner"
      items={["Okafor", "Lind", "Amaral"].map((name) => ({
        label: name,
        checked: name === planner,
        onSelect: () => setPlanner(name),
      }))}
    />
  );
}

describe("Menu rendering", () => {
  it("is a trigger that controls a closed menu", () => {
    render(<Actions />);
    expect(trigger()).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(menu().parentElement).toHaveAttribute("hidden");
    expect(menu()).toHaveAccessibleName("Card actions");
  });

  it("keeps every item in the page while closed", () => {
    render(<Actions />);
    expect(document.querySelectorAll('[data-sprint-part="item"]')).toHaveLength(4);
    expect(item("Delete")).toHaveAttribute("data-sprint-tone", "danger");
    expect(item("Open in planner")).toHaveAttribute("href", "/planner");
    expect(item("Duplicate")).toBeDisabled();
  });

  it("gathers grouped items under a labelled group", () => {
    render(
      <Menu
        label="Account"
        items={[
          { label: "Profile", href: "/p", group: "Signed in as Nomad" },
          { label: "Sign out", onSelect: () => {} },
        ]}
      />,
    );
    expect(
      screen.getByRole("group", { name: "Signed in as Nomad", hidden: true }),
    ).toContainElement(item("Profile"));
    expect(item("Profile")).toHaveAttribute("data-sprint-group", "Signed in as Nomad");
  });

  it("draws an icon-only trigger with its label as the name and a tooltip", () => {
    render(<Actions icon={<svg />} hideLabel />);
    expect(trigger()).toBeInTheDocument();
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent(
      "Card actions",
    );
  });
});

describe("Menu interaction", () => {
  it("opens on click and focuses the first enabled item", () => {
    render(<Actions />);
    fireEvent.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(menu().parentElement).not.toHaveAttribute("hidden");
    expect(root()).toHaveAttribute("data-sprint-open", "");
    expect(item("Edit")).toHaveFocus();
  });

  it("moves with the arrow keys, skipping disabled items and wrapping", () => {
    render(<Actions />);
    fireEvent.keyDown(trigger(), { key: "ArrowDown" });
    expect(item("Edit")).toHaveFocus();
    fireEvent.keyDown(item("Edit"), { key: "ArrowDown" });
    expect(item("Delete")).toHaveFocus();
    fireEvent.keyDown(item("Delete"), { key: "ArrowDown" });
    expect(item("Open in planner")).toHaveFocus();
    fireEvent.keyDown(item("Open in planner"), { key: "ArrowDown" });
    expect(item("Edit")).toHaveFocus();
    fireEvent.keyDown(item("Edit"), { key: "End" });
    expect(item("Open in planner")).toHaveFocus();
    fireEvent.keyDown(item("Open in planner"), { key: "d" });
    expect(item("Delete")).toHaveFocus();
  });

  it("opens on the last item with the up arrow", () => {
    render(<Actions />);
    fireEvent.keyDown(trigger(), { key: "ArrowUp" });
    expect(item("Open in planner")).toHaveFocus();
  });

  it("runs an item, closes, and returns focus to the trigger", () => {
    const log: string[] = [];
    render(<Actions log={log} />);
    fireEvent.click(trigger());
    fireEvent.click(item("Delete"));
    expect(log).toEqual(["delete"]);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveFocus();
  });

  it("closes on Escape without letting a surrounding dialog close", () => {
    const onClose = vi.fn();
    render(
      <Dialog label="Speakers" open onClose={onClose}>
        <Actions />
      </Dialog>,
    );
    fireEvent.click(trigger());
    fireEvent.keyDown(item("Edit"), { key: "Escape" });
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveFocus();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes when the pointer goes down outside it", () => {
    render(
      <>
        <Actions />
        <p>Elsewhere</p>
      </>,
    );
    fireEvent.click(trigger());
    fireEvent.pointerDown(screen.getByText("Elsewhere"));
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("reports opening and closing", () => {
    const onOpenChange = vi.fn();
    render(<Actions onOpenChange={onOpenChange} />);
    fireEvent.click(trigger());
    fireEvent.click(trigger());
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it("marks radio choices and opens on the checked one", () => {
    render(<Picker />);
    const lind = screen.getByRole("menuitemradio", { name: "Lind", hidden: true });
    expect(lind).toHaveAttribute("aria-checked", "true");
    fireEvent.click(trigger("Planner"));
    expect(lind).toHaveFocus();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Amaral" }));
    expect(
      screen.getByRole("menuitemradio", { name: "Amaral", hidden: true }),
    ).toHaveAttribute("aria-checked", "true");
    expect(lind).toHaveAttribute("aria-checked", "false");
  });

  it("does not open while disabled", () => {
    render(<Actions disabled />);
    fireEvent.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Menu agent tool", () => {
  it("enumerates only enabled items that are not links", () => {
    render(<Actions />);
    const descriptor = mock.find("choose-card-actions")?.descriptor;
    expect(descriptor?.inputSchema.properties.item?.enum).toEqual(["Edit", "Delete"]);
  });

  it("runs an item without the menu being open", async () => {
    const log: string[] = [];
    render(<Actions log={log} />);
    const result = await call("choose-card-actions", { item: "Edit" });
    expect(log).toEqual(["edit"]);
    expect(result).toContain('Chosen. The menu is now:\n- **Menu** "Card actions"');
  });

  it("chooses a radio item and reports the new check", async () => {
    render(<Picker />);
    const result = await call("choose-planner", { item: "Okafor" });
    expect(result).toContain('part `item` "Okafor" [checked]');
  });

  it("registers nothing while disabled or when every item is a link", () => {
    const view = render(<Actions disabled />);
    expect(mock.names()).toEqual([]);
    view.rerender(<Menu label="Links" items={[{ label: "Home", href: "/" }]} />);
    expect(mock.names()).toEqual([]);
  });
});

describe("Menu agent view", () => {
  it("renders one control per item an agent can run, and text for the rest", () => {
    const log: string[] = [];
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Actions log={log} />
      </SprintProvider>,
    );
    expect(container.textContent).toContain(
      '- **Menu** "Card actions" → tool `choose-card-actions`',
    );
    expect(container.textContent).toContain('- part `item` "Duplicate" [disabled]');
    expect(container.textContent).toContain(
      '- part `item` "Open in planner" [href=/planner]',
    );
    expect(screen.queryByRole("button", { name: /Duplicate/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Open in planner/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /"Delete"/ }));
    expect(log).toEqual(["delete"]);
  });

  it("projects the same items from the human page", () => {
    const { container } = render(<Actions />);
    const [node] = serializeWithin(container);
    expect(node?.parts.map((part) => part.label)).toEqual([
      "Edit",
      "Duplicate",
      "Delete",
      "Open in planner",
    ]);
  });
});
