import { defineAgentMeta } from "@/agent/registry.ts";
import { OPEN_ENTITY_ROW_TOOL } from "./tool.ts";

export const entityRowMeta = defineAgentMeta({
  name: "EntityRow",
  category: "display",
  summary:
    "One record in a list of records, as a single clickable row: a title, a few Tags, and one line of meta. Give it an href and the whole row is a link; give it onSelect and it is an action that registers an open tool.",
  whenToUse:
    'Use it for a list of people, projects, or anything else a person scans and picks one of, where each entry needs a name, a classification, and a line of context such as last activity. Stack several in a Stack with gap="none" and adjacent rows share their keylines. The title is the accessible name, so it is also what an agent selects on.',
  whenNotToUse:
    "Do not use it when the entries are compared column by column; that is a Table. Do not use it for a catalogue entry with a paragraph of body; that is a Card. Do not put controls in it: the whole row is already one link or button, so tags and meta are data, not components.",
  status: "experimental",
  props: {
    title: {
      kind: "string",
      description:
        "The record's name, and the row's accessible name. Also derives the tool name when the row acts.",
      required: true,
    },
    href: {
      kind: "string",
      description:
        "Destination, which makes the whole row a link. A row that navigates registers no tool by default, because an agent can follow the href itself.",
    },
    onSelect: {
      kind: "handler",
      description:
        "What clicking does, called with the click event. Alone it makes the row a button that registers an open tool by default. Alongside href the row stays a link and the handler rides the click, so a router can call preventDefault.",
    },
    tags: {
      kind: "array",
      description:
        "Classifications rendered as Tags after the title: { label, tone? }, where tone is one of the Tag tones. Carried as Tag lines under the row in the agent view.",
    },
    meta: {
      kind: "array",
      description:
        "One line of context, each entry a string or { term?, detail }, joined with a middle dot. Truncates rather than wraps when the row is short of room. Carried as the meta part.",
    },
    description: {
      kind: "string",
      description:
        "An optional sentence under the row, for a record that needs more than a line of meta. Carried as the description part.",
    },
    disabled: {
      kind: "boolean",
      description:
        "Disable an acting row and unregister its tool. Has no effect on a row that navigates or does nothing.",
      default: false,
    },
    agentTool: {
      kind: "boolean",
      description:
        "Override the default: on for a row that acts, off for a row that navigates. A row with neither href nor onSelect never registers one.",
    },
    agentName: {
      kind: "string",
      description:
        "Override the title used to derive the tool name, when two rows share a title.",
    },
  },
  state: {
    href: {
      description: "Where the row goes, when it navigates.",
      attribute: "data-sprint-href",
    },
    disabled: {
      description: "Present when an acting row cannot be opened.",
      attribute: "data-sprint-disabled",
    },
  },
  tools: {
    open: OPEN_ENTITY_ROW_TOOL,
  },
  agentView: {
    example:
      '- **EntityRow** "Ada Lovelace" [href=#/people/ada]\n  - part `title` "Ada Lovelace"\n  - part `meta` "Last sign-in: 3 days ago · 2 apps"\n  - **Tag** "admin" [tone=info]\n  - **Tag** "billing" [tone=neutral]',
  },
  examples: [
    {
      title: "A person in a directory",
      description:
        "A row that navigates. No tool, because the href is already public; tags and meta are data.",
      code: '<EntityRow\n  title="Ada Lovelace"\n  href="#/people/ada"\n  tags={[{ label: "admin", tone: "info" }, { label: "billing" }]}\n  meta={[{ term: "Last sign-in", detail: "3 days ago" }, "2 apps"]}\n/>',
    },
    {
      title: "A row that acts",
      description:
        "onSelect instead of href, so the row registers open-grace-hopper and an agent can pick it.",
      code: '<EntityRow\n  title="Grace Hopper"\n  onSelect={() => select("grace")}\n  tags={[{ label: "owner", tone: "warning" }]}\n  meta={["Invited yesterday"]}\n/>',
    },
    {
      title: "A directory of rows",
      description:
        "Rows stacked with no gap share their keylines, so the list reads as one ruled block.",
      code: '<Stack gap="none">\n  {people.map((person) => (\n    <EntityRow\n      key={person.id}\n      title={person.name}\n      href={person.href}\n      tags={person.roles.map((role) => ({ label: role }))}\n      meta={[{ term: "Last sign-in", detail: person.lastSignIn }]}\n    />\n  ))}\n</Stack>',
    },
    {
      title: "With a description",
      description: "A sentence under the row, for a record that needs one.",
      code: '<EntityRow\n  title="Payments service"\n  href="#/projects/payments"\n  tags={[{ label: "degraded", tone: "danger" }]}\n  meta={["Updated 4 min ago"]}\n  description="Card authorisations are timing out in eu-west."\n/>',
    },
  ],
  a11y: {
    notes:
      "The whole row is one control: a link with an href, a button with onSelect, or a labelled group with neither. The title is the accessible name, and the tags, meta, and description are its accessible description, so a screen reader announces the name first and the context after.",
  },
  relatedComponents: ["Card", "Tag", "Stack", "Table"],
});
