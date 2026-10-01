import { defineAgentMeta } from "@/agent/registry.ts";
import { EXPAND_DISCLOSURE_TOOL } from "./tool.ts";

export const disclosureMeta = defineAgentMeta({
  name: "Disclosure",
  category: "layout",
  summary:
    "A labelled region a person can show or hide with a toggle that carries its expanded state. Collapsing conceals the content from a person only: it stays in the page, and the agent view always renders it.",
  whenToUse:
    'Use it for secondary detail a person reads on demand beside the primary content, such as an access breakdown on a user page behind "Show access breakdown". It replaces a Button that swaps its own label, because the toggle publishes aria-expanded and the region it controls, and the content stays readable to an agent without a click.',
  whenNotToUse:
    "Do not use it to hide content an agent should not read; collapsing is a human affordance and the agent view carries the content regardless. Do not use it for a region that is always visible, which is a Panel, or for content that must interrupt the page, which is a Dialog. Do not use it to switch between alternative views of the same data, which is a SegmentedControl.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'What the region is, as a noun phrase such as "Access breakdown". It names the region for a screen reader, derives the toggle text and the tool name.',
      required: true,
    },
    children: {
      kind: "node",
      description:
        "The region's content. It is always mounted: collapsing hides it from a person with CSS, so components inside keep their tools and stay in the page projection.",
    },
    expanded: {
      kind: "boolean",
      description:
        "Whether the region is revealed. Pass it with onExpandedChange to control the disclosure; leave it unset to let the disclosure keep its own state.",
    },
    defaultExpanded: {
      kind: "boolean",
      description: "The initial state when the disclosure is uncontrolled.",
      default: false,
    },
    onExpandedChange: {
      kind: "handler",
      description:
        "Called with the new state whenever the toggle is pressed, by a person, a DOM-driving agent, or the expand tool.",
    },
    showLabel: {
      kind: "string",
      description: "The toggle text while collapsed.",
      default: '"Show " followed by the label',
    },
    hideLabel: {
      kind: "string",
      description: "The toggle text while expanded.",
      default: '"Hide " followed by the label',
    },
    agentName: {
      kind: "string",
      description:
        "Override the label used to derive the tool name, when two disclosures on a page would otherwise collide.",
    },
    agentTool: {
      kind: "boolean",
      description:
        "Set false to render the disclosure without registering an expand tool.",
      default: true,
    },
  },
  state: {
    expanded: {
      description:
        "Present while the region is revealed to a person. Absent means collapsed: the content is still in the page, concealed by CSS rather than unmounted or marked hidden.",
      attribute: "data-sprint-expanded",
    },
  },
  tools: {
    expand: EXPAND_DISCLOSURE_TOOL,
  },
  agentView: {
    example:
      '- **Disclosure** "Access breakdown" → tool `expand-access-breakdown`\n  - part `toggle` "Show access breakdown"\n  - **Text** "Admin through the Operators group."',
  },
  examples: [
    {
      title: "Secondary detail on demand",
      description:
        "Uncontrolled: the disclosure keeps its own state. In agent view the content renders beneath the line whether or not a person has opened it, and the toggle is one control.",
      code: '<Disclosure label="Access breakdown">\n  <Text>Admin through the Operators group.</Text>\n</Disclosure>',
    },
    {
      title: "A controlled disclosure",
      description:
        "Pass expanded and onExpandedChange when something else on the page needs to know or set whether the region is open. The expand tool drives the same toggle.",
      code: '<Disclosure\n  label="Access breakdown"\n  expanded={open}\n  onExpandedChange={setOpen}\n>\n  <Text>Admin through the Operators group.</Text>\n</Disclosure>',
    },
    {
      title: "Custom toggle text",
      description:
        "showLabel and hideLabel replace the derived toggle text when the noun phrase does not read naturally after Show and Hide.",
      code: '<Disclosure label="Audit trail" showLabel="Show 12 events" hideLabel="Hide events">\n  <Text>Last change was a role grant by the on-call operator.</Text>\n</Disclosure>',
    },
  ],
  a11y: {
    role: "region",
    keyboard: ["Enter toggles", "Space toggles"],
    notes:
      "The root is a section named by the label. The toggle is a real button with aria-expanded and aria-controls pointing at the content. Collapsed content is display: none, which removes it from the accessibility tree for a person and a screen reader while leaving it in the DOM for the agent projection.",
  },
  relatedComponents: ["Panel", "Switch"],
});
