import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { Link } from "./Link.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
});

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Link"));
  if (element === null) throw new Error("no Link root found");
  return element;
}

describe("Link rendering", () => {
  it("publishes its destination as state", () => {
    render(<Link href="#/Button">Button</Link>);
    expect(root()).toHaveAttribute("href", "#/Button");
    expect(root()).toHaveAttribute("data-sprint-href", "#/Button");
  });

  it("marks the current location for screen readers and agents alike", () => {
    render(
      <Link href="#/Button" active>
        Button
      </Link>,
    );
    expect(root()).toHaveAttribute("data-sprint-active", "");
    expect(root()).toHaveAttribute("aria-current", "page");
  });

  it("protects an external destination", () => {
    render(
      <Link href="https://example.test" external>
        Specification
      </Link>,
    );
    expect(root()).toHaveAttribute("data-sprint-external", "");
    expect(root()).toHaveAttribute("target", "_blank");
    expect(root()).toHaveAttribute("rel", "noreferrer noopener");
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Link ref={ref} href="#/Button" id="nav" data-testid="spread">
        Button
      </Link>,
    );
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "nav");
    expect(screen.getByTestId("spread")).toBe(root());
  });
});

describe("Link agent tool", () => {
  it("registers nothing by default, so a nav list costs no tools", () => {
    render(
      <>
        <Link href="#/Button">Button</Link>
        <Link href="#/Table">Table</Link>
      </>,
    );
    expect(mock.names()).toEqual([]);
    expect(root()).not.toHaveAttribute("data-sprint-tool");
  });

  it("registers an open tool when asked", () => {
    render(
      <Link href="#/checkout" agentTool>
        Go to checkout
      </Link>,
    );
    expect(mock.names()).toEqual(["open-go-to-checkout"]);
    expect(root()).toHaveAttribute("data-sprint-tool", "open-go-to-checkout");
  });
});

describe("Link agent view", () => {
  it("renders one anchor carrying its own line and its real href", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Link href="#/Button" active>
          Button
        </Link>
      </SprintProvider>,
    );

    const anchor = container.querySelector("a");
    expect(anchor).toHaveAttribute("href", "#/Button");
    expect(anchor?.textContent).toBe('- **Link** "Button" [active, href=#/Button]');
  });

  it("renders text only when the consumer wants zero markup", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false} agentControls="never">
        <Link href="#/Button">Button</Link>
      </SprintProvider>,
    );

    expect(container.querySelector("a")).toBeNull();
    expect(container.textContent).toBe('- **Link** "Button" [href=#/Button]\n');
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(
      <Link href="#/Button" active>
        Button
      </Link>,
    );

    const [node] = serializeWithin(container);
    expect(node?.label).toBe("Button");
    expect(node?.state).toMatchObject({ href: "#/Button", active: true });
  });
});
