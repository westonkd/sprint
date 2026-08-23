import type { AgentNode, AgentPart, AgentStateValue } from "./node.ts";
import { isEmptyNode } from "./node.ts";

export interface MarkdownOptions {
  includeSummary?: boolean;
}

function formatState(state: Record<string, AgentStateValue>): string {
  const keys = Object.keys(state).sort();
  if (keys.length === 0) return "";

  const rendered = keys.map((key) => {
    const value = state[key];
    return value === true ? key : `${key}=${value}`;
  });

  return ` [${rendered.join(", ")}]`;
}

function formatLabel(label: string | undefined): string {
  return label === undefined ? "" : ` "${label}"`;
}

function formatTool(tool: string | undefined): string {
  return tool === undefined ? "" : ` → tool \`${tool}\``;
}

function partLine(part: AgentPart, indent: string): string {
  return `${indent}- part \`${part.part}\`${formatLabel(part.label)}${formatState(
    part.state,
  )}${formatTool(part.tool)}`;
}

export function nodeLine(node: AgentNode): string {
  const suffix = isEmptyNode(node) ? " (empty)" : "";
  const owned = node.owner === undefined ? "" : ` (owned by \`${node.owner}\`)`;
  return `- **${node.component}**${formatLabel(node.label)}${formatState(
    node.state,
  )}${formatTool(node.tool)}${owned}${suffix}`;
}

function nodeLines(
  node: AgentNode,
  indent: string,
  options: Required<MarkdownOptions>,
): string[] {
  const lines = [`${indent}${nodeLine(node)}`];

  const inner = `${indent}  `;

  if (options.includeSummary && node.summary !== undefined) {
    lines.push(`${inner}${node.summary}`);
  }

  for (const part of node.parts) {
    lines.push(partLine(part, inner));
  }

  for (const child of node.children) {
    lines.push(...nodeLines(child, inner, options));
  }

  if (node.truncated) {
    lines.push(`${inner}- … nested components omitted, depth limit reached`);
  }

  return lines;
}

export function toMarkdown(
  input: AgentNode | readonly AgentNode[],
  options: MarkdownOptions = {},
): string {
  const nodes = Array.isArray(input) ? input : [input as AgentNode];
  const resolved: Required<MarkdownOptions> = {
    includeSummary: options.includeSummary ?? true,
  };

  if (nodes.length === 0) return "No Sprint components found.";

  return nodes.flatMap((node) => nodeLines(node, "", resolved)).join("\n");
}
