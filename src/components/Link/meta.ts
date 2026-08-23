import { defineAgentMeta } from "@/agent/registry.ts";
import { OPEN_LINK_TOOL } from "./tool.ts";

export const linkMeta = defineAgentMeta({
  name: "Link",
  category: "navigation",
  summary:
    "A navigation link. It publishes its destination as state, so an agent reading the page in text learns the URL rather than having to click to find out, and it renders a real anchor in both views.",
  whenToUse:
    "Use it for anything that changes the address: a nav item, a cross-reference, a link out to a specification. Set active on the item matching the current route so the agent view and the human view agree about where you are.",
  whenNotToUse:
    "Do not use it for an action that stays on the page; that is a Button. Do not register a tool on ordinary navigation: an agent can already reach a URL, and a page of links would flood its tool list for no gain.",
  status: "experimental",
  props: {
    href: {
      kind: "string",
      description:
        "The destination. Published as data-sprint-href and carried in the agent view, so the URL is readable without a click.",
      required: true,
    },
    children: {
      kind: "node",
      description:
        "The link text. It names the destination, so prefer the page's name over here or read more.",
      required: true,
    },
    active: {
      kind: "boolean",
      description:
        "Mark the link as the current location. Sets aria-current so a screen reader and an agent learn it the same way.",
      default: false,
    },
    external: {
      kind: "boolean",
      description:
        "Mark a destination outside this app. Opens in a new context and adds the usual rel protections.",
      default: false,
    },
    agentTool: {
      kind: "boolean",
      description:
        "Set true to register an open tool for this link. Off by default: navigation is reachable by URL, so a tool per link is cost without benefit.",
      default: false,
    },
    agentName: {
      kind: "string",
      description:
        "Override the label used to derive the tool name, for icon-only links or two links with the same text.",
    },
  },
  state: {
    href: {
      description: "Where this link goes.",
      attribute: "data-sprint-href",
    },
    active: {
      description: "Present when this link is the current location.",
      attribute: "data-sprint-active",
    },
    external: {
      description: "Present when the destination is outside this app.",
      attribute: "data-sprint-external",
    },
  },
  tools: {
    open: OPEN_LINK_TOOL,
  },
  agentView: {
    example: '- **Link** "Button" [active, href=#/Button]',
  },
  examples: [
    {
      title: "A nav item",
      code: '<Link href="#/Button" active={route === "Button"}>Button</Link>',
    },
    {
      title: "A link out",
      code: '<Link href="https://developer.chrome.com/docs/ai/webmcp" external>\n  Chrome docs\n</Link>',
    },
    {
      title: "A link an agent may follow itself",
      description:
        "Opting in is for the one link that completes a task, not for a nav list.",
      code: '<Link href="#/checkout" agentTool>Go to checkout</Link>',
    },
  ],
  a11y: {
    role: "link",
    keyboard: ["Enter follows the link"],
    notes:
      "active sets aria-current=page. External links open in a new context with rel=noreferrer noopener, and carry their outward mark as a pseudo-element so it never reaches the accessible name or the tool name.",
  },
});
