import { defineAgentMeta } from "@/agent/registry.ts";

export const navGroupMeta = defineAgentMeta({
  name: "NavGroup",
  category: "navigation",
  summary:
    "A labelled cluster of links inside a Nav. The label renders as a small uppercase rubric above its links and names the group for screen readers and agents alike.",
  whenToUse:
    "Use it when a Nav holds more than one kind of destination: guides versus components, product versus account. The label tells every reader what the links below it have in common, which is exactly what an agent scanning for the right link needs.",
  whenNotToUse:
    "Do not use it outside a Nav; on its own it is just a heading over links, which Panel does better. Do not nest groups; one level of grouping is all a sidebar can carry.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        "What the links in this group have in common. Rendered as the rubric and as the group's accessible name.",
      required: true,
    },
    children: {
      kind: "node",
      description: "The Link components this group collects.",
      required: true,
    },
  },
  agentView: {
    example: '- **NavGroup** "Components"',
  },
  a11y: {
    role: "group",
    notes:
      "The group carries its label as an accessible name, so screen readers announce the rubric when entering the cluster rather than reading an unlabelled run of links.",
  },
  relatedComponents: ["Nav", "Link"],
  examples: [
    {
      title: "A labelled group of links",
      code: '<NavGroup label="Reference">\n  <Link href="https://developer.chrome.com/docs/ai/webmcp" external>\n    Chrome docs\n  </Link>\n  <Link href="https://github.com/webmachinelearning/webmcp" external>\n    Specification\n  </Link>\n</NavGroup>',
    },
  ],
});
