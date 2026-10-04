import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type FloatingAlign, placeFloating, useFloating } from "./useFloating.ts";

afterEach(() => {
  vi.restoreAllMocks();
});

function anchorAt(rect: { x: number; y: number; width: number; height: number }) {
  const anchor = document.createElement("button");
  vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue(DOMRect.fromRect(rect));
  return anchor;
}

function surface(size: { width: number; height: number }) {
  const floating = document.createElement("div");
  Object.defineProperty(floating, "offsetWidth", { value: size.width });
  Object.defineProperty(floating, "scrollHeight", { value: size.height });
  return floating;
}

describe("placeFloating", () => {
  it.each<[FloatingAlign, string]>([
    ["start", "100px"],
    ["center", "125px"],
    ["end", "150px"],
  ])("aligns to the %s of the anchor", (align, left) => {
    const floating = surface({ width: 100, height: 50 });
    placeFloating(
      floating,
      anchorAt({ x: 100, y: 40, width: 150, height: 30 }),
      "below",
      align,
    );
    expect(floating.style.getPropertyValue("--sprint-floating-left")).toBe(left);
  });

  it("keeps the surface inside the right edge of the viewport", () => {
    const floating = surface({ width: 200, height: 50 });
    placeFloating(
      floating,
      anchorAt({ x: window.innerWidth - 50, y: 40, width: 40, height: 30 }),
    );
    expect(floating.style.getPropertyValue("--sprint-floating-left")).toBe(
      `${window.innerWidth - 200}px`,
    );
  });

  it("matches the anchor's width when asked", () => {
    const floating = surface({ width: 100, height: 50 });
    placeFloating(
      floating,
      anchorAt({ x: 10, y: 40, width: 240, height: 30 }),
      "below",
      "start",
      true,
    );
    expect(floating.style.getPropertyValue("--sprint-floating-width")).toBe("240px");
  });

  it("flips a preferred side that has no room", () => {
    const floating = surface({ width: 100, height: 120 });
    const placement = placeFloating(
      floating,
      anchorAt({ x: 10, y: 20, width: 40, height: 30 }),
      "above",
    );
    expect(placement).toBe("below");
    expect(floating).toHaveAttribute("data-placement", "below");
    expect(floating.style.getPropertyValue("--sprint-floating-top")).toBe("50px");
    expect(floating.style.getPropertyValue("--sprint-floating-room")).toBe(
      `${window.innerHeight - 50}px`,
    );
  });
});

function Harness(props: { open: boolean; onDismiss: () => void }) {
  const anchor = useRef<HTMLButtonElement>(null);
  const floating = useRef<HTMLDivElement>(null);
  useFloating({ open: props.open, anchor, floating, onDismiss: props.onDismiss });
  return (
    <>
      <button type="button" ref={anchor}>
        Anchor
      </button>
      <div ref={floating}>Surface</div>
      <p>Outside</p>
    </>
  );
}

describe("useFloating", () => {
  it("places the surface while open and dismisses on an outside pointer", () => {
    const onDismiss = vi.fn();
    render(<Harness open onDismiss={onDismiss} />);
    expect(screen.getByText("Surface")).toHaveAttribute("data-placement", "below");
    fireEvent.pointerDown(screen.getByText("Surface"));
    fireEvent.pointerDown(screen.getByText("Anchor"));
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.pointerDown(screen.getByText("Outside"));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("does nothing while closed", () => {
    const onDismiss = vi.fn();
    render(<Harness open={false} onDismiss={onDismiss} />);
    expect(screen.getByText("Surface")).not.toHaveAttribute("data-placement");
    fireEvent.pointerDown(screen.getByText("Outside"));
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
