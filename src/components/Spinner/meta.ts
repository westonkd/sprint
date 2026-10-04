import { defineAgentMeta } from "@/agent/registry.ts";

export const spinnerMeta = defineAgentMeta({
  name: "Spinner",
  category: "feedback",
  summary:
    "A small inline busy mark for work with no measurable progress, sized to sit inside a field or beside a line of text.",
  whenToUse:
    "Use where a whole bar or region would be too much: beside a field that is checking a value, at the end of a line that is saving, inside a combobox while results load. The label says what is happening and is announced politely; showLabel prints it beside the mark.",
  whenNotToUse:
    "Do not use for a region whose data is loading; that is Pending or a component's loading prop. Do not use when the work can be counted; that is Progress. Do not use for a busy button; Button's loading prop marks the button itself.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description: 'What is happening, such as "Checking availability".',
      required: true,
    },
    size: {
      kind: "enum",
      description:
        "medium matches body text; small fits inside a dense row or a field.",
      values: ["small", "medium"],
      default: "medium",
    },
    showLabel: {
      kind: "boolean",
      description:
        "Print the label beside the mark instead of keeping it for assistive technology only.",
      default: false,
    },
  },
  state: {
    loading: {
      description: "Always present: a spinner is only rendered while work is running.",
      attribute: "data-sprint-loading",
    },
    size: {
      description: "Present as small on the compact mark.",
      attribute: "data-sprint-size",
      values: ["small"],
    },
  },
  agentView: {
    example: '- **Spinner** "Saving note" [loading]',
  },
  examples: [
    {
      title: "Saving beside a line",
      description: "The mark sits in the line, and the label is printed beside it.",
      code: '<Spinner label="Saving note" showLabel />',
    },
    {
      title: "A silent mark in a field",
      description:
        "A small mark with the label kept for assistive technology and agents.",
      code: '<Spinner label="Searching members" size="small" />',
    },
  ],
  a11y: {
    role: "status",
    notes:
      "A role=status element, so the label is announced politely when the spinner appears. Render it only while work runs, rather than toggling its visibility. The mark is a stepped four-cell pulse, still under reduced motion.",
  },
});
