import {
  AGENT_ATTRIBUTE,
  agentAttributes,
  TOOL_ATTRIBUTE,
} from "@/agent/attributes.ts";
import type { AgentNode, AgentPart, AgentStateValue } from "./node.ts";

export interface NodeInput {
  component: string;
  label?: string | undefined;
  summary?: string | undefined;
  tool?: string | undefined;
  owner?: string | undefined;
  state?: Record<string, AgentStateValue | false | null | undefined>;
  parts?: AgentPart[];
}

export function buildAgentNode(input: NodeInput): AgentNode {
  const state: Record<string, AgentStateValue> = {};
  for (const [key, value] of Object.entries(input.state ?? {})) {
    if (value === false || value === null || value === undefined) continue;
    state[key] = value;
  }

  return {
    component: input.component,
    state,
    parts: input.parts ?? [],
    children: [],
    ...(input.label === undefined ? {} : { label: input.label }),
    ...(input.summary === undefined ? {} : { summary: input.summary }),
    ...(input.tool === undefined ? {} : { tool: input.tool }),
    ...(input.owner === undefined ? {} : { owner: input.owner }),
  };
}

export function agentAttributesFor(node: AgentNode): Record<string, string> {
  return agentAttributes(node.component, {
    state: { ...node.state, tool: node.tool, owner: node.owner },
  });
}

export function agentControlSelector(component: string, tool?: string): string {
  return tool === undefined
    ? `[${AGENT_ATTRIBUTE}="${component}"]`
    : `[${TOOL_ATTRIBUTE}="${tool}"]`;
}

export function agentControlAttributes(node: AgentNode): Record<string, string> {
  const attributes: Record<string, string> = { [AGENT_ATTRIBUTE]: node.component };
  if (node.tool !== undefined) attributes[TOOL_ATTRIBUTE] = node.tool;
  return attributes;
}

export function agentPartAttributesFor(
  component: string,
  part: AgentPart,
): Record<string, string> {
  return agentAttributes(component, {
    part: part.part,
    state: { ...part.state, tool: part.tool },
  });
}
