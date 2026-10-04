import { defineAgentMeta } from "@/agent/registry.ts";

export const kbdMeta = defineAgentMeta({
  name: "Kbd",
  category: "typography",
  summary:
    "A keyboard key or shortcut, drawn as key caps. Pass the combination as text joined with plus signs.",
  whenToUse:
    'Use to tell a person which keys do something: an undo hint in a toast, a shortcut beside a menu item\'s description, a search field\'s focus key. Write the combination as one string, such as "Ctrl+Z" or "Shift+Enter"; each part becomes its own cap.',
  whenNotToUse:
    "Do not use for code or for a value someone types into a field; that is code or a CodeBlock. Do not use it as a control; it does not press anything.",
  status: "experimental",
  props: {
    children: {
      kind: "string",
      description:
        'The keys, joined with "+", such as "Ctrl+Z". A lone "+" is a key in its own right.',
      required: true,
    },
  },
  agentView: {
    example: '- **Kbd** "Ctrl+Z"',
  },
  examples: [
    {
      title: "An undo shortcut",
      code: "<Kbd>Ctrl+Z</Kbd>",
    },
    {
      title: "A single key",
      description: "One key is one cap.",
      code: "<Kbd>/</Kbd>",
    },
  ],
  a11y: {
    notes:
      "A kbd element nesting one kbd per key, which is the HTML pattern for a key combination. The plus signs between caps are hidden from assistive technology, which reads the keys in order.",
  },
});
