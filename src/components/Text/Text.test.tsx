import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { Text } from "./Text.tsx";

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Text"));
  if (element === null) throw new Error("no Text root found");
  return element;
}

describe("Text rendering", () => {
  it("defaults to a paragraph at the default tone and size", () => {
    render(<Text>Two views, one definition.</Text>);
    expect(root().tagName).toBe("P");
    expect(root()).toHaveAttribute("data-sprint-tone", "default");
    expect(root()).toHaveAttribute("data-sprint-size", "normal");
  });

  it("reflects tone and size", () => {
    render(
      <Text tone="warning" size="small">
        Unavailable here.
      </Text>,
    );
    expect(root()).toHaveAttribute("data-sprint-tone", "warning");
    expect(root()).toHaveAttribute("data-sprint-size", "small");
  });

  it("renders the element it was asked for", () => {
    render(<Text as="span">Inline.</Text>);
    expect(root().tagName).toBe("SPAN");
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLParagraphElement>();
    render(
      <Text ref={ref} id="lede" data-testid="spread">
        Lede.
      </Text>,
    );
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "lede");
    expect(screen.getByTestId("spread")).toBe(root());
  });
});

describe("Text agent view", () => {
  it("renders its own words, with tone, and no element", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Text tone="muted">Tools survive the switch.</Text>
      </SprintProvider>,
    );

    expect(container.querySelector(agentSelector("Text"))).toBeNull();
    expect(container.textContent).toBe(
      '- **Text** "Tools survive the switch." [size=normal, tone=muted]\n',
    );
  });

  it("flattens inline markup the way the DOM projection does", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Text>
          Registered with <code>document.modelContext</code> when available.
        </Text>
      </SprintProvider>,
    );

    expect(container.textContent).toContain(
      '"Registered with document.modelContext when available."',
    );
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(
      <Text tone="muted" size="small">
        Registered with <code>document.modelContext</code> when available.
      </Text>,
    );

    const [node] = serializeWithin(container);
    expect(node?.label).toBe("Registered with document.modelContext when available.");
    expect(node?.state).toMatchObject({ tone: "muted", size: "small" });
  });

  it("skips content hidden from the accessibility tree", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Text>
          <span aria-hidden="true">▶ </span>Ready.
        </Text>
      </SprintProvider>,
    );

    expect(container.textContent).toContain('"Ready."');
  });
});
