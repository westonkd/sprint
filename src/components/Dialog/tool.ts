import type { AgentToolSpec } from "@/agent/types.ts";

export const CLOSE_DIALOG_TOOL: AgentToolSpec = {
  verb: "close",
  description:
    "Close this dialog without taking its action, exactly as pressing its close control or Escape would. Anything entered inside the dialog may be discarded by the page. To take the dialog's action instead, use the tools its contents register while it is open.",
  inputSchema: { type: "object", properties: {} },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The dialog is open. A closed dialog renders nothing and has no tools.",
  unregisteredWhen: "The dialog closes or unmounts.",
};
