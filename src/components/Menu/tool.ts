import type { AgentToolSpec } from "@/agent/types.ts";

export const CHOOSE_MENU_TOOL: AgentToolSpec = {
  verb: "choose",
  description:
    "Choose one item from this menu by its visible label, exactly as a person opening the menu and pressing the item would. The menu does not need to be open. Items that are links are not offered; reach them by their href. Returns the menu's state after the choice, so a follow-up read is usually unnecessary.",
  inputSchema: {
    type: "object",
    properties: {
      item: {
        type: "string",
        description: "The visible label of the item to choose.",
      },
    },
    required: ["item"],
  },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The menu is mounted and enabled, has at least one enabled item without an href, and no other component claims the same tool name. The registered schema enumerates those items' labels.",
  unregisteredWhen:
    "The menu unmounts, becomes disabled, or its last enabled item without an href is removed or disabled.",
};
