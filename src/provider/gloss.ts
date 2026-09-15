import type { PointerEvent as ReactPointerEvent } from "react";

const GLOSS_X = "--sprint-gloss-x";
const GLOSS_FADE = "--sprint-gloss-fade";
const CAST_SHIFT = "--sprint-cast-shift";
const X_MIN = 22;
const X_MAX = 78;
const FADE_SPAN = 28;
const FADE_FLOOR = 0.25;
const CAST_TRAVEL = 10;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function stilled() {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const GLOSSY = new Set([
  "Button",
  "Card",
  "Tag",
  "SegmentedControl",
  "Switch",
  "Shell",
]);

const LIT_PARTS = new Set(["option", "thumb"]);

function litPart(node: Element, root: HTMLElement): HTMLElement | null {
  const part = node.closest<HTMLElement>("[data-sprint-part]");
  if (part === null || !root.contains(part)) return null;
  const name = part.dataset.sprintPart;
  return name !== undefined && LIT_PARTS.has(name) ? part : null;
}

function glossTarget(node: EventTarget | null): HTMLElement | null {
  if (!(node instanceof Element)) return null;
  const root = node.closest<HTMLElement>("[data-sprint]");
  if (root === null) return null;
  const name = root.dataset.sprint;
  if (name === undefined || !GLOSSY.has(name)) return null;
  return litPart(node, root) ?? root;
}

export function trackGloss(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType === "touch" || stilled()) return;
  const target = glossTarget(event.target);
  if (target === null) return;
  const box = target.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) return;
  const x = clamp(((event.clientX - box.left) / box.width) * 100, X_MIN, X_MAX);
  const offset = (x - 50) / FADE_SPAN;
  target.style.setProperty(GLOSS_X, `${x.toFixed(1)}%`);
  target.style.setProperty(
    GLOSS_FADE,
    clamp(1 - Math.abs(offset), FADE_FLOOR, 1).toFixed(3),
  );
  target.style.setProperty(CAST_SHIFT, `${(offset * -CAST_TRAVEL).toFixed(1)}px`);
}

export function releaseGloss(event: ReactPointerEvent<HTMLElement>) {
  const target = glossTarget(event.target);
  if (target === null) return;
  target.style.removeProperty(GLOSS_X);
  target.style.removeProperty(GLOSS_FADE);
  target.style.removeProperty(CAST_SHIFT);
  if (target.style.length === 0) target.removeAttribute("style");
}
