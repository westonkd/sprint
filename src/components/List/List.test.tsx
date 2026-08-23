import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { List } from "./List.tsx";

const ITEMS = ["One tool, one action.", "Register contextually."];

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("List"));
  if (element === null) throw new Error("no List root found");
  return element;
}

describe("List rendering", () => {
  it("is a list named by its label", () => {
    render(<List label="Tool rules" items={ITEMS} />);
    expect(screen.getByRole("list", { name: "Tool rules" })).toBe(root());
    expect(root()).toHaveAttribute("role", "list");
    expect(within(root()).getAllByRole("listitem")).toHaveLength(2);
    expect(root()).toHaveAttribute("data-sprint-items", "2");
  });

  it("numbers an ordered list with a real ol", () => {
    render(<List label="Steps" items={ITEMS} ordered />);
    expect(root().tagName).toBe("OL");
    expect(root()).toHaveAttribute("data-sprint-ordered", "");
  });

  it("addresses every item by position", () => {
    render(<List label="Tool rules" items={ITEMS} />);
    const items = document.querySelectorAll(agentSelector("List", "item"));
    expect(
      Array.from(items).map((item) => item.getAttribute("data-sprint-index")),
    ).toEqual(["1", "2"]);
  });

  it("keeps mixed inline content in one container beside the marker", () => {
    render(
      <List
        label="Tool rules"
        items={[
          <>
            <strong>One tool, one action.</strong> Overlapping tools make selection
            harder.
          </>,
        ]}
      />,
    );
    const item = document.querySelector(agentSelector("List", "item"));
    expect(item?.children).toHaveLength(1);
    expect(item?.children[0]).toHaveTextContent(
      "One tool, one action. Overlapping tools make selection harder.",
    );
  });

  it("says it is empty rather than rendering nothing", () => {
    render(<List label="Tool rules" items={[]} emptyLabel="No rules yet" />);
    expect(root()).toHaveAttribute("data-sprint-empty", "");
    expect(root()).toHaveTextContent("No rules yet");
  });
});

describe("List agent view", () => {
  it("carries every item as a part, and renders no element", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <List label="Tool rules" items={ITEMS} />
      </SprintProvider>,
    );

    expect(container.querySelector(agentSelector("List"))).toBeNull();
    expect(container.textContent).toBe(
      [
        '- **List** "Tool rules" [items=2]',
        '  - part `item` "One tool, one action." [index=1]',
        '  - part `item` "Register contextually." [index=2]',
        "",
      ].join("\n"),
    );
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(
      <List
        label="Tool rules"
        items={[
          <>
            <strong>One tool, one action.</strong> Overlapping tools make selection
            harder.
          </>,
        ]}
      />,
    );

    const [node] = serializeWithin(container);
    expect(node?.parts).toEqual([
      {
        part: "item",
        label: "One tool, one action. Overlapping tools make selection harder.",
        state: { index: "1" },
      },
    ]);
  });
});
