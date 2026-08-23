import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "../../agent/attributes.ts";
import { __resetToolNames } from "../../agent/webmcp/scope.ts";
import {
  installMockModelContext,
  type MockModelContext,
} from "../../test/modelContext.ts";
import { Button } from "./Button.tsx";

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
  const element = document.querySelector<HTMLElement>(agentSelector("Button"));
  if (element === null) throw new Error("no Button root found");
  return element;
}

async function press(name: string): Promise<string | null> {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name);
  });
  return result;
}

describe("Button rendering", () => {
  it("tags itself as a component root", () => {
    render(<Button>Prepare launch</Button>);
    expect(root()).toHaveTextContent("Prepare launch");
  });

  it("defaults to the neutral tone so acid stays rationed", () => {
    render(<Button>Go</Button>);
    expect(root()).toHaveAttribute("data-sprint-tone", "neutral");
  });

  it("reflects tone and block", () => {
    render(
      <Button tone="action" block>
        Go
      </Button>,
    );
    expect(root()).toHaveAttribute("data-sprint-tone", "action");
    expect(root()).toHaveAttribute("data-sprint-block", "");
  });

  it("reflects loading as valueless state plus aria-busy, and disables the control", () => {
    render(<Button loading>Save</Button>);
    expect(root()).toHaveAttribute("data-sprint-loading", "");
    expect(root()).toHaveAttribute("aria-busy", "true");
    expect(root()).toBeDisabled();
  });

  it("reflects disabled", () => {
    render(<Button disabled>Save</Button>);
    expect(root()).toHaveAttribute("data-sprint-disabled", "");
    expect(root()).toBeDisabled();
  });

  it("defaults to type=button so it does not submit an enclosing form by accident", () => {
    render(<Button>Go</Button>);
    expect(root()).toHaveAttribute("type", "button");
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} id="go" data-testid="spread" title="Go now">
        Go
      </Button>,
    );
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "go");
    expect(root()).toHaveAttribute("title", "Go now");
    expect(screen.getByTestId("spread")).toBe(root());
  });

  it("does not fire onClick while loading", () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    fireEvent.click(root());
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("Button agent tool", () => {
  it("registers a press tool named from its label", () => {
    render(<Button>Prepare launch</Button>);
    expect(mock.names()).toEqual(["press-prepare-launch"]);
  });

  it("publishes the tool name on the root element", () => {
    render(<Button>Prepare launch</Button>);
    expect(root()).toHaveAttribute("data-sprint-tool", "press-prepare-launch");
  });

  it("derives a name from non-string children", () => {
    render(
      <Button>
        <span aria-hidden="true">▶</span>
        <span>Prepare launch</span>
      </Button>,
    );
    expect(mock.names()).toEqual(["press-prepare-launch"]);
  });

  it("honours agentName over the visible label", () => {
    render(<Button agentName="Save billing">Save</Button>);
    expect(mock.names()).toEqual(["press-save-billing"]);
  });

  it("registers nothing when agentTool is false", () => {
    render(<Button agentTool={false}>Prepare launch</Button>);
    expect(mock.history).toHaveLength(0);
    expect(root()).not.toHaveAttribute("data-sprint-tool");
  });

  it("registers nothing while disabled or loading", () => {
    const view = render(<Button disabled>Save</Button>);
    expect(mock.history).toHaveLength(0);
    view.rerender(<Button loading>Save</Button>);
    expect(mock.history).toHaveLength(0);
  });

  it("unregisters when it becomes disabled and re-registers when it recovers", () => {
    const view = render(<Button>Save</Button>);
    expect(mock.names()).toEqual(["press-save"]);
    view.rerender(<Button disabled>Save</Button>);
    expect(mock.names()).toEqual([]);
    view.rerender(<Button>Save</Button>);
    expect(mock.names()).toEqual(["press-save"]);
  });

  it("annotates the tool as state-changing and untrusted", () => {
    render(<Button>Save</Button>);
    expect(mock.find("press-save")?.descriptor.annotations).toEqual({
      readOnlyHint: false,
      untrustedContentHint: true,
    });
  });

  it("uses the spec description verbatim", async () => {
    const { PRESS_TOOL } = await import("./tool.ts");
    render(<Button>Save</Button>);
    expect(mock.find("press-save")?.descriptor.description).toBe(
      PRESS_TOOL.description,
    );
  });
});

describe("Button tool execution", () => {
  it("runs the consumer's onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await press("press-save");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("dispatches a real click that reaches a parent listener", async () => {
    const onParentClick = vi.fn();
    render(
      // biome-ignore lint/a11y/useKeyWithClickEvents: asserting event bubbling, not a control
      // biome-ignore lint/a11y/noStaticElementInteractions: asserting event bubbling, not a control
      <div onClick={onParentClick}>
        <Button>Save</Button>
      </div>,
    );
    await press("press-save");
    expect(onParentClick).toHaveBeenCalledTimes(1);
  });

  it("submits an enclosing form when type is submit", async () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) =>
      event.preventDefault(),
    );
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Save</Button>
      </form>,
    );
    await press("press-save");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("reports the resulting state, not the state before the press", async () => {
    function Saving() {
      const [saving, setSaving] = useState(false);
      return (
        <Button loading={saving} onClick={() => setSaving(true)}>
          Save
        </Button>
      );
    }

    render(<Saving />);
    const result = await press("press-save");
    expect(result).toContain("loading");
  });

  it("describes the button it just pressed", async () => {
    render(<Button tone="danger">Purge vault</Button>);
    const result = await press("press-purge-vault");
    expect(result).toContain("**Button**");
    expect(result).toContain("Purge vault");
    expect(result).toContain("tone=danger");
  });

  it("reports removal when the press unmounts the button", async () => {
    function SelfDestruct() {
      const [gone, setGone] = useState(false);
      return gone ? null : <Button onClick={() => setGone(true)}>Dismiss</Button>;
    }

    render(<SelfDestruct />);
    await expect(press("press-dismiss")).resolves.toContain("removed");
  });
});
