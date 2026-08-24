import { defineAgentMeta } from "@/agent/registry.ts";
import { SET_SWITCH_TOOL } from "./tool.ts";

export const switchMeta = defineAgentMeta({
  name: "Switch",
  category: "input",
  summary:
    "An on/off setting that takes effect the moment it changes. It registers one set tool that takes the end state rather than toggling.",
  whenToUse:
    "Use it for a live setting: enabling telemetry, muting alerts, switching a feed. The set tool takes on as true or false, so an agent states the end state and never has to read before writing.",
  whenNotToUse:
    "Do not use it for a boolean a form will submit later; that is a Checkbox, and the distinction is when the change takes effect. Do not use it to choose between two named modes a person should see side by side, which is a SegmentedControl.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'What the setting controls. Names the switch for a screen reader and derives the tool name, so prefer a noun phrase such as "Live telemetry".',
      required: true,
    },
    on: {
      kind: "boolean",
      description: "Whether the setting is on. The switch is fully controlled.",
      required: true,
    },
    onChange: {
      kind: "handler",
      description:
        "Called with the new state. The set tool drives a real click, so this runs for agent changes too.",
      required: true,
    },
    disabled: {
      kind: "boolean",
      description: "Disable the switch and unregister its set tool.",
      default: false,
    },
    agentName: {
      kind: "string",
      description:
        "Override the label used to derive the tool name, when two switches on a page would otherwise collide.",
    },
    agentTool: {
      kind: "boolean",
      description: "Set false to render the switch without registering a set tool.",
      default: true,
    },
  },
  state: {
    on: {
      description: "Present while the setting is on.",
      attribute: "data-sprint-on",
    },
    disabled: {
      description: "Present when the switch cannot be changed.",
      attribute: "data-sprint-disabled",
    },
  },
  tools: {
    set: SET_SWITCH_TOOL,
  },
  agentView: {
    example: '- **Switch** "Live telemetry" [on] → tool `set-live-telemetry`',
  },
  examples: [
    {
      title: "A live setting",
      description:
        "In agent view the switch renders as one control; pressing it toggles, while the set tool states the end state.",
      code: '<Switch label="Live telemetry" on={telemetry} onChange={setTelemetry} />',
    },
    {
      title: "A disabled switch",
      description:
        "Disabled unregisters the tool, so an agent cannot change what a person could not.",
      code: '<Switch label="Ground link" on disabled onChange={setLink} />',
    },
  ],
  a11y: {
    role: "switch",
    keyboard: ["Space toggles", "Enter toggles"],
    notes:
      "A button with role switch and aria-checked, so the label and state read together. The thumb moves by a single-axis stepped translation and respects prefers-reduced-motion.",
  },
});
