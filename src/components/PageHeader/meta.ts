import { defineAgentMeta } from "@/agent/registry.ts";

export const pageHeaderMeta = defineAgentMeta({
  name: "PageHeader",
  category: "layout",
  summary:
    "The top of a page: its h1 title, the Tag chips that classify it, an optional page-level control, and a lede underneath.",
  whenToUse:
    "Use it once per page, as the first thing inside the content region. The label becomes the page's only h1, so the document outline starts here. Put status or category Tags in tags, a control that affects the whole page in actions, and the introductory sentence or two in children as Text.",
  whenNotToUse:
    "Do not use it for a section within a page; that is a Panel with a headingLevel. Do not put navigation in actions; the page's links belong in a Nav.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description: "The page title. Rendered as the page's h1.",
      required: true,
    },
    tags: {
      kind: "node",
      description:
        "Tag components that classify the page, rendered on the title line. Keep it to two or three.",
    },
    actions: {
      kind: "node",
      description:
        "A control that acts on the whole page, rendered at the end of the title line.",
    },
    children: {
      kind: "node",
      description: "The lede: a Text or two introducing the page.",
    },
  },
  agentView: {
    example: '- **PageHeader** "Button"',
  },
  a11y: {
    notes:
      "The label renders as the page's h1, so keep to one PageHeader per page. Tags and the lede are ordinary content after it; the header element itself takes no landmark role because it sits inside main.",
  },
  relatedComponents: ["Panel", "Heading", "Tag"],
  examples: [
    {
      title: "A titled page with a lede",
      code: '<PageHeader label="Reports">\n  <Text>Everything the quarter produced, in one place.</Text>\n</PageHeader>',
    },
    {
      title: "Status tags and a page-level control",
      description:
        "Tags classify the page on the title line; the action slot holds the one control that affects the whole page.",
      code: '<PageHeader\n  label="Button"\n  tags={<Tag tone="warning" filled>experimental</Tag>}\n  actions={<Button agentTool={false}>Refresh</Button>}\n>\n  <Text>A single action a person or an agent can trigger.</Text>\n</PageHeader>',
    },
  ],
});
