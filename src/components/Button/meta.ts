import { defineAgentMeta } from "@/agent/registry.ts";
import { PRESS_TOOL } from "./tool.ts";

export const buttonMeta = defineAgentMeta({
  name: "Button",
  category: "action",
  summary:
    "A single action a person or an agent can trigger. Renders as a flat rectangular control with an uppercase monospace label.",
  whenToUse:
    'Use for any discrete action: submitting, confirming, dismissing, advancing a step. Use tone="action" with block for the one primary action in a view, tone="danger" for destructive actions, and the default neutral tone for everything else.',
  whenNotToUse:
    "Do not use for navigation between pages; use a link. Do not use for toggling a persistent on/off state; that needs a switch or a checkbox.",
  status: "experimental",
  props: {
    children: {
      kind: "node",
      description:
        'The button label. Its text also derives the WebMCP tool name, so prefer a verb phrase like "Prepare launch" over "OK".',
      required: true,
    },
    tone: {
      kind: "enum",
      description:
        "Visual and semantic weight. Acid is rationed to one primary action per view.",
      values: ["neutral", "action", "danger"],
      default: "neutral",
    },
    block: {
      kind: "boolean",
      description:
        'Render as a full-width bar. Combine with tone="action" for the primary action of a region.',
      default: false,
    },
    loading: {
      kind: "boolean",
      description:
        "Mark work in progress. Sets aria-busy, disables the control, and unregisters the press tool until it clears.",
      default: false,
    },
    disabled: {
      kind: "boolean",
      description: "Disable the control and unregister its press tool.",
      default: false,
    },
    agentName: {
      kind: "string",
      description:
        "Override the label used to derive the tool name. Set this on icon-only buttons, when two buttons would otherwise collide, and whenever the visible label contains changing values such as a count.",
    },
    agentTool: {
      kind: "boolean",
      description:
        "Set false to render the button without registering any WebMCP tool.",
      default: true,
    },
    onClick: {
      kind: "handler",
      description:
        "Standard click handler. The press tool dispatches a real click, so this runs for agent presses too.",
    },
  },
  state: {
    tone: {
      description: "The button's current tone.",
      attribute: "data-sprint-tone",
      values: ["neutral", "action", "danger"],
    },
    block: {
      description: "Present when the button renders as a full-width bar.",
      attribute: "data-sprint-block",
    },
    loading: {
      description: "Present while the button is busy.",
      attribute: "data-sprint-loading",
    },
    disabled: {
      description: "Present when the button cannot be pressed.",
      attribute: "data-sprint-disabled",
    },
  },
  tools: {
    press: PRESS_TOOL,
  },
  agentView: {
    example:
      '- **Button** "Prepare launch" [tone=action] → tool `press-prepare-launch`',
  },
  examples: [
    {
      title: "Primary action",
      description: "The one rationed acid action bar for a view.",
      code: '<Button tone="action" block onClick={prepare}>Prepare launch</Button>',
    },
    {
      title: "Destructive action",
      code: '<Button tone="danger" onClick={purge}>Purge vault</Button>',
    },
    {
      title: "Busy state",
      description:
        "While loading the press tool is unregistered, so an agent cannot double-submit.",
      code: "<Button loading={saving} onClick={save}>Save loadout</Button>",
    },
    {
      title: "Disambiguating two identical labels",
      description:
        "Without agentName both buttons would claim press-save and neither would register a tool.",
      code: '<Button agentName="Save billing">Save</Button>',
    },
    {
      title: "Keeping the tool name stable under a changing label",
      description:
        "A label carrying a value would otherwise rename the tool on every change, churning registration and staling any name an agent already holds.",
      code: '<Button agentName="Increment">Increment ({count})</Button>',
    },
  ],
  a11y: {
    role: "button",
    keyboard: ["Enter activates", "Space activates"],
    notes:
      "Loading sets aria-busy and disables the control. Focus is an offset keyline, never a rounded ring.",
  },
});
