import { defineAgentMeta } from "@/agent/registry.ts";

export const navMeta = defineAgentMeta({
  name: "Nav",
  category: "navigation",
  summary:
    "A labelled navigation landmark: the region that holds a page's links to elsewhere. Links inside it render as a vertical rail with the active item marked by a keyline.",
  whenToUse:
    "Use it around any set of links whose job is getting around the app: a sidebar, a table of contents, a footer link block. The label names the landmark, so a person navigating by landmark, a screen reader, and an agent reading the page all know these links are wayfinding rather than content. Group related links inside it with NavGroup.",
  whenNotToUse:
    "Do not use it for a link that sits inside prose; a bare Link is already readable there. Do not use it for a set of actions that stay on the page; those are Buttons in a Stack.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        "What this navigation is for. Rendered as the landmark's accessible name, so two navs on one page stay distinguishable.",
      required: true,
    },
    children: {
      kind: "node",
      description: "Link components, or NavGroup components wrapping them.",
      required: true,
    },
  },
  agentView: {
    example: '- **Nav** "Workbench"',
  },
  a11y: {
    role: "navigation",
    notes:
      "The label is the landmark's accessible name via aria-label. Active links inside it carry aria-current=page, so the current location is announced without any styling cue.",
  },
  relatedComponents: ["NavGroup", "Link", "Shell"],
  examples: [
    {
      title: "A grouped sidebar nav",
      description:
        "Each NavGroup names a cluster of destinations. The active link carries the current-page mark in every view.",
      code: '<Nav label="Docs">\n  <NavGroup label="Guides">\n    <Link href="#/guide/webmcp">WebMCP</Link>\n  </NavGroup>\n  <NavGroup label="Components">\n    <Link href="#/Button" active>Button</Link>\n    <Link href="#/Table">Table</Link>\n  </NavGroup>\n</Nav>',
    },
    {
      title: "A flat nav",
      description: "A short list of destinations needs no grouping.",
      code: '<Nav label="Site">\n  <Link href="#/">Home</Link>\n  <Link href="#/pricing">Pricing</Link>\n</Nav>',
    },
  ],
});
