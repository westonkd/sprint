import type { AgentToolSpec } from "@/agent/types.ts";

export const SELECT_RADIO_TOOL: AgentToolSpec = {
  verb: "select",
  description:
    "Select one of this group's options by its visible label, exactly as a person clicking its radio button would. Only one option is selected at a time, so this replaces the current one. Returns the group's state after the change.",
  inputSchema: {
    type: "object",
    properties: {
      option: {
        type: "string",
        description: "The visible label of the option to select.",
      },
    },
    required: ["option"],
  },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The group is mounted and enabled, has at least one enabled option, and no other component claims the same tool name. The registered schema enumerates the enabled options' labels.",
  unregisteredWhen:
    "The group unmounts, becomes disabled, or loses its last enabled option.",
};
