import { defineAgentMeta } from "@/agent/registry.ts";
import { TURN_PAGE_TOOL } from "./tool.ts";

export const paginationMeta = defineAgentMeta({
  name: "Pagination",
  category: "navigation",
  summary:
    'A navigation landmark for a long set shown one page at a time: Previous and Next controls, a "Page 2 of 3" readout, and a "Showing 26–50 of 61" summary of which items are on screen. It takes counts rather than items, so it works the same over a local array or a server query.',
  whenToUse:
    "Use it under or above a Table or List whose items arrive a page at a time, when the count is known. Give it onPageChange to page in place, which registers one turn tool that can jump straight to any page; give it href to make every page a URL, which needs no tool because a link is already reachable. Its state carries the page, the page count and the item range, so an agent reading the page knows how much it has not seen.",
  whenNotToUse:
    "Do not use it when the total is unknown or the set grows as it is read; that is a load-more Button. Do not use it for steps in a flow a person must complete in order, and do not use it to move between unrelated pages, which is Nav or Breadcrumb. Do not use it for a set that fits on one screen: it renders, but has nothing to do.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'What is being paged. Names the navigation landmark and derives the tool name, so prefer a noun phrase such as "Users pages".',
      required: true,
    },
    page: {
      kind: "number",
      description:
        "The 1-based page currently shown. The component is controlled; a value outside 1 to the page count is clamped into it.",
      required: true,
    },
    pageSize: {
      kind: "number",
      description: "How many items a full page holds. Values below 1 are treated as 1.",
      required: true,
    },
    total: {
      kind: "number",
      description:
        "How many items the whole set holds. The page count is total divided by pageSize, rounded up, and never less than 1, so an empty set is one empty page.",
      required: true,
    },
    onPageChange: {
      kind: "handler",
      description:
        "Called with the page to show. Without href the controls are buttons and the turn tool registers; with href it runs alongside the link, for routers that intercept clicks.",
    },
    href: {
      kind: "handler",
      description:
        "Given a page number, returns its URL. When present, Previous and Next render as links, each publishes its URL as data-sprint-href, and no tool registers.",
    },
    previousLabel: {
      kind: "string",
      description: "The text of the control that goes back a page.",
      default: "Previous",
    },
    nextLabel: {
      kind: "string",
      description: "The text of the control that goes forward a page.",
      default: "Next",
    },
    agentName: {
      kind: "string",
      description:
        "Override the label used to derive the tool name, when two paginations on a page would otherwise collide.",
    },
    agentTool: {
      kind: "boolean",
      description: "Set false to render the controls without registering a turn tool.",
      default: true,
    },
  },
  state: {
    page: {
      description: "The 1-based page shown, after clamping.",
      attribute: "data-sprint-page",
    },
    pages: {
      description: "How many pages the set spans. Never less than 1.",
      attribute: "data-sprint-pages",
    },
    total: {
      description: "How many items the whole set holds.",
      attribute: "data-sprint-total",
    },
    first: {
      description:
        "The 1-based position of the first item on this page, or 0 when the set is empty.",
      attribute: "data-sprint-first",
    },
    last: {
      description:
        "The 1-based position of the last item on this page, or 0 when the set is empty.",
      attribute: "data-sprint-last",
    },
  },
  tools: {
    turn: TURN_PAGE_TOOL,
  },
  agentView: {
    example:
      '- **Pagination** "Users pages" [first=26, last=50, page=2, pages=3, total=61] → tool `turn-users-pages`\n  - part `previous` "Previous"\n  - part `next` "Next"',
  },
  a11y: {
    role: "navigation",
    keyboard: [
      "Tab reaches Previous and Next in order",
      "Enter or Space on a button, Enter on a link, turns the page",
    ],
    notes:
      "The root is a nav landmark named by label. A control with nowhere to go is a disabled button, or a link with no href and aria-disabled, so it leaves the tab order. The item summary is a polite live region, so a screen reader hears the new range after a turn.",
  },
  relatedComponents: ["Table", "List", "Nav", "Breadcrumb"],
  examples: [
    {
      title: "Paging a table in place",
      description:
        "With onPageChange the controls are buttons and one turn tool registers, so an agent can jump to page 3 without pressing Next twice.",
      code: '<Pagination\n  label="Users pages"\n  page={page}\n  pageSize={25}\n  total={61}\n  onPageChange={setPage}\n/>',
    },
    {
      title: "Pages as links",
      description:
        "With href every page is a URL. The controls are links, nothing registers, and each link publishes where it goes.",
      code: `<Pagination\n  label="Changelog pages"\n  page={2}\n  pageSize={10}\n  total={42}\n  href={(page) => \`#/changelog?page=\${page}\`}\n/>`,
    },
    {
      title: "The last page, relabelled",
      description:
        "On the last page Next is disabled and the summary shows the short final range. The labels are overridable for sets that read better as time.",
      code: '<Pagination\n  label="Activity pages"\n  page={4}\n  pageSize={8}\n  total={31}\n  previousLabel="Newer"\n  nextLabel="Older"\n  onPageChange={setPage}\n/>',
    },
    {
      title: "An empty set",
      description:
        "No items is one empty page. Both controls are disabled, no tool registers, and the summary still says what it is showing.",
      code: '<Pagination\n  label="Search results pages"\n  page={1}\n  pageSize={20}\n  total={0}\n  onPageChange={setPage}\n/>',
    },
  ],
});
