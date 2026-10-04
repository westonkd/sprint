import type { AgentToolSpec } from "@/agent/types.ts";

export const CHOOSE_COMBOBOX_TOOL: AgentToolSpec = {
  verb: "choose",
  description:
    "Choose an option in this searchable field. Pass an option's exact label to select it. Pass part of a label to search: one match is selected, several are listed back so you can call again with the exact label. Pass an empty string to clear a field that allows clearing. Returns the field's state after the change.",
  inputSchema: {
    type: "object",
    properties: {
      option: {
        type: "string",
        description:
          "An exact option label, a search for one, or an empty string to clear the field.",
      },
    },
    required: ["option"],
  },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The field is mounted and enabled, has a resolvable label, and no other component claims the same tool name.",
  unregisteredWhen: "The field unmounts or becomes disabled.",
};
