import { render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { Table, type TableColumn, type TableRow } from "./Table.tsx";

const COLUMNS: readonly TableColumn[] = [
  { key: "prop", header: "Prop" },
  { key: "kind", header: "Kind" },
];

const ROWS: readonly TableRow[] = [
  { id: "tone", cells: { prop: <code>tone</code>, kind: "enum" } },
  { id: "block", cells: { prop: <code>block</code>, kind: "boolean" } },
];

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Table"));
  if (element === null) throw new Error("no Table root found");
  return element;
}

function cells(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(agentSelector("Table", "cell")),
  );
}

describe("Table rendering", () => {
  it("names the table and counts its shape", () => {
    render(<Table label="Props" columns={COLUMNS} rows={ROWS} />);
    expect(screen.getByRole("table", { name: "Props" })).toBe(root());
    expect(root()).toHaveAttribute("data-sprint-columns", "2");
    expect(root()).toHaveAttribute("data-sprint-rows", "2");
    expect(root()).not.toHaveAttribute("data-sprint-empty");
  });

  it("addresses every cell by column and row", () => {
    render(<Table label="Props" columns={COLUMNS} rows={ROWS} />);
    const first = cells()[0];
    expect(first).toHaveAttribute("data-sprint-column", "prop");
    expect(first).toHaveAttribute("data-sprint-row", "tone");
    expect(cells()).toHaveLength(4);
  });

  it("selects a column without knowing anything about the markup", () => {
    render(<Table label="Props" columns={COLUMNS} rows={ROWS} />);
    const kinds = document.querySelectorAll(
      `${agentSelector("Table", "cell")}[data-sprint-column="kind"]`,
    );
    expect(Array.from(kinds).map((cell) => cell.textContent)).toEqual([
      "Kindenum",
      "Kindboolean",
    ]);
  });

  it("falls back to the row position when no id was given", () => {
    render(<Table label="Props" columns={COLUMNS} rows={[{ cells: { prop: "a" } }]} />);
    expect(cells()[0]).toHaveAttribute("data-sprint-row", "1");
  });

  it("repeats the column header per cell for the stacked layout, hidden from the tree", () => {
    render(<Table label="Props" columns={COLUMNS} rows={ROWS} />);
    const first = cells()[0];
    expect(first?.querySelector("span")).toHaveAttribute("aria-hidden", "true");
    expect(within(root()).getAllByRole("columnheader")).toHaveLength(2);
  });

  it("keeps table semantics even though the stacked layout changes display", () => {
    render(<Table label="Props" columns={COLUMNS} rows={ROWS} />);
    expect(within(root()).getAllByRole("row")).toHaveLength(3);
    expect(within(root()).getAllByRole("cell")).toHaveLength(4);
  });

  it("says it is empty rather than rendering a bare keyline", () => {
    render(
      <Table
        label="Registered tools"
        columns={COLUMNS}
        rows={[]}
        emptyLabel="No tools registered"
      />,
    );
    expect(root()).toHaveAttribute("data-sprint-empty", "");
    expect(root()).toHaveAttribute("data-sprint-rows", "0");
    expect(root()).toHaveTextContent("No tools registered");
    expect(cells()).toHaveLength(0);
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLTableElement>();
    render(
      <Table
        ref={ref}
        label="Props"
        columns={COLUMNS}
        rows={ROWS}
        id="props"
        data-testid="spread"
      />,
    );
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "props");
    expect(screen.getByTestId("spread")).toBe(root());
  });
});

describe("Table agent view", () => {
  it("renders the data, one line per cell, and no element", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Table label="Props" columns={COLUMNS} rows={[ROWS[0] as TableRow]} />
      </SprintProvider>,
    );

    expect(container.querySelector(agentSelector("Table"))).toBeNull();
    expect(container.textContent).toBe(
      [
        '- **Table** "Props" [columns=2, rows=1]',
        '  - part `cell` "tone" [column=prop, row=tone]',
        '  - part `cell` "enum" [column=kind, row=tone]',
        "",
      ].join("\n"),
    );
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(<Table label="Props" columns={COLUMNS} rows={ROWS} />);

    const [node] = serializeWithin(container);
    expect(node?.label).toBe("Props");
    expect(node?.state).toMatchObject({ columns: "2", rows: "2" });
    expect(node?.parts).toEqual([
      { part: "cell", label: "tone", state: { column: "prop", row: "tone" } },
      { part: "cell", label: "enum", state: { column: "kind", row: "tone" } },
      { part: "cell", label: "block", state: { column: "prop", row: "block" } },
      { part: "cell", label: "boolean", state: { column: "kind", row: "block" } },
    ]);
  });
});
