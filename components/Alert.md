# Alert

> A status message for the outcome of something that already happened: a notice, a warning, or a failure.

- Category: feedback
- Status: experimental

## When to use

Use to report the result of an action or a condition the person did not just cause: "check your inbox", "invalid credentials", "this key expires soon". Use tone="danger" for failures, "warning" for conditions needing attention, "info" for neutral notices, and "neutral" for quiet confirmations. Pass onDismiss when the message can be acknowledged and cleared.

### When not to

Do not use for validation on a specific field; the field's own error prop places the message where the problem is. Do not use for confirmation of an action the person is about to take; that is a Dialog.

## Install

```tsx
import { Alert } from "sprint";
import "sprint/styles.css";
```

## Examples

### A sign-in notice

The default info tone for a neutral status message.

```tsx
<Alert label="Check your inbox">We sent a sign-in link to nomad@escadrille.test.</Alert>
```

### A dismissible confirmation

Providing onDismiss renders the dismiss control and registers the dismiss tool. Removing the alert is the page's job.

```tsx
<Alert tone="neutral" label="Key revoked" onDismiss={acknowledge}>The key can no longer authenticate.</Alert>
```

### A failure

Danger announces assertively via role=alert.

```tsx
<Alert tone="danger" label="Sign-in failed">Wrong callsign or access code.</Alert>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `children` | node (required) | — | The message. Inline content only; it is flattened to text for the agent view. |
| `label` | string | — | A short uppercase title above the message. Also derives the dismiss tool name, so prefer a stable phrase. |
| `tone` | enum neutral \\| info \\| warning \\| danger | `"info"` | The message's severity. Danger and warning announce assertively; info and neutral announce politely. |
| `onDismiss` | handler | — | Called when the dismiss control is pressed. Providing it renders the control and registers the dismiss tool; the page owns removing the alert. |
| `agentName` | string | — | Override the label used to derive the dismiss tool name. Required for a dismissible alert with no label. |
| `agentTool` | boolean | `true` | Set false to render a dismissible alert without registering a tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-tone` | neutral \\| info \\| warning \\| danger | The alert's severity. |
| `data-sprint-dismissible` | present or absent | Present when the alert has a dismiss control. |

## WebMCP tools

### `<scope>-dismiss-<label>`

Dismiss this alert, exactly as a person clicking its dismiss control would. The page decides what dismissal means, usually removing the message. Returns the alert's state after the dismissal, or says the alert left the page.

- Read-only: no
- Registered when: The alert is mounted, has an onDismiss handler, and label or agentName provides a stable name.
- Unregistered when: The alert unmounts or loses its onDismiss handler.

```json
{
  "name": "<scope>-dismiss-<label>",
  "description": "Dismiss this alert, exactly as a person clicking its dismiss control would. The page decides what dismissal means, usually removing the message. Returns the alert's state after the dismissal, or says the alert left the page.",
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
- **Alert** "Check your inbox" [dismissible, tone=info]
```

## Accessibility

- Role: `status`
- Notes: Danger and warning render role=alert and announce assertively; info and neutral render role=status. The dismiss control is a labelled button. Render the alert when the condition occurs rather than toggling its visibility, or the announcement is lost.
