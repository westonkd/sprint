import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { Link } from "../Link/index.ts";
import { NavGroup } from "./NavGroup.tsx";

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("NavGroup"));
  if (element === null) throw new Error("no NavGroup root found");
  return element;
}

describe("NavGroup rendering", () => {
  it("renders a group named by its label", () => {
    render(
      <NavGroup label="Guides">
        <Link href="#/guide/webmcp">WebMCP</Link>
      </NavGroup>,
    );
    expect(screen.getByRole("group", { name: "Guides" })).toBe(root());
    expect(root()).toHaveTextContent("Guides");
  });

  it("renders its links after the rubric", () => {
    render(
      <NavGroup label="Guides">
        <Link href="#/guide/webmcp">WebMCP</Link>
      </NavGroup>,
    );
    expect(screen.getByRole("link", { name: "WebMCP" })).toBeInTheDocument();
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <NavGroup ref={ref} label="Guides" id="guides" data-testid="spread">
        <Link href="#/">Home</Link>
      </NavGroup>,
    );
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "guides");
    expect(screen.getByTestId("spread")).toBe(root());
  });
});

describe("NavGroup agent view", () => {
  it("renders one line and indents its links", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <NavGroup label="Reference">
          <Link href="https://example.com" external>
            Spec
          </Link>
        </NavGroup>
      </SprintProvider>,
    );

    expect(container.textContent).toBe(
      '- **NavGroup** "Reference"\n  - **Link** "Spec" [external, href=https://example.com]\n',
    );
  });
});
