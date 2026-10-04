import { defineAgentMeta } from "@/agent/registry.ts";

export const headingMeta = defineAgentMeta({
  name: "Heading",
  category: "typography",
  summary:
    "A section title, rendered as a real h element at the level you pick so it joins the document outline.",
  whenToUse:
    "Use it for the title of a page or of a region inside one, and keep levels in document order so the outline an agent or a screen reader builds is the outline you meant.",
  whenNotToUse:
    "Do not use it for the label on a bordered region; Panel takes a label prop, draws its own header, and joins the outline through its headingLevel prop. Do not pick a level for its size, only for its place in the outline.",
  status: "experimental",
  props: {
    children: {
      kind: "node",
      description: "The title. Keep it short; long titles truncate in chrome.",
      required: true,
    },
    level: {
      kind: "enum",
      description:
        "Outline depth, rendered as the matching h element. 1 is the page title and there should be one per page. 5 and 6 take the level-4 voice unless size says otherwise.",
      values: ["1", "2", "3", "4", "5", "6"],
      default: "2",
    },
    size: {
      kind: "enum",
      description:
        "The type voice, from 1 (display) to 4 (smallest), when it should differ from the level. Use it when a heading's place in the outline and its visual weight disagree, such as a level-2 title inside a dense card that should read small.",
      values: ["1", "2", "3", "4"],
    },
  },
  state: {
    level: {
      description: "The outline depth, and so the type voice in use.",
      attribute: "data-sprint-level",
      values: ["1", "2", "3", "4", "5", "6"],
    },
    size: {
      description: "The type voice, present only when it differs from the level.",
      attribute: "data-sprint-size",
      values: ["1", "2", "3", "4"],
    },
  },
  agentView: {
    example: '- **Heading** "WebMCP tools" [level=2]',
  },
  examples: [
    {
      title: "A page title",
      code: "<Heading level={1}>Button</Heading>",
    },
    {
      title: "A section title",
      description: "The default level, for a region inside a page.",
      code: "<Heading>Every variant</Heading>",
    },
    {
      title: "A deep heading in a small voice",
      description:
        "The outline needs a level-3 heading, but inside a compact card it should read at the smallest size.",
      code: "<Heading level={3} size={4}>Sunday speakers</Heading>",
    },
  ],
});
