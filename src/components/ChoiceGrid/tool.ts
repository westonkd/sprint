import type { AgentToolSpec } from "@/agent/types.ts";

export const CHOOSE_TOOL: AgentToolSpec = {
  verb: "choose",
  description:
    "Choose one of this grid's options by its visible label, exactly as a person pressing it would. In submit mode the choice submits the surrounding form with the option's value, so it can navigate away; in select mode it replaces the current selection. Returns the grid's state after the choice.",
  inputSchema: {
    type: "object",
    properties: {
      option: {
        type: "string",
        description:
          "The visible label of the option to choose, as shown under its glyph.",
      },
    },
    required: ["option"],
  },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The grid is mounted, enabled, has a resolvable label, agentTool is not false, and no other component claims the same tool name. The registered schema enumerates the current option labels.",
  unregisteredWhen: "The grid unmounts, becomes disabled, or agentTool turns false.",
};
