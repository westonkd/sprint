import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { Alert, type AlertProps } from "./Alert.tsx";

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
  const element = document.querySelector<HTMLElement>(agentSelector("Alert"));
  if (element === null) throw new Error("no Alert root found");
  return element;
}

async function call(name: string, inputs: Record<string, unknown>) {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result as string | null;
}

function DismissHarness(props: Partial<AlertProps>) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <Alert label="Key revoked" onDismiss={() => setVisible(false)} {...props}>
      The key can no longer authenticate.
    </Alert>
  );
}

describe("Alert rendering", () => {
  it("renders a status message with its tone", () => {
    render(<Alert label="Check your inbox">We sent a link.</Alert>);
    expect(root()).toHaveAttribute("role", "status");
    expect(root()).toHaveAttribute("data-sprint-tone", "info");
    expect(root()).toHaveTextContent("We sent a link.");
    expect(document.querySelector(agentSelector("Alert", "title"))).toHaveTextContent(
      "Check your inbox",
    );
  });

  it("announces danger and warning assertively", () => {
    const { rerender } = render(<Alert tone="danger">Sign-in failed.</Alert>);
    expect(root()).toHaveAttribute("role", "alert");
    rerender(<Alert tone="warning">Key expires soon.</Alert>);
    expect(root()).toHaveAttribute("role", "alert");
  });

  it("renders no dismiss control without onDismiss", () => {
    render(<Alert>Quiet notice.</Alert>);
    expect(root()).not.toHaveAttribute("data-sprint-dismissible");
    expect(document.querySelector(agentSelector("Alert", "dismiss"))).toBeNull();
  });

  it("dismisses through the control", () => {
    render(<DismissHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(document.querySelector(agentSelector("Alert"))).toBeNull();
  });
});

describe("Alert agent tool", () => {
  it("registers a dismiss tool only when dismissible", () => {
    const { rerender } = render(<Alert label="Key revoked">Done.</Alert>);
    expect(mock.names()).toEqual([]);
    rerender(
      <Alert label="Key revoked" onDismiss={() => {}}>
        Done.
      </Alert>,
    );
    expect(mock.names()).toEqual(["dismiss-key-revoked"]);
  });

  it("registers nothing without a stable name", () => {
    render(<Alert onDismiss={() => {}}>Anonymous.</Alert>);
    expect(mock.names()).toEqual([]);
  });

  it("names the tool from agentName over label", () => {
    render(
      <Alert label="Key revoked (3)" agentName="Key revoked" onDismiss={() => {}}>
        Done.
      </Alert>,
    );
    expect(mock.names()).toEqual(["dismiss-key-revoked"]);
  });

  it("dismisses through a real click and reports the departure", async () => {
    render(<DismissHarness />);
    const result = await call("dismiss-key-revoked", {});
    expect(result).toContain("gone from the page");
    expect(document.querySelector(agentSelector("Alert"))).toBeNull();
    expect(mock.names()).toEqual([]);
  });
});

describe("Alert agent view", () => {
  it("renders text with its message part when not dismissible", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Alert tone="danger" label="Sign-in failed">
          Wrong callsign or access code.
        </Alert>
      </SprintProvider>,
    );
    expect(container.querySelector("[data-sprint-view] button")).toBeNull();
    expect(container.textContent).toContain('**Alert** "Sign-in failed"');
    expect(container.textContent).toContain("tone=danger");
    expect(container.textContent).toContain("Wrong callsign or access code.");
  });

  it("renders one control for the dismiss part", () => {
    render(
      <SprintProvider view="agent" pageTools={false}>
        <DismissHarness />
      </SprintProvider>,
    );
    const control = screen.getByRole("button", { name: /Dismiss/ });
    fireEvent.click(control);
    expect(screen.queryByRole("button", { name: /Dismiss/ })).toBeNull();
  });

  it("respects agentControls never", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false} agentControls="never">
        <DismissHarness />
      </SprintProvider>,
    );
    expect(container.querySelector("[data-sprint-view] button")).toBeNull();
  });
});
