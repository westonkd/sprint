# Text

> A run of prose, sized and toned from the semantic scale. In agent view it renders as its own text content, so an agent reads the words rather than inferring them from styling.

- Category: typography
- Status: experimental

## When to use

Use it for every paragraph, caption, note, and inline status line, so tone carries meaning instead of an ad-hoc colour. tone="muted" is the small print under a heading, tone="warning" and tone="danger" state that something is wrong, and tone="action" confirms something is live.

### When not to

Do not use it for a section title; that is Heading. Do not put components inside it: it flattens its children to a single string for the agent view, so a nested Button would lose its tool.

## Install

```tsx
import { Text } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A lede

```tsx
<Text>Every component renders normally for people and as text for agents.</Text>
```

### A note under a heading

The small print that would otherwise be an untyped grey span.

```tsx
<Text tone="muted" size="small">Registered while the button is enabled.</Text>
```

### A live status line

Tone is the whole message here, so an agent reading the attribute learns the same thing a person learns from the colour.

```tsx
<Text tone={ready ? "action" : "warning"} size="small">
  {ready ? "WebMCP is available in this browser." : "WebMCP is unavailable here."}
</Text>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `children` | node (required) | — | The prose. Inline markup such as code or strong is fine; components are not. |
| `tone` | enum default \\| muted \\| action \\| info \\| warning \\| danger | `"default"` | What the text means, not just how it looks. Agents read this off the attribute. |
| `size` | enum small \\| normal | `"normal"` | Type size. "small" is the annotation size used for notes and captions. |
| `as` | enum p \\| span \\| div | `"p"` | The element to render. Use span when the text sits inside another line of text. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-tone` | default \\| muted \\| action \\| info \\| warning \\| danger | What the text is saying about the thing it describes. |
| `data-sprint-size` | small \\| normal | The type size in use. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Text** "Tools stay registered across a view switch." [tone=muted]
```
