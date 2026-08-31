# Dialog

> A modal that interrupts the page for one decision: confirm a destructive action, complete a short step, acknowledge something before continuing.

- Category: overlay
- Status: experimental

## When to use

Use when the page must not continue until the person decides: confirming a revocation or deletion, a short focused form, a required acknowledgement. Keep one decision per dialog and put its actions inside as ordinary Buttons; tools registered inside the dialog compose their names under its label.

### When not to

Do not use for status messages; that is an Alert. Do not use for anything the person should be able to ignore; a modal takes the whole page hostage. Do not nest dialogs.

## Install

```tsx
import { Dialog } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A destructive confirmation

The confirm Button registers its tool only while the dialog is open, and its name is scoped under the dialog's label.

```tsx
<Dialog label="Revoke key" open={confirming} onClose={() => setConfirming(false)}>
  <Stack gap="tight">
    <Text>The key stops authenticating immediately. This cannot be undone.</Text>
    <Button tone="danger" onClick={revoke}>Revoke sk-prod</Button>
  </Stack>
</Dialog>
```

### Owned by its opener

Passing the opener's tool name lets a reading agent attach the dialog to the control that produced it.

```tsx
<Dialog
  label="Rotate secret"
  open={rotating}
  owner="press-rotate-secret"
  onClose={() => setRotating(false)}
>
  <Text>The current secret keeps working for one hour.</Text>
</Dialog>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | The dialog's title. Names the dialog for assistive tech, derives the close tool name, and scopes the names of tools registered inside. |
| `open` | boolean (required) | — | Whether the dialog is shown. A closed dialog renders nothing at all; the page owns this state. |
| `onClose` | handler (required) | — | Called when the person or an agent asks to close: the close control, Escape, or the close tool. Set open to false in response. |
| `children` | node (required) | — | The dialog's contents. Ordinary components; anything actionable registers its own tools, scoped under the dialog's label. |
| `headingLevel` | enum 2 \\| 3 \\| 4 | — | Render the title as a real heading at this level, joining the page outline. |
| `owner` | string | — | The tool name of the control that opened this dialog. Published as data-sprint-owner so a reading agent can attach the dialog to its opener. |
| `agentName` | string | — | Override the label used to derive the close tool name. |
| `agentTool` | boolean | `true` | Set false to render without registering the close tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-open` | present or absent | Present while the dialog is shown. A closed dialog is absent from the DOM entirely. |

## WebMCP tools

### `<scope>-close-<label>`

Close this dialog without taking its action, exactly as pressing its close control or Escape would. Anything entered inside the dialog may be discarded by the page. To take the dialog's action instead, use the tools its contents register while it is open.

- Read-only: no
- Registered when: The dialog is open. A closed dialog renders nothing and has no tools.
- Unregistered when: The dialog closes or unmounts.

```json
{
  "name": "<scope>-close-<label>",
  "description": "Close this dialog without taking its action, exactly as pressing its close control or Escape would. Anything entered inside the dialog may be discarded by the page. To take the dialog's action instead, use the tools its contents register while it is open.",
  "inputSchema": {
    "type": "object",
    "properties": {}
  },
  "annotations": {
    "readOnlyHint": false,
    "untrustedContentHint": true
  }
}
```

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Dialog** "Revoke key" [open] with part `close` → tool `close-revoke-key`
```

## Accessibility

- Role: `dialog`
- Keyboard: Escape closes, Tab cycles within the dialog
- Notes: A native dialog element shown with showModal, so focus containment, inerting the page behind, and Escape come from the browser. The title names the dialog via aria-label.
