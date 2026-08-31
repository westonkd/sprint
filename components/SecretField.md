# SecretField

> A sensitive value shown once or on demand: an API key, a recovery code, a signing secret. Masked by default with reveal and copy controls, and the value never reaches any agent surface.

- Category: display
- Status: experimental

## When to use

Use to hand a person a secret the page holds. The mask is fixed-length so nothing leaks, and copy places the value on the clipboard without revealing it.

### When not to

Do not use for entering a secret; that is a TextInput with type password. Do not use for values that are safe to read; a DescriptionList or CodeBlock keeps those on the agent surface where they belong.

## Install

```tsx
import { SecretField } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A key shown once

```tsx
<SecretField
  label="API key"
  value={key}
  hint="Store it now. It is not shown again."
/>
```

### Starting revealed

For a value the person is expected to transcribe immediately.

```tsx
<SecretField label="Recovery code" value={code} defaultRevealed />
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What the secret is, shown as the field's uppercase title. |
| `value` | string (required) | — | The secret. Never appears in agent attributes, the agent view, or the copyable text stream; only reveal and copy touch it. |
| `hint` | string | — | Guidance below the value, e.g. "Store it now. It is not shown again." |
| `defaultRevealed` | boolean | `false` | Start revealed instead of masked. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-filled` | present or absent | Present when the field holds a secret. |
| `data-sprint-revealed` | present or absent | Present while the value is shown in clear text. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **SecretField** "API key" [filled]
```

## Accessibility

- Notes: The reveal control is a toggle button with aria-pressed; the masked value is announced as a hidden secret rather than as bullet characters. Copy announces its success by swapping its label to Copied.
