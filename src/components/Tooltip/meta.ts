import { defineAgentMeta } from "@/agent/registry.ts";

export const tooltipMeta = defineAgentMeta({
  name: "Tooltip",
  category: "overlay",
  summary:
    "A short hint that appears beside one control on hover or keyboard focus. A human affordance only: it adds nothing to the agent view.",
  whenToUse:
    "Use to name an icon-only control for sighted mouse users, or to show the whole of a line that is truncated on screen. Wrap exactly one focusable element. The hint appears after a short hover or at once on keyboard focus, and Escape dismisses it.",
  whenNotToUse:
    "Never put information only in a tooltip: touch users never see it and agents never read it, so the text must repeat something the wrapped element already says through its label or its own content. Do not use it for anything interactive; that is a Menu or a Dialog. For an icon-only Button, pass hideLabel instead, which adds the tooltip itself.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description: "The hint text. Keep it to a few words.",
      required: true,
    },
    children: {
      kind: "node",
      description:
        "Exactly one focusable element, such as a Button or a link. The tooltip is anchored to it and, unless describe is false, linked to it with aria-describedby.",
      required: true,
    },
    side: {
      kind: "enum",
      description:
        "Where the hint prefers to appear. It flips to the other side when there is no room.",
      values: ["above", "below"],
      default: "above",
    },
    describe: {
      kind: "boolean",
      description:
        "Link the hint to the element with aria-describedby. Set false when the hint repeats the element's accessible name, so a screen reader does not read it twice.",
      default: true,
    },
    disabled: {
      kind: "boolean",
      description: "Stop the hint from appearing.",
      default: false,
    },
  },
  examples: [
    {
      title: "Naming a truncated line",
      description:
        "The line is cut short on screen, so the tooltip shows it whole. The element's own text already carries the full value for assistive technology and agents.",
      code: '<Tooltip label="Elder Kestrel, second counselor in the elders quorum presidency">\n  <Link href="/callings/42">Elder Kestrel, second counselor…</Link>\n</Tooltip>',
    },
    {
      title: "A hint below its control",
      description:
        "side moves the hint below the control; it still flips when the control sits at the bottom of the screen.",
      code: '<Tooltip label="Opens in the planner" side="below">\n  <Button>Plan Sunday</Button>\n</Tooltip>',
    },
  ],
  a11y: {
    role: "tooltip",
    keyboard: ["Focus shows the hint", "Escape hides it"],
    notes:
      "The hint is a role=tooltip element linked to the wrapped element with aria-describedby. It appears after a hover delay or immediately on keyboard focus, never on touch, and is dismissed by Escape, blur, or moving the pointer away. It is a popover in the top layer, rendered inside the wrapped element's DOM, so it shows above a modal Dialog.",
  },
});
