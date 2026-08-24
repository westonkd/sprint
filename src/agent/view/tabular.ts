import type { AgentNode, AgentPart } from "./node.ts";

function isCell(part: AgentPart): boolean {
  return (
    part.part === "cell" &&
    typeof part.state.column === "string" &&
    typeof part.state.row === "string"
  );
}

function text(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");
}

function cellKey(row: string, column: string): string {
  return JSON.stringify([row, column]);
}

export function condenseCells(node: AgentNode): AgentNode {
  if (node.parts.length === 0 || !node.parts.every(isCell)) return node;

  const columns: string[] = [];
  const rowIds: string[] = [];
  const cells = new Map<string, string>();

  for (const part of node.parts) {
    const column = String(part.state.column);
    const row = String(part.state.row);
    if (!columns.includes(column)) columns.push(column);
    if (!rowIds.includes(row)) rowIds.push(row);
    cells.set(cellKey(row, column), part.label ?? "");
  }

  const summary = [
    `| row | ${columns.map(text).join(" | ")} |`,
    `| --- | ${columns.map(() => "---").join(" | ")} |`,
    ...rowIds.map(
      (row) =>
        `| ${text(row)} | ${columns
          .map((column) => text(cells.get(cellKey(row, column)) ?? ""))
          .join(" | ")} |`,
    ),
  ].join("\n");

  return { ...node, parts: [], summary };
}
