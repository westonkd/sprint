import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { Button } from "../Button/index.ts";
import { Tag } from "../Tag/index.ts";
import { Text } from "../Text/index.ts";
import { PageHeader } from "./PageHeader.tsx";

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("PageHeader"));
  if (element === null) throw new Error("no PageHeader root found");
  return element;
}

describe("PageHeader rendering", () => {
  it("renders its label as the page's h1", () => {
    render(<PageHeader label="Reports" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Reports" }),
    ).toBeInTheDocument();
  });

  it("renders tags on the title line", () => {
    render(<PageHeader label="Button" tags={<Tag tone="warning">experimental</Tag>} />);
    expect(root()).toHaveTextContent("experimental");
  });

  it("renders a page-level action", () => {
    render(
      <PageHeader
        label="Reports"
        actions={<Button agentTool={false}>Refresh</Button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
  });

  it("renders the lede after the title line", () => {
    render(
      <PageHeader label="Reports">
        <Text>Everything the quarter produced.</Text>
      </PageHeader>,
    );
    expect(root()).toHaveTextContent("Everything the quarter produced.");
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLElement>();
    render(<PageHeader ref={ref} label="Reports" id="head" data-testid="spread" />);
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "head");
    expect(screen.getByTestId("spread")).toBe(root());
  });
});

describe("PageHeader agent view", () => {
  it("renders one line and indents what it carries", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <PageHeader label="Reports" tags={<Tag>beta</Tag>}>
          <Text tone="muted">Everything the quarter produced.</Text>
        </PageHeader>
      </SprintProvider>,
    );

    expect(container.textContent).toBe(
      '- **PageHeader** "Reports"\n  - **Tag** "beta" [tone=neutral]\n  - **Text** "Everything the quarter produced." [size=normal, tone=muted]\n',
    );
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(
      <PageHeader label="Reports">
        <Text>Everything the quarter produced.</Text>
      </PageHeader>,
    );

    const [node] = serializeWithin(container);
    expect(node?.component).toBe("PageHeader");
    expect(node?.label).toBe("Reports");
  });
});
