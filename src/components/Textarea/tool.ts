import type { AgentToolSpec } from "@/agent/types.ts";

export const FILL_TEXTAREA_TOOL: AgentToolSpec = {
  verb: "fill",
  description:
    "Replace this text area's content with the value provided, exactly as a person typing it would. The value is the full text it ends up containing, line breaks included; pass an empty string to clear it. Returns the area's state after the change, so a follow-up read is unnecessary.",
  inputSchema: {
    type: "object",
    properties: {
      value: {
        type: "string",
        description:
          "The full text the area should contain afterwards, with real line breaks where line breaks belong. Replaces the current text.",
      },
    },
    required: ["value"],
  },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The area is mounted, enabled, has a resolvable label, and no other component claims the same tool name.",
  unregisteredWhen: "The area unmounts or becomes disabled.",
};
