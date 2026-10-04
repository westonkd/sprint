import { type RefObject, useLayoutEffect, useRef } from "react";

export type FloatingSide = "below" | "above";
export type FloatingAlign = "start" | "center" | "end";

export interface UseFloatingOptions {
  open: boolean;
  anchor: RefObject<HTMLElement | null>;
  floating: RefObject<HTMLElement | null>;
  side?: FloatingSide;
  align?: FloatingAlign;
  matchWidth?: boolean;
  boundary?: RefObject<HTMLElement | null>;
  onDismiss?: () => void;
}

export const FLOATING_TOP = "--sprint-floating-top";
export const FLOATING_BOTTOM = "--sprint-floating-bottom";
export const FLOATING_LEFT = "--sprint-floating-left";
export const FLOATING_WIDTH = "--sprint-floating-width";
export const FLOATING_ROOM = "--sprint-floating-room";
export const FLOATING_PLACEMENT = "data-placement";

const CAP_REM = 16;

function rootFontSize(): number {
  const size = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(size) ? size : 16;
}

function preferredHeight(floating: HTMLElement): number {
  const content = Array.from(floating.children).reduce(
    (tallest, child) => Math.max(tallest, child.scrollHeight),
    floating.scrollHeight,
  );
  const chrome = floating.offsetHeight - floating.clientHeight;
  return Math.min(content + chrome, CAP_REM * rootFontSize());
}

function startOf(rect: DOMRect, width: number, align: FloatingAlign): number {
  if (align === "end") return rect.right - width;
  if (align === "center") return rect.left + rect.width / 2 - width / 2;
  return rect.left;
}

export function placeFloating(
  floating: HTMLElement,
  anchor: HTMLElement,
  side: FloatingSide = "below",
  align: FloatingAlign = "start",
  matchWidth = false,
): FloatingSide {
  const rect = anchor.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const below = viewportHeight - rect.bottom;
  const above = rect.top;
  const wanted = preferredHeight(floating);
  const preferred = side === "below" ? below : above;
  const other = side === "below" ? above : below;
  const placement: FloatingSide =
    preferred < wanted && other > preferred
      ? side === "below"
        ? "above"
        : "below"
      : side;

  const width = Math.min(matchWidth ? rect.width : floating.offsetWidth, viewportWidth);
  const left = Math.max(
    0,
    Math.min(startOf(rect, width, align), viewportWidth - width),
  );

  floating.setAttribute(FLOATING_PLACEMENT, placement);
  if (placement === "above") {
    floating.style.removeProperty(FLOATING_TOP);
    floating.style.setProperty(FLOATING_BOTTOM, `${viewportHeight - rect.top}px`);
  } else {
    floating.style.removeProperty(FLOATING_BOTTOM);
    floating.style.setProperty(FLOATING_TOP, `${rect.bottom}px`);
  }
  floating.style.setProperty(
    FLOATING_ROOM,
    `${placement === "above" ? above : below}px`,
  );
  floating.style.setProperty(FLOATING_LEFT, `${left}px`);
  if (matchWidth) floating.style.setProperty(FLOATING_WIDTH, `${width}px`);
  else floating.style.removeProperty(FLOATING_WIDTH);
  return placement;
}

function canPopover(element: HTMLElement): boolean {
  return typeof element.showPopover === "function";
}

export function showFloating(element: HTMLElement): void {
  if (!canPopover(element)) return;
  if (!element.matches(":popover-open")) element.showPopover();
}

export function hideFloating(element: HTMLElement): void {
  if (!canPopover(element)) return;
  if (element.matches(":popover-open")) element.hidePopover();
}

function within(
  target: EventTarget | null,
  ...elements: (HTMLElement | null)[]
): boolean {
  if (!(target instanceof Node)) return false;
  return elements.some((element) => element?.contains(target) === true);
}

export function useFloating(options: UseFloatingOptions): void {
  const {
    open,
    anchor,
    floating,
    side = "below",
    align = "start",
    matchWidth = false,
    boundary,
    onDismiss,
  } = options;

  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useLayoutEffect(() => {
    const surface = floating.current;
    const target = anchor.current;
    if (surface === null || target === null) return;
    if (!open) {
      hideFloating(surface);
      return;
    }

    showFloating(surface);
    placeFloating(surface, target, side, align, matchWidth);

    const reposition = () => placeFloating(surface, target, side, align, matchWidth);
    const dismiss = (event: Event) => {
      if (within(event.target, target, surface, boundary?.current ?? null)) return;
      dismissRef.current?.();
    };

    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    document.addEventListener("pointerdown", dismiss, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
      document.removeEventListener("pointerdown", dismiss, true);
    };
  }, [open, anchor, floating, side, align, matchWidth, boundary]);
}
