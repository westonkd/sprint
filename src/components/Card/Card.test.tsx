import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { Card } from "./Card.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
});

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Card"));
  if (element === null) throw new Error("no Card root found");
  return element;
}

describe("Card rendering", () => {
  it("is a link when it has a destination", () => {
    render(
      <Card label="Button" href="#/Button">
        A single action.
      </Card>,
    );
    expect(screen.getByRole("link", { name: "Button" })).toBe(root());
    expect(root()).toHaveAttribute("data-sprint-href", "#/Button");
  });

  it("is a button when it acts", () => {
    render(<Card label="Start from blank" onClick={() => {}} />);
    expect(screen.getByRole("button", { name: "Start from blank" })).toBe(root());
    expect(root()).not.toHaveAttribute("data-sprint-href");
  });

  it("marks its title and body as parts", () => {
    render(
      <Card label="Button" href="#/Button">
        A single action.
      </Card>,
    );
    expect(document.querySelector(agentSelector("Card", "title"))).toHaveTextContent(
      "Button",
    );
    expect(document.querySelector(agentSelector("Card", "body"))).toHaveTextContent(
      "A single action.",
    );
  });

  it("calls onClick", () => {
    const onClick = vi.fn();
    render(<Card label="Start from blank" onClick={onClick} />);
    screen.getByRole("button").click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables an acting card", () => {
    render(<Card label="Start from blank" onClick={() => {}} disabled />);
    expect(root()).toBeDisabled();
    expect(root()).toHaveAttribute("data-sprint-disabled", "");
  });
});

describe("Card agent tool", () => {
  it("registers nothing when it navigates", () => {
    render(
      <Card label="Button" href="#/Button">
        A single action.
      </Card>,
    );
    expect(mock.names()).toEqual([]);
  });

  it("registers an open tool when it acts", () => {
    render(<Card label="Start from blank" onClick={() => {}} />);
    expect(mock.names()).toEqual(["open-start-from-blank"]);
  });

  it("opens through the real control and reports the card back", async () => {
    const onClick = vi.fn();
    render(<Card label="Start from blank" onClick={onClick} />);

    let result: string | null = null;
    await act(async () => {
      result = await mock.call("open-start-from-blank");
    });

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(result).toContain('**Card** "Start from blank"');
  });

  it("unregisters while disabled", () => {
    render(<Card label="Start from blank" onClick={() => {}} disabled />);
    expect(mock.names()).toEqual([]);
  });

  it("can be talked into a tool even though it navigates", () => {
    render(
      <Card label="Checkout" href="#/checkout" agentTool>
        Finish the order.
      </Card>,
    );
    expect(mock.names()).toEqual(["open-checkout"]);
  });
});

describe("Card agent view", () => {
  it("renders one control carrying its title and body", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Card label="Button" href="#/Button">
          A single action.
        </Card>
      </SprintProvider>,
    );

    const anchor = container.querySelector("a");
    expect(anchor).toHaveAttribute("href", "#/Button");
    expect(container.textContent).toContain('- **Card** "Button" [href=#/Button]');
    expect(container.textContent).toContain('- part `body` "A single action."');
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(
      <Card label="Button" href="#/Button">
        A single action.
      </Card>,
    );

    const [node] = serializeWithin(container);
    expect(node?.label).toBe("Button");
    expect(node?.parts).toEqual([
      { part: "title", label: "Button", state: {} },
      { part: "body", label: "A single action.", state: {} },
    ]);
  });
});
