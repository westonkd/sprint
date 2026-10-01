# Pagination

> A navigation landmark for a long set shown one page at a time: Previous and Next controls, a "Page 2 of 3" readout, and a "Showing 26–50 of 61" summary of which items are on screen. It takes counts rather than items, so it works the same over a local array or a server query.

- Category: navigation
- Status: experimental

## When to use

Use it under or above a Table or List whose items arrive a page at a time, when the count is known. Give it onPageChange to page in place, which registers one turn tool that can jump straight to any page; give it href to make every page a URL, which needs no tool because a link is already reachable. Its state carries the page, the page count and the item range, so an agent reading the page knows how much it has not seen.

### When not to

Do not use it when the total is unknown or the set grows as it is read; that is a load-more Button. Do not use it for steps in a flow a person must complete in order, and do not use it to move between unrelated pages, which is Nav or Breadcrumb. Do not use it for a set that fits on one screen: it renders, but has nothing to do.

## Install

```tsx
import { Pagination } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### Paging a table in place

With onPageChange the controls are buttons and one turn tool registers, so an agent can jump to page 3 without pressing Next twice.

```tsx
<Pagination
  label="Users pages"
  page={page}
  pageSize={25}
  total={61}
  onPageChange={setPage}
/>
```

### Pages as links

With href every page is a URL. The controls are links, nothing registers, and each link publishes where it goes.

```tsx
<Pagination
  label="Changelog pages"
  page={2}
  pageSize={10}
  total={42}
  href={(page) => `#/changelog?page=${page}`}
/>
```

### The last page, relabelled

On the last page Next is disabled and the summary shows the short final range. The labels are overridable for sets that read better as time.

```tsx
<Pagination
  label="Activity pages"
  page={4}
  pageSize={8}
  total={31}
  previousLabel="Newer"
  nextLabel="Older"
  onPageChange={setPage}
/>
```

### An empty set

No items is one empty page. Both controls are disabled, no tool registers, and the summary still says what it is showing.

```tsx
<Pagination
  label="Search results pages"
  page={1}
  pageSize={20}
  total={0}
  onPageChange={setPage}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What is being paged. Names the navigation landmark and derives the tool name, so prefer a noun phrase such as "Users pages". |
| `page` | number (required) | — | The 1-based page currently shown. The component is controlled; a value outside 1 to the page count is clamped into it. |
| `pageSize` | number (required) | — | How many items a full page holds. Values below 1 are treated as 1. |
| `total` | number (required) | — | How many items the whole set holds. The page count is total divided by pageSize, rounded up, and never less than 1, so an empty set is one empty page. |
| `onPageChange` | handler | — | Called with the page to show. Without href the controls are buttons and the turn tool registers; with href it runs alongside the link, for routers that intercept clicks. |
| `href` | handler | — | Given a page number, returns its URL. When present, Previous and Next render as links, each publishes its URL as data-sprint-href, and no tool registers. |
| `previousLabel` | string | `"Previous"` | The text of the control that goes back a page. |
| `nextLabel` | string | `"Next"` | The text of the control that goes forward a page. |
| `agentName` | string | — | Override the label used to derive the tool name, when two paginations on a page would otherwise collide. |
| `agentTool` | boolean | `true` | Set false to render the controls without registering a turn tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-page` | present or absent | The 1-based page shown, after clamping. |
| `data-sprint-pages` | present or absent | How many pages the set spans. Never less than 1. |
| `data-sprint-total` | present or absent | How many items the whole set holds. |
| `data-sprint-first` | present or absent | The 1-based position of the first item on this page, or 0 when the set is empty. |
| `data-sprint-last` | present or absent | The 1-based position of the last item on this page, or 0 when the set is empty. |

## WebMCP tools

### `<scope>-turn-<label>`

Go to a page of this paginated set by its 1-based number, exactly as a person pressing Previous or Next until they reach it would. Any page from 1 to the page count is accepted, not just the neighbours. Returns the pagination's state after the change, including which items are now showing, so a follow-up read is unnecessary.

- Read-only: no
- Registered when: The pagination is mounted, changes page through onPageChange rather than href, has more than one page, has a resolvable label, and no other component claims the same tool name. The registered schema states the current page count.
- Unregistered when: The pagination unmounts, is given href, loses onPageChange, or shrinks to a single page.

```json
{
  "name": "<scope>-turn-<label>",
  "description": "Go to a page of this paginated set by its 1-based number, exactly as a person pressing Previous or Next until they reach it would. Any page from 1 to the page count is accepted, not just the neighbours. Returns the pagination's state after the change, including which items are now showing, so a follow-up read is unnecessary.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "page": {
        "type": "integer",
        "description": "The 1-based number of the page to show.",
        "minimum": 1
      }
    },
    "required": [
      "page"
    ]
  },
  "annotations": {
    "readOnlyHint": false,
    "untrustedContentHint": false
  }
}
```

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Pagination** "Users pages" [first=26, last=50, page=2, pages=3, total=61] → tool `turn-users-pages`
  - part `previous` "Previous"
  - part `next` "Next"
```

## Accessibility

- Role: `navigation`
- Keyboard: Tab reaches Previous and Next in order, Enter or Space on a button, Enter on a link, turns the page
- Notes: The root is a nav landmark named by label. A control with nowhere to go is a disabled button, or a link with no href and aria-disabled, so it leaves the tab order. The item summary is a polite live region, so a screen reader hears the new range after a turn.
