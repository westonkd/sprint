import type { AgentToolSpec } from "@/agent/types.ts";

export const SELECT_TAB_TOOL: AgentToolSpec = {
  verb: "select",
  description:
    "Show one of these tabs by its visible label, exactly as a person clicking the tab would. Only the selected tab's panel is on the page, so read the page again after switching to see its contents. Returns the tabs' state after the change.",
  inputSchema: {
    type: "object",
    properties: {
      tab: {
        type: "string",
        description: "The visible label of the tab to show.",
      },
    },
    required: ["tab"],
  },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The tabs are mounted, at least one tab is enabled, and no other component claims the same tool name. The registered schema enumerates the enabled tabs' labels.",
  unregisteredWhen: "The tabs unmount or every tab is disabled.",
};
