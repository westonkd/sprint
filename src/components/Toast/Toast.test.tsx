import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { Toast } from "./Toast.tsx";

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

describe("Toast", () => {
  it("renders nothing while closed", () => {
    render(<Toast open={false} message="Saved." onDismiss={() => {}} />);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("announces its message and dismisses itself after the duration", () => {
    const onDismiss = vi.fn();
    render(<Toast open message="Saved." onDismiss={onDismiss} duration={1000} />);
    expect(screen.getByRole("status")).toHaveTextContent("Saved.");
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("pauses while the pointer is on it", () => {
    const onDismiss = vi.fn();
    render(<Toast open message="Saved." onDismiss={onDismiss} duration={1000} />);
    fireEvent.pointerEnter(screen.getByRole("status"));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.pointerLeave(screen.getByRole("status"));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("stays without a duration and dismisses from its control", () => {
    const onDismiss = vi.fn();
    render(<Toast open message="Offline." duration={null} onDismiss={onDismiss} />);
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("runs its action through a Button with its own press tool", async () => {
    const undo = vi.fn();
    render(
      <Toast
        open
        message="Moved."
        onDismiss={() => {}}
        action={{ label: "Undo", onSelect: undo, shortcut: "Ctrl+Z" }}
      />,
    );
    expect(screen.getByRole("button", { name: "Undo" })).toHaveAttribute(
      "aria-keyshortcuts",
      "Ctrl+Z",
    );
    expect(mock.names()).toContain("press-undo");
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(undo).toHaveBeenCalledOnce();
  });

  it("announces danger assertively", () => {
    render(<Toast open tone="danger" message="Could not save." onDismiss={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Could not save.");
  });

  it("renders its message, a dismiss control and the action for agents", () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Toast
          open
          message="Moved."
          onDismiss={onDismiss}
          action={{ label: "Undo", onSelect: () => {} }}
        />
      </SprintProvider>,
    );
    expect(container.textContent).toContain('- part `message` "Moved."');
    expect(container.textContent).toContain('**Button** "Undo"');
    fireEvent.click(screen.getByRole("button", { name: /"Dismiss"/ }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
