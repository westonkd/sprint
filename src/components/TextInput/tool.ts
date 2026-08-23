import type { AgentToolSpec } from "@/agent/types.ts";

export const FILL_TOOL: AgentToolSpec = {
  verb: "fill",
  description:
    "Replace this field's text with the value provided, exactly as a person typing it would. The value is the full text the field ends up containing; pass an empty string to clear it. Returns the field's state after the change, so a follow-up read is unnecessary.",
  inputSchema: {
    type: "object",
    properties: {
      value: {
        type: "string",
        description:
          "The full text the field should contain afterwards. Replaces the current text rather than appending to it.",
      },
    },
    required: ["value"],
  },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The field is mounted, enabled, has a resolvable label, and no other component claims the same tool name.",
  unregisteredWhen: "The field unmounts or becomes disabled.",
};
