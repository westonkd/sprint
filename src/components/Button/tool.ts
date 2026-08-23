import type { AgentToolSpec } from "../../agent/types.ts";

export const PRESS_TOOL: AgentToolSpec = {
  verb: "press",
  description:
    "Press this button, exactly as a person clicking it would. Returns the button's state after the press, so a follow-up read is usually unnecessary. Any work the press starts is not waited for; if the button enters a loading state the result says so.",
  inputSchema: { type: "object", properties: {} },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The button is mounted, enabled, not loading, has a resolvable label, and no other component claims the same tool name.",
  unregisteredWhen: "The button unmounts, becomes disabled, or starts loading.",
};
