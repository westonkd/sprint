export type AgentStateValue = string | true;

export interface AgentPart {
  part: string;
  label?: string;
  state: Record<string, AgentStateValue>;
  tool?: string;
}

export interface AgentNode {
  component: string;
  summary?: string;
  label?: string;
  state: Record<string, AgentStateValue>;
  parts: AgentPart[];
  tool?: string;
  owner?: string;
  children: AgentNode[];
  truncated?: true;
}

export type AgentFormatter = (nodes: readonly AgentNode[]) => string;

export function isEmptyNode(node: AgentNode): boolean {
  return (
    node.label === undefined && node.parts.length === 0 && node.children.length === 0
  );
}

export function countNodes(nodes: readonly AgentNode[]): number {
  let total = 0;
  for (const node of nodes) {
    total += 1 + countNodes(node.children);
  }
  return total;
}

export function collectTools(nodes: readonly AgentNode[]): string[] {
  const names: string[] = [];
  for (const node of nodes) {
    if (node.tool) names.push(node.tool);
    for (const part of node.parts) {
      if (part.tool) names.push(part.tool);
    }
    names.push(...collectTools(node.children));
  }
  return names;
}
