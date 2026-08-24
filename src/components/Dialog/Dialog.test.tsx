import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { Button } from "@/components/Button/index.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { Dialog } from "./Dialog.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
  vi.restoreAllMocks();
});

function root(): HTMLDialogElement {
  const element = document.querySelector<HTMLDialogElement>(agentSelector("Dialog"));
  if (element === null) throw new Error("no Dialog root found");
  return element;
}

async function call(name: string, inputs: Record<string, unknown>) {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result as string | null;
}

function Harness(props: { defaultOpen?: boolean; owner?: string }) {
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  const [revoked, setRevoked] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Revoke key</Button>
      {revoked ? <p>revoked</p> : null}
      <Dialog
        label="Revoke key"
        open={open}
        {...(props.owner === undefined ? {} : { owner: props.owner })}
        onClose={() => setOpen(false)}
      >
        <Button
          tone="danger"
          onClick={() => {
            setRevoked(true);
            setOpen(false);
          }}
        >
          Confirm revoke
        </Button>
      </Dialog>
    </>
  );
}

describe("Dialog rendering", () => {
  it("renders nothing while closed", () => {
    render(<Harness />);
    expect(document.querySelector(agentSelector("Dialog"))).toBeNull();
  });

  it("opens as a modal with its label and contents", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Revoke key" }));
    expect(root().open).toBe(true);
    expect(root()).toHaveAttribute("aria-label", "Revoke key");
    expect(root()).toHaveAttribute("data-sprint-open", "");
    expect(screen.getByRole("button", { name: "Confirm revoke" })).toBeVisible();
  });

  it("closes through the close control", () => {
    render(<Harness defaultOpen />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(document.querySelector(agentSelector("Dialog"))).toBeNull();
  });

  it("closes on cancel, as Escape would", () => {
    render(<Harness defaultOpen />);
    fireEvent(root(), new Event("cancel", { bubbles: false, cancelable: true }));
    expect(document.querySelector(agentSelector("Dialog"))).toBeNull();
  });

  it("publishes its owner", () => {
    render(<Harness defaultOpen owner="press-revoke-key" />);
    expect(root()).toHaveAttribute("data-sprint-owner", "press-revoke-key");
  });
});

describe("Dialog agent tools", () => {
  it("registers the close tool only while open", () => {
    render(<Harness />);
    expect(mock.names()).not.toContain("close-revoke-key");
    fireEvent.click(screen.getByRole("button", { name: "Revoke key" }));
    expect(mock.names()).toContain("close-revoke-key");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(mock.names()).not.toContain("close-revoke-key");
  });

  it("scopes tools registered inside under its label", () => {
    render(<Harness defaultOpen />);
    expect(mock.names()).toContain("revoke-key-press-confirm-revoke");
  });

  it("closes through the tool with a real click", async () => {
    render(<Harness defaultOpen />);
    const result = await call("close-revoke-key", {});
    expect(result).toContain("Closed");
    expect(document.querySelector(agentSelector("Dialog"))).toBeNull();
  });

  it("lets an agent take the dialog's action, which closes it", async () => {
    render(<Harness defaultOpen />);
    await call("revoke-key-press-confirm-revoke", {});
    expect(screen.getByText("revoked")).toBeInTheDocument();
    expect(document.querySelector(agentSelector("Dialog"))).toBeNull();
    expect(mock.names()).not.toContain("close-revoke-key");
  });
});

describe("Dialog agent view", () => {
  it("renders nothing while closed", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness />
      </SprintProvider>,
    );
    expect(container.textContent).not.toContain("**Dialog**");
  });

  it("renders its line, a close control, and its contents while open", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness defaultOpen />
      </SprintProvider>,
    );
    expect(container.textContent).toContain('**Dialog** "Revoke key"');
    expect(container.textContent).toContain("[open]");
    const close = screen.getByRole("button", { name: /Close/ });
    expect(container.textContent).toContain("Confirm revoke");
    fireEvent.click(close);
    expect(container.textContent).not.toContain("**Dialog**");
  });

  it("renders text only under agentControls never", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false} agentControls="never">
        <Dialog label="Revoke key" open onClose={() => {}}>
          contents
        </Dialog>
      </SprintProvider>,
    );
    expect(container.querySelector("[data-sprint-view] button")).toBeNull();
    expect(container.textContent).toContain('**Dialog** "Revoke key"');
  });
});
