# Steps

> An ordered set of numbered steps a person works through: each one a number badge, a short title and an optional body, with a rule between them. A step can be marked done or current, so the list doubles as a record of how far someone has got.

- Category: display
- Status: experimental

## When to use

Use it when the order is the instruction: a handful of things to do one after another, each worth a title of its own, like the two things to send someone or the stages of a setup. Mark the step in progress as current and the finished ones as done when the page knows; leave every state off when the steps are simply instructions. Each step is an addressable part carrying its position and state, so an agent can say which step is next without counting lines.

### When not to

Do not use it for a plain numbered list of short points with no titles or progress; that is List with ordered. Do not use it as a wizard that moves between screens: Steps only displays where someone is, it has no actions and registers no WebMCP tool, because there is nothing to press and an agent reads every step and its state from the agent view. Pair it with a Button when the page itself advances. Do not put components or links in a step; title and body are plain strings.

## Install

```tsx
import { Steps } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### Send Tess two things

The plainest case: two instructions in order, with no progress to report.

```tsx
<Steps
  label="Send Tess two things"
  steps={[{ title: "Copy the link" }, { title: "Pass on the emoji" }]}
/>
```

### Partway through

A finished step, the one in progress, and one still to come, each with a line of detail.

```tsx
<Steps
  label="Connect a tool"
  steps={[
    {
      title: "Register the tool",
      body: "Give it a name and an input schema.",
      state: "done",
    },
    {
      title: "Drive the DOM",
      body: "Click the real element rather than calling a prop.",
      state: "current",
    },
    { title: "Return the new state", body: "Read it back from the page." },
  ]}
/>
```

### Every step done

When all steps are done the list publishes that it is complete.

```tsx
<Steps
  label="Send Tess two things"
  steps={[
    { title: "Copy the link", state: "done" },
    { title: "Pass on the emoji", state: "done" },
  ]}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What the steps achieve, as a short phrase like "Send Tess two things". Names the list for a screen reader and for the agent view. |
| `steps` | array (required) | — | The steps in order, each { title: string; body?: string; state?: "done" \| "current" }. Title is the instruction in a few words; body is an optional sentence of detail. A step with no state is upcoming. Mark at most one step current. |
| `doneLabel` | string | `"Done"` | What a screen reader hears as the description of a finished step, since the done mark is drawn rather than written. |
| `emptyLabel` | string | `"No steps"` | What the list says when it has no steps. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-steps` | present or absent | How many steps there are. |
| `data-sprint-complete` | present or absent | Present when every step is done. |
| `data-sprint-empty` | present or absent | Present when there are no steps. |
| `data-sprint-index` | present or absent | On a step: its 1-based position, which is also the number in its badge. |
| `data-sprint-done` | present or absent | On a step: present once the step is finished. |
| `data-sprint-current` | present or absent | On a step: present on the step in progress. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Steps** "Send Tess two things" [steps=2]
  - part `step` "Copy the link" [index=1]
  - part `step` "Pass on the emoji" [index=2]
```

## Accessibility

- Role: `list`
- Notes: A real ol named by its label, with an explicit list role because the drawn badges require list-style none and Safari would otherwise drop the list semantics, so the position of each step is announced. The badge number is aria-hidden for the same reason. The current step carries aria-current="step", and a done step is described by doneLabel. Title and body are read as one item, separated by a colon that is hidden visually.
