import { describe, expect, it } from "vitest";
import type { AgentNode, AgentPart } from "./node.ts";
import { condenseCells } from "./tabular.ts";

function cell(row: string, column: string, label: string): AgentPart {
  return { part: "cell", label, state: { row, column } };
}

function node(parts: AgentPart[]): AgentNode {
  return { component: "Table", state: {}, parts, children: [] };
}

describe("condenseCells", () => {
  it("condenses cell parts into a pipe table summary", () => {
    const condensed = condenseCells(
      node([cell("tone", "prop", "tone"), cell("tone", "kind", "enum")]),
    );
    expect(condensed.parts).toEqual([]);
    expect(condensed.summary).toBe(
      ["| row | prop | kind |", "| --- | --- | --- |", "| tone | tone | enum |"].join(
        "\n",
      ),
    );
  });

  it("leaves a node with non-cell parts untouched", () => {
    const input = node([
      cell("1", "name", "a"),
      { part: "option", label: "dark", state: {} },
    ]);
    expect(condenseCells(input)).toBe(input);
  });

  it("leaves a part-less node untouched", () => {
    const input = node([]);
    expect(condenseCells(input)).toBe(input);
  });

  it("escapes pipes and flattens line breaks in cell text", () => {
    const condensed = condenseCells(node([cell("1", "values", "a | b\nc")]));
    expect(condensed.summary).toContain("| a \\| b c |");
  });

  it("fills missing cells with empty columns", () => {
    const condensed = condenseCells(
      node([cell("1", "name", "a"), cell("2", "name", "b"), cell("2", "count", "9")]),
    );
    expect(condensed.summary).toBe(
      [
        "| row | name | count |",
        "| --- | --- | --- |",
        "| 1 | a |  |",
        "| 2 | b | 9 |",
      ].join("\n"),
    );
  });
});
