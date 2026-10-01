import { defineAgentMeta } from "@/agent/registry.ts";

export const emptyStateMeta = defineAgentMeta({
  name: "EmptyState",
  category: "feedback",
  summary:
    "A region that says there is nothing here, and why: a headline, an optional sentence, and an optional way out such as clearing filters or creating the first record. It marks the empty field with the register's own empty ornament.",
  whenToUse:
    'Use it in place of a list, grid, or set of results that has nothing to show, so the space says it is empty rather than rendering nothing. Set reason="filtered" when records exist but none match, so an agent knows to relax the filters rather than conclude there is no data.',
  whenNotToUse:
    "Do not use it for an empty Table, List, or Panel; those already carry their own emptyLabel. Do not use it for a failure; that is an Alert. Do not use it while data is still loading; that is Pending.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'The headline, saying what is empty in a few words: "No one matches these filters". The region\'s accessible name.',
      required: true,
    },
    description: {
      kind: "string",
      description:
        "One sentence of explanation or next step. Carried as the description part.",
    },
    action: {
      kind: "object",
      description:
        "The one way out, as data: { label, onSelect?, href? }. An href renders a Link, otherwise a Button that registers its own press tool, so the action is a single control in the agent view.",
    },
    reason: {
      kind: "enum",
      description:
        "Why it is empty: nothing exists yet, or nothing matches the current filters.",
      values: ["empty", "filtered"],
      default: "empty",
    },
  },
  state: {
    empty: {
      description: "Always present, so one selector finds every empty region.",
      attribute: "data-sprint-empty",
    },
    reason: {
      description: "Why the region is empty.",
      attribute: "data-sprint-reason",
      values: ["empty", "filtered"],
    },
  },
  agentView: {
    example:
      '- **EmptyState** "No one matches these filters" [empty, reason=filtered]\n  - part `description` "Try a different role or clear the search."',
  },
  examples: [
    {
      title: "Nothing matches",
      description:
        "Records exist but the filters exclude them all. The action is a Button, so it registers press-clear-filters.",
      code: '<EmptyState\n  reason="filtered"\n  label="No one matches these filters"\n  description="Try a different role or clear the search."\n  action={{ label: "Clear filters", onSelect: clearFilters }}\n/>',
    },
    {
      title: "Nothing yet",
      description: "The first-run case, with a link to where records are made.",
      code: '<EmptyState\n  label="No projects yet"\n  description="Projects you create or are invited to appear here."\n  action={{ label: "Create a project", href: "#/projects/new" }}\n/>',
    },
    {
      title: "Just the headline",
      code: '<EmptyState label="No notifications" />',
    },
  ],
  a11y: {
    role: "group",
    notes:
      "The headline names the group and the description describes it. The action is an ordinary Button or Link inside it, reached in normal tab order.",
  },
  relatedComponents: ["Pending", "Alert", "Button", "Link"],
});
