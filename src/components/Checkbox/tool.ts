import type { AgentToolSpec } from "@/agent/types.ts";

export const SET_CHECKBOX_TOOL: AgentToolSpec = {
  verb: "set",
  description:
    "Check or uncheck this box by stating the end state, exactly as a person clicking it would. Setting the state it already has succeeds and changes nothing, so the call is safe to retry. Returns the box's state after the call, so a follow-up read is unnecessary.",
  inputSchema: {
    type: "object",
    properties: {
      checked: {
        type: "boolean",
        description:
          "The end state: true leaves the box checked, false leaves it unchecked.",
      },
    },
    required: ["checked"],
  },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The box is mounted, enabled, has a resolvable label, and no other component claims the same tool name.",
  unregisteredWhen: "The box unmounts or becomes disabled.",
};
