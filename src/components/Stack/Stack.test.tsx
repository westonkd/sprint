import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { Button } from "../Button/index.ts";
import { Stack } from "./Stack.tsx";

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Stack"));
  if (element === null) throw new Error("no Stack root found");
  return element;
}

describe("Stack rendering", () => {
  it("defaults to a column with normal spacing", () => {
    render(<Stack>content</Stack>);
    expect(root()).toHaveAttribute("data-sprint-direction", "column");
    expect(root()).toHaveAttribute("data-sprint-gap", "normal");
  });

  it("reflects direction, gap, wrap and collapse", () => {
    render(
      <Stack direction="row" gap="tight" wrap collapse>
        content
      </Stack>,
    );
    expect(root()).toHaveAttribute("data-sprint-direction", "row");
    expect(root()).toHaveAttribute("data-sprint-gap", "tight");
    expect(root()).toHaveAttribute("data-sprint-wrap", "");
    expect(root()).toHaveAttribute("data-sprint-collapse", "");
  });

  it("omits alignment attributes that were not asked for", () => {
    render(<Stack>content</Stack>);
    expect(root()).not.toHaveAttribute("data-sprint-align");
    expect(root()).not.toHaveAttribute("data-sprint-justify");
  });

  it("passes the grid track minimum through as a custom property", () => {
    render(
      <Stack direction="grid" min="16rem">
        content
      </Stack>,
    );
    expect(root().style.getPropertyValue("--sprint-stack-min")).toBe("16rem");
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Stack ref={ref} id="bar" data-testid="spread">
        content
      </Stack>,
    );
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "bar");
    expect(screen.getByTestId("spread")).toBe(root());
  });
});

describe("Stack agent view", () => {
  it("renders no element and no line, because layout is not meaning", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Stack direction="row">
          <Button>Prepare launch</Button>
        </Stack>
      </SprintProvider>,
    );

    expect(container.querySelector(agentSelector("Stack"))).toBeNull();
    expect(container.textContent).not.toContain("**Stack**");
    expect(container.textContent).toContain('**Button** "Prepare launch"');
  });

  it("does not indent what it contains", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Stack>
          <Button>Prepare launch</Button>
        </Stack>
      </SprintProvider>,
    );

    expect(container.textContent?.startsWith("- **Button**")).toBe(true);
  });
});
