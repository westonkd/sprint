import { defineAgentMeta } from "@/agent/registry.ts";
import { FILL_TOOL } from "./tool.ts";

export const textInputMeta = defineAgentMeta({
  name: "TextInput",
  category: "input",
  summary:
    "A single-line text field with its own uppercase monospace label, an optional hint, and an optional error. Fully controlled, and it registers one fill tool that replaces the field's text with an explicit value.",
  whenToUse:
    "Use it for any free-form single-line value: a name, a callsign, an email address, a search term. The label is part of the component, so a form never needs a separate label element, and the error prop is how validation reaches both a person and an agent.",
  whenNotToUse:
    "Do not use it for multi-line text, which is a Textarea. Do not use it to pick from a known set of values; that is a Select or a SegmentedControl. Do not use it for an on/off state, which is a Checkbox or a Switch.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'What the field holds. Names the field for a screen reader and derives the tool name, so prefer a noun phrase such as "Callsign".',
      required: true,
    },
    value: {
      kind: "string",
      description: "The field's current text. The field is fully controlled.",
      required: true,
    },
    onChange: {
      kind: "handler",
      description:
        "Called with the new text on every change. The fill tool drives a real input event, so this runs for agent fills too.",
      required: true,
    },
    type: {
      kind: "enum",
      description:
        'The input type. "password" masks the field everywhere: the value never appears in agent attributes, the agent view, or tool results.',
      values: ["text", "email", "url", "search", "password"],
      default: "text",
    },
    placeholder: {
      kind: "string",
      description: "Ghost text shown while the field is empty.",
    },
    hint: {
      kind: "string",
      description:
        "Guidance shown under the field and carried into the agent view. Replaced by error while one is set.",
    },
    error: {
      kind: "string",
      description:
        "A validation message. Marks the field invalid for people, screen readers, and agents alike.",
    },
    name: {
      kind: "string",
      description: "The native form name submitted with the surrounding form.",
    },
    autoComplete: {
      kind: "string",
      description: "The native autocomplete hint, forwarded to the input.",
    },
    disabled: {
      kind: "boolean",
      description: "Disable the field and unregister its fill tool.",
      default: false,
    },
    required: {
      kind: "boolean",
      description: "Mark the field required, visually and in the agent view.",
      default: false,
    },
    agentName: {
      kind: "string",
      description:
        "Override the label used to derive the tool name, when two fields on a page would otherwise collide.",
    },
    agentTool: {
      kind: "boolean",
      description: "Set false to render the field without registering a fill tool.",
      default: true,
    },
  },
  state: {
    value: {
      description:
        "The field's current text. Never present on a password field, which reflects filled instead.",
      attribute: "data-sprint-value",
    },
    filled: {
      description: "Present when a password field holds text.",
      attribute: "data-sprint-filled",
    },
    empty: {
      description: "Present while the field holds no text.",
      attribute: "data-sprint-empty",
    },
    disabled: {
      description: "Present when the field cannot be edited.",
      attribute: "data-sprint-disabled",
    },
    required: {
      description: "Present when the field must be filled.",
      attribute: "data-sprint-required",
    },
    invalid: {
      description: "Present while an error is set.",
      attribute: "data-sprint-invalid",
    },
  },
  tools: {
    fill: FILL_TOOL,
  },
  agentView: {
    example:
      '- **TextInput** "Callsign" [empty, required] → tool `fill-callsign`\n  - part `hint` "Uppercase, three to eight letters"',
  },
  examples: [
    {
      title: "A labelled field",
      description:
        "Label, hint, and control are one component. In agent view the hint becomes a part line and the field renders a live input an agent can type into.",
      code: '<TextInput\n  label="Callsign"\n  value={callsign}\n  onChange={setCallsign}\n  hint="Uppercase, three to eight letters"\n  placeholder="NOMAD"\n/>',
    },
    {
      title: "A validation error",
      description:
        "The error replaces the hint, marks the field invalid on every surface, and reads back through the fill tool's result.",
      code: '<TextInput\n  label="Frequency"\n  value={frequency}\n  onChange={setFrequency}\n  required\n  error="Out of band. Use 118.000 to 136.975."\n/>',
    },
    {
      title: "A password",
      description:
        "The value stays off every agent surface: state reflects filled or empty, and tool results never echo the text.",
      code: '<TextInput\n  label="Access code"\n  type="password"\n  value={code}\n  onChange={setCode}\n  autoComplete="current-password"\n/>',
    },
  ],
  a11y: {
    role: "textbox",
    keyboard: ["Standard text editing", "Tab moves through the field"],
    notes:
      "The label element is associated via htmlFor. An error sets aria-invalid and is linked with aria-describedby, as is the hint. Focus is an offset keyline, never a rounded ring.",
  },
});
