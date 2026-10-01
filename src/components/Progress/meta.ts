import { defineAgentMeta } from "@/agent/registry.ts";

export const progressMeta = defineAgentMeta({
  name: "Progress",
  category: "feedback",
  summary:
    "A labelled loading indicator for work in progress. Indeterminate by default; pass value for a known fraction complete.",
  whenToUse:
    "Use while something the person is waiting on is still running: a page section fetching, an upload, an import, a long job. Omit value when the remaining work is unknown, and pass value with max when it can be counted. Keep the label a stable noun phrase for what is loading, not a percentage.",
  whenNotToUse:
    "Do not use for a busy action; Button's loading prop already marks the button itself. Do not use for the outcome of work that finished or failed; that is an Alert. Do not use for a quantity that is not progress, such as disk usage.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'What is loading, such as "Importing manifest". It is the indicator\'s accessible name and its agent label.',
      required: true,
    },
    value: {
      kind: "number",
      description:
        "Work completed so far, in the same units as max. Omit for an indeterminate indicator. Clamped to the range 0 to max.",
    },
    max: {
      kind: "number",
      description: "The value at which the work is complete.",
      default: 100,
    },
  },
  state: {
    loading: {
      description:
        "Present until the work completes. An indeterminate indicator is always loading.",
      attribute: "data-sprint-loading",
    },
    value: {
      description:
        "The fraction complete as a whole percentage, such as 40%. Absent while indeterminate.",
      attribute: "data-sprint-value",
    },
  },
  agentView: {
    example: '- **Progress** "Importing manifest" [loading, value=40%]',
  },
  examples: [
    {
      title: "Indeterminate load",
      description:
        "Nothing to count yet, so the indicator only says that work is running.",
      code: '<Progress label="Loading flight plan" />',
    },
    {
      title: "Counted progress",
      description:
        "With value and max the agent reads a percentage instead of guessing.",
      code: '<Progress label="Importing manifest" value={imported} max={total} />',
    },
    {
      title: "Complete",
      description:
        "At max the loading state clears, so the line reads as finished rather than stalled.",
      code: '<Progress label="Importing manifest" value={240} max={240} />',
    },
  ],
  a11y: {
    role: "progressbar",
    notes:
      "Renders a native progress element named by the visible label. Omitting value leaves it indeterminate, which assistive technology announces as busy. The percentage readout is hidden from assistive technology because the progressbar already carries its value.",
  },
});
