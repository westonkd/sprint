import type { AgentToolSpec } from "@/agent/types.ts";

export const ACT_BREADCRUMB_TOOL: AgentToolSpec = {
  verb: "act",
  description:
    "Run one of this breadcrumb's trailing actions by its visible label, exactly as a person pressing it would. Only actions that do something in the page are offered; an action that is a link is reachable by its href instead. Returns the breadcrumb's state after the action, so a follow-up read is usually unnecessary.",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        description:
          "The visible label of the action to run, as shown at the end of the bar.",
      },
    },
    required: ["action"],
  },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The breadcrumb is mounted, has at least one action without an href, and no other component claims the same tool name. The registered schema enumerates those actions' labels.",
  unregisteredWhen:
    "The breadcrumb unmounts, or its last action without an href is removed.",
};
