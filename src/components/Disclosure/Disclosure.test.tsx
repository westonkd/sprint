import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { Button } from "../Button/index.ts";
import { Disclosure, type DisclosureProps } from "./Disclosure.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
  vi.restoreAllMocks();
});

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Disclosure"));
  if (element === null) throw new Error("no Disclosure root found");
  return element;
}

function toggle(): HTMLElement {
  const element = root().querySelector<HTMLElement>(
    agentSelector("Disclosure", "toggle"),
  );
  if (element === null) throw new Error("no toggle part found");
  return element;
}

function Controlled(
  props: Partial<DisclosureProps> & { onSpy?: (next: boolean) => void },
) {
  const { onSpy, ...rest } = props;
  const [open, setOpen] = useState(false);
  return (
    <Disclosure
      label="Access breakdown"
      expanded={open}
      onExpandedChange={(next) => {
        onSpy?.(next);
        setOpen(next);
      }}
      {...rest}
    >
      <Button>Revoke admin</Button>
    </Disclosure>
  );
}

async function call(name: string, inputs: Record<string, unknown>) {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result as string | null;
}

describe("Disclosure rendering", () => {
  it("names the region with its label and derives the toggle text", () => {
    render(<Disclosure label="Access breakdown">Admin through Operators.</Disclosure>);
    expect(screen.getByRole("region", { name: "Access breakdown" })).toBe(root());
    expect(screen.getByRole("button", { name: "Show access breakdown" })).toBe(
      toggle(),
    );
  });

  it("wires the toggle to the content it controls", () => {
    render(<Disclosure label="Access breakdown">Admin through Operators.</Disclosure>);
    const controls = toggle().getAttribute("aria-controls");
    expect(controls).not.toBeNull();
    const content = document.getElementById(controls ?? "");
    expect(content).toHaveTextContent("Admin through Operators.");
    expect(root()).toContainElement(content);
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles uncontrolled and reflects the state", () => {
    render(<Disclosure label="Access breakdown">Admin through Operators.</Disclosure>);
    expect(root()).not.toHaveAttribute("data-sprint-expanded");
    fireEvent.click(toggle());
    expect(root()).toHaveAttribute("data-sprint-expanded", "");
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    expect(toggle()).toHaveTextContent("Hide access breakdown");
    fireEvent.click(toggle());
    expect(root()).not.toHaveAttribute("data-sprint-expanded");
    expect(toggle()).toHaveTextContent("Show access breakdown");
  });

  it("starts expanded with defaultExpanded", () => {
    render(
      <Disclosure label="Access breakdown" defaultExpanded>
        body
      </Disclosure>,
    );
    expect(root()).toHaveAttribute("data-sprint-expanded", "");
  });

  it("follows the controlled value and reports changes", () => {
    const spy = vi.fn();
    render(<Controlled onSpy={spy} />);
    fireEvent.click(toggle());
    expect(spy).toHaveBeenCalledWith(true);
    expect(root()).toHaveAttribute("data-sprint-expanded", "");
  });

  it("does not move when controlled and the parent refuses the change", () => {
    const spy = vi.fn();
    render(
      <Disclosure label="Access breakdown" expanded={false} onExpandedChange={spy}>
        body
      </Disclosure>,
    );
    fireEvent.click(toggle());
    expect(spy).toHaveBeenCalledWith(true);
    expect(root()).not.toHaveAttribute("data-sprint-expanded");
  });

  it("uses custom toggle text", () => {
    render(
      <Disclosure
        label="Audit trail"
        showLabel="Show 12 events"
        hideLabel="Hide events"
      >
        body
      </Disclosure>,
    );
    expect(toggle()).toHaveTextContent("Show 12 events");
    fireEvent.click(toggle());
    expect(toggle()).toHaveTextContent("Hide events");
  });

  it("keeps an acronym intact in the derived toggle text", () => {
    render(<Disclosure label="API keys">body</Disclosure>);
    expect(toggle()).toHaveTextContent("Show API keys");
  });

  it("conceals collapsed content with CSS, never by unmounting or the hidden attribute", () => {
    render(
      <Disclosure label="Access breakdown">
        <Button>Revoke admin</Button>
      </Disclosure>,
    );
    const content = document.getElementById(
      toggle().getAttribute("aria-controls") ?? "",
    );
    expect(content).not.toBeNull();
    expect(content).not.toHaveAttribute("hidden");
    expect(content).not.toHaveAttribute("aria-hidden");
    expect(root().querySelector(agentSelector("Button"))).not.toBeNull();
    expect(mock.names()).toContain("press-revoke-admin");
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Disclosure ref={ref} label="Access breakdown" id="access" data-testid="spread">
        body
      </Disclosure>,
    );
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "access");
    expect(screen.getByTestId("spread")).toBe(root());
  });
});

