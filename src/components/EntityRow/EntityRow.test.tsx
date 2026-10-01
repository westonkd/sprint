import { act, render, screen } from "@testing-library/react";
import type { MouseEvent } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { EntityRow } from "./EntityRow.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
});

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("EntityRow"));
  if (element === null) throw new Error("no EntityRow root found");
  return element;
}

const ada = {
  title: "Ada Lovelace",
  tags: [{ label: "admin", tone: "info" as const }, { label: "billing" }],
  meta: [{ term: "Last sign-in", detail: "3 days ago" }, "2 apps"],
};

describe("EntityRow rendering", () => {
  it("is a link when it has a destination", () => {
    render(<EntityRow {...ada} href="#/people/ada" />);
    expect(screen.getByRole("link", { name: "Ada Lovelace" })).toBe(root());
    expect(root()).toHaveAttribute("data-sprint-href", "#/people/ada");
  });

  it("is a button when it acts", () => {
    render(<EntityRow {...ada} onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "Ada Lovelace" })).toBe(root());
    expect(root()).not.toHaveAttribute("data-sprint-href");
  });

  it("is a labelled group when it does neither", () => {
    render(<EntityRow {...ada} />);
    expect(screen.getByRole("group", { name: "Ada Lovelace" })).toBe(root());
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("describes itself with its tags, meta, and description", () => {
    render(<EntityRow {...ada} href="#/people/ada" description="Founding engineer." />);
    expect(root()).toHaveAccessibleDescription(
      "admin billing Last sign-in: 3 days ago · 2 apps Founding engineer.",
    );
  });

  it("renders its tags as Tags", () => {
    render(<EntityRow {...ada} href="#/people/ada" />);
    const tags = root().querySelectorAll(agentSelector("Tag"));
    expect(Array.from(tags, (tag) => tag.textContent)).toEqual(["admin", "billing"]);
    expect(tags[0]).toHaveAttribute("data-sprint-tone", "info");
    expect(tags[1]).toHaveAttribute("data-sprint-tone", "neutral");
  });

  it("marks its title, meta, and description as parts", () => {
    render(<EntityRow {...ada} href="#/people/ada" description="Founding engineer." />);
    expect(
      document.querySelector(agentSelector("EntityRow", "title")),
    ).toHaveTextContent("Ada Lovelace");
    expect(
      document.querySelector(agentSelector("EntityRow", "meta")),
    ).toHaveTextContent("Last sign-in: 3 days ago · 2 apps");
    expect(
      document.querySelector(agentSelector("EntityRow", "description")),
    ).toHaveTextContent("Founding engineer.");
  });

  it("omits the parts it was not given", () => {
    render(<EntityRow title="Ada Lovelace" href="#/people/ada" />);
    expect(document.querySelector(agentSelector("EntityRow", "meta"))).toBeNull();
    expect(
      document.querySelector(agentSelector("EntityRow", "description")),
    ).toBeNull();
    expect(root().querySelector(agentSelector("Tag"))).toBeNull();
  });

  it("calls onSelect", () => {
    const onSelect = vi.fn();
    render(<EntityRow {...ada} onSelect={onSelect} />);
    screen.getByRole("button").click();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("lets a router intercept a navigating row", () => {
    const onSelect = vi.fn((event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
    });
    render(<EntityRow {...ada} href="#/people/ada" onSelect={onSelect} />);
    expect(screen.getByRole("link", { name: "Ada Lovelace" })).toBe(root());
    root().click();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]?.[0]?.defaultPrevented).toBe(true);
  });

  it("disables an acting row", () => {
    render(<EntityRow {...ada} onSelect={() => {}} disabled />);
    expect(root()).toBeDisabled();
    expect(root()).toHaveAttribute("data-sprint-disabled", "");
  });

  it("ignores disabled on a row that navigates", () => {
    render(<EntityRow {...ada} href="#/people/ada" disabled />);
    expect(root()).not.toHaveAttribute("data-sprint-disabled");
  });
});

