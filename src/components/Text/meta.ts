import { defineAgentMeta } from "@/agent/registry.ts";

export const textMeta = defineAgentMeta({
  name: "Text",
  category: "typography",
  summary:
    "A run of prose, sized and toned from the semantic scale. In agent view it renders as its own text content, so an agent reads the words rather than inferring them from styling.",
  whenToUse:
    'Use it for every paragraph, caption, note, and inline status line, so tone carries meaning instead of an ad-hoc colour. tone="muted" is the small print under a heading, tone="warning" and tone="danger" state that something is wrong, and tone="action" confirms something is live.',
  whenNotToUse:
    "Do not use it for a section title; that is Heading. Do not put components inside it: it flattens its children to a single string for the agent view, so a nested Button would lose its tool.",
  status: "experimental",
  props: {
    children: {
      kind: "node",
      description:
        "The prose. Inline markup such as code or strong is fine; components are not.",
      required: true,
    },
    tone: {
      kind: "enum",
      description:
        "What the text means, not just how it looks. Agents read this off the attribute.",
      values: ["default", "muted", "action", "info", "warning", "danger"],
      default: "default",
    },
    size: {
      kind: "enum",
      description:
        'Type size. "small" is the annotation size used for notes and captions.',
      values: ["small", "normal"],
      default: "normal",
    },
    as: {
      kind: "enum",
      description:
        "The element to render. Use span when the text sits inside another line of text.",
      values: ["p", "span", "div"],
      default: "p",
    },
  },
  state: {
    tone: {
      description: "What the text is saying about the thing it describes.",
      attribute: "data-sprint-tone",
      values: ["default", "muted", "action", "info", "warning", "danger"],
    },
    size: {
      description: "The type size in use.",
      attribute: "data-sprint-size",
      values: ["small", "normal"],
    },
  },
  agentView: {
    example: '- **Text** "Tools stay registered across a view switch." [tone=muted]',
  },
  examples: [
    {
      title: "A lede",
      code: "<Text>Every component renders normally for people and as text for agents.</Text>",
    },
    {
      title: "A note under a heading",
      description: "The small print that would otherwise be an untyped grey span.",
      code: '<Text tone="muted" size="small">Registered while the button is enabled.</Text>',
    },
    {
      title: "A live status line",
      description:
        "Tone is the whole message here, so an agent reading the attribute learns the same thing a person learns from the colour.",
      code: '<Text tone={ready ? "action" : "warning"} size="small">\n  {ready ? "WebMCP is available in this browser." : "WebMCP is unavailable here."}\n</Text>',
    },
  ],
});