describe("Disclosure agent tool", () => {
  it("registers one expand tool named from its label", () => {
    render(<Disclosure label="Access breakdown">body</Disclosure>);
    expect(mock.names()).toEqual(["expand-access-breakdown"]);
    expect(root()).toHaveAttribute("data-sprint-tool", "expand-access-breakdown");
  });

  it("expands through a real click and reports the new state", async () => {
    const spy = vi.fn();
    render(<Controlled onSpy={spy} />);
    const result = await call("expand-access-breakdown", { expanded: true });
    expect(spy).toHaveBeenCalledWith(true);
    expect(root()).toHaveAttribute("data-sprint-expanded", "");
    expect(result).toContain("Expanded");
    expect(result).toContain("[expanded]");
  });

  it("collapses by stating the end state", async () => {
    render(
      <Disclosure label="Access breakdown" defaultExpanded>
        body
      </Disclosure>,
    );
    const result = await call("expand-access-breakdown", { expanded: false });
    expect(root()).not.toHaveAttribute("data-sprint-expanded");
    expect(result).toContain("Collapsed");
  });

  it("treats the current state as success, not a toggle", async () => {
    render(<Disclosure label="Access breakdown">body</Disclosure>);
    const result = await call("expand-access-breakdown", { expanded: false });
    expect(root()).not.toHaveAttribute("data-sprint-expanded");
    expect(result).toContain("Already collapsed");
  });

  it("rejects input that does not state an end state", async () => {
    render(<Disclosure label="Access breakdown">body</Disclosure>);
    const result = await call("expand-access-breakdown", { expanded: "yes" });
    expect(result).toContain("expanded");
    expect(result).not.toContain("Expanded.");
    expect(root()).not.toHaveAttribute("data-sprint-expanded");
  });

  it("derives its name from agentName and can opt out", () => {
    const { rerender } = render(
      <Disclosure label="Access breakdown" agentName="Crew access">
        body
      </Disclosure>,
    );
    expect(mock.names()).toEqual(["expand-crew-access"]);
    rerender(
      <Disclosure label="Access breakdown" agentTool={false}>
        body
      </Disclosure>,
    );
    expect(mock.names()).toEqual([]);
  });

  it("unregisters on unmount", () => {
    const { unmount } = render(<Disclosure label="Access breakdown">body</Disclosure>);
    expect(mock.names()).toEqual(["expand-access-breakdown"]);
    unmount();
    expect(mock.names()).toEqual([]);
  });
});

describe("Disclosure agent view", () => {
  it("renders collapsed content beneath the line, with the toggle as one control", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Disclosure label="Access breakdown">
          <Button>Revoke admin</Button>
        </Disclosure>
      </SprintProvider>,
    );

    expect(container.textContent).toBe(
      '- **Disclosure** "Access breakdown" → tool `expand-access-breakdown`\n' +
        '  - part `toggle` "Show access breakdown"\n' +
        '  - **Button** "Revoke admin" [tone=neutral] → tool `press-revoke-admin`\n',
    );
    expect(
      container.querySelectorAll(
        '[data-sprint-agent="Disclosure"][data-sprint-part="toggle"]',
      ),
    ).toHaveLength(1);
  });

  it("toggles from the agent control", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Disclosure label="Access breakdown">body</Disclosure>
      </SprintProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Show access breakdown/ }));
    expect(container.textContent).toContain('"Access breakdown" [expanded]');
    expect(container.textContent).toContain('"Hide access breakdown" [expanded]');
  });

  it("drives the expand tool against the agent rendering", async () => {
    render(
      <SprintProvider view="agent" pageTools={false}>
        <Disclosure label="Access breakdown">body</Disclosure>
      </SprintProvider>,
    );
    const result = await call("expand-access-breakdown", { expanded: true });
    expect(result).toContain("[expanded]");
  });

  it("renders text only when controls are off", () => {
    const { container } = render(
      <SprintProvider view="agent" agentControls="never" pageTools={false}>
        <Disclosure label="Access breakdown">body</Disclosure>
      </SprintProvider>,
    );
    expect(container.querySelector("[data-sprint-view] button")).toBeNull();
    expect(container.textContent).toContain('- part `toggle` "Show access breakdown"');
  });

  it("agrees with the projection of its own collapsed human rendering", () => {
    const { container } = render(
      <Disclosure label="Access breakdown">
        <Button>Revoke admin</Button>
      </Disclosure>,
    );

    const [node] = serializeWithin(container);
    expect(node?.component).toBe("Disclosure");
    expect(node?.label).toBe("Access breakdown");
    expect(node?.state).toEqual({});
    expect(node?.region).toBe(true);
    expect(node?.tool).toBe("expand-access-breakdown");
    expect(node?.parts).toEqual([
      { part: "toggle", label: "Show access breakdown", state: {} },
    ]);
    expect(node?.children.map((child) => child.label)).toEqual(["Revoke admin"]);
  });

  it("projects the expanded state on the root and the toggle", () => {
    const { container } = render(
      <Disclosure label="Access breakdown" defaultExpanded>
        body
      </Disclosure>,
    );

    const [node] = serializeWithin(container);
    expect(node?.state).toEqual({ expanded: true });
    expect(node?.parts).toEqual([
      { part: "toggle", label: "Hide access breakdown", state: { expanded: true } },
    ]);
  });
});
