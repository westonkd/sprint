import { defineAgentMeta } from "@/agent/registry.ts";

export const metaLineMeta = defineAgentMeta({
  name: "MetaLine",
  category: "display",
  summary:
    "A slash-separated manifest line of term–detail pairs: serials, build strings, issue dates. It is chrome, not content, and in the agent view it reads as the same single line of text a person sees.",
  whenToUse:
    "Use it for the compact strip of identifying metadata that belongs to a page, panel, or footer: version and build identifiers, timestamps, serial numbers, owners. Values are short. By default the line truncates with an ellipsis rather than wrapping; set wrap where it sits in a narrow container and every entry has to stay visible.",
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
    wrap: {
      kind: "boolean",
      description:
        "Let entries flow onto further lines instead of truncating the line. Each entry stays whole on one line, and a separator stays at the end of the line it closes, so no line starts with a slash. An entry wider than the container is the only thing that still truncates.",
      default: false,
    },
  },
  state: {
    entries: {
      description: "How many term–detail pairs the line carries.",
      attribute: "data-sprint-entries",
    },
    wrap: {
      description: "Present when entries may flow onto further lines.",
      attribute: "data-sprint-wrap",
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
    {
      title: "Wrapping in a narrow rail",
      description:
        "With wrap, a sidebar shows every entry on as many lines as it needs instead of cutting the later ones off.",
      code: '<MetaLine\n  wrap\n  entries={[\n    { term: "Sprint", detail: "v0.0.0" },\n    { term: "Channel", detail: "dev" },\n    { term: "WebMCP", detail: "chrome 149" },\n    { term: "Build", detail: "2744.07.22-a1" },\n  ]}\n/>',
    },
  ],
  a11y: {
    role: "paragraph",
    notes:
      "The separators are real text, so the accessible name is the same line the agent view carries. Nothing in the line is interactive.",
  },
});
