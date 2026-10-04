# Prose

> Typography for long-form rendered content such as Markdown: headings, paragraphs, lists, links, code, tables and quotes, in the theme's voice.

- Category: typography
- Status: experimental

## When to use

Wrap HTML you did not lay out yourself: member notes rendered from Markdown, an agenda's program details, a help article. Pass the original Markdown as source and the agent view carries it verbatim, which is better for an agent than flattened text. Sprint does not parse Markdown; render it with the library of your choice and pass the result as children.

### When not to

Do not use for interface copy you write yourself; that is Text and Heading. Do not put interactive Sprint components inside it; Prose styles plain elements.

## Install

```tsx
import { Prose } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### Rendered Markdown

The page renders Markdown however it likes and passes the original as source, which the agent view carries unchanged.

```tsx
<Prose label="Member notes" source={notes}>
  <Markdown>{notes}</Markdown>
</Prose>
```

### Compact notes

```tsx
<Prose size="small">
  <p>Prefers <strong>text</strong> after six.</p>
  <ul>
    <li>Organ</li>
    <li>Youth program</li>
  </ul>
</Prose>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `children` | node (required) | — | The rendered content: plain HTML elements such as p, ul, a, code and table. |
| `source` | string | — | The Markdown the children were rendered from. The agent view shows this instead of the flattened text, keeping lists, links and emphasis intact. |
| `label` | string | — | What the content is, such as "Member notes". Makes the block a labelled region and names it in the agent view. |
| `size` | enum small \\| normal | `"normal"` | small for notes inside a card or a side panel. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-size` | small | Present as small for the compact size. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Prose** "Member notes"
  - part `content` "Moved in **March**. Plays the organ."
```

## Accessibility

- Role: `region`
- Notes: With a label the block is a named region; without one it adds no semantics of its own. The content keeps its own elements, so headings join the page outline.
