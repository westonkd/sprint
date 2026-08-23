import { defineAgentMeta } from "@/agent/registry.ts";

export const panelMeta = defineAgentMeta({
  name: "Panel",
  category: "layout",
  summary:
    "A keylined region that announces what it is in a small header band, with an optional slot for the controls that act on it. Everything on a Sprint page lives inside one.",
  whenToUse:
    "Use it for every distinct region of a page: a section of documentation, a form, a readout, a preview. The label is the region's accessible name, so a person, a screen reader, and an agent all address the region by the same words.",
  whenNotToUse:
    "Do not use it as a spacer or a plain box; that is Stack. Do not nest panels more than two deep, or the keylines stop meaning anything.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        "What this region is. Rendered in the header band and used as the region's accessible name.",
      required: true,
    },
    children: {
      kind: "node",
      description:
        "The region's content. An empty panel says it is empty rather than collapsing.",
    },
    actions: {
      kind: "node",
      description:
        "Controls that act on this region, rendered at the end of the header band. Keep it to one or two.",
    },
    flush: {
      kind: "boolean",
      description:
        "Drop the body padding, for content that draws its own edges such as a Table or a CodeBlock.",
      default: false,
    },
    emptyLabel: {
      kind: "string",
      description: "What the panel says when it has no content.",
      default: "Empty",
    },
  },
  state: {
    flush: {
      description: "Present when the body carries no padding of its own.",
      attribute: "data-sprint-flush",
    },
    empty: {
      description:
        "Present when the panel has no content. The panel still renders its keyline and says it is empty.",
      attribute: "data-sprint-empty",
    },
  },
  agentView: {
    example: '- **Panel** "WebMCP tools"',
  },
  examples: [
    {
      title: "A section of a page",
      code: '<Panel label="When to use">\n  <Text>Use it for any discrete action.</Text>\n</Panel>',
    },
    {
      title: "A panel with a control in its header",
      description:
        "The header slot is for controls that act on the region, not for navigation.",
      code: '<Panel\n  label="Preview"\n  actions={<Button agentName="Reset preview">Reset</Button>}\n>\n  <Button tone="action">Prepare launch</Button>\n</Panel>',
    },
    {
      title: "A flush panel around a table",
      description:
        "Content that draws its own keylines sits flush, so borders do not double up.",
      code: '<Panel label="Conventions" flush>\n  <Table label="Conventions" columns={columns} rows={rows} />\n</Panel>',
    },
    {
      title: "An empty region",
      description:
        "An empty panel keeps its border and states that it is empty, rather than vanishing and leaving a person or an agent unsure whether it failed to load.",
      code: '<Panel label="Registered tools" emptyLabel="No tools registered" />',
    },
  ],
});
