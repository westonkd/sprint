import type { AgentToolSpec } from "@/agent/types.ts";

export const SET_SWITCH_TOOL: AgentToolSpec = {
  verb: "set",
  description:
    "Switch this setting on or off by stating the end state, exactly as a person clicking it would. The change takes effect immediately. Setting the state it already has succeeds and changes nothing, so the call is safe to retry. Returns the switch's state after the call.",
  inputSchema: {
    type: "object",
    properties: {
      on: {
        type: "boolean",
        description: "The end state: true leaves the switch on, false leaves it off.",
      },
    },
    required: ["on"],
  },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The switch is mounted, enabled, has a resolvable label, and no other component claims the same tool name.",
  unregisteredWhen: "The switch unmounts or becomes disabled.",
};
