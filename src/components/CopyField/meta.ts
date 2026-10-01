import { defineAgentMeta } from "@/agent/registry.ts";

export const copyFieldMeta = defineAgentMeta({
  name: "CopyField",
  category: "input",
  summary:
    "A labelled, read-only value with a Copy control: a setup link, an invite URL, a webhook address. The value truncates with an ellipsis on one line, stays selectable, and the control confirms with Copied for two seconds.",
  whenToUse:
    'Use it to hand a person a value they are meant to paste somewhere else, such as "Copy the link" under a device setup step. The whole value stays in the DOM and in the agent view however narrow the field is drawn, so truncation never hides it from a screen reader or an agent.',
  whenNotToUse:
    "Do not use it for a secret; that is a SecretField, which masks the value and keeps it off every agent surface. Do not use it for a plain read-only value nobody needs to copy; that is a TextInput with readOnly, or a DescriptionList row. Do not use it for multi-line code; that is a CodeBlock.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'What the value is, shown above it as the field label and used as the node\'s label in the agent view, e.g. "Setup link".',
      required: true,
    },
    value: {
      kind: "string",
      description:
        "The text shown and copied, verbatim. It is never masked: an agent reads it from the value part.",
      required: true,
    },
    copyLabel: {
      kind: "string",
      description: "The copy control's label while idle.",
      default: "Copy",
    },
    copiedLabel: {
      kind: "string",
      description:
        "The copy control's label for two seconds after the value reaches the clipboard.",
      default: "Copied",
    },
    onCopy: {
      kind: "handler",
      description:
        "Called with the value once it is on the clipboard. Not called when the clipboard refuses the write.",
    },
  },
  state: {
    copied: {
      description:
        "Present for two seconds after the copy control has put the value on the clipboard.",
      attribute: "data-sprint-copied",
    },
    "copy-failed": {
      description:
        "Present after the clipboard refused the write or is unavailable. The value's text is selected instead, so the person can copy it by hand.",
      attribute: "data-sprint-copy-failed",
    },
  },
  agentView: {
    example:
      '- **CopyField** "Setup link"\n  - part `value` "https://sprint.example/setup/7HW4"\n  - part `copy` "Copy"',
  },
  examples: [
    {
      title: "Copy the link",
      description:
        "The first real need: a setup link a person pastes into another device. A long URL truncates in the field and is still copied whole.",
      code: '<CopyField\n  label="Setup link"\n  value="https://sprint.example/setup/7HW4-XK92-QQ1D?station=KX-2209&expires=2026-10-01"\n/>',
    },
    {
      title: "Custom control labels",
      description:
        "Relabel the control in the language of the task, and react once the value is on the clipboard.",
      code: '<CopyField\n  label="Invite code"\n  value="NOMAD-0042"\n  copyLabel="Copy code"\n  copiedLabel="Code copied"\n  onCopy={() => setShared(true)}\n/>',
    },
  ],
  a11y: {
    role: "group",
    keyboard: ["Tab reaches the copy control", "Enter or Space copies"],
    notes:
      "The group is named by its visible label. The full value is in the DOM however it is truncated, and its title shows it on hover. The copy control is a real button whose label swap is a polite live region. If the clipboard refuses, the value's text is selected so a keyboard copy still works. No WebMCP tool is registered: the value is already readable in the agent view, and an agent gains nothing from writing it to the person's clipboard that reading it does not give.",
  },
  relatedComponents: ["SecretField", "TextInput", "CodeBlock", "DescriptionList"],
});
