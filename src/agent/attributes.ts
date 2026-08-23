export const COMPONENT_ATTRIBUTE = "data-sprint";
export const PART_ATTRIBUTE = "data-sprint-part";
export const STATE_ATTRIBUTE_PREFIX = "data-sprint-";
export const TOOL_ATTRIBUTE = "data-sprint-tool";
export const OWNER_ATTRIBUTE = "data-sprint-owner";
export const AGENT_ATTRIBUTE = "data-sprint-agent";
export const VIEW_ATTRIBUTE = "data-sprint-view";
export const VIEW_COPY_ATTRIBUTE = "data-sprint-view-copy";
export const THEME_ATTRIBUTE = "data-sprint-theme";

export const RESERVED_STATE_KEYS: readonly string[] = [
  "part",
  "tool",
  "owner",
  "agent",
  "view",
  "view-copy",
  "theme",
];

export type AgentAttributeValue = string | number | boolean | null | undefined;

export interface AgentAttributeOptions {
  part?: string;
  state?: Record<string, AgentAttributeValue>;
}

export function agentAttributes(
  component: string,
  options: AgentAttributeOptions = {},
): Record<string, string> {
  const attributes: Record<string, string> = {
    [COMPONENT_ATTRIBUTE]: component,
  };

  if (options.part) {
    attributes[PART_ATTRIBUTE] = options.part;
  }

  for (const [key, value] of Object.entries(options.state ?? {})) {
    if (value === null || value === undefined || value === false) continue;
    attributes[`${STATE_ATTRIBUTE_PREFIX}${key}`] = value === true ? "" : String(value);
  }

  return attributes;
}

export function agentSelector(component: string, part?: string): string {
  const base = `[${COMPONENT_ATTRIBUTE}="${component}"]`;
  return part ? `${base} [${PART_ATTRIBUTE}="${part}"]` : base;
}
