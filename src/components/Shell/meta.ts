import { defineAgentMeta } from "@/agent/registry.ts";

export const shellMeta = defineAgentMeta({
  name: "Shell",
  category: "layout",
  summary:
    "The page-level frame: a sidebar and a main content region, with the landmark wiring done once. On a phone the sidebar becomes a top bar whose drawer opens from a menu button; on a desktop it is a full-height rail.",
  whenToUse:
    "Use it once, at the root of an app view. Put the brand in bar, a Nav in side, and the page in children. It renders the main and complementary landmarks, a skip-to-content control for keyboard users, and the mobile drawer behaviour, so none of that is rebuilt per app. Like Stack it is silent in agent view: its regions speak for themselves.",
  whenNotToUse:
    "Do not use it inside another Shell, or anywhere below the top of the page; a region within a page is a Panel. Do not use it just to put two columns next to each other; that is Stack.",
  status: "experimental",
  props: {
    children: {
      kind: "node",
      description: "The page content. Rendered inside the main landmark.",
      required: true,
    },
    side: {
      kind: "node",
      description:
        "The sidebar content, usually a Nav. On narrow viewports it becomes the drawer behind the menu button, and the drawer closes itself when a link inside it is followed.",
    },
    bar: {
      kind: "node",
      description:
        "What stays visible when the sidebar collapses to a top bar: typically the brand link. The menu button renders next to it automatically.",
    },
    sideLabel: {
      kind: "string",
      description: "Accessible name for the sidebar landmark.",
      default: "Sidebar",
    },
    skipLabel: {
      kind: "string",
      description:
        "Text of the skip control that moves focus to the main region. Visually hidden until focused.",
      default: "Skip to content",
    },
    menuLabel: {
      kind: "string",
      description: "Label of the drawer button while the drawer is closed.",
      default: "Menu",
    },
    closeLabel: {
      kind: "string",
      description: "Label of the drawer button while the drawer is open.",
      default: "Close",
    },
  },
  state: {
    open: {
      description:
        "Present while the mobile drawer is open. On wide viewports the sidebar is always visible and this state is inert.",
      attribute: "data-sprint-open",
    },
  },
  a11y: {
    notes:
      "Renders the only main element and an aside named by sideLabel, so the page has its landmarks without any consumer wiring. The first focusable element is a skip control that moves focus to main without touching the URL, which keeps it safe in hash-routed apps. The drawer button carries aria-expanded and aria-controls.",
  },
  relatedComponents: ["Nav", "Panel", "Stack"],
  examples: [
    {
      title: "A sidebar app shell",
      description:
        "One Shell per view. The sidebar collapses to a top bar with a drawer on narrow screens, and an agent reading the page sees the nav and the content with no frame in between.",
      code: '<Shell\n  bar={<Link href="#/">ACME</Link>}\n  side={\n    <Nav label="Main">\n      <Link href="#/reports" active>Reports</Link>\n      <Link href="#/settings">Settings</Link>\n    </Nav>\n  }\n>\n  <Panel label="Reports" headingLevel={2}>\n    <Text>Quarterly numbers land here.</Text>\n  </Panel>\n</Shell>',
    },
  ],
});
