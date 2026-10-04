import { defineAgentMeta } from "@/agent/registry.ts";
import { CHOOSE_MENU_TOOL } from "./tool.ts";

export const menuMeta = defineAgentMeta({
  name: "Menu",
  category: "action",
  summary:
    "A button that opens a short list of actions, links, or one-of-several choices. Registers one choose tool enumerating the items an agent can run.",
  whenToUse:
    "Use to gather secondary actions behind one control: a card's edit, duplicate and delete; an account menu; a share menu; a switcher between a few named views. Items hold data, not elements: each is { label, onSelect?, href?, checked?, tone?, disabled?, group?, icon? }. An item with checked becomes a radio choice with a visible mark, so a menu can also pick one value from a short list.",
  whenNotToUse:
    "Do not use for the primary action of a view; that is a Button. Do not use to pick a form value that is submitted with other fields; that is a Select or a SegmentedControl. Do not use for navigation that should stay visible; that is a Nav or a Breadcrumb. Items take plain text labels and an optional icon, never components.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'What the menu holds, such as "Card actions" or "Share". It is the trigger\'s text, names the menu for assistive technology, and derives the choose tool name.',
      required: true,
    },
    items: {
      kind: "array",
      description:
        'The items in order: { label, onSelect?, href?, external?, checked?, tone?, disabled?, group?, icon? }. onSelect runs the item; href makes it a link, which agents reach by URL rather than the tool. checked, true or false, makes the item a radio choice. tone="danger" marks a destructive item. Consecutive items sharing a group string are gathered under that heading.',
      required: true,
    },
    icon: {
      kind: "node",
      description: "An icon drawn on the trigger before its label.",
    },
    hideLabel: {
      kind: "boolean",
      description:
        "Show only the icon on a square trigger, such as a three-dot card menu. The label stays the accessible name and the tool name, and shows as a tooltip. Requires icon.",
      default: false,
    },
    size: {
      kind: "enum",
      description: "The trigger's size, matching Button.",
      values: ["medium", "small"],
      default: "medium",
    },
    align: {
      kind: "enum",
      description:
        "Which edge of the trigger the list lines up with. Use end for a menu at the right of a card or a toolbar.",
      values: ["start", "center", "end"],
      default: "start",
    },
    side: {
      kind: "enum",
      description:
        "Where the list prefers to open. It flips to the other side when there is no room, so a menu low on the screen still opens fully in view.",
      values: ["below", "above"],
      default: "below",
    },
    disabled: {
      kind: "boolean",
      description: "Disable the trigger and unregister the choose tool.",
      default: false,
    },
    onOpenChange: {
      kind: "handler",
      description: "Called with true when the list opens and false when it closes.",
    },
    agentName: {
      kind: "string",
      description:
        "Override the label used to derive the tool name, such as when every card on a page has a menu called Actions.",
    },
    agentTool: {
      kind: "boolean",
      description: "Set false to render the menu without registering the choose tool.",
      default: true,
    },
  },
  state: {
    open: {
      description: "Present while the list is open on screen.",
      attribute: "data-sprint-open",
    },
    disabled: {
      description: "Present when the menu cannot be opened.",
      attribute: "data-sprint-disabled",
    },
  },
  tools: {
    choose: CHOOSE_MENU_TOOL,
  },
  agentView: {
    example:
      '- **Menu** "Card actions" → tool `choose-card-actions`\n  - part `item` "Edit"\n  - part `item` "Delete" [tone=danger]',
  },
  examples: [
    {
      title: "Card actions",
      description:
        "A three-dot trigger at the end of a card. The destructive item is marked, and an agent runs either item through the choose tool without opening anything.",
      code: '<Menu\n  label="Card actions"\n  icon={<MoreIcon />}\n  hideLabel\n  size="small"\n  align="end"\n  items={[\n    { label: "Edit", onSelect: edit },\n    { label: "Duplicate", onSelect: duplicate },\n    { label: "Delete", tone: "danger", onSelect: remove },\n  ]}\n/>',
    },
    {
      title: "Links and actions together",
      description:
        "An item with href is a real link and is left out of the tool, because a URL already reaches it. Groups gather related items under a heading.",
      code: '<Menu\n  label="Account"\n  items={[\n    { label: "Profile", href: "#/profile", group: "Signed in as Nomad" },\n    { label: "Settings", href: "#/settings", group: "Signed in as Nomad" },\n    { label: "Sign out", onSelect: signOut },\n  ]}\n/>',
    },
    {
      title: "Choosing one of several",
      description:
        "checked turns items into radio choices with a visible mark, so the menu doubles as a compact picker. It opens with focus on the checked item.",
      code: '<Menu\n  label={plannerLabel}\n  agentName="Planner"\n  items={planners.map((name) => ({\n    label: name,\n    checked: name === planner,\n    onSelect: () => setPlanner(name),\n  }))}\n/>',
    },
  ],
  a11y: {
    role: "menu",
    keyboard: [
      "Enter, Space or Down Arrow on the trigger opens the list on the first or checked item",
      "Up Arrow on the trigger opens it on the last item",
      "Arrow keys move between items and wrap",
      "Home and End move to the first and last item",
      "A letter moves to the next item starting with it",
      "Escape closes the list and returns focus to the trigger",
      "Tab closes the list and moves on",
    ],
    notes:
      "The trigger has aria-haspopup=menu and aria-expanded. Items are menuitem buttons or links, or menuitemradio with aria-checked. The list is a popover in the top layer rendered inside the menu's own DOM, so it opens above a modal Dialog and is never clipped by an ancestor's overflow. Disabled items are skipped by the keyboard.",
  },
});
