import { COMPONENT_ATTRIBUTE } from "@/agent/attributes.ts";

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
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
