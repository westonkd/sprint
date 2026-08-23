import "./styles/primitives.css";
import "./styles/semantic.css";
import "./styles/base.css";

export type {
  AgentAttributeOptions,
  AgentAttributeValue,
} from "./agent/attributes.ts";
export {
  AGENT_ATTRIBUTE,
  agentAttributes,
  agentSelector,
  COMPONENT_ATTRIBUTE,
  OWNER_ATTRIBUTE,
  PART_ATTRIBUTE,
  RESERVED_STATE_KEYS,
  STATE_ATTRIBUTE_PREFIX,
  TOOL_ATTRIBUTE,
} from "./agent/attributes.ts";
export {
  buildAgentManifest,
  defineAgentMeta,
  getAgentMeta,
  listAgentMeta,
  TOOL_NAMING_CONVENTION,
} from "./agent/registry.ts";
export type {
  AgentActionSpec,
  AgentComponentMeta,
  AgentExample,
  AgentManifest,
  AgentPropKind,
  AgentPropSpec,
  AgentStateSpec,
  AgentToolSpec,
} from "./agent/types.ts";
export type { AgentControlProps, AgentLineProps } from "./agent/view/AgentText.tsx";
export { AgentControl, AgentLine } from "./agent/view/AgentText.tsx";
export type { MarkdownOptions } from "./agent/view/markdown.ts";
export { nodeLine, toMarkdown } from "./agent/view/markdown.ts";
export type {
  SprintAgentControls,
  SprintView,
  SprintViewValue,
} from "./agent/view/mode.ts";
export {
  defaultAgentFormat,
  useAgentControls,
  useAgentFormat,
  useSprintView,
  useSprintViewControl,
} from "./agent/view/mode.ts";
export type {
  AgentFormatter,
  AgentNode,
  AgentPart,
  AgentStateValue,
} from "./agent/view/node.ts";
export type { NodeInput } from "./agent/view/project.ts";
export {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "./agent/view/project.ts";
export type { SerializeOptions } from "./agent/view/serialize.ts";
export { serializeElement, serializeWithin } from "./agent/view/serialize.ts";
export { clamp, paginate } from "./agent/view/truncate.ts";
export {
  getModelContext,
  isModelContextAvailable,
  PARAM_DESCRIPTION_LIMIT,
  registerTool,
  TOOL_DESCRIPTION_LIMIT,
  TOOL_OUTPUT_LIMIT,
  validateInputs,
} from "./agent/webmcp/adapter.ts";
export { afterCommit } from "./agent/webmcp/afterCommit.ts";
export type { AgentScopeValue } from "./agent/webmcp/scope.ts";
export {
  AgentScopeProvider,
  slug,
  toolName,
  useAgentScope,
} from "./agent/webmcp/scope.ts";
export type {
  JsonSchemaObject,
  JsonSchemaProperty,
  JsonSchemaType,
  ModelContext,
  ToolAnnotations,
  ToolDescriptor,
  ToolExecuteContext,
} from "./agent/webmcp/types.ts";
export type { UseAgentToolOptions } from "./agent/webmcp/useAgentTool.ts";
export { useAgentTool } from "./agent/webmcp/useAgentTool.ts";
export * from "./components/index.ts";
export type {
  AgentRegionProps,
  SprintProviderProps,
} from "./provider/SprintProvider.tsx";
export { AgentRegion, SprintProvider } from "./provider/SprintProvider.tsx";
export { version } from "./version.ts";
