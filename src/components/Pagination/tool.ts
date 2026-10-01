import type { AgentToolSpec } from "@/agent/types.ts";

export const TURN_PAGE_TOOL: AgentToolSpec = {
  verb: "turn",
  description:
    "Go to a page of this paginated set by its 1-based number, exactly as a person pressing Previous or Next until they reach it would. Any page from 1 to the page count is accepted, not just the neighbours. Returns the pagination's state after the change, including which items are now showing, so a follow-up read is unnecessary.",
  inputSchema: {
    type: "object",
    properties: {
      page: {
        type: "integer",
        description: "The 1-based number of the page to show.",
        minimum: 1,
      },
    },
    required: ["page"],
  },
  readOnly: false,
  untrustedContent: false,
  registeredWhen:
    "The pagination is mounted, changes page through onPageChange rather than href, has more than one page, has a resolvable label, and no other component claims the same tool name. The registered schema states the current page count.",
  unregisteredWhen:
    "The pagination unmounts, is given href, loses onPageChange, or shrinks to a single page.",
};
