import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { Link } from "../Link/index.ts";
import { NavGroup } from "../NavGroup/index.ts";
import { Nav } from "./Nav.tsx";

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Nav"));
  if (element === null) throw new Error("no Nav root found");
  return element;
}

describe("Nav rendering", () => {
  it("renders a navigation landmark named by its label", () => {
    render(
      <Nav label="Workbench">
        <Link href="#/Button">Button</Link>
      </Nav>,
    );
    expect(screen.getByRole("navigation", { name: "Workbench" })).toBe(root());
  });

  it("renders its links", () => {
    render(
      <Nav label="Workbench">
        <Link href="#/Button" active>
          Button
        </Link>
      </Nav>,
    );
    expect(screen.getByRole("link", { name: "Button" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Nav ref={ref} label="Workbench" id="nav" data-testid="spread">
        <Link href="#/">Home</Link>
      </Nav>,
    );
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "nav");
    expect(screen.getByTestId("spread")).toBe(root());
  });
});

describe("Nav agent view", () => {
  it("renders one line and indents what it contains", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Nav label="Docs">
          <NavGroup label="Components">
            <Link href="#/Button" active>
              Button
            </Link>
          </NavGroup>
        </Nav>
      </SprintProvider>,
    );

    expect(container.textContent).toBe(
      '- **Nav** "Docs"\n  - **NavGroup** "Components"\n    - **Link** "Button" [active, href=#/Button]\n',
    );
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(
      <Nav label="Docs">
        <Link href="#/Button">Button</Link>
      </Nav>,
    );

    const [node] = serializeWithin(container);
    expect(node?.component).toBe("Nav");
    expect(node?.label).toBe("Docs");
    expect(node?.children[0]?.label).toBe("Button");
  });
});
