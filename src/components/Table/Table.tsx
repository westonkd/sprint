import type { ComponentPropsWithRef, CSSProperties, ReactNode } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { condenseCells } from "@/agent/view/tabular.ts";
import { reactText } from "@/agent/view/text.ts";
import { tableMeta } from "./meta.ts";
import "./Table.css";

export const TABLE_WIDTHS = [
  "4rem",
  "5rem",
  "6rem",
  "7rem",
  "8rem",
  "9rem",
  "10rem",
  "12rem",
  "14rem",
  "16rem",
  "20rem",
  "24rem",
] as const;

export type TableWidth = (typeof TABLE_WIDTHS)[number];

export interface TableColumn {
  key: string;
  header: string;
  align?: "start" | "end";
  width?: TableWidth | (string & Record<never, never>);
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
  loading?: boolean;
  loadingLabel?: string;
}

function onScale(width: string): width is TableWidth {
  return (TABLE_WIDTHS as readonly string[]).includes(width);
}

function offScaleWidth(width: string | undefined): CSSProperties | undefined {
  if (width === undefined || onScale(width)) return undefined;
  return { width };
}

function rowId(row: TableRow, index: number): string {
  return row.id ?? String(index + 1);
}

function cellState(column: TableColumn, row: string): Record<string, string> {
  return {
    column: column.key,
    row,
    ...(column.align === undefined ? {} : { align: column.align }),
  };
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
        state: cellState(column, rowId(row, index)),
        ...(label === undefined ? {} : { label }),
      };
    }),
  );
}

export function Table(props: TableProps) {
  const {
    label,
    columns,
    rows,
    emptyLabel = "No rows",
    loading = false,
    loadingLabel = "Loading",
    ...rest
  } = props;

  const view = useSprintView();
  const empty = rows.length === 0;

  const node = buildAgentNode({
    component: tableMeta.name,
    label,
    state: {
      columns: String(columns.length),
      rows: String(rows.length),
      empty,
      loading,
    },
    parts: cellParts(columns, rows),
  });

  if (view === "agent") return <AgentLine node={condenseCells(node)} />;

  return (
    <table
      {...rest}
      {...agentAttributesFor(node)}
      role="table"
      aria-label={label}
      aria-busy={loading || undefined}
    >
      <thead role="rowgroup">
        <tr role="row">
          {columns.map((column) => (
            <th
              key={column.key}
              role="columnheader"
              scope="col"
              data-sprint-column={column.key}
              data-sprint-width={column.width}
              style={offScaleWidth(column.width)}
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
              <span>{loading ? loadingLabel : emptyLabel}</span>
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
                    state: cellState(column, rowId(row, index)),
                  })}
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
