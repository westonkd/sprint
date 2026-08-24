import { defineAgentMeta } from "@/agent/registry.ts";
import { DISMISS_ALERT_TOOL } from "./tool.ts";

export const alertMeta = defineAgentMeta({
  name: "Alert",
  category: "feedback",
  summary:
    "A status message for the outcome of something that already happened: a notice, a warning, or a failure.",
  whenToUse:
    'Use to report the result of an action or a condition the person did not just cause: "check your inbox", "invalid credentials", "this key expires soon". Use tone="danger" for failures, "warning" for conditions needing attention, "info" for neutral notices, and "neutral" for quiet confirmations. Pass onDismiss when the message can be acknowledged and cleared.',
  whenNotToUse:
    "Do not use for validation on a specific field; the field's own error prop places the message where the problem is. Do not use for confirmation of an action the person is about to take; that is a Dialog.",
  status: "experimental",
  props: {
    children: {
      kind: "node",
      description:
        "The message. Inline content only; it is flattened to text for the agent view.",
      required: true,
    },
    label: {
      kind: "string",
      description:
        "A short uppercase title above the message. Also derives the dismiss tool name, so prefer a stable phrase.",
    },
    tone: {
      kind: "enum",
      description:
        "The message's severity. Danger and warning announce assertively; info and neutral announce politely.",
      values: ["neutral", "info", "warning", "danger"],
      default: "info",
    },
    onDismiss: {
      kind: "handler",
      description:
        "Called when the dismiss control is pressed. Providing it renders the control and registers the dismiss tool; the page owns removing the alert.",
    },
    agentName: {
      kind: "string",
      description:
        "Override the label used to derive the dismiss tool name. Required for a dismissible alert with no label.",
    },
    agentTool: {
      kind: "boolean",
      description:
        "Set false to render a dismissible alert without registering a tool.",
      default: true,
    },
  },
  state: {
    tone: {
      description: "The alert's severity.",
      attribute: "data-sprint-tone",
      values: ["neutral", "info", "warning", "danger"],
    },
    dismissible: {
      description: "Present when the alert has a dismiss control.",
      attribute: "data-sprint-dismissible",
    },
  },
  tools: {
    dismiss: DISMISS_ALERT_TOOL,
  },
  agentView: {
    example: '- **Alert** "Check your inbox" [dismissible, tone=info]',
  },
  examples: [
    {
      title: "A sign-in notice",
      description: "The default info tone for a neutral status message.",
      code: '<Alert label="Check your inbox">We sent a sign-in link to nomad@escadrille.test.</Alert>',
    },
    {
      title: "A dismissible confirmation",
      description:
        "Providing onDismiss renders the dismiss control and registers the dismiss tool. Removing the alert is the page's job.",
      code: '<Alert tone="neutral" label="Key revoked" onDismiss={acknowledge}>The key can no longer authenticate.</Alert>',
    },
    {
      title: "A failure",
      description: "Danger announces assertively via role=alert.",
      code: '<Alert tone="danger" label="Sign-in failed">Wrong callsign or access code.</Alert>',
    },
  ],
  a11y: {
    role: "status",
    notes:
      "Danger and warning render role=alert and announce assertively; info and neutral render role=status. The dismiss control is a labelled button. Render the alert when the condition occurs rather than toggling its visibility, or the announcement is lost.",
  },
});
