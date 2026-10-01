import type { AgentToolSpec } from "@/agent/types.ts";

export const EXPAND_DISCLOSURE_TOOL: AgentToolSpec = {
  verb: "expand",
  description:
    "Expand or collapse this region for the person viewing the page, by stating the end state, exactly as a person pressing its toggle would. The content is already readable in the agent view either way, so call this only to change what a person sees. Setting the state it already has succeeds and changes nothing. Returns the region's state after the call.",
  inputSchema: {
    type: "object",
    properties: {
      expanded: {
        type: "boolean",
        description: "The end state: true reveals the region, false conceals it.",
      },
    },
    required: ["expanded"],
  },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The disclosure is mounted, has a resolvable label, and no other component claims the same tool name.",
  unregisteredWhen: "The disclosure unmounts or agentTool is set false.",
};
