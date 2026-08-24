import { defineAgentMeta } from "@/agent/registry.ts";
import { SET_CHECKBOX_TOOL } from "./tool.ts";

export const checkboxMeta = defineAgentMeta({
  name: "Checkbox",
  category: "input",
  summary:
    "A single on/off choice recorded as form data. It registers one set tool that takes the end state rather than toggling.",
  whenToUse:
    "Use it for a boolean a form will submit: accepting terms, opting in, including something in a request. The set tool takes checked as true or false, so an agent states the end state and never has to read before writing.",
  whenNotToUse:
    "Do not use it for a setting that takes effect the moment it changes; that is a Switch. Do not use it for choosing one of several options, which is a SegmentedControl or a Select.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'What checking it means. Names the box for a screen reader and derives the tool name, so prefer a statement such as "Accept the terms".',
      required: true,
    },
    checked: {
      kind: "boolean",
      description: "Whether the box is checked. The box is fully controlled.",
      required: true,
    },
    onChange: {
      kind: "handler",
      description:
        "Called with the new checked state. The set tool drives a real click, so this runs for agent changes too.",
      required: true,
    },
    hint: {
      kind: "string",
      description:
        "Guidance shown under the box and carried into the agent view. Replaced by error while one is set.",
    },
    error: {
      kind: "string",
      description:
        "A validation message. Marks the box invalid for people, screen readers, and agents alike.",
    },
    name: {
      kind: "string",
      description: "The native form name submitted with the surrounding form.",
    },
    disabled: {
      kind: "boolean",
      description: "Disable the box and unregister its set tool.",
      default: false,
    },
    required: {
      kind: "boolean",
      description: "Mark the box as one that must be checked.",
      default: false,
    },
    agentName: {
      kind: "string",
      description:
        "Override the label used to derive the tool name, when two boxes on a page would otherwise collide.",
    },
    agentTool: {
      kind: "boolean",
      description: "Set false to render the box without registering a set tool.",
      default: true,
    },
  },
  state: {
    checked: {
      description: "Present while the box is checked.",
      attribute: "data-sprint-checked",
    },
    disabled: {
      description: "Present when the box cannot be changed.",
      attribute: "data-sprint-disabled",
    },
    required: {
      description: "Present when the box must be checked.",
      attribute: "data-sprint-required",
    },
    invalid: {
      description: "Present while an error is set.",
      attribute: "data-sprint-invalid",
    },
  },
  tools: {
    set: SET_CHECKBOX_TOOL,
  },
  agentView: {
    example:
      '- **Checkbox** "Accept the terms" [required] → tool `set-accept-the-terms`\n  - part `error` "Required before launch"',
  },
  examples: [
    {
      title: "A consent box",
      description:
        "In agent view the box renders as one control; pressing it toggles, while the set tool states the end state.",
      code: '<Checkbox\n  label="Accept the terms"\n  checked={accepted}\n  onChange={setAccepted}\n  required\n/>',
    },
    {
      title: "An error on a required box",
      description: "The error marks the box invalid on every surface until it clears.",
      code: '<Checkbox\n  label="Confirm the manifest"\n  checked={confirmed}\n  onChange={setConfirmed}\n  required\n  error="Confirm before launch."\n/>',
    },
    {
      title: "A disabled box",
      description:
        "Disabled unregisters the tool, so an agent cannot change what a person could not.",
      code: '<Checkbox\n  label="Telemetry"\n  checked\n  disabled\n  onChange={setTelemetry}\n/>',
    },
  ],
  a11y: {
    role: "checkbox",
    keyboard: ["Space toggles", "Tab moves through the box"],
    notes:
      "A native checkbox input wrapped by its label, visually replaced by a keylined square. Focus draws an offset keyline around the square; errors set aria-invalid and link with aria-describedby.",
  },
});
