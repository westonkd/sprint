import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { Heading } from "./Heading.tsx";

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Heading"));
  if (element === null) throw new Error("no Heading root found");
  return element;
}

describe("Heading rendering", () => {
  it("defaults to level two", () => {
    render(<Heading>Every variant</Heading>);
    expect(root().tagName).toBe("H2");
    expect(root()).toHaveAttribute("data-sprint-level", "2");
  });

  it("renders the element matching its level", () => {
    render(<Heading level={1}>Button</Heading>);
    expect(root().tagName).toBe("H1");
    expect(root()).toHaveAttribute("data-sprint-level", "1");
  });

  it("keeps the heading role so the outline survives", () => {
    render(<Heading level={3}>Primary action</Heading>);
    expect(screen.getByRole("heading", { level: 3 })).toBe(root());
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLHeadingElement>();
    render(
      <Heading ref={ref} id="title" data-testid="spread">
        Button
      </Heading>,
    );
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "title");
    expect(screen.getByTestId("spread")).toBe(root());
  });
});

describe("Heading agent view", () => {
  it("renders one line carrying its level, and no element", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Heading level={3}>Busy state</Heading>
      </SprintProvider>,
    );

    expect(container.querySelector(agentSelector("Heading"))).toBeNull();
    expect(container.textContent).toBe('- **Heading** "Busy state" [level=3]\n');
  });
});

describe("Heading levels and sizes", () => {
  it("renders levels five and six as real headings", () => {
    render(<Heading level={6}>Footnotes</Heading>);
    expect(screen.getByRole("heading", { level: 6, name: "Footnotes" })).toBe(root());
  });

  it("publishes a size only when it differs from the level", () => {
    const view = render(
      <Heading level={3} size={4}>
        Speakers
      </Heading>,
    );
    expect(root()).toHaveAttribute("data-sprint-size", "4");
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    view.rerender(
      <Heading level={3} size={3}>
        Speakers
      </Heading>,
    );
    expect(root()).not.toHaveAttribute("data-sprint-size");
  });
});
