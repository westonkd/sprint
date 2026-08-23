import type { AgentToolSpec } from "@/agent/types.ts";

export const SELECT_TOOL: AgentToolSpec = {
  verb: "select",
  description:
    "Select one of this control's options by its visible label, exactly as a person clicking it would. Only one option is selected at a time, so this replaces the current one. Returns the control's state after the change, so a follow-up read is unnecessary.",
  inputSchema: {
    type: "object",
    properties: {
      option: {
        type: "string",
        description:
          "The visible label of the option to select, as shown on the control.",
      },
    },
    required: ["option"],
  },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The control is mounted, enabled, has a resolvable label, and no other component claims the same tool name. The registered schema enumerates the current option labels.",
  unregisteredWhen: "The control unmounts or becomes disabled.",
};
