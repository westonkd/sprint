import {
  COMPONENT_ATTRIBUTE,
  OWNER_ATTRIBUTE,
  PART_ATTRIBUTE,
  REGION_ATTRIBUTE,
  STATE_ATTRIBUTE_PREFIX,
  TOOL_ATTRIBUTE,
} from "./attributes.ts";
import type { AgentComponentMeta, AgentManifest } from "./types.ts";
import { TOOL_OUTPUT_LIMIT } from "./webmcp/adapter.ts";

export const TOOL_NAMING_CONVENTION = "<scope>-<verb>-<label-slug>";

const registry = new Map<string, AgentComponentMeta>();

export function defineAgentMeta<const T extends AgentComponentMeta>(meta: T): T {
  const existing = registry.get(meta.name);
  if (existing !== undefined && existing !== meta) {
    console.warn(
      `Agent metadata for "${meta.name}" was replaced. Two components sharing a name will collapse into one manifest entry.`,
    );
  }
  registry.set(meta.name, meta);
  return meta;
}

export function getAgentMeta(name: string): AgentComponentMeta | undefined {
  return registry.get(name);
}

export function listAgentMeta(): AgentComponentMeta[] {
  return [...registry.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function buildAgentManifest(version: string): AgentManifest {
  return {
    library: "sprint",
    version,
    conventions: {
      componentAttribute: COMPONENT_ATTRIBUTE,
      partAttribute: PART_ATTRIBUTE,
      stateAttributePrefix: STATE_ATTRIBUTE_PREFIX,
      toolAttribute: TOOL_ATTRIBUTE,
      ownerAttribute: OWNER_ATTRIBUTE,
      regionAttribute: REGION_ATTRIBUTE,
      agentViewFormat: "markdown",
      toolNaming: TOOL_NAMING_CONVENTION,
      toolOutputLimit: TOOL_OUTPUT_LIMIT,
    },
    components: listAgentMeta(),
  };
}
