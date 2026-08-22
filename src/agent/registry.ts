import {
  COMPONENT_ATTRIBUTE,
  PART_ATTRIBUTE,
  STATE_ATTRIBUTE_PREFIX,
} from "./attributes.ts";
import type { AgentComponentMeta, AgentManifest } from "./types.ts";

const registry = new Map<string, AgentComponentMeta>();

export function defineAgentMeta<const T extends AgentComponentMeta>(meta: T): T {
  if (registry.has(meta.name)) {
    throw new Error(`Duplicate agent metadata registered for "${meta.name}"`);
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
    },
    components: listAgentMeta(),
  };
}
