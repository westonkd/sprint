import { defineAgentMeta } from "@/agent/registry.ts";

export const stackMeta = defineAgentMeta({
  name: "Stack",
  category: "layout",
  summary:
    "The one-dimensional layout primitive: a row, a column, or an auto-filling grid, with spacing drawn from the space scale. It renders a plain box and nothing else.",
  whenToUse:
    "Use it wherever two or more things sit next to each other. Prefer it over a bare div with inline styles so spacing stays on the scale. Stack is invisible in agent view: it emits no line, because an agent does not care how a region is arranged, only what is in it.",
  whenNotToUse:
    'Do not use it to draw a bordered region with a header; that is Panel. Do not nest three deep to fake a grid; use direction="grid".',
  status: "experimental",
  props: {
    children: {
      kind: "node",
      description: "The items to lay out.",
      required: true,
    },
    direction: {
      kind: "enum",
      description:
        'Axis. "grid" fills as many equal columns as fit, each at least min wide.',
      values: ["row", "column", "grid"],
      default: "column",
    },
    gap: {
      kind: "enum",
      description: "Space between items, from the space scale.",
      values: ["none", "tight", "normal", "loose"],
      default: "normal",
    },
    align: {
      kind: "enum",
      description: "Cross-axis alignment.",
      values: ["start", "center", "end", "stretch", "baseline"],
    },
    justify: {
      kind: "enum",
      description: "Main-axis distribution.",
      values: ["start", "center", "end", "between"],
    },
    wrap: {
      kind: "boolean",
      description: "Let a row wrap onto more lines instead of overflowing.",
      default: false,
    },
    collapse: {
      kind: "boolean",
      description:
        "Stack a row into a column on narrow viewports. This is how a toolbar survives a phone.",
      default: false,
    },
    min: {
      kind: "string",
      description:
        'Minimum track width for direction="grid", as a CSS length. Tracks never exceed the container.',
      default: "18rem",
    },
  },
  state: {
    direction: {
      description: "The axis in use.",
      attribute: "data-sprint-direction",
      values: ["row", "column", "grid"],
    },
    gap: {
      description: "The spacing step in use.",
      attribute: "data-sprint-gap",
      values: ["none", "tight", "normal", "loose"],
    },
    align: {
      description: "Cross-axis alignment, when one was asked for.",
      attribute: "data-sprint-align",
      values: ["start", "center", "end", "stretch", "baseline"],
    },
    justify: {
      description: "Main-axis distribution, when one was asked for.",
      attribute: "data-sprint-justify",
      values: ["start", "center", "end", "between"],
    },
    wrap: {
      description: "Present when a row is allowed to wrap.",
      attribute: "data-sprint-wrap",
    },
    collapse: {
      description: "Present when the row stacks into a column on narrow viewports.",
      attribute: "data-sprint-collapse",
    },
  },
  examples: [
    {
      title: "A row of actions",
      description: "Wrapping keeps a toolbar from overflowing on a narrow screen.",
      code: '<Stack direction="row" gap="tight" wrap>\n  <Button>Cancel</Button>\n  <Button tone="action">Confirm</Button>\n</Stack>',
    },
    {
      title: "A responsive card grid",
      description:
        "Tracks fill the container and never go below min, so this is one column on a phone and three on a desktop with no media query of your own.",
      code: '<Stack direction="grid" min="16rem">\n  <Card label="Button" href="#/Button">One action.</Card>\n  <Card label="Table" href="#/Table">Rows and columns.</Card>\n</Stack>',
    },
    {
      title: "A header bar that stacks on a phone",
      code: '<Stack direction="row" justify="between" align="center" collapse>\n  <Heading level={1}>Button</Heading>\n  <Tag tone="warning">experimental</Tag>\n</Stack>',
    },
  ],
});
