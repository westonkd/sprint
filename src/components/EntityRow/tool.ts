import type { AgentToolSpec } from "@/agent/types.ts";

export const OPEN_ENTITY_ROW_TOOL: AgentToolSpec = {
  verb: "open",
  description:
    "Open this row, exactly as a person clicking it would. What opening does is the row's own business: it may select the record, reveal its detail, or start a flow. Returns the row's state after the click.",
  inputSchema: { type: "object", properties: {} },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The row acts rather than navigates, is mounted, enabled, has a resolvable title, and no other component claims the same tool name.",
  unregisteredWhen:
    "The row unmounts, becomes disabled, or turns into a link by taking an href.",
};
