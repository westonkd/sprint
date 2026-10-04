import { act, createEvent, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { Tooltip } from "./Tooltip.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  mock.uninstall();
  __resetToolNames();
});

function bubble(): HTMLElement {
  return screen.getByRole("tooltip", { hidden: true });
}

function trigger(): HTMLElement {
  return screen.getByRole("button", { name: "Hide sidebar" });
}

function Example(props: { describe?: boolean; disabled?: boolean }) {
  return (
    <Tooltip label="Collapse the navigation" {...props}>
      <button type="button" aria-label="Hide sidebar">
        ⟨
      </button>
    </Tooltip>
  );
}

describe("Tooltip", () => {
  it("is hidden until asked for and describes its element", () => {
    render(<Example />);
    expect(bubble()).toHaveAttribute("hidden");
    expect(trigger()).toHaveAccessibleDescription("Collapse the navigation");
  });

  it("appears after a hover delay and hides when the pointer leaves", () => {
    render(<Example />);
    const anchor = trigger().parentElement as HTMLElement;
    fireEvent.pointerEnter(anchor, { pointerType: "mouse" });
    expect(bubble()).toHaveAttribute("hidden");
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(bubble()).not.toHaveAttribute("hidden");
    fireEvent.pointerLeave(anchor);
    expect(bubble()).toHaveAttribute("hidden");
  });

  it("never appears for touch", () => {
    render(<Example />);
    const anchor = trigger().parentElement as HTMLElement;
    const touch = createEvent.pointerOver(anchor);
    Object.defineProperty(touch, "pointerType", { value: "touch" });
    fireEvent(anchor, touch);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(bubble()).toHaveAttribute("hidden");
  });

  it("appears on focus and Escape dismisses it", () => {
    render(<Example />);
    act(() => trigger().focus());
    expect(bubble()).not.toHaveAttribute("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(bubble()).toHaveAttribute("hidden");
  });

  it("can leave the description off when it repeats the name", () => {
    render(<Example describe={false} />);
    expect(trigger()).not.toHaveAttribute("aria-describedby");
  });

  it("does not appear while disabled", () => {
    render(<Example disabled />);
    act(() => trigger().focus());
    expect(bubble()).toHaveAttribute("hidden");
  });

  it("adds nothing to the agent projection", () => {
    const { container } = render(<Example />);
    expect(serializeWithin(container)).toEqual([]);
  });

  it("renders only its element in agent view", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Example />
      </SprintProvider>,
    );
    expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
    expect(container.querySelector("button[aria-label='Hide sidebar']")).not.toBeNull();
  });
});
