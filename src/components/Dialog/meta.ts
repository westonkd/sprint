import { defineAgentMeta } from "@/agent/registry.ts";
import { CLOSE_DIALOG_TOOL } from "./tool.ts";

export const dialogMeta = defineAgentMeta({
  name: "Dialog",
  category: "overlay",
  summary:
    "A modal that interrupts the page for one decision: confirm a destructive action, complete a short step, acknowledge something before continuing. Renders as a double-keylined panel over a hatched backdrop, in the browser's top layer.",
  whenToUse:
    "Use when the page must not continue until the person decides: confirming a revocation or deletion, a short focused form, a required acknowledgement. Keep one decision per dialog and put its actions inside as ordinary Buttons; tools registered inside the dialog compose their names under its label.",
  whenNotToUse:
    "Do not use for status messages; that is an Alert. Do not use for anything the person should be able to ignore; a modal takes the whole page hostage. Do not nest dialogs.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        "The dialog's title. Names the dialog for assistive tech, derives the close tool name, and scopes the names of tools registered inside.",
      required: true,
    },
    open: {
      kind: "boolean",
      description:
        "Whether the dialog is shown. A closed dialog renders nothing at all; the page owns this state.",
      required: true,
    },
    onClose: {
      kind: "handler",
      description:
        "Called when the person or an agent asks to close: the close control, Escape, or the close tool. Set open to false in response.",
      required: true,
    },
    children: {
      kind: "node",
      description:
        "The dialog's contents. Ordinary components; anything actionable registers its own tools, scoped under the dialog's label.",
      required: true,
    },
    headingLevel: {
      kind: "enum",
      description:
        "Render the title as a real heading at this level, joining the page outline.",
      values: ["2", "3", "4"],
    },
    owner: {
      kind: "string",
      description:
        "The tool name of the control that opened this dialog. Published as data-sprint-owner so a reading agent can attach the dialog to its opener.",
    },
    agentName: {
      kind: "string",
      description: "Override the label used to derive the close tool name.",
    },
    agentTool: {
      kind: "boolean",
      description: "Set false to render without registering the close tool.",
      default: true,
    },
  },
  state: {
    open: {
      description:
        "Present while the dialog is shown. A closed dialog is absent from the DOM entirely.",
      attribute: "data-sprint-open",
    },
  },
  tools: {
    close: CLOSE_DIALOG_TOOL,
  },
  agentView: {
    example:
      '- **Dialog** "Revoke key" [open] with part `close` → tool `close-revoke-key`',
  },
  examples: [
    {
      title: "A destructive confirmation",
      description:
        "The confirm Button registers its tool only while the dialog is open, and its name is scoped under the dialog's label.",
      code: '<Dialog label="Revoke key" open={confirming} onClose={() => setConfirming(false)}>\n  <Stack gap="tight">\n    <Text>The key stops authenticating immediately. This cannot be undone.</Text>\n    <Button tone="danger" onClick={revoke}>Revoke sk-prod</Button>\n  </Stack>\n</Dialog>',
    },
    {
      title: "Owned by its opener",
      description:
        "Passing the opener's tool name lets a reading agent attach the dialog to the control that produced it.",
      code: '<Dialog\n  label="Rotate secret"\n  open={rotating}\n  owner="press-rotate-secret"\n  onClose={() => setRotating(false)}\n>\n  <Text>The current secret keeps working for one hour.</Text>\n</Dialog>',
    },
  ],
  a11y: {
    role: "dialog",
    keyboard: ["Escape closes", "Tab cycles within the dialog"],
    notes:
      "A native dialog element shown with showModal, so focus containment, inerting the page behind, and Escape come from the browser. The title names the dialog via aria-label.",
  },
});
