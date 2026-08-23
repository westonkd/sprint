import { defineAgentMeta } from "@/agent/registry.ts";

export const headingMeta = defineAgentMeta({
  name: "Heading",
  category: "typography",
  summary:
    "A section title. Level 1 is the display voice, heavy and tightly tracked; levels 2 to 4 are the wide-tracked uppercase monospace that labels everything else in the system.",
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
        "Outline depth, rendered as the matching h element. 1 is the page title and there should be one per page.",
      values: ["1", "2", "3", "4"],
      default: "2",
    },
  },
  state: {
    level: {
      description: "The outline depth, and so the type voice in use.",
      attribute: "data-sprint-level",
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
  ],
});
