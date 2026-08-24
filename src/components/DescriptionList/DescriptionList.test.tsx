import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { DescriptionList } from "./DescriptionList.tsx";

const ITEMS = [
  { term: "Created", description: "2026-08-01" },
  { term: "Scopes", description: <code>read, write</code> },
];

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("DescriptionList"));
  if (element === null) throw new Error("no DescriptionList root found");
  return element;
}

describe("DescriptionList rendering", () => {
  it("renders a native dl with one pair per item", () => {
    render(<DescriptionList label="Key sk-prod" items={ITEMS} />);
    expect(root().tagName).toBe("DL");
    expect(root()).toHaveAttribute("aria-label", "Key sk-prod");
    expect(root()).toHaveAttribute("data-sprint-items", "2");

    const pairs = document.querySelectorAll(agentSelector("DescriptionList", "item"));
    expect(pairs).toHaveLength(2);
    expect(pairs[0]?.querySelector("dt")).toHaveTextContent("Created");
    expect(pairs[0]?.querySelector("dd")).toHaveTextContent("2026-08-01");
    expect(pairs[1]?.querySelector("dd")).toHaveTextContent("read, write");
  });

  it("keeps its frame and states its emptiness", () => {
    render(
      <DescriptionList label="Recovery codes" items={[]} emptyLabel="None generated" />,
    );
    expect(root()).toHaveAttribute("data-sprint-empty", "");
    expect(root()).toHaveTextContent("None generated");
    expect(document.querySelector(agentSelector("DescriptionList", "item"))).toBeNull();
  });
});

describe("DescriptionList agent view", () => {
  it("renders text lines flattening each pair", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <DescriptionList label="Key sk-prod" items={ITEMS} />
      </SprintProvider>,
    );
    expect(container.querySelector("[data-sprint-view] dl")).toBeNull();
    expect(container.textContent).toContain('**DescriptionList** "Key sk-prod"');
    expect(container.textContent).toContain("Created: 2026-08-01");
    expect(container.textContent).toContain("Scopes: read, write");
  });

  it("reads as empty with no items", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <DescriptionList label="Recovery codes" items={[]} />
      </SprintProvider>,
    );
    expect(container.textContent).toContain("[empty");
  });
});
