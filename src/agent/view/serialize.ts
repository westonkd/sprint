import {
  COMPONENT_ATTRIBUTE,
  OWNER_ATTRIBUTE,
  PART_ATTRIBUTE,
  RESERVED_STATE_KEYS,
  STATE_ATTRIBUTE_PREFIX,
  TOOL_ATTRIBUTE,
} from "@/agent/attributes.ts";
import { getAgentMeta } from "@/agent/registry.ts";
import type { AgentComponentMeta } from "@/agent/types.ts";
import type { AgentNode, AgentPart, AgentStateValue } from "./node.ts";
import { accessibleText } from "./text.ts";

const reserved = new Set(RESERVED_STATE_KEYS);

const NATIVE_BOOLEAN_STATE: ReadonlyMap<string, string> = new Map([
  ["disabled", "disabled"],
  ["open", "open"],
  ["readonly", "readonly"],
  ["required", "required"],
]);

const ARIA_STATE: ReadonlyMap<string, string> = new Map([
  ["aria-disabled", "disabled"],
  ["aria-busy", "loading"],
  ["aria-expanded", "expanded"],
  ["aria-checked", "checked"],
  ["aria-selected", "selected"],
  ["aria-pressed", "pressed"],
  ["aria-invalid", "invalid"],
]);

export interface SerializeOptions {
  maxDepth?: number;
  lookupMeta?: (name: string) => AgentComponentMeta | undefined;
}

function readState(element: Element): Record<string, AgentStateValue> {
  const state: Record<string, AgentStateValue> = {};

  for (const [attribute, key] of ARIA_STATE) {
    const value = element.getAttribute(attribute);
    if (value === null || value === "false") continue;
    state[key] = value === "true" || value === "" ? true : value;
  }

  for (const [attribute, key] of NATIVE_BOOLEAN_STATE) {
    if (element.hasAttribute(attribute)) state[key] = true;
  }

  for (const attribute of Array.from(element.attributes)) {
    if (!attribute.name.startsWith(STATE_ATTRIBUTE_PREFIX)) continue;
    const key = attribute.name.slice(STATE_ATTRIBUTE_PREFIX.length);
    if (key === "" || reserved.has(key)) continue;
    state[key] = attribute.value === "" ? true : attribute.value;
  }

  return state;
}

function scan(root: Element): { parts: Element[]; children: Element[] } {
  const parts: Element[] = [];
  const children: Element[] = [];

  const walk = (element: Element): void => {
    for (const child of Array.from(element.children)) {
      if (child.hasAttribute(COMPONENT_ATTRIBUTE)) {
        children.push(child);
        continue;
      }
      if (child.hasAttribute(PART_ATTRIBUTE)) parts.push(child);
      walk(child);
    }
  };

  walk(root);
  return { parts, children };
}

function toPart(element: Element): AgentPart {
  const name = element.getAttribute(PART_ATTRIBUTE) ?? "";
  const label = accessibleText(element);
  const tool = element.getAttribute(TOOL_ATTRIBUTE);
  return {
    part: name,
    state: readState(element),
    ...(label === undefined ? {} : { label }),
    ...(tool === null || tool === "" ? {} : { tool }),
  };
}

export function serializeElement(
  root: Element,
  options: SerializeOptions = {},
): AgentNode | null {
  const component = root.getAttribute(COMPONENT_ATTRIBUTE);
  if (component === null) return null;

  const maxDepth = options.maxDepth ?? 8;
  const lookupMeta = options.lookupMeta ?? getAgentMeta;

  const { parts, children } = scan(root);
  const label = accessibleText(root);
  const summary = lookupMeta(component)?.summary;
  const tool = root.getAttribute(TOOL_ATTRIBUTE);
  const owner = root.getAttribute(OWNER_ATTRIBUTE);
  const exhausted = maxDepth <= 0 && children.length > 0;

  return {
    component,
    state: readState(root),
    parts: parts.map(toPart),
    children: exhausted
      ? []
      : children
          .map((child) =>
            serializeElement(child, { ...options, maxDepth: maxDepth - 1 }),
          )
          .filter((node): node is AgentNode => node !== null),
    ...(summary === undefined ? {} : { summary }),
    ...(label === undefined ? {} : { label }),
    ...(tool === null || tool === "" ? {} : { tool }),
    ...(owner === null || owner === "" ? {} : { owner }),
    ...(exhausted ? { truncated: true as const } : {}),
  };
}

function topLevelRoots(root: ParentNode): Element[] {
  const found: Element[] = [];

  const walk = (element: ParentNode): void => {
    for (const child of Array.from(element.children)) {
      if (child.hasAttribute(COMPONENT_ATTRIBUTE)) {
        found.push(child);
        continue;
      }
      walk(child);
    }
  };

  walk(root);
  return found;
}

function reattachOwned(nodes: AgentNode[]): AgentNode[] {
  const owned = nodes.filter((node) => node.owner !== undefined);
  if (owned.length === 0) return nodes;

  const byTool = new Map<string, AgentNode>();
  const index = (node: AgentNode): void => {
    if (node.tool) byTool.set(node.tool, node);
    for (const part of node.parts) {
      if (part.tool) byTool.set(part.tool, node);
    }
    for (const child of node.children) index(child);
  };
  for (const node of nodes) index(node);

  const attached = new Set<AgentNode>();
  for (const node of owned) {
    const host = node.owner === undefined ? undefined : byTool.get(node.owner);
    if (host === undefined || host === node) continue;
    host.children.push(node);
    attached.add(node);
  }

  return nodes.filter((node) => !attached.has(node));
}

export function serializeWithin(
  root: ParentNode,
  options: SerializeOptions = {},
): AgentNode[] {
  const nodes = topLevelRoots(root)
    .map((element) => serializeElement(element, options))
    .filter((node): node is AgentNode => node !== null);
  return reattachOwned(nodes);
}
