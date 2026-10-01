# Pending

> Marks a region whose data is being fetched. Keeps stale content visible and readable while it refreshes, and holds a labelled pending field when there is nothing to show yet.

- Category: feedback
- Status: experimental

## When to use

Wrap a region you build yourself while its data loads: a profile card, a chart, a custom summary. Pass the children only once data exists, so the first load shows the pending field and a refetch keeps the old content under a busy bar. Table, List, DescriptionList and Panel take a loading prop of their own, so reach for that first.

### When not to

Do not wrap a Table, List, DescriptionList or Panel; use its loading prop, which keeps the region's own label and frame. Do not use for a long job with a countable amount of work; that is a Progress. Do not use for a busy action; that is Button's loading prop.

## Install

```tsx
import { Pending } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### First load

No data yet, so the region holds a labelled pending field.

```tsx
<Pending loading={isLoading} label="Loading profile">
  {profile && <ProfileSummary profile={profile} />}
</Pending>
```

### Refetching stale content

Content already on screen stays readable under a busy bar, and an agent reads it nested under a loading line.

```tsx
<Pending loading={isFetching} label="Refreshing pilot">
  <Stack gap="tight">
    <Heading level={3}>{pilot.callsign}</Heading>
    <Text tone="muted">{pilot.status}</Text>
  </Stack>
</Pending>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `loading` | boolean (required) | — | Whether the region's data is being fetched. While false the wrapper adds nothing to the agent view. |
| `label` | string (required) | — | What is loading, as a phrase a person can read in the empty field, such as "Loading profile". |
| `children` | node | — | The region's content. Omit it until data exists; while loading with children they stay visible as stale content. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-loading` | present or absent | Present while the region's data is being fetched. |
| `data-sprint-empty` | present or absent | Present while loading with no content yet, so nothing on screen is data. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Pending** "Loading profile" [empty, loading]
```

## Accessibility

- Role: `group`
- Notes: While loading the wrapper is a group named by its label with aria-busy set, so assistive technology knows the content may change. Idle, it is a plain element with no role.
