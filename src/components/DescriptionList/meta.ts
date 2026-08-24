import { defineAgentMeta } from "@/agent/registry.ts";

export const descriptionListMeta = defineAgentMeta({
  name: "DescriptionList",
  category: "display",
  summary:
    "Labelled term–description pairs for the details of one thing: metadata, settings, profile fields.",
  whenToUse:
    "Use for the properties of a single entity: a token's created date and scopes, a session's device and last activity, a profile's fields. Each item pairs one term with one description.",
  whenNotToUse:
    "Do not use for many entities with the same fields; that is a Table. Do not put components inside term or description; both are flattened to text for the agent view, so only inline content survives. Do not use for prose sequences; that is a List.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        "The accessible name for the list, describing what entity it details.",
      required: true,
    },
    items: {
      kind: "array",
      description:
        "The pairs, in order. Each item is { term, description }; both are inline content flattened to text for the agent view.",
      required: true,
    },
    emptyLabel: {
      kind: "string",
      description: "Text shown when items is empty. The region keeps its frame.",
      default: "Empty",
    },
  },
  state: {
    items: {
      description: "The number of pairs.",
      attribute: "data-sprint-items",
    },
    empty: {
      description: "Present when there are no pairs.",
      attribute: "data-sprint-empty",
    },
  },
  agentView: {
    example: '- **DescriptionList** "Key sk-prod" [items=2]',
  },
  examples: [
    {
      title: "Token metadata",
      code: '<DescriptionList\n  label="Key sk-prod"\n  items={[\n    { term: "Created", description: "2026-08-01" },\n    { term: "Last used", description: "2 hours ago" },\n    { term: "Scopes", description: "read, write" },\n  ]}\n/>',
    },
    {
      title: "An empty list",
      description: "The region keeps its frame and states its emptiness.",
      code: '<DescriptionList label="Recovery codes" items={[]} emptyLabel="None generated" />',
    },
  ],
  a11y: {
    role: "definition list",
    notes:
      "Renders a native dl with an aria-label. Terms are dt elements and descriptions dd, so structure survives without styling.",
  },
});
