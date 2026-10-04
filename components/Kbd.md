# Kbd

> A keyboard key or shortcut, drawn as key caps. Pass the combination as text joined with plus signs.

- Category: typography
- Status: experimental

## When to use

Use to tell a person which keys do something: an undo hint in a toast, a shortcut beside a menu item's description, a search field's focus key. Write the combination as one string, such as "Ctrl+Z" or "Shift+Enter"; each part becomes its own cap.

### When not to

Do not use for code or for a value someone types into a field; that is code or a CodeBlock. Do not use it as a control; it does not press anything.

## Install

```tsx
import { Kbd } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### An undo shortcut

```tsx
<Kbd>Ctrl+Z</Kbd>
```

### A single key

One key is one cap.

```tsx
<Kbd>/</Kbd>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `children` | string (required) | — | The keys, joined with "+", such as "Ctrl+Z". A lone "+" is a key in its own right. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Kbd** "Ctrl+Z"
```

## Accessibility

- Notes: A kbd element nesting one kbd per key, which is the HTML pattern for a key combination. The plus signs between caps are hidden from assistive technology, which reads the keys in order.
