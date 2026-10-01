import { defineAgentMeta } from "@/agent/registry.ts";
import { ACT_BREADCRUMB_TOOL } from "./tool.ts";

export const breadcrumbMeta = defineAgentMeta({
  name: "Breadcrumb",
  category: "navigation",
  summary:
    "A navigation landmark that renders as one line: the path to the current page, where every crumb opens the level it sits in. Every destination in the tree stays in the page as an addressable part; the crumbs decide which of them a person is shown.",
  whenToUse:
    "Use it as an application's primary navigation when the destinations form a tree, or when the catalogue is larger than a rail can hold. A crumb opens its siblings, a branch drills into its children, and typing in an open crumb searches the whole tree, so what a person chooses from is one level rather than the whole set. Put a page-level command or two in actions. It takes destinations as data because it counts, filters and orders them.",
  whenNotToUse:
    "Do not use it for a handful of links that fit in a sidebar; that is Nav with NavGroup, which keeps every destination visible at once. Do not use it for links inside prose, and do not pass components in items or actions: each destination is a label, an href and its children, not a node.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        "What this navigation is for. Rendered as the landmark's accessible name and as the root of the path.",
      required: true,
    },
    href: {
      kind: "string",
      description:
        "Where the root of the path leads, such as the list a detail page belongs to. Without it the root is plain text.",
    },
    items: {
      kind: "array",
      description:
        "The destinations, as a tree of { label, href?, active?, external?, children? }. The item marked active is the current page, and the crumbs are the path to it. A branch without an href is a level, not a destination.",
      required: true,
    },
    actions: {
      kind: "array",
      description:
        "Commands for the whole page, rendered at the end of the bar, as { label, href?, external?, onSelect? }. An action with an href is a link; one without runs onSelect.",
    },
    maxCrumbs: {
      kind: "number",
      description:
        "How many crumbs the bar shows before it folds the middle of the path behind an ellipsis. On a narrow screen every crumb but the last folds regardless.",
      default: 4,
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
      kind: "string",
      description:
        "Which crumb is open, as its depth from 0, or 'trail', or 'closed'. Pass it to drive the bar from outside, such as from an application-level shortcut; leave it off and the bar keeps its own state.",
    },
    onOpenChange: {
      kind: "handler",
      description:
        "Called with the crumb depth the bar wants open, 'trail', or 'closed'. Required when open is controlled, so the bar can still close itself.",
    },
    defaultVisited: {
      kind: "array",
      description:
        "The hrefs already visited, oldest first, to seed the trail with. Use it to restore a trail recorded through onNavigate when the bar remounts.",
    },
    visited: {
      kind: "array",
      description:
        "The trail as hrefs, oldest first, when the owner keeps it. Leave it off and the bar keeps its own trail for as long as it is mounted.",
    },
    onNavigate: {
      kind: "handler",
      description:
        "Called with the item when a destination is chosen, before the browser follows the href. Use it to record the visit somewhere that outlives this component.",
    },
    agentName: {
      kind: "string",
      description: "Overrides the label when deriving the action tool's name.",
    },
    agentTool: {
      kind: "boolean",
      description: "Whether actions without an href register a WebMCP tool.",
      default: true,
    },
  },
  state: {
    href: {
      description:
        "On the root: where the root of the path leads. On a destination or an action: where it goes.",
      attribute: "data-sprint-href",
    },
    recency: {
      description:
        "On a group of results while the trail is open: 1 for the group visited most recently, counting up. Orders the groups without a style attribute.",
      attribute: "data-sprint-recency",
    },
    path: {
      description:
        "The path to the current page, labels joined by ' / '. Absent when no item is active.",
      attribute: "data-sprint-path",
    },
    destinations: {
      description: "How many destinations the tree holds.",
      attribute: "data-sprint-destinations",
    },
    visited: {
      description: "How many destinations have been visited through this bar.",
      attribute: "data-sprint-visited",
    },
    open: {
      description:
        "Which crumb is open, as its depth, or trail. Absent when the bar is closed to its one line.",
      attribute: "data-sprint-open",
    },
    matches: {
      description: "How many entries the open crumb is showing.",
      attribute: "data-sprint-matches",
    },
    shown: {
      description:
        "On a destination: present when the open crumb is currently showing it to a person. Every destination stays in the page either way.",
      attribute: "data-sprint-shown",
    },
    parent: {
      description:
        "On a destination: the labels of the levels above it, joined by ' / '.",
      attribute: "data-sprint-parent",
    },
    active: {
      description: "On a destination: present when it is the current page.",
      attribute: "data-sprint-active",
    },
    ancestor: {
      description:
        "On a destination: present when it is on the path to the current page.",
      attribute: "data-sprint-ancestor",
    },
  },
  tools: { act: ACT_BREADCRUMB_TOOL },
  agentView: {
    example:
      '- **Breadcrumb** "Workbench" [destinations=2, path=display / Table, visited=0] → tool `act-workbench`\n  - part `action` "Copy link"\n  - part `destination` "Button" [href=#/Button, parent=action]\n  - part `destination` "Table" [active, href=#/Table, parent=display]',
  },
  a11y: {
    role: "navigation",
    notes:
      "The label is the landmark's accessible name and the crumbs are an ordered list, the current one carrying aria-current=page. Destinations the open crumb is not showing are hidden from the accessibility tree by CSS, so a screen reader travels one level at a time exactly as a sighted reader does, while the page itself keeps all of them. From the field, ArrowDown enters the results and ArrowUp at the top returns to it; typing anywhere in the results goes back to the field and keeps the character. Enter takes the first result. Escape closes the bar, as does a press outside it, and the match count is a polite live region. ArrowUp in an empty field recalls the trail, the way a console recalls history. The ellipsis that folds the middle of the path is a toggle with aria-expanded.",
  },
  relatedComponents: ["Nav", "NavGroup", "Link", "Shell"],
  examples: [
    {
      title: "A path you can edit",
      description:
        "One line of chrome over a tree. Each crumb opens the level it sits in and filters it as you type; a branch drills into its children.",
      code: '<Breadcrumb\n  label="Workbench"\n  items={[\n    { label: "action", children: [{ href: "#/Button", label: "Button" }] },\n    {\n      label: "display",\n      children: [{ href: "#/Table", label: "Table", active: true }],\n    },\n  ]}\n/>',
    },
    {
      title: "A deep path that folds",
      description:
        "Past maxCrumbs the middle of the path folds behind an ellipsis, which unfolds it again. A crumb that is open is never folded.",
      code: '<Breadcrumb\n  label="Store"\n  maxCrumbs={3}\n  items={[\n    {\n      label: "Clothing",\n      href: "#/clothing",\n      children: [\n        {\n          label: "Outerwear",\n          href: "#/clothing/outerwear",\n          children: [\n            {\n              label: "Jackets",\n              href: "#/clothing/outerwear/jackets",\n              children: [{ label: "Rain shell", href: "#/rain-shell", active: true }],\n            },\n          ],\n        },\n      ],\n    },\n  ]}\n/>',
    },
    {
      title: "Trailing actions",
      description:
        "Commands for the whole page sit at the end of the bar. A link action publishes its href; one with onSelect registers a WebMCP tool, since an agent has no URL to reach it by.",
      code: '<Breadcrumb\n  label="Docs"\n  items={[{ label: "guides", children: [{ href: "#/guide/webmcp", label: "WebMCP", active: true }] }]}\n  actions={[\n    { label: "Copy link", onSelect: () => navigator.clipboard.writeText(location.href) },\n    { label: "Source", href: "https://github.com/westonkd/sprint", external: true },\n  ]}\n/>',
    },
    {
      title: "A root that leads back",
      description:
        'Give the root an href and it becomes a link back to the list the page belongs to, the way "People" leads from a person back to everyone.',
      code: '<Breadcrumb\n  label="People"\n  href="#/people"\n  items={[\n    {\n      label: "Admin",\n      href: "#/people?role=admin",\n      children: [{ label: "Tess Ocampo", href: "#/people/tess", active: true }],\n    },\n  ]}\n/>',
    },
    {
      title: "Recording where a person has been",
      description:
        "The bar keeps a trail of the destinations chosen through it, reachable from the visited count at its head. Record visits through onNavigate and hand them back in defaultVisited, and the trail survives the bar remounting.",
      code: '<Breadcrumb\n  label="Docs"\n  items={[{ label: "guides", children: [{ href: "#/guide/webmcp", label: "WebMCP" }] }]}\n  defaultVisited={["#/guide/webmcp"]}\n  onNavigate={(item) => console.log(item.href)}\n/>',
    },
  ],
});
