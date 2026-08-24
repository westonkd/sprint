import { defineAgentMeta } from "@/agent/registry.ts";

export const secretFieldMeta = defineAgentMeta({
  name: "SecretField",
  category: "display",
  summary:
    "A sensitive value shown once or on demand: an API key, a recovery code, a signing secret. Masked by default with reveal and copy controls, and the value never reaches any agent surface.",
  whenToUse:
    "Use to hand a person a secret the page holds: a freshly created API key, recovery codes, a webhook signing secret. The mask is fixed-length so nothing leaks, reveal shows the value on demand, and copy places it on the clipboard without revealing it.",
  whenNotToUse:
    "Do not use for entering a secret; that is a TextInput with type password. Do not use for values that are safe to read; a DescriptionList or CodeBlock keeps those on the agent surface where they belong.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description: "What the secret is, shown as the field's uppercase title.",
      required: true,
    },
    value: {
      kind: "string",
      description:
        "The secret. Never appears in agent attributes, the agent view, or the copyable text stream; only reveal and copy touch it.",
      required: true,
    },
    hint: {
      kind: "string",
      description:
        'Guidance below the value, e.g. "Store it now. It is not shown again."',
    },
    defaultRevealed: {
      kind: "boolean",
      description: "Start revealed instead of masked.",
      default: false,
    },
  },
  state: {
    filled: {
      description: "Present when the field holds a secret.",
      attribute: "data-sprint-filled",
    },
    revealed: {
      description: "Present while the value is shown in clear text.",
      attribute: "data-sprint-revealed",
    },
  },
  agentView: {
    example: '- **SecretField** "API key" [filled]',
  },
  examples: [
    {
      title: "A key shown once",
      code: '<SecretField\n  label="API key"\n  value={key}\n  hint="Store it now. It is not shown again."\n/>',
    },
    {
      title: "Starting revealed",
      description: "For a value the person is expected to transcribe immediately.",
      code: '<SecretField label="Recovery code" value={code} defaultRevealed />',
    },
  ],
  a11y: {
    notes:
      "The reveal control is a toggle button with aria-pressed; the masked value is announced as a hidden secret rather than as bullet characters. Copy announces its success by swapping its label to Copied.",
  },
});
