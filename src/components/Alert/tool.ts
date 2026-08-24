import type { AgentToolSpec } from "@/agent/types.ts";

export const DISMISS_ALERT_TOOL: AgentToolSpec = {
  verb: "dismiss",
  description:
    "Dismiss this alert, exactly as a person clicking its dismiss control would. The page decides what dismissal means, usually removing the message. Returns the alert's state after the dismissal, or says the alert left the page.",
  inputSchema: { type: "object", properties: {} },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The alert is mounted, has an onDismiss handler, and label or agentName provides a stable name.",
  unregisteredWhen: "The alert unmounts or loses its onDismiss handler.",
};
