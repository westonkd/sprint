import { defineAgentMeta } from "@/agent/registry.ts";

export const navBarMeta = defineAgentMeta({
  name: "NavBar",
  category: "navigation",
  summary:
    "A navigation landmark that renders as one line: where you are, written as a coordinate you can edit. Every destination stays in the page as an addressable part; the coordinate decides which of them a person is shown.",
  whenToUse:
    "Use it as an application's primary navigation when the catalogue is larger than a rail can hold, or when the layout needs its full width. Each segment of the coordinate opens its own level and filters as you type, so what a person chooses from is one level rather than the whole set. It takes destinations as data because it counts, filters and orders them.",
  whenNotToUse:
    "Do not use it for a handful of links that fit in a sidebar; that is Nav with NavGroup, which keeps every destination visible at once. Do not use it for links inside prose, and do not pass components in groups: each destination is a label and an href, not a node.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        "What this navigation is for. Rendered as the landmark's accessible name and as the root of the coordinate.",
      required: true,
    },
    groups: {
      kind: "array",
      description:
        "The destinations, as groups of { label, items }, each item { href, label, active?, external? }. Order is the order a person travels them.",
      required: true,
    },
    emptyLabel: {
      kind: "string",
      description: "What the bar says when a filter matches no destination.",
      default: "No match",
    },
    trailEmptyLabel: {
      kind: "string",
      description: "What the bar says when nothing has been visited through it yet.",
      default: "Nothing visited yet",
    },
    open: {
      kind: "enum",
      description:
        "Which segment is open, or 'closed'. Pass it to drive the bar from outside, such as from an application-level shortcut; leave it off and the bar keeps its own state.",
      values: ["trail", "group", "leaf", "closed"],
    },
    onOpenChange: {
      kind: "handler",
      description:
        "Called with the segment the bar wants open, or 'closed'. Required when open is controlled, so the bar can still close itself.",
    },
    onNavigate: {
      kind: "handler",
      description:
        "Called with the destination when one is chosen, before the browser follows the href. Use it to record the visit somewhere that outlives this component.",
    },
  },
  state: {
    destinations: {
      description: "How many destinations the bar holds.",
      attribute: "data-sprint-destinations",
    },
    open: {
      description:
        "Which segment of the coordinate is open: trail, group, or leaf. Absent when the bar is closed to its one line.",
      attribute: "data-sprint-open",
    },
    depth: {
      description: "How many destinations have been visited through this bar.",
      attribute: "data-sprint-depth",
    },
    matches: {
      description: "How many destinations the open segment is showing.",
      attribute: "data-sprint-matches",
    },
    shown: {
      description:
        "On a destination: present when the open segment is currently showing it to a person. Every destination stays in the page either way.",
      attribute: "data-sprint-shown",
    },
    group: {
      description: "On a destination: the group it belongs to.",
      attribute: "data-sprint-group",
    },
    href: {
      description: "On a destination: where it goes.",
      attribute: "data-sprint-href",
    },
    active: {
      description: "On a destination: present when it is the current page.",
      attribute: "data-sprint-active",
    },
  },
  agentView: {
    example:
      '- **NavBar** "Workbench" [destinations=2, depth=0]\n  - part `destination` "Button" [group=action, href=#/Button]\n  - part `destination` "Table" [group=display, href=#/Table, active, shown]',
  },
  a11y: {
    role: "navigation",
    notes:
      "The label is the landmark's accessible name. The current destination carries aria-current=page. Destinations the coordinate is not showing are hidden from the accessibility tree by CSS, so a screen reader travels one level at a time exactly as a sighted reader does, while the page itself keeps all of them. From the field, ArrowDown enters the results and ArrowUp at the top returns to it; typing anywhere in the results goes back to the field and keeps the character. Escape closes the bar, as does a press outside it, and the match count is a polite live region. ArrowUp in an empty field recalls the trail, the way a console recalls history.",
  },
  relatedComponents: ["Nav", "NavGroup", "Link", "Shell"],
  examples: [
    {
      title: "A coordinate bar",
      description:
        "One line of chrome over a grouped catalogue. Clicking a segment opens that level and filters it as you type.",
      code: '<NavBar\n  label="Workbench"\n  groups={[\n    { label: "action", items: [{ href: "#/Button", label: "Button" }] },\n    { label: "display", items: [{ href: "#/Table", label: "Table", active: true }] },\n  ]}\n/>',
    },
    {
      title: "Recording where a person has been",
      description:
        "The bar keeps a trail of the destinations chosen through it, reachable from the depth count at its head. onNavigate is how that outlives the component.",
      code: '<NavBar\n  label="Docs"\n  groups={[{ label: "guides", items: [{ href: "#/guide/webmcp", label: "WebMCP" }] }]}\n  onNavigate={(destination) => console.log(destination.href)}\n/>',
    },
  ],
});
