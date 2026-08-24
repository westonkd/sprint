import { defineAgentMeta } from "@/agent/registry.ts";

export const metaLineMeta = defineAgentMeta({
  name: "MetaLine",
  category: "display",
  summary:
    "A slash-separated manifest line of term–detail pairs in small uppercase monospace: serials, build strings, issue dates, unit fields. It is chrome, not content, and in the agent view it reads as the same single line of text a person sees.",
  whenToUse:
    "Use it for the compact strip of identifying metadata that belongs to a page, panel, or footer: version and build identifiers, timestamps, serial numbers, owners. Values are short and the line truncates rather than wraps.",
  whenNotToUse:
    "Do not use it for the details of a record a person is meant to study; that is a DescriptionList. Do not put anything interactive in it, and do not use it for prose.",
  status: "experimental",
  props: {
    entries: {
      kind: "array",
      description:
        "Term–detail pairs in display order: { term, detail }, both strings. Rendered as TERM: DETAIL, slash-separated, and carried as one line in the agent view. An empty array renders nothing.",
      required: true,
    },
  },
  state: {
    entries: {
      description: "How many term–detail pairs the line carries.",
      attribute: "data-sprint-entries",
    },
  },
  agentView: {
    example:
      '- **MetaLine** "SERIAL: NU-TYPE-CORE-A1 / ISSUED: 2744.07.22" [entries=2]',
  },
  examples: [
    {
      title: "A build strip",
      description:
        "The manifest voice: uppercase mono, slash-separated, terms muted and details in ink.",
      code: '<MetaLine\n  entries={[\n    { term: "Serial", detail: "NU-TYPE-CORE-A1" },\n    { term: "Issued", detail: "2744.07.22" },\n  ]}\n/>',
    },
    {
      title: "Version chrome for a footer",
      description: "The line an app pins under its content or into a Shell rail.",
      code: '<MetaLine\n  entries={[\n    { term: "Sprint", detail: "v0.0.0" },\n    { term: "Channel", detail: "dev" },\n    { term: "WebMCP", detail: "chrome 149" },\n  ]}\n/>',
    },
  ],
  a11y: {
    role: "paragraph",
    notes:
      "The separators are real text, so the accessible name is the same line the agent view carries. Nothing in the line is interactive.",
  },
});
