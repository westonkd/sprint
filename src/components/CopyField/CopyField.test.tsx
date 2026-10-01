import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { COPIED_FOR, CopyField } from "./CopyField.tsx";

const LINK = "https://sprint.example/setup/7HW4-XK92-QQ1D?station=KX-2209";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
  vi.useRealTimers();
  vi.restoreAllMocks();
  Object.defineProperty(navigator, "clipboard", {
    value: undefined,
    configurable: true,
  });
});

function installClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
}

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("CopyField"));
  if (element === null) throw new Error("no CopyField root found");
  return element;
}

function valueElement(): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    agentSelector("CopyField", "value"),
  );
  if (element === null) throw new Error("no value part found");
  return element;
}

async function press(name: string) {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name }));
  });
}

describe("CopyField rendering", () => {
  it("is a group named by its visible label", () => {
    render(<CopyField label="Setup link" value={LINK} />);
    expect(screen.getByRole("group", { name: "Setup link" })).toBe(root());
  });

  it("shows the whole value unmasked, with its title for hover", () => {
    render(<CopyField label="Setup link" value={LINK} />);
    expect(valueElement()).toHaveTextContent(LINK);
    expect(valueElement()).toHaveAttribute("title", LINK);
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(<CopyField ref={ref} id="share" label="Setup link" value={LINK} />);
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "share");
  });

  it("uses custom control labels", () => {
    render(<CopyField label="Invite code" value="NOMAD-0042" copyLabel="Copy code" />);
    expect(screen.getByRole("button", { name: "Copy code" })).toHaveAttribute(
      "data-sprint-part",
      "copy",
    );
  });

  it("announces the control's label swap politely", () => {
    render(<CopyField label="Setup link" value={LINK} />);
    expect(screen.getByRole("button", { name: "Copy" })).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });
});

describe("CopyField copying", () => {
  it("writes the value, confirms, and calls onCopy", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    installClipboard(writeText);
    const onCopy = vi.fn();
    render(<CopyField label="Setup link" value={LINK} onCopy={onCopy} />);

    await press("Copy");

    expect(writeText).toHaveBeenCalledWith(LINK);
    expect(onCopy).toHaveBeenCalledWith(LINK);
    expect(root()).toHaveAttribute("data-sprint-copied", "");
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("resets to the idle label after the confirmation window", async () => {
    vi.useFakeTimers();
    installClipboard(vi.fn().mockResolvedValue(undefined));
    render(
      <CopyField label="Invite code" value="NOMAD-0042" copiedLabel="Code copied" />,
    );

    await press("Copy");
    expect(screen.getByRole("button", { name: "Code copied" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(COPIED_FOR - 1);
    });
    expect(root()).toHaveAttribute("data-sprint-copied", "");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(root()).not.toHaveAttribute("data-sprint-copied");
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
  });

  it("marks the failure and selects the value when the clipboard refuses", async () => {
    installClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    const onCopy = vi.fn();
    render(<CopyField label="Setup link" value={LINK} onCopy={onCopy} />);

    await press("Copy");

    expect(root()).toHaveAttribute("data-sprint-copy-failed", "");
    expect(root()).not.toHaveAttribute("data-sprint-copied");
    expect(onCopy).not.toHaveBeenCalled();
    expect(document.getSelection()?.toString()).toBe(LINK);
  });

  it("falls back the same way when there is no clipboard", async () => {
    render(<CopyField label="Setup link" value={LINK} />);
    await press("Copy");
    expect(root()).toHaveAttribute("data-sprint-copy-failed", "");
    expect(document.getSelection()?.toString()).toBe(LINK);
  });

  it("clears a failure once a later copy succeeds", async () => {
    const writeText = vi
      .fn()
      .mockRejectedValueOnce(new Error("denied"))
      .mockResolvedValue(undefined);
    installClipboard(writeText);
    render(<CopyField label="Setup link" value={LINK} />);

    await press("Copy");
    expect(root()).toHaveAttribute("data-sprint-copy-failed", "");
    await press("Copy");
    expect(root()).not.toHaveAttribute("data-sprint-copy-failed");
    expect(root()).toHaveAttribute("data-sprint-copied", "");
  });

  it("registers no WebMCP tool", () => {
    render(<CopyField label="Setup link" value={LINK} />);
    expect(mock.names()).toEqual([]);
    expect(root()).not.toHaveAttribute("data-sprint-tool");
  });
});

describe("CopyField agent view", () => {
  it("reads the label and the whole value, with one copy control", () => {
    render(
      <SprintProvider defaultView="agent">
        <CopyField label="Setup link" value={LINK} />
      </SprintProvider>,
    );
    const surface = document.querySelector('[data-sprint-view="agent"]');
    expect(surface?.textContent).toContain('**CopyField** "Setup link"');
    expect(surface?.textContent).toContain(`part \`value\` "${LINK}"`);
    const buttons = surface?.querySelectorAll("button") ?? [];
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAttribute("data-sprint-part", "copy");
    expect(buttons[0]?.textContent).toContain('part `copy` "Copy"');
  });

  it("copies through the agent control", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    installClipboard(writeText);
    render(
      <SprintProvider defaultView="agent">
        <CopyField label="Setup link" value={LINK} />
      </SprintProvider>,
    );
    await act(async () => {
      fireEvent.click(
        document.querySelector('[data-sprint-view="agent"] button') as HTMLElement,
      );
    });
    expect(writeText).toHaveBeenCalledWith(LINK);
    const surface = document.querySelector('[data-sprint-view="agent"]');
    expect(surface?.textContent).toContain("[copied]");
    expect(surface?.textContent).toContain('part `copy` "Copied"');
  });

  it("renders text only when controls are off", () => {
    const { container } = render(
      <SprintProvider defaultView="agent" agentControls="never">
        <CopyField label="Setup link" value={LINK} />
      </SprintProvider>,
    );
    expect(container.querySelector("[data-sprint-view] button")).toBeNull();
    expect(container.textContent).toContain(LINK);
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(<CopyField label="Setup link" value={LINK} />);
    const [node] = serializeWithin(container);
    expect(node?.component).toBe("CopyField");
    expect(node?.label).toBe("Setup link");
    expect(node?.parts.map((part) => [part.part, part.label])).toEqual([
      ["value", LINK],
      ["copy", "Copy"],
    ]);
  });
});
