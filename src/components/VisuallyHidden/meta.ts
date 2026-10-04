import { defineAgentMeta } from "@/agent/registry.ts";

export const visuallyHiddenMeta = defineAgentMeta({
  name: "VisuallyHidden",
  category: "typography",
  summary:
    "Text that is off screen but still read by screen readers and agents. For context a sighted person gets from the layout.",
  whenToUse:
    'Use to say in words what the layout says visually: "(opens in a new tab)" after a link, a count\'s unit, a heading for a region whose purpose is obvious on screen. With focusable, it wraps a skip link that appears only while it has focus.',
  whenNotToUse:
    "Do not use to hide a field's label; TextInput, Textarea, SearchField and Progress take hideLabel, and an icon-only Button takes hideLabel too. Do not hide content that a sighted person also needs.",
  status: "experimental",
  props: {
    children: {
      kind: "node",
      description: "The hidden text, or a skip link when focusable is set.",
      required: true,
    },
    focusable: {
      kind: "boolean",
      description:
        "Show the content while something inside it has keyboard focus, for a skip link.",
      default: false,
    },
  },
  state: {
    focusable: {
      description: "Present when the content appears while focused.",
      attribute: "data-sprint-focusable",
    },
  },
  agentView: {
    example: '- **VisuallyHidden** "opens in a new tab"',
  },
  examples: [
    {
      title: "Extra words for a screen reader",
      description:
        "The arrow says it to a sighted person; the hidden text says it to everyone else.",
      code: '<Link href="https://churchofjesuschrist.org" external>\n  Gospel Library ↗<VisuallyHidden> (opens in a new tab)</VisuallyHidden>\n</Link>',
    },
    {
      title: "A skip link",
      description: "Off screen until a keyboard user tabs to it.",
      code: '<VisuallyHidden focusable>\n  <Link href="#main">Skip to the board</Link>\n</VisuallyHidden>',
    },
  ],
  a11y: {
    notes:
      "Hidden with a one-pixel clip rather than display or visibility, so screen readers still read it. The agent view renders its text as an ordinary line.",
  },
});
