import { defineAgentMeta } from "@/agent/registry.ts";

export const proseMeta = defineAgentMeta({
  name: "Prose",
  category: "typography",
  summary:
    "Typography for long-form rendered content such as Markdown: headings, paragraphs, lists, links, code, tables and quotes, in the theme's voice.",
  whenToUse:
    "Wrap HTML you did not lay out yourself: member notes rendered from Markdown, an agenda's program details, a help article. Pass the original Markdown as source and the agent view carries it verbatim, which is better for an agent than flattened text. Sprint does not parse Markdown; render it with the library of your choice and pass the result as children.",
  whenNotToUse:
    "Do not use for interface copy you write yourself; that is Text and Heading. Do not put interactive Sprint components inside it; Prose styles plain elements.",
  status: "experimental",
  props: {
    children: {
      kind: "node",
      description:
        "The rendered content: plain HTML elements such as p, ul, a, code and table.",
      required: true,
    },
    source: {
      kind: "string",
      description:
        "The Markdown the children were rendered from. The agent view shows this instead of the flattened text, keeping lists, links and emphasis intact.",
    },
    label: {
      kind: "string",
      description:
        'What the content is, such as "Member notes". Makes the block a labelled region and names it in the agent view.',
    },
    size: {
      kind: "enum",
      description: "small for notes inside a card or a side panel.",
      values: ["small", "normal"],
      default: "normal",
    },
  },
  state: {
    size: {
      description: "Present as small for the compact size.",
      attribute: "data-sprint-size",
      values: ["small"],
    },
  },
  agentView: {
    example:
      '- **Prose** "Member notes"\n  - part `content` "Moved in **March**. Plays the organ."',
  },
  examples: [
    {
      title: "Rendered Markdown",
      description:
        "The page renders Markdown however it likes and passes the original as source, which the agent view carries unchanged.",
      code: '<Prose label="Member notes" source={notes}>\n  <Markdown>{notes}</Markdown>\n</Prose>',
    },
    {
      title: "Compact notes",
      code: '<Prose size="small">\n  <p>Prefers <strong>text</strong> after six.</p>\n  <ul>\n    <li>Organ</li>\n    <li>Youth program</li>\n  </ul>\n</Prose>',
    },
  ],
  a11y: {
    role: "region",
    notes:
      "With a label the block is a named region; without one it adds no semantics of its own. The content keeps its own elements, so headings join the page outline.",
  },
});
