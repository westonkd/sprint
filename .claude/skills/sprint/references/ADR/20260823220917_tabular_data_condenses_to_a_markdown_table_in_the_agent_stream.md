# Tabular data condenses to a Markdown table in the agent stream

- **Status**: Accepted
- **Date**: 2026-08-23

## Context

Table rendered one stream line per cell: `- part \`cell\` "enum" [column=kind, row=tone]`. The
Button page's own props table is 32 such lines, several kilobytes of repeated bracket metadata for
data a Markdown pipe table carries in a tenth of the space, and the agent has to mentally reassemble
the grid from coordinates. The 1.5K platform cap on tool output makes this worse: that one panel
alone paginates `read-region` across multiple calls.

The per-cell form exists because cells are addressable parts, and the formatter contract says a
formatter emits one line per part so `AgentControlGroup` can map lines back onto controls
positionally.

## Decision

A node whose parts are all `cell` parts carrying `column` and `row` state is **condensed** before
formatting: its parts are dropped and replaced by a multi-line summary containing a Markdown pipe
table (`| row | <column keys...> |`, one body row per row id). `condenseCells` in
`src/agent/view/tabular.ts` is the one implementation, applied in both places a node becomes text:
the component's own agent render (`Table` condenses before `AgentLine`) and the DOM projection
(`serializeElement` condenses after reading parts). The two surfaces keep agreeing by construction
because they run the same function on the same part data.

The human DOM is unchanged: every cell still carries `data-sprint-part="cell"`,
`data-sprint-column`, and `data-sprint-row`, so selector-driven agents keep cell addressing.
Column header cells in the pipe table are the column *keys* (the values used in selectors), not the
display headers, because keys are what both surfaces can see.

Two amendments to the formatter shape rule come with this:

- A summary may span multiple lines when the node has no parts. (With parts, it stays one line.)
- `AgentControlGroup` now computes its part-line offset as `lines.length - parts.length` instead of
  assuming a single-line summary, which honours the contract without counting summary lines.

## Consequences

- The Button props table drops from 32 metadata lines to a 10-line pipe table that is directly
  readable as a table; `read-region` pages shrink accordingly.
- Alignment (`data-sprint-align`) and any other per-cell state are visible only in the DOM, not in
  the stream. Alignment is presentation, so this is intended.
- Any future data-grid component gets the same condensation for free by naming its parts `cell`
  with `column`/`row` state.
- Custom formatters see the condensed node, so they need no table-awareness of their own.
