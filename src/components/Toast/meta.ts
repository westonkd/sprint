import { defineAgentMeta } from "@/agent/registry.ts";

export const toastMeta = defineAgentMeta({
  name: "Toast",
  category: "feedback",
  summary:
    "A brief message that floats at the bottom of the screen after something happened, with an optional single action such as Undo, and dismisses itself.",
  whenToUse:
    "Use to confirm an action that already took effect and can still be reversed or followed up: a person moved, a note saved, a share link copied. Render one Toast with open, message and onDismiss; the page owns which toast is showing. The action is data, { label, onSelect, shortcut? }, rendered as a Button that registers its own press tool, and the shortcut is shown as key caps.",
  whenNotToUse:
    "Do not use for an error the person must act on, or anything that must stay visible; that is an Alert in the page. Do not use for a decision; that is a Dialog. Do not show several at once: replace the message instead. Inside an open modal Dialog, render the Toast inside the Dialog, because the page behind it is inert.",
  status: "experimental",
  props: {
    open: {
      kind: "boolean",
      description: "Whether the toast is showing. A closed toast renders nothing.",
      required: true,
    },
    message: {
      kind: "string",
      description:
        'What happened, in a sentence, such as "Moved Sister Amaral to Primary."',
      required: true,
    },
    onDismiss: {
      kind: "handler",
      description:
        "Called when the toast should go: after duration, or when the dismiss control is pressed. Set open to false in response.",
      required: true,
    },
    label: {
      kind: "string",
      description: "A short title above the message, and the toast's accessible name.",
    },
    tone: {
      kind: "enum",
      description:
        "neutral and info announce politely; warning too. danger announces assertively, but prefer an Alert for errors.",
      values: ["neutral", "info", "warning", "danger"],
      default: "neutral",
    },
    action: {
      kind: "object",
      description:
        "One follow-up action: { label, onSelect, shortcut? }. It is a Button with its own press tool, named from the label. shortcut is shown as key caps and published as aria-keyshortcuts; the page binds the key itself.",
    },
    duration: {
      kind: "number",
      description:
        "Milliseconds before onDismiss is called. The timer pauses while the pointer or focus is on the toast. Pass null to keep it until dismissed.",
      default: 6000,
    },
    dismissLabel: {
      kind: "string",
      description: "Accessible name of the dismiss control.",
      default: "Dismiss",
    },
  },
  state: {
    tone: {
      description: "The toast's tone.",
      attribute: "data-sprint-tone",
      values: ["neutral", "info", "warning", "danger"],
    },
  },
  agentView: {
    example:
      '- **Toast** [tone=neutral]\n  - part `message` "Moved Sister Amaral to Primary."\n  - part `dismiss` "Dismiss"\n  - **Button** "Undo" [size=small, tone=action] → tool `press-undo`',
  },
  examples: [
    {
      title: "An undo toast",
      description:
        "The action is a real Button, so an agent can press Undo through its tool while the toast is up.",
      code: '<Toast\n  open={moved !== null}\n  message={`Moved ${moved?.name} to ${moved?.calling}.`}\n  action={{ label: "Undo", onSelect: undo, shortcut: "Ctrl+Z" }}\n  onDismiss={() => setMoved(null)}\n/>',
    },
    {
      title: "A toast that stays",
      description: "duration={null} keeps it until dismissed.",
      code: '<Toast\n  open={offline}\n  label="Offline"\n  tone="warning"\n  duration={null}\n  message="Changes are saved on this device until the connection returns."\n  onDismiss={() => setOffline(false)}\n/>',
    },
  ],
  a11y: {
    role: "status",
    notes:
      "A role=status region, or role=alert for danger, so the message is announced when the toast appears. Render it when the event happens rather than toggling visibility. It opens as a popover in the top layer, at the bottom edge on a phone and the bottom corner on a wide screen. The timer pauses while the pointer or keyboard focus is on it, so nobody loses the action mid-reach.",
  },
});
