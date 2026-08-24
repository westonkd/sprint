import { defineAgentMeta } from "@/agent/registry.ts";
import { OPEN_CARD_TOOL } from "./tool.ts";

export const cardMeta = defineAgentMeta({
  name: "Card",
  category: "navigation",
  summary:
    "One entry in a catalogue: a keylined block with a title, a line or two of body, and the whole block clickable. Give it an href and it is a link; give it onClick and it is an action that registers an open tool.",
  whenToUse:
    "Use it in a grid of comparable things a person picks between: components in a catalogue, results in a list, templates to start from. The title is the accessible name, so it is also what an agent selects on.",
  whenNotToUse:
    "Do not use it for a static region with a header; that is Panel. Do not put separate controls inside one, because the whole card is already a single control and nesting buttons inside a link is invalid.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        "The card's title, and its accessible name. Also derives the tool name when the card acts.",
      required: true,
    },
    children: {
      kind: "node",
      description:
        "A line or two describing the entry. Carried in the agent view as the body part.",
    },
    href: {
      kind: "string",
      description:
        "Destination, which makes the card a link. A card that navigates registers no tool by default.",
    },
    onClick: {
      kind: "handler",
      description:
        "What clicking does. Alone it makes the card a button that registers an open tool by default. Alongside href the card stays a link and the handler rides the click, so a client-side router can intercept the navigation.",
    },
    disabled: {
      kind: "boolean",
      description:
        "Disable an acting card and unregister its tool. Has no effect on a card that navigates.",
      default: false,
    },
    agentTool: {
      kind: "boolean",
      description:
        "Override the default: on for a card that acts, off for a card that navigates, because an agent can reach an href on its own.",
    },
    agentName: {
      kind: "string",
      description:
        "Override the label used to derive the tool name, when two cards share a title.",
    },
  },
  state: {
    href: {
      description: "Where the card goes, when it navigates.",
      attribute: "data-sprint-href",
    },
    disabled: {
      description: "Present when the card cannot be opened.",
      attribute: "data-sprint-disabled",
    },
  },
  tools: {
    open: OPEN_CARD_TOOL,
  },
  agentView: {
    example:
      '- **Card** "Button" [href=#/Button]\n  - part `title` "Button"\n  - part `body` "A single action a person or an agent can trigger."',
  },
  examples: [
    {
      title: "A catalogue entry",
      description:
        "A card that navigates. No tool, because the href is already public.",
      code: '<Card label="Button" href="#/Button">\n  A single action a person or an agent can trigger.\n</Card>',
    },
    {
      title: "A card that acts",
      description:
        "onClick instead of href, so the card registers open-start-from-blank and an agent can take it.",
      code: '<Card label="Start from blank" onClick={create}>\n  An empty page with the provider already wired up.\n</Card>',
    },
  ],
  a11y: {
    notes:
      "The whole block is one control: a link when it has an href, a button when it acts. The title names it, and the body is read as its content rather than as part of the name.",
  },
});
