# Toast

> A brief message that floats at the bottom of the screen after something happened, with an optional single action such as Undo, and dismisses itself.

- Category: feedback
- Status: experimental

## When to use

Use to confirm an action that already took effect and can still be reversed or followed up: a person moved, a note saved, a share link copied. Render one Toast with open, message and onDismiss; the page owns which toast is showing. The action is data, { label, onSelect, shortcut? }, rendered as a Button that registers its own press tool, and the shortcut is shown as key caps.

### When not to

Do not use for an error the person must act on, or anything that must stay visible; that is an Alert in the page. Do not use for a decision; that is a Dialog. Do not show several at once: replace the message instead. Inside an open modal Dialog, render the Toast inside the Dialog, because the page behind it is inert.

## Install

```tsx
import { Toast } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### An undo toast

The action is a real Button, so an agent can press Undo through its tool while the toast is up.

```tsx
<Toast
  open={moved !== null}
  message={movedMessage}
  action={{ label: "Undo", onSelect: undo, shortcut: "Ctrl+Z" }}
  onDismiss={() => setMoved(null)}
/>
```

### A toast that stays

duration={null} keeps it until dismissed.

```tsx
<Toast
  open={offline}
  label="Offline"
  tone="warning"
  duration={null}
  message="Changes are saved on this device until the connection returns."
  onDismiss={() => setOffline(false)}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `open` | boolean (required) | — | Whether the toast is showing. A closed toast renders nothing. |
| `message` | string (required) | — | What happened, in a sentence, such as "Moved Sister Amaral to Primary." |
| `onDismiss` | handler (required) | — | Called when the toast should go: after duration, or when the dismiss control is pressed. Set open to false in response. |
| `label` | string | — | A short title above the message, and the toast's accessible name. |
| `tone` | enum neutral \\| info \\| warning \\| danger | `"neutral"` | neutral and info announce politely; warning too. danger announces assertively, but prefer an Alert for errors. |
| `action` | object | — | One follow-up action: { label, onSelect, shortcut? }. It is a Button with its own press tool, named from the label. shortcut is shown as key caps and published as aria-keyshortcuts; the page binds the key itself. |
| `duration` | number | `6000` | Milliseconds before onDismiss is called. The timer pauses while the pointer or focus is on the toast. Pass null to keep it until dismissed. |
| `dismissLabel` | string | `"Dismiss"` | Accessible name of the dismiss control. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-tone` | neutral \\| info \\| warning \\| danger | The toast's tone. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Toast** [tone=neutral]
  - part `message` "Moved Sister Amaral to Primary."
  - part `dismiss` "Dismiss"
  - **Button** "Undo" [size=small, tone=action]
```

## Accessibility

- Role: `status`
- Notes: A role=status region, or role=alert for danger, so the message is announced when the toast appears. Render it when the event happens rather than toggling visibility. It opens as a popover in the top layer, at the bottom edge on a phone and the bottom corner on a wide screen. The timer pauses while the pointer or keyboard focus is on it, so nobody loses the action mid-reach.
