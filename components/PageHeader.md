# PageHeader

> The top of a page: its h1 title, the Tag chips that classify it, an optional page-level control, and a lede underneath.

- Category: layout
- Status: experimental

## When to use

Use it once per page, as the first thing inside the content region. The label becomes the page's only h1, so the document outline starts here. Put status or category Tags in tags, a control that affects the whole page in actions, and the introductory sentence or two in children as Text.

### When not to

Do not use it for a section within a page; that is a Panel with a headingLevel. Do not put navigation in actions; the page's links belong in a Nav.

## Install

```tsx
import { PageHeader } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A titled page with a lede

```tsx
<PageHeader label="Reports">
  <Text>Everything the quarter produced, in one place.</Text>
</PageHeader>
```

### Status tags and a page-level control

Tags classify the page on the title line; the action slot holds the one control that affects the whole page.

```tsx
<PageHeader
  label="Button"
  tags={<Tag tone="warning" filled>experimental</Tag>}
  actions={<Button agentTool={false}>Refresh</Button>}
>
  <Text>A single action a person or an agent can trigger.</Text>
</PageHeader>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | The page title. Rendered as the page's h1. |
| `tags` | node | — | Tag components that classify the page, rendered on the title line. Keep it to two or three. |
| `actions` | node | — | A control that acts on the whole page, rendered at the end of the title line. |
| `children` | node | — | The lede: a Text or two introducing the page. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **PageHeader** "Button"
```

## Accessibility

- Notes: The label renders as the page's h1, so keep to one PageHeader per page. Tags and the lede are ordinary content after it; the header element itself takes no landmark role because it sits inside main.
