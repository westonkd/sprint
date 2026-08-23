import { isValidElement, type ReactNode } from "react";
import { COMPONENT_ATTRIBUTE } from "@/agent/attributes.ts";

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

interface TextualProps {
  children?: ReactNode;
  "aria-hidden"?: boolean | string;
  "aria-label"?: string;
}

function gatherReact(node: ReactNode, out: string[]): void {
  if (node === null || node === undefined || typeof node === "boolean") return;

  if (typeof node === "string" || typeof node === "number") {
    out.push(String(node));
    return;
  }

  if (Array.isArray(node)) {
    for (const child of node) gatherReact(child as ReactNode, out);
    return;
  }

  if (!isValidElement(node)) return;

  const props = node.props as TextualProps;
  if (props["aria-hidden"] === true || props["aria-hidden"] === "true") return;
  if (typeof props["aria-label"] === "string") {
    out.push(props["aria-label"]);
    return;
  }

  gatherReact(props.children, out);
}

export function reactText(node: ReactNode): string | undefined {
  const parts: string[] = [];
  gatherReact(node, parts);
  const text = normalize(parts.join(""));
  return text === "" ? undefined : text;
}

function isHidden(element: Element): boolean {
  return (
    element.getAttribute("aria-hidden") === "true" || element.hasAttribute("hidden")
  );
}

function gather(node: Node, out: string[], depth: number): void {
  if (node.nodeType === Node.TEXT_NODE) {
    out.push(node.nodeValue ?? "");
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const element = node as Element;
  if (isHidden(element)) return;
  if (depth > 0 && element.hasAttribute(COMPONENT_ATTRIBUTE)) return;

  const label = element.getAttribute("aria-label");
  if (depth > 0 && label !== null) {
    out.push(label);
    return;
  }

  for (const child of Array.from(element.childNodes)) {
    gather(child, out, depth + 1);
  }
}

export function accessibleText(element: Element): string | undefined {
  const label = element.getAttribute("aria-label");
  if (label !== null) {
    const direct = normalize(label);
    return direct === "" ? undefined : direct;
  }

  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy !== null) {
    const root = element.ownerDocument;
    const referenced = labelledBy
      .split(/\s+/)
      .filter((id) => id !== "")
      .map((id) => root.getElementById(id))
      .filter((target): target is HTMLElement => target !== null)
      .map((target) => accessibleText(target) ?? "")
      .filter((text) => text !== "");
    if (referenced.length > 0) return normalize(referenced.join(" "));
  }

  const parts: string[] = [];
  gather(element, parts, 0);
  const text = normalize(parts.join(""));
  return text === "" ? undefined : text;
}
