import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { Button } from "../Button/index.ts";
import { Panel } from "./Panel.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
});

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Panel"));
  if (element === null) throw new Error("no Panel root found");
  return element;
}

describe("Panel rendering", () => {
  it("names the region with its label", () => {
    render(<Panel label="When to use">body</Panel>);
    expect(screen.getByRole("region", { name: "When to use" })).toBe(root());
    expect(root()).toHaveTextContent("When to use");
  });

  it("renders its children in the body", () => {
    render(<Panel label="When to use">Use it for any discrete action.</Panel>);
    expect(root()).toHaveTextContent("Use it for any discrete action.");
  });

  it("renders header actions", () => {
    render(
      <Panel label="Preview" actions={<Button>Reset preview</Button>}>
        body
      </Panel>,
    );
    expect(screen.getByRole("button", { name: "Reset preview" })).toBeInTheDocument();
  });

  it("reflects flush", () => {
    render(
      <Panel label="Conventions" flush>
        body
      </Panel>,
    );
    expect(root()).toHaveAttribute("data-sprint-flush", "");
  });

  it("says it is empty rather than collapsing", () => {
    render(<Panel label="Registered tools" emptyLabel="No tools registered" />);
    expect(root()).toHaveAttribute("data-sprint-empty", "");
    expect(root()).toHaveTextContent("No tools registered");
  });

  it("is not empty once it has content", () => {
    render(<Panel label="Registered tools">one</Panel>);
    expect(root()).not.toHaveAttribute("data-sprint-empty");
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Panel ref={ref} label="Props" id="props" data-testid="spread">
        body
      </Panel>,
    );
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "props");
    expect(screen.getByTestId("spread")).toBe(root());
  });
});

describe("Panel agent view", () => {
  it("renders one line and indents what it contains", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Panel label="Examples">
          <Button>Prepare launch</Button>
        </Panel>
      </SprintProvider>,
    );

    expect(container.textContent).toBe(
      '- **Panel** "Examples"\n  - **Button** "Prepare launch" [tone=neutral] → tool `press-prepare-launch`\n',
    );
  });

  it("says an empty region is empty", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Panel label="Registered tools" />
      </SprintProvider>,
    );

    expect(container.textContent).toBe('- **Panel** "Registered tools" [empty]\n');
  });

  it("keeps a tool inside it registered across a view switch", () => {
    const { rerender } = render(
      <SprintProvider view="human" pageTools={false}>
        <Panel label="Examples">
          <Button>Prepare launch</Button>
        </Panel>
      </SprintProvider>,
    );
    expect(mock.names()).toEqual(["press-prepare-launch"]);

    rerender(
      <SprintProvider view="agent" pageTools={false}>
        <Panel label="Examples">
          <Button>Prepare launch</Button>
        </Panel>
      </SprintProvider>,
    );
    expect(mock.names()).toEqual(["press-prepare-launch"]);
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(
      <Panel label="Examples">
        <Button>Prepare launch</Button>
      </Panel>,
    );

    const [node] = serializeWithin(container);
    expect(node?.label).toBe("Examples");
    expect(node?.children[0]?.label).toBe("Prepare launch");
  });
});
