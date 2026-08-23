import { defineAgentMeta } from "@/agent/registry.ts";
import { FILL_TEXTAREA_TOOL } from "./tool.ts";

export const textareaMeta = defineAgentMeta({
  name: "Textarea",
  category: "input",
  summary:
    "A multi-line text area with its own uppercase monospace label, an optional hint, and an optional error. Fully controlled, and it registers one fill tool that replaces the whole content with an explicit value, line breaks included.",
  whenToUse:
    "Use it for free-form text that runs longer than a line: a description, a message body, a set of notes. In the agent view the current content is part of the component's state line, so an agent reads what is written without a separate query.",
  whenNotToUse:
    "Do not use it for a single-line value, which is a TextInput. Do not use it for code a person should read rather than write; that is a CodeBlock. Long values make long state lines, so keep it off surfaces where the agent view must stay terse.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'What the area holds. Names it for a screen reader and derives the tool name, so prefer a noun phrase such as "Mission notes".',
      required: true,
    },
    value: {
      kind: "string",
      description: "The area's current text. The area is fully controlled.",
      required: true,
    },
    onChange: {
      kind: "handler",
      description:
        "Called with the new text on every change. The fill tool drives a real input event, so this runs for agent fills too.",
      required: true,
    },
    rows: {
      kind: "number",
      description: "The visible line count before scrolling.",
      default: 4,
    },
    placeholder: {
      kind: "string",
      description: "Ghost text shown while the area is empty.",
    },
    hint: {
      kind: "string",
      description:
        "Guidance shown under the area and carried into the agent view. Replaced by error while one is set.",
    },
    error: {
      kind: "string",
      description:
        "A validation message. Marks the area invalid for people, screen readers, and agents alike.",
    },
    name: {
      kind: "string",
      description: "The native form name submitted with the surrounding form.",
    },
    disabled: {
      kind: "boolean",
      description: "Disable the area and unregister its fill tool.",
      default: false,
    },
    required: {
      kind: "boolean",
      description: "Mark the area required, visually and in the agent view.",
      default: false,
    },
    agentName: {
      kind: "string",
      description:
        "Override the label used to derive the tool name, when two areas on a page would otherwise collide.",
    },
    agentTool: {
      kind: "boolean",
      description: "Set false to render the area without registering a fill tool.",
      default: true,
    },
  },
  state: {
    value: {
      description: "The area's current text.",
      attribute: "data-sprint-value",
    },
    empty: {
      description: "Present while the area holds no text.",
      attribute: "data-sprint-empty",
    },
    disabled: {
      description: "Present when the area cannot be edited.",
      attribute: "data-sprint-disabled",
    },
    required: {
      description: "Present when the area must be filled.",
      attribute: "data-sprint-required",
    },
    invalid: {
      description: "Present while an error is set.",
      attribute: "data-sprint-invalid",
    },
  },
  tools: {
    fill: FILL_TEXTAREA_TOOL,
  },
  agentView: {
    example:
      '- **Textarea** "Mission notes" [empty] → tool `fill-mission-notes`\n  - part `hint` "What the relief crew needs to know"',
  },
  examples: [
    {
      title: "A notes area",
      description:
        "Label, hint, and control are one component. In agent view it renders a live textarea an agent can type into.",
      code: '<Textarea\n  label="Mission notes"\n  value={notes}\n  onChange={setNotes}\n  hint="What the relief crew needs to know"\n/>',
    },
    {
      title: "A required area with an error",
      description:
        "The error replaces the hint and marks the area invalid on every surface.",
      code: '<Textarea\n  label="Abort reason"\n  value={reason}\n  onChange={setReason}\n  required\n  rows={3}\n  error="State the reason before aborting."\n/>',
    },
  ],
  a11y: {
    role: "textbox",
    keyboard: ["Standard text editing", "Enter inserts a line break"],
    notes:
      "The label element is associated via htmlFor. An error sets aria-invalid and is linked with aria-describedby, as is the hint.",
  },
});
