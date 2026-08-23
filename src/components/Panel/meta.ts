import { defineAgentMeta } from "@/agent/registry.ts";

export const panelMeta = defineAgentMeta({
  name: "Panel",
  category: "layout",
  summary:
    "A keylined region that announces what it is in a small header band, with an optional slot for the controls that act on it. Everything on a Sprint page lives inside one.",
  whenToUse:
    "Use it for every distinct region of a page: a section of documentation, a form, a readout, a preview. The label is the region's accessible name, so a person, a screen reader, and an agent all address the region by the same words.",
  whenNotToUse:
    "Do not use it as a spacer or a plain box; that is Stack. Nesting reads clearly to about three deep, because each level alternates its ground and demotes its frame; past that, the depth cues repeat and the region wants a page of its own.",
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
    headingLevel: {
      kind: "enum",
      description:
        "Render the label as a real heading at this outline depth, so the section is reachable when a screen reader navigates by headings. Set it on every panelled section of a page; leave it unset only for chrome such as a preview frame.",
      values: ["2", "3", "4"],
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
  a11y: {
    role: "region",
    notes:
      "The section is a named landmark either way: the label is its accessible name. With headingLevel the label is also a heading element, so the page outline includes the region; without it the region is reachable only by landmark navigation.",
  },
  examples: [
    {
      title: "A section of a page",
      description:
        "headingLevel puts the label in the page outline, so a screen reader finds the section by heading as well as by landmark.",
      code: '<Panel label="When to use" headingLevel={2}>\n  <Text>Use it for any discrete action.</Text>\n</Panel>',
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
      title: "Nested panels",
      description:
        "Depth styles itself: the outermost panel carries a doubled keyline, each nested level alternates its ground, and nested headers demote to a dashed rule, so a reader ranks the levels without counting borders.",
      code: '<Panel label="The shape" headingLevel={2}>\n  <Panel label="Human view" headingLevel={3}>\n    <Panel label="Crew" headingLevel={4}>\n      <Text>Registration fields live here.</Text>\n    </Panel>\n  </Panel>\n</Panel>',
    },
    {
      title: "An empty region",
      description:
        "An empty panel keeps its border and states that it is empty, rather than vanishing and leaving a person or an agent unsure whether it failed to load.",
      code: '<Panel label="Registered tools" emptyLabel="No tools registered" />',
    },
  ],
});
