import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { Divider } from "./Divider.tsx";

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Divider"));
  if (element === null) throw new Error("no Divider root found");
  return element;
}

describe("Divider rendering", () => {
  it("renders a horizontal separator", () => {
    render(<Divider />);
    expect(root()).toContainElement(screen.getByRole("separator"));
  });

  it("is a hairline unless told otherwise", () => {
    render(<Divider />);
    expect(root()).toHaveAttribute("data-sprint-weight", "hairline");
  });

  it("publishes its weight", () => {
    render(<Divider weight="band" />);
    expect(root()).toHaveAttribute("data-sprint-weight", "band");
  });

  it("names the segment it opens before the rule", () => {
    render(<Divider label="Results" />);
    expect(root().textContent).toBe("Results");
    expect(root().firstElementChild?.tagName).toBe("SPAN");
    expect(root().lastElementChild?.tagName).toBe("HR");
  });

  it("draws no label text when it has none", () => {
    render(<Divider />);
    expect(root().textContent).toBe("");
    expect(root().children).toHaveLength(1);
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Divider ref={ref} id="break" />);
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "break");
  });
});

describe("Divider agent surface", () => {
  it("renders nothing at all when it has no label", () => {
    const { container } = render(
      <SprintProvider view="agent">
        <Divider />
      </SprintProvider>,
    );
    expect(container.textContent).toBe("");
    expect(container.querySelector(agentSelector("Divider"))).toBeNull();
  });

  it("renders one line when it names a segment", () => {
    render(
      <SprintProvider view="agent">
        <Divider label="Results" weight="band" />
      </SprintProvider>,
    );
    expect(document.body.textContent).toContain(
      '- **Divider** "Results" [weight=band]',
    );
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(<Divider label="Results" weight="heavy" />);
    const [node] = serializeWithin(container);
    expect(node?.component).toBe("Divider");
    expect(node?.label).toBe("Results");
    expect(node?.state.weight).toBe("heavy");
  });
});
