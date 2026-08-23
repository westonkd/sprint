import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { Link } from "../Link/index.ts";
import { Nav } from "../Nav/index.ts";
import { Text } from "../Text/index.ts";
import { Shell } from "./Shell.tsx";

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Shell"));
  if (element === null) throw new Error("no Shell root found");
  return element;
}

function renderShell() {
  return render(
    <Shell
      bar={<Link href="#/">ACME</Link>}
      side={
        <Nav label="Main">
          <Link href="#/reports" active>
            Reports
          </Link>
        </Nav>
      }
    >
      <Text>Quarterly numbers land here.</Text>
    </Shell>,
  );
}

describe("Shell rendering", () => {
  it("renders the page content inside the main landmark", () => {
    renderShell();
    expect(screen.getByRole("main")).toHaveTextContent("Quarterly numbers land here.");
  });

  it("renders the sidebar as a named complementary landmark", () => {
    renderShell();
    const aside = screen.getByRole("complementary", { name: "Sidebar" });
    expect(aside).toContainElement(screen.getByRole("navigation", { name: "Main" }));
  });

  it("names the sidebar from sideLabel", () => {
    render(
      <Shell
        sideLabel="Workbench sidebar"
        side={
          <Nav label="Main">
            <Link href="#/">Home</Link>
          </Nav>
        }
      >
        body
      </Shell>,
    );
    expect(
      screen.getByRole("complementary", { name: "Workbench sidebar" }),
    ).toBeInTheDocument();
  });

  it("opens and closes the drawer from the menu button", () => {
    renderShell();
    const toggle = screen.getByRole("button", { name: "Menu" });
    expect(root()).not.toHaveAttribute("data-sprint-open");
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(root()).toHaveAttribute("data-sprint-open", "");
    expect(screen.getByRole("button", { name: "Close" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("closes the drawer when a link inside it is followed", () => {
    renderShell();
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    expect(root()).toHaveAttribute("data-sprint-open", "");

    fireEvent.click(screen.getByRole("link", { name: "Reports" }));
    expect(root()).not.toHaveAttribute("data-sprint-open");
  });

  it("moves focus to main from the skip control", () => {
    renderShell();
    fireEvent.click(screen.getByRole("button", { name: "Skip to content" }));
    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Shell ref={ref} id="shell" data-testid="spread">
        body
      </Shell>,
    );
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "shell");
    expect(screen.getByTestId("spread")).toBe(root());
  });
});

describe("Shell agent view", () => {
  it("renders no frame, only its regions in reading order", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Shell
          side={
            <Nav label="Main">
              <Link href="#/reports">Reports</Link>
            </Nav>
          }
        >
          <Text>Quarterly numbers land here.</Text>
        </Shell>
      </SprintProvider>,
    );

    expect(screen.queryByRole("main")).toBeNull();
    expect(screen.queryByRole("complementary")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.textContent).toBe(
      '- **Nav** "Main"\n  - **Link** "Reports" [href=#/reports]\n- **Text** "Quarterly numbers land here." [size=normal, tone=default]\n',
    );
  });
});
