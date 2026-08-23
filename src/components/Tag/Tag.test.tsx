import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { Tag } from "./Tag.tsx";

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Tag"));
  if (element === null) throw new Error("no Tag root found");
  return element;
}

describe("Tag rendering", () => {
  it("defaults to the neutral keyline", () => {
    render(<Tag>action</Tag>);
    expect(root()).toHaveAttribute("data-sprint-tone", "neutral");
    expect(root()).not.toHaveAttribute("data-sprint-filled");
  });

  it("reflects tone and fill", () => {
    render(
      <Tag tone="warning" filled>
        experimental
      </Tag>,
    );
    expect(root()).toHaveAttribute("data-sprint-tone", "warning");
    expect(root()).toHaveAttribute("data-sprint-filled", "");
  });

  it("stays inert, with no role and nothing to press", () => {
    render(<Tag>action</Tag>);
    expect(root()).not.toHaveAttribute("role");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Tag ref={ref} id="status" data-testid="spread">
        stable
      </Tag>,
    );
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "status");
    expect(screen.getByTestId("spread")).toBe(root());
  });
});

describe("Tag agent view", () => {
  it("renders one line carrying its tone, and no element", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Tag tone="info">read only</Tag>
      </SprintProvider>,
    );

    expect(container.querySelector(agentSelector("Tag"))).toBeNull();
    expect(container.textContent).toBe('- **Tag** "read only" [tone=info]\n');
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(
      <Tag tone="warning" filled>
        experimental
      </Tag>,
    );

    const [node] = serializeWithin(container);
    expect(node?.label).toBe("experimental");
    expect(node?.state).toMatchObject({ tone: "warning", filled: true });
  });
});
