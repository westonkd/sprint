# Shell

> The page-level frame: a sidebar and a main content region, with the landmark wiring done once. On a phone the sidebar becomes a drawer behind a menu button.

- Category: layout
- Status: experimental

## When to use

Use it once, at the root of an app view. Put the brand in bar, a Nav in side, and the page in children. It renders the main and complementary landmarks, a skip-to-content control for keyboard users, and the mobile drawer behaviour, so none of that is rebuilt per app. Like Stack it is silent in agent view: its regions speak for themselves.

### When not to

Do not use it inside another Shell, or anywhere below the top of the page; a region within a page is a Panel. Do not use it just to put two columns next to each other; that is Stack.

## Install

```tsx
import { Shell } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A sidebar app shell

One Shell per view. The sidebar collapses to a top bar with a drawer on narrow screens, and an agent reading the page sees the nav and the content with no frame in between.

```tsx
<Shell
  bar={<Link href="#/">ACME</Link>}
  side={
    <Nav label="Main">
      <Link href="#/reports" active>Reports</Link>
      <Link href="#/settings">Settings</Link>
    </Nav>
  }
>
  <Panel label="Reports" headingLevel={2}>
    <Text>Quarterly numbers land here.</Text>
  </Panel>
</Shell>
```

### A sidebar that can be hidden

With collapsible, a person can put the sidebar away on a wide screen as well as a narrow one, and get the full width for the page.

```tsx
<Shell
  collapsible
  bar={<Link href="#/">ACME</Link>}
  side={
    <Nav label="Main">
      <Link href="#/reports" active>Reports</Link>
      <Link href="#/settings">Settings</Link>
    </Nav>
  }
>
  <Text>Quarterly numbers land here.</Text>
</Shell>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `children` | node (required) | — | The page content. Rendered inside the main landmark. |
| `side` | node | — | The sidebar content, usually a Nav. On narrow viewports it becomes the drawer behind the menu button, and the drawer closes itself when a link inside it is followed. |
| `bar` | node | — | What stays visible when the sidebar collapses to a top bar: typically the brand link. The menu button renders next to it automatically. |
| `sideLabel` | string | `"Sidebar"` | Accessible name for the sidebar landmark. |
| `skipLabel` | string | `"Skip to content"` | Text of the skip control that moves focus to the main region. Visually hidden until focused. |
| `menuLabel` | string | `"Menu"` | Label of the drawer button while the drawer is closed. |
| `closeLabel` | string | `"Close"` | Label of the drawer button while the drawer is open. |
| `collapsible` | boolean | `false` | Lets a person hide the sidebar on wide viewports too. A second toggle appears beside the bar there, and while collapsed the page takes the narrow layout: the bar runs across the top and the sidebar is gone until it is shown again. |
| `collapsed` | boolean | — | Whether the sidebar is collapsed on wide viewports, when the owner keeps that state. Pair it with onCollapsedChange. |
| `defaultCollapsed` | boolean | `false` | Whether a collapsible sidebar starts collapsed when the Shell keeps its own state. |
| `onCollapsedChange` | handler | — | Called with the collapsed state the Shell wants. Use it to remember the choice across visits. |
| `hideLabel` | string | `"Hide menu"` | Label of the wide-viewport toggle while the sidebar is shown. |
| `showLabel` | string | `"Show menu"` | Label of the wide-viewport toggle while the sidebar is collapsed. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-collapsed` | present or absent | Present while a collapsible sidebar is hidden on wide viewports. Narrow viewports ignore it and keep the drawer. |
| `data-sprint-open` | present or absent | Present while the mobile drawer is open. On wide viewports the sidebar is always visible and this state is inert. |

## Accessibility

- Notes: Renders the only main element and an aside named by sideLabel, so the page has its landmarks without any consumer wiring. The first focusable element is a skip control that moves focus to main without touching the URL, which keeps it safe in hash-routed apps. The drawer button carries aria-expanded and aria-controls.
