import type { AgentComponentMeta, NavBarGroup } from "../src/index.ts";

export type NavModel = readonly NavBarGroup[];

export const CATEGORY_ORDER = [
  "layout",
  "navigation",
  "typography",
  "display",
  "action",
  "input",
  "feedback",
  "overlay",
];

export function byCategory(
  components: readonly AgentComponentMeta[],
): [string, AgentComponentMeta[]][] {
  const groups = new Map<string, AgentComponentMeta[]>();
  for (const meta of components) {
    const list = groups.get(meta.category) ?? [];
    list.push(meta);
    groups.set(meta.category, list);
  }
  const known = CATEGORY_ORDER.filter((category) => groups.has(category));
  const rest = [...groups.keys()].filter((c) => !CATEGORY_ORDER.includes(c)).sort();
  return [...known, ...rest].map((category) => {
    const list = groups.get(category) ?? [];
    list.sort((a, b) => a.name.localeCompare(b.name));
    return [category, list];
  });
}
