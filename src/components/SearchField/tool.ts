import type { AgentToolSpec } from "@/agent/types.ts";

export const SEARCH_TOOL: AgentToolSpec = {
  verb: "search",
  description:
    "Search with this field: replace its text with the query, exactly as a person typing it would, then submit it as pressing Enter would. Pass an empty string to clear the search. Results usually render elsewhere on the page; this returns the field's state after the search, so read the results region next.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "The full search text. Replaces the current query rather than appending to it; an empty string clears the search.",
      },
    },
    required: ["query"],
  },
  readOnly: false,
  untrustedContent: true,
  registeredWhen:
    "The field is mounted, enabled, has a resolvable label, and no other component claims the same tool name.",
  unregisteredWhen: "The field unmounts or becomes disabled.",
};
