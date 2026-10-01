# CopyField

> A labelled, read-only value with a Copy control: a setup link, an invite URL, a webhook address. The value truncates with an ellipsis on one line, stays selectable, and the control confirms with Copied for two seconds.

- Category: input
- Status: experimental

## When to use

Use it to hand a person a value they are meant to paste somewhere else, such as "Copy the link" under a device setup step. The whole value stays in the DOM and in the agent view however narrow the field is drawn, so truncation never hides it from a screen reader or an agent.

### When not to

Do not use it for a secret; that is a SecretField, which masks the value and keeps it off every agent surface. Do not use it for a plain read-only value nobody needs to copy; that is a TextInput with readOnly, or a DescriptionList row. Do not use it for multi-line code; that is a CodeBlock.

## Install

```tsx
import { CopyField } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### Copy the link

The first real need: a setup link a person pastes into another device. A long URL truncates in the field and is still copied whole.

```tsx
<CopyField
  label="Setup link"
  value="https://sprint.example/setup/7HW4-XK92-QQ1D?station=KX-2209&expires=2026-10-01"
/>
```

### Custom control labels

Relabel the control in the language of the task, and react once the value is on the clipboard.

```tsx
<CopyField
  label="Invite code"
  value="NOMAD-0042"
  copyLabel="Copy code"
  copiedLabel="Code copied"
  onCopy={() => setShared(true)}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What the value is, shown above it as the field label and used as the node's label in the agent view, e.g. "Setup link". |
| `value` | string (required) | — | The text shown and copied, verbatim. It is never masked: an agent reads it from the value part. |
| `copyLabel` | string | `"Copy"` | The copy control's label while idle. |
| `copiedLabel` | string | `"Copied"` | The copy control's label for two seconds after the value reaches the clipboard. |
| `onCopy` | handler | — | Called with the value once it is on the clipboard. Not called when the clipboard refuses the write. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-copied` | present or absent | Present for two seconds after the copy control has put the value on the clipboard. |
| `data-sprint-copy-failed` | present or absent | Present after the clipboard refused the write or is unavailable. The value's text is selected instead, so the person can copy it by hand. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **CopyField** "Setup link"
  - part `value` "https://sprint.example/setup/7HW4"
  - part `copy` "Copy"
```

## Accessibility

- Role: `group`
- Keyboard: Tab reaches the copy control, Enter or Space copies
- Notes: The group is named by its visible label. The full value is in the DOM however it is truncated, and its title shows it on hover. The copy control is a real button whose label swap is a polite live region. If the clipboard refuses, the value's text is selected so a keyboard copy still works. No WebMCP tool is registered: the value is already readable in the agent view, and an agent gains nothing from writing it to the person's clipboard that reading it does not give.
