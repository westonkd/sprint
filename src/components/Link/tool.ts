import type { AgentToolSpec } from "@/agent/types.ts";

export const OPEN_LINK_TOOL: AgentToolSpec = {
  verb: "open",
  description:
    "Follow this link and load its destination, exactly as a person clicking it would. The current page is replaced, so anything unsaved on it is lost and any tool registered by this page stops existing.",
  inputSchema: { type: "object", properties: {} },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The link opts in with agentTool, is mounted, has a resolvable label, and no other component claims the same tool name. Links register nothing by default.",
  unregisteredWhen: "The link unmounts or opts back out.",
};
