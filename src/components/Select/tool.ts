import type { AgentToolSpec } from "@/agent/types.ts";

export const SELECT_OPTION_TOOL: AgentToolSpec = {
  verb: "select",
  description:
    "Choose one of this dropdown's options by its visible label, exactly as a person opening it and clicking one would. Only one option is chosen at a time, so this replaces the current choice. Returns the dropdown's state after the change, so a follow-up read is unnecessary.",
  inputSchema: {
    type: "object",
    properties: {
      option: {
        type: "string",
        description:
          "The visible label of the option to choose, as a person reads it in the list.",
      },
    },
    required: ["option"],
  },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The dropdown is mounted, enabled, has a resolvable label, and no other component claims the same tool name. The registered schema enumerates the current option labels.",
  unregisteredWhen: "The dropdown unmounts or becomes disabled.",
};
