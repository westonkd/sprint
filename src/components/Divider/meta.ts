import { defineAgentMeta } from "@/agent/registry.ts";

export const dividerMeta = defineAgentMeta({
  name: "Divider",
  category: "layout",
  summary:
    "A horizontal rule that segments a page: the line between a header or a breadcrumb and the body under it, or between two runs of content. It draws in the active theme's own keyline or band, and can name the segment it opens.",
  whenToUse:
    "Use it where a page changes subject and nothing else marks the change: under a PageHeader or a Breadcrumb before the body starts, or between groups of panels. Give it a label when the segment that follows has a name worth reading; an unlabelled Divider is invisible in agent view, because an agent does not care where a line is drawn, only what the line announces.",
  whenNotToUse:
    "Do not use it to space things out; that is the gap on Stack. Do not use it to frame a region with a header; that is Panel, which draws its own keylines. Do not stack two in a row, and do not use it inside a Panel to separate a list's items; the list draws its own.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        "The name of the segment the divider opens, rendered small on the rule.",
    },
    weight: {
      kind: "enum",
      description:
        'How hard the break is. "hairline" is a keyline, "heavy" a thick strong keyline, "band" a strip of the theme\'s own ornament for the one break that matters most on a page.',
      values: ["hairline", "heavy", "band"],
      default: "hairline",
    },
  },
  state: {
    weight: {
      description: "How hard the break is.",
      attribute: "data-sprint-weight",
      values: ["hairline", "heavy", "band"],
    },
  },
  agentView: {
    example: '- **Divider** "Results" [weight=band]',
  },
  a11y: {
    role: "separator",
    notes:
      "The rule is a native hr, so assistive technology announces a separator. A label is ordinary text read just before it, the way a person reads it on the rule.",
  },
  relatedComponents: ["Stack", "PageHeader", "Breadcrumb", "Panel"],
  examples: [
    {
      title: "Separating the header from the body",
      description:
        "The plainest break: a keyline under the page's chrome, before the content starts.",
      code: '<Stack>\n  <Breadcrumb\n    label="Docs"\n    items={[{ label: "guides", children: [{ href: "#/guide/webmcp", label: "WebMCP", active: true }] }]}\n  />\n  <Divider />\n  <Text>The body of the page starts here.</Text>\n</Stack>',
    },
    {
      title: "A named segment",
      description:
        "A label names what follows, on the rule itself and to an agent reading the page.",
      code: '<Divider label="Results" weight="heavy" />',
    },
    {
      title: "The page's main break",
      description:
        "A band draws the theme's own ornament: hatching in the default register, pins in calorie, a barcode strip in trax, a row of dots in ambient. Use it once per page.",
      code: '<Divider label="Body" weight="band" />',
    },
  ],
});
