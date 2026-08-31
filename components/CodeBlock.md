# CodeBlock

> A snippet of code with a caption band and a copy control. In agent view the snippet is carried verbatim as the code part, so an agent reads the source instead of the highlighting.

- Category: display
- Status: experimental

## When to use

Use it for any code a reader is meant to run or copy: an install snippet, an example, a generated tool descriptor. It scrolls horizontally rather than wrapping, so a long line stays a long line.

### When not to

Do not use it for a short inline identifier inside a sentence; use a code element inside Text. Do not use it for prose you want to look technical.

## Install

```tsx
import { CodeBlock } from "sprint";
import "sprint/styles.css";
```

## Examples

### An example snippet

No caption, so the language names the block. It registers no WebMCP tool: an agent has nothing to gain from putting text on a person's clipboard, and it can already read the code.

```tsx
<CodeBlock code={'<Button tone="action">Prepare launch</Button>'} />
```

### A captioned descriptor

```tsx
<CodeBlock
  caption="descriptor"
  language="json"
  code={JSON.stringify(descriptor, null, 2)}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `code` | string (required) | — | The snippet, verbatim. Newlines are preserved and this exact string is what an agent reads and what the copy control copies. |
| `caption` | string | — | What the snippet is, shown in the band above it and used as the block's accessible name. Defaults to the language. |
| `language` | enum tsx \\| json \\| bash \\| text | `"tsx"` | What the snippet is written in. Drives the caption default. |
| `copyLabel` | string | `"Copy"` | Label for the copy control. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-language` | tsx \\| json \\| bash \\| text | The language the snippet is in. |
| `data-sprint-lines` | present or absent | How many lines the snippet has. |
| `data-sprint-copied` | present or absent | Present for a moment after the copy control has put the snippet on the clipboard. |
| `data-sprint-token` | tag \\| attr \\| string \\| keyword \\| number \\| punct \\| comment | On a highlight span: which token class it is. Colour comes from this, so a theme can recolour code without touching the component. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **CodeBlock** "install" [language=bash, lines=1]
  - part `copy` "Copy"
  - part `code` "npm install sprint"
```

## Accessibility

- Notes: The frame is a figure named by its caption. The copy control is a real button and reports back in its own label once the snippet is on the clipboard; the label swap is a polite live region, so a screen reader hears the confirmation too.
