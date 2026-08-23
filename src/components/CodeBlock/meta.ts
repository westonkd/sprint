import { defineAgentMeta } from "@/agent/registry.ts";

export const codeBlockMeta = defineAgentMeta({
  name: "CodeBlock",
  category: "display",
  summary:
    "A snippet of code in a keylined frame, syntax-coloured from the palette, with a copy control and a caption band. In agent view the snippet is carried verbatim as the code part, so an agent reads the source instead of the highlighting.",
  whenToUse:
    "Use it for any code a reader is meant to run or copy: an install snippet, an example, a generated tool descriptor. It scrolls horizontally rather than wrapping, so a long line stays a long line.",
  whenNotToUse:
    "Do not use it for a short inline identifier inside a sentence; use a code element inside Text. Do not use it for prose you want to look technical.",
  status: "experimental",
  props: {
    code: {
      kind: "string",
      description:
        "The snippet, verbatim. Newlines are preserved and this exact string is what an agent reads and what the copy control copies.",
      required: true,
    },
    caption: {
      kind: "string",
      description:
        "What the snippet is, shown in the band above it and used as the block's accessible name. Defaults to the language.",
    },
    language: {
      kind: "enum",
      description: "What the snippet is written in. Drives the caption default.",
      values: ["tsx", "json", "bash", "text"],
      default: "tsx",
    },
    copyLabel: {
      kind: "string",
      description: "Label for the copy control.",
      default: "Copy",
    },
  },
  state: {
    language: {
      description: "The language the snippet is in.",
      attribute: "data-sprint-language",
      values: ["tsx", "json", "bash", "text"],
    },
    lines: {
      description: "How many lines the snippet has.",
      attribute: "data-sprint-lines",
    },
    copied: {
      description:
        "Present for a moment after the copy control has put the snippet on the clipboard.",
      attribute: "data-sprint-copied",
    },
    token: {
      description:
        "On a highlight span: which token class it is. Colour comes from this, so a theme can recolour code without touching the component.",
      attribute: "data-sprint-token",
      values: ["tag", "attr", "string", "keyword", "number", "punct", "comment"],
    },
  },
  agentView: {
    example:
      '- **CodeBlock** "install" [language=bash, lines=1]\n  - part `copy` "Copy"\n  - part `code` "npm install sprint"',
  },
  examples: [
    {
      title: "An example snippet",
      description:
        "No caption, so the language names the block. It registers no WebMCP tool: an agent has nothing to gain from putting text on a person's clipboard, and it can already read the code.",
      code: "<CodeBlock code={'<Button tone=\"action\">Prepare launch</Button>'} />",
    },
    {
      title: "A captioned descriptor",
      code: '<CodeBlock\n  caption="descriptor"\n  language="json"\n  code={JSON.stringify(descriptor, null, 2)}\n/>',
    },
  ],
  a11y: {
    notes:
      "The frame is a figure named by its caption. The copy control is a real button and reports back in its own label once the snippet is on the clipboard.",
  },
});
