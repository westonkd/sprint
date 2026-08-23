import type { ComponentPropsWithRef, ReactNode } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { reactText } from "@/agent/view/text.ts";
import { tableMeta } from "./meta.ts";
import "./Table.css";

export interface TableColumn {
  key: string;
  header: string;
  align?: "start" | "end";
  width?: string;
}

export interface TableRow {
  id?: string;
  cells: Record<string, ReactNode>;
}

export interface TableProps extends ComponentPropsWithRef<"table"> {
  label: string;
  columns: readonly TableColumn[];
  rows: readonly TableRow[];
  emptyLabel?: string;
}

function rowId(row: TableRow, index: number): string {
  return row.id ?? String(index + 1);
}

function cellParts(
  columns: readonly TableColumn[],
  rows: readonly TableRow[],
): AgentPart[] {
  return rows.flatMap((row, index) =>
    columns.map((column) => {
      const label = reactText(row.cells[column.key]);
      return {
        part: "cell",
        state: { column: column.key, row: rowId(row, index) },
        ...(label === undefined ? {} : { label }),
      };
    }),
  );
}

export function Table(props: TableProps) {
  const { label, columns, rows, emptyLabel = "No rows", ...rest } = props;

  const view = useSprintView();
  const empty = rows.length === 0;

  const node = buildAgentNode({
    component: tableMeta.name,
    label,
    state: {
      columns: String(columns.length),
      rows: String(rows.length),
      empty,
    },
    parts: cellParts(columns, rows),
  });

  if (view === "agent") return <AgentLine node={node} />;

  return (
    <table {...rest} {...agentAttributesFor(node)} role="table" aria-label={label}>
      <thead role="rowgroup">
        <tr role="row">
          {columns.map((column) => (
            <th
              key={column.key}
              role="columnheader"
              scope="col"
              data-sprint-column={column.key}
              style={column.width === undefined ? undefined : { width: column.width }}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody role="rowgroup">
        {empty ? (
          <tr role="row">
            <td role="cell" colSpan={columns.length}>
              {emptyLabel}
            </td>
          </tr>
        ) : (
          rows.map((row, index) => (
            <tr key={rowId(row, index)} role="row">
              {columns.map((column) => (
                <td
                  key={column.key}
                  role="cell"
                  {...agentPartAttributesFor({
                    part: "cell",
                    state: { column: column.key, row: rowId(row, index) },
                  })}
                  data-sprint-align={column.align}
                >
                  <span aria-hidden="true">{column.header}</span>
                  <div>{row.cells[column.key]}</div>
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