describe("EntityRow agent tool", () => {
  it("registers nothing when it navigates", () => {
    render(<EntityRow {...ada} href="#/people/ada" />);
    expect(mock.names()).toEqual([]);
  });

  it("registers nothing when it does neither, even when asked", () => {
    render(<EntityRow {...ada} agentTool />);
    expect(mock.names()).toEqual([]);
  });

  it("registers an open tool when it acts", () => {
    render(<EntityRow {...ada} onSelect={() => {}} />);
    expect(mock.names()).toEqual(["open-ada-lovelace"]);
  });

  it("opens through the real control and reports the row back", async () => {
    const onSelect = vi.fn();
    render(<EntityRow {...ada} onSelect={onSelect} />);

    let result: string | null = null;
    await act(async () => {
      result = await mock.call("open-ada-lovelace");
    });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(result).toContain('**EntityRow** "Ada Lovelace"');
  });

  it("unregisters while disabled and again on unmount", () => {
    const { rerender, unmount } = render(<EntityRow {...ada} onSelect={() => {}} />);
    expect(mock.names()).toEqual(["open-ada-lovelace"]);

    rerender(<EntityRow {...ada} onSelect={() => {}} disabled />);
    expect(mock.names()).toEqual([]);

    rerender(<EntityRow {...ada} onSelect={() => {}} />);
    expect(mock.names()).toEqual(["open-ada-lovelace"]);

    unmount();
    expect(mock.names()).toEqual([]);
  });

  it("unregisters when it turns into a link", () => {
    const { rerender } = render(<EntityRow {...ada} onSelect={() => {}} />);
    rerender(<EntityRow {...ada} href="#/people/ada" onSelect={() => {}} />);
    expect(mock.names()).toEqual([]);
  });

  it("takes an agent name when two rows share a title", () => {
    render(<EntityRow {...ada} onSelect={() => {}} agentName="Ada in billing" />);
    expect(mock.names()).toEqual(["open-ada-in-billing"]);
  });
});

describe("EntityRow agent view", () => {
  it("renders a link control carrying its parts and tags", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <EntityRow {...ada} href="#/people/ada" />
      </SprintProvider>,
    );

    const anchor = container.querySelector("a[data-sprint-agent]");
    expect(anchor).toHaveAttribute("href", "#/people/ada");
    expect(anchor).toHaveTextContent(
      '- **EntityRow** "Ada Lovelace" [href=#/people/ada]',
    );
    expect(container.textContent).toContain(
      '- part `meta` "Last sign-in: 3 days ago · 2 apps"',
    );
    expect(container.textContent).toContain('- **Tag** "admin" [tone=info]');
    expect(container.textContent).toContain('- **Tag** "billing" [tone=neutral]');
    expect(container.querySelectorAll("[data-sprint-agent]")).toHaveLength(1);
  });

  it("renders a button control when it acts", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <EntityRow {...ada} onSelect={onSelect} />
      </SprintProvider>,
    );

    const button = container.querySelector<HTMLButtonElement>(
      "button[data-sprint-agent]",
    );
    expect(button).toHaveTextContent("→ tool `open-ada-lovelace`");
    button?.click();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("renders text alone when it does neither or is disabled", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <EntityRow {...ada} />
        <EntityRow title="Grace Hopper" onSelect={() => {}} disabled />
      </SprintProvider>,
    );

    expect(container.querySelectorAll("[data-sprint-agent]")).toHaveLength(0);
    expect(container.textContent).toContain('- **EntityRow** "Ada Lovelace"');
    expect(container.textContent).toContain(
      '- **EntityRow** "Grace Hopper" [disabled]',
    );
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(
      <EntityRow {...ada} href="#/people/ada" description="Founding engineer." />,
    );

    const [node] = serializeWithin(container);
    expect(node?.label).toBe("Ada Lovelace");
    expect(node?.state).toEqual({ href: "#/people/ada" });
    expect(node?.parts).toEqual([
      { part: "title", label: "Ada Lovelace", state: {} },
      { part: "meta", label: "Last sign-in: 3 days ago · 2 apps", state: {} },
      { part: "description", label: "Founding engineer.", state: {} },
    ]);
    expect(node?.children.map((child) => [child.label, child.state])).toEqual([
      ["admin", { tone: "info" }],
      ["billing", { tone: "neutral" }],
    ]);
  });
});
