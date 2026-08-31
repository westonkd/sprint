import { defineAgentMeta } from "@/agent/registry.ts";

export const tagMeta = defineAgentMeta({
  name: "Tag",
  category: "display",
  summary:
    "A small chip that classifies the thing next to it: a status, a category, a count, a build string.",
  whenToUse:
    "Use it for a short classification a person scans and an agent reads off the tone attribute, such as a release status, a read-only or write marker on a tool, or a version chip.",
  whenNotToUse:
    "Do not use it for anything clickable; a Tag is inert, and a chip that acts is a Button. Do not put a sentence in one.",
  status: "experimental",
  props: {
    children: {
      kind: "node",
      description: "The chip text. One or two words.",
      required: true,
    },
    tone: {
      kind: "enum",
      description:
        "What class of thing this is. Acid is rationed, so reach for info or inert before action.",
      values: ["neutral", "action", "danger", "info", "warning", "inert"],
      default: "neutral",
    },
    filled: {
      kind: "boolean",
      description:
        "Render as a solid field of the tone with inverted ink, instead of a keyline. Use for the one chip that must be read first.",
      default: false,
    },
  },
  state: {
    tone: {
      description: "The class of thing the chip marks.",
      attribute: "data-sprint-tone",
      values: ["neutral", "action", "danger", "info", "warning", "inert"],
    },
    filled: {
      description: "Present when the chip is a solid field rather than a keyline.",
      attribute: "data-sprint-filled",
    },
  },
  agentView: {
    example: '- **Tag** "experimental" [filled, tone=warning]',
  },
  examples: [
    {
      title: "A release status",
      code: '<Tag tone="warning" filled>experimental</Tag>',
    },
    {
      title: "A category chip",
      code: "<Tag>action</Tag>",
    },
    {
      title: "Read-only against changes-state",
      description:
        "Two tones doing the work a legend would otherwise have to do in prose.",
      code: '<Tag tone={tool.readOnly ? "info" : "danger"}>\n  {tool.readOnly ? "read only" : "changes state"}\n</Tag>',
    },
  ],
});
