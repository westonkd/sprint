import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { EmptyState } from "./EmptyState.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
});

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("EmptyState"));
  if (element === null) throw new Error("no EmptyState root found");
  return element;
}

describe("EmptyState rendering", () => {
  it("is a group named by its headline and described by its sentence", () => {
    render(
      <EmptyState
        label="No one matches these filters"
        description="Try a different role or clear the search."
      />,
    );
    expect(screen.getByRole("group", { name: "No one matches these filters" })).toBe(
      root(),
    );
    expect(root()).toHaveAccessibleDescription(
      "Try a different role or clear the search.",
    );
  });

  it("says it is empty and why", () => {
    render(<EmptyState label="No notifications" />);
    expect(root()).toHaveAttribute("data-sprint-empty", "");
    expect(root()).toHaveAttribute("data-sprint-reason", "empty");
  });

  it("reflects a filtered reason", () => {
    render(<EmptyState label="No one matches" reason="filtered" />);
    expect(root()).toHaveAttribute("data-sprint-reason", "filtered");
  });

  it("renders no control without an action", () => {
    render(<EmptyState label="No notifications" />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders an acting action as a Button", () => {
    const onSelect = vi.fn();
    render(
      <EmptyState
        label="No one matches"
        action={{ label: "Clear filters", onSelect }}
      />,
    );
    const button = screen.getByRole("button", { name: "Clear filters" });
    expect(button).toHaveAttribute("data-sprint", "Button");
    button.click();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("renders a navigating action as a Link", () => {
    render(
      <EmptyState
        label="No projects yet"
        action={{ label: "Create a project", href: "#/projects/new" }}
      />,
    );
    const link = screen.getByRole("link", { name: "Create a project" });
    expect(link).toHaveAttribute("data-sprint", "Link");
    expect(link).toHaveAttribute("href", "#/projects/new");
  });
});

describe("EmptyState agent tool", () => {
  it("registers nothing of its own", () => {
    render(<EmptyState label="No notifications" />);
    expect(mock.names()).toEqual([]);
  });

  it("lets its Button register the press tool, and presses through it", async () => {
    const onSelect = vi.fn();
    const { unmount } = render(
      <EmptyState
        label="No one matches"
        action={{ label: "Clear filters", onSelect }}
      />,
    );
    expect(mock.names()).toEqual(["press-clear-filters"]);

    await act(async () => {
      await mock.call("press-clear-filters");
    });
    expect(onSelect).toHaveBeenCalledTimes(1);

    unmount();
    expect(mock.names()).toEqual([]);
  });

  it("registers nothing for a navigating action", () => {
    render(
      <EmptyState
        label="No projects yet"
        action={{ label: "Create a project", href: "#/projects/new" }}
      />,
    );
    expect(mock.names()).toEqual([]);
  });
});

describe("EmptyState agent view", () => {
  it("renders its line, its description, and exactly one control for its action", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <EmptyState
          reason="filtered"
          label="No one matches these filters"
          description="Try a different role or clear the search."
          action={{ label: "Clear filters", onSelect }}
        />
      </SprintProvider>,
    );

    expect(container.textContent).toContain(
      '- **EmptyState** "No one matches these filters" [empty, reason=filtered]',
    );
    expect(container.textContent).toContain(
      '  - part `description` "Try a different role or clear the search."',
    );

    const controls = container.querySelectorAll("[data-sprint-agent]");
    expect(controls).toHaveLength(1);
    expect(controls[0]).toHaveTextContent('**Button** "Clear filters"');
    (controls[0] as HTMLElement).click();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("renders text alone without an action", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <EmptyState label="No notifications" />
      </SprintProvider>,
    );
    expect(container.querySelectorAll("[data-sprint-agent]")).toHaveLength(0);
    expect(container.textContent).toContain(
      '- **EmptyState** "No notifications" [empty, reason=empty]',
    );
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(
      <EmptyState
        reason="filtered"
        label="No one matches these filters"
        description="Try a different role or clear the search."
        action={{ label: "Clear filters", onSelect: () => {} }}
      />,
    );

    const [node] = serializeWithin(container);
    expect(node?.label).toBe("No one matches these filters");
    expect(node?.state).toEqual({ empty: true, reason: "filtered" });
    expect(node?.parts).toEqual([
      {
        part: "description",
        label: "Try a different role or clear the search.",
        state: {},
      },
    ]);
    expect(node?.children.map((child) => [child.component, child.label])).toEqual([
      ["Button", "Clear filters"],
    ]);
  });
});
