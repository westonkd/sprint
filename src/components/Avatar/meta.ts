import { defineAgentMeta } from "@/agent/registry.ts";

export const avatarMeta = defineAgentMeta({
  name: "Avatar",
  category: "display",
  summary:
    "A person's photo in a circle, falling back to their initials when there is no photo or it fails to load.",
  whenToUse:
    "Use beside a person's name in a row, a card, or an account menu trigger. Pass the full name; it is the accessible name and the source of the initials. Set decorative when the name is already printed right beside it, so it is not read twice.",
  whenNotToUse:
    "Do not use for a logo or an illustration; that is an Image. Do not use as a button on its own; put it inside a Button or a Menu trigger that carries the label.",
  status: "experimental",
  props: {
    name: {
      kind: "string",
      description: "The person's name. Names the avatar and supplies the initials.",
      required: true,
    },
    src: {
      kind: "string",
      description:
        "The photo's URL. Without it, or if it fails to load, the initials show instead.",
    },
    size: {
      kind: "enum",
      description:
        "small for dense rows, medium beside body text, large in a profile header.",
      values: ["small", "medium", "large"],
      default: "medium",
    },
    decorative: {
      kind: "boolean",
      description:
        "Hide the avatar from assistive technology and the agent view, for when the name is printed beside it.",
      default: false,
    },
  },
  state: {
    photo: {
      description: "Present while a photo is showing rather than initials.",
      attribute: "data-sprint-photo",
    },
    size: {
      description: "The size, when it is not medium.",
      attribute: "data-sprint-size",
      values: ["small", "large"],
    },
  },
  agentView: {
    example: '- **Avatar** "Ada Okafor" [photo]',
  },
  examples: [
    {
      title: "A photo",
      code: '<Avatar name="Ada Okafor" src="media/portrait.svg" />',
    },
    {
      title: "Initials when there is no photo",
      description: "The first and last initials, on the inset surface.",
      code: '<Avatar name="Brother Lind" size="large" />',
    },
    {
      title: "Beside a printed name",
      description:
        "decorative keeps a screen reader and an agent from hearing the name twice.",
      code: '<Stack direction="row" gap="snug" align="center">\n  <Avatar name="Sister Amaral" size="small" decorative />\n  <Text as="span">Sister Amaral</Text>\n</Stack>',
    },
  ],
  a11y: {
    role: "img",
    notes:
      "A role=img element named by the person's name, with the photo's own alt left empty so the name is read once. decorative switches it to aria-hidden.",
  },
});
