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

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-open` | present or absent | Present while the mobile drawer is open. On wide viewports the sidebar is always visible and this state is inert. |

## Accessibility

- Notes: Renders the only main element and an aside named by sideLabel, so the page has its landmarks without any consumer wiring. The first focusable element is a skip control that moves focus to main without touching the URL, which keeps it safe in hash-routed apps. The drawer button carries aria-expanded and aria-controls.
