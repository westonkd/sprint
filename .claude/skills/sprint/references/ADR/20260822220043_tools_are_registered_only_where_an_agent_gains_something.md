# Tools are registered only where an agent gains something

- **Status**: Accepted
- **Date**: 2026-08-22

## Context

Button registers its press tool by default, and the PRD records the tripwire: at roughly
15 tools on a realistic page, that default should be reconsidered.

The workbench hit the tripwire on the first try. Its sidebar alone is sixteen links. A
catalogue page adds twelve cards. Every code block has a copy control. Had all of them
followed Button's default, a single documentation page would have registered forty-odd
tools, most of them navigation, and buried the three that actually do something.

Raising the tripwire was not the answer, because the problem is not the count. It is that
`open-table`, on a link to `#/Table`, gives an agent nothing it did not already have.

## Decision

Registration is per-component and justified per-component. The test is: **what can an
agent do with this tool that it could not do without it?**

- **Button** registers by default. Pressing is unreachable except through the element.
- **Link** does not. A URL is reachable by navigation, and the destination is published
  as `data-sprint-href` so an agent reads it without clicking. `agentTool` opts one in
  for the link that completes a task.
- **Card** follows what it is: with `href` it navigates and registers nothing; with
  `onClick` it acts and registers `open-<label>`. `agentTool` overrides either way.
- **CodeBlock** never registers. Copying to a person's clipboard does nothing for a model
  that can already read the snippet, which the agent view hands it verbatim.
- **SegmentedControl** registers one tool for the whole group, not one per option, with
  the option labels as an `enum` on a per-instance `inputSchema`.

Presence in the agent view is not tied to any of this. A tool-less Link still renders its
own line, still says where it goes, and still renders a real anchor an agent can click.

## Consequences

A page's tool list stays proportional to what the page can *do* rather than to how much
is on it. The workbench's Button page registers Button's press tools plus the three page
tools, and nothing else.

The cost is that the default is no longer uniform, so "does this component register?" is
now a question with a per-component answer. It is documented on every affected prop and
on the component page, and the philosophy guide states the rule as point 5.

The PRD's tripwire question is answered for navigation, and still open for actions: if a
page ever holds fifteen genuinely actionable Buttons, Button's default is back on the
table.

`useAgentTool` gained an `inputSchema` option so a component can register the shared spec
with a per-instance value set. The prose stays declared once in `tool.ts`; only the enum
is live.
