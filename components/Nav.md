# Nav

> A labelled navigation landmark: the region that holds a page's links to elsewhere.

- Category: navigation
- Status: experimental

## When to use

Use it around any set of links whose job is getting around the app: a sidebar, a table of contents, a footer link block. The label names the landmark, so a person navigating by landmark, a screen reader, and an agent reading the page all know these links are wayfinding rather than content. Group related links inside it with NavGroup.

### When not to

Do not use it for a link that sits inside prose; a bare Link is already readable there. Do not use it for a set of actions that stay on the page; those are Buttons in a Stack.

## Install

```tsx
import { Nav } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A grouped sidebar nav

Each NavGroup names a cluster of destinations. The active link carries the current-page mark in every view.

```tsx
<Nav label="Docs">
  <NavGroup label="Guides">
    <Link href="#/guide/webmcp">WebMCP</Link>
  </NavGroup>
  <NavGroup label="Components">
    <Link href="#/Button" active>Button</Link>
    <Link href="#/Table">Table</Link>
  </NavGroup>
</Nav>
```

### A flat nav

A short list of destinations needs no grouping.

```tsx
<Nav label="Site">
  <Link href="#/">Home</Link>
  <Link href="#/pricing">Pricing</Link>
</Nav>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What this navigation is for. Rendered as the landmark's accessible name, so two navs on one page stay distinguishable. |
| `children` | node (required) | — | Link components, or NavGroup components wrapping them. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Nav** "Workbench"
```

## Accessibility

- Role: `navigation`
- Notes: The label is the landmark's accessible name via aria-label. Active links inside it carry aria-current=page, so the current location is announced without any styling cue.
