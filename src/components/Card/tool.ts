import type { AgentToolSpec } from "@/agent/types.ts";

export const OPEN_CARD_TOOL: AgentToolSpec = {
  verb: "open",
  description:
    "Open this card, exactly as a person clicking it would. What opening does is the card's own business: it may reveal detail in place, select this item, or start a flow. Returns the card's state after the click.",
  inputSchema: { type: "object", properties: {} },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The card acts rather than navigates, is mounted, enabled, has a resolvable label, and no other component claims the same tool name.",
  unregisteredWhen:
    "The card unmounts, becomes disabled, or turns into a link by taking an href.",
};
