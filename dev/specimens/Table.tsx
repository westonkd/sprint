import type { ReactNode } from "react";
import { Table } from "../../src/index.ts";

export const tableSpecimens: Record<string, ReactNode> = {
  "A reference table": (
    <Table
      label="Props"
      columns={[
        { key: "prop", header: "Prop" },
        { key: "kind", header: "Kind" },
      ]}
      rows={[{ id: "tone", cells: { prop: <code>tone</code>, kind: "enum" } }]}
    />
  ),
  "A table with no rows": (
    <Table
      label="Registered tools"
      emptyLabel="No tools registered"
      columns={[{ key: "name", header: "Name" }]}
      rows={[]}
    />
  ),
};

export const tableGallery: ReactNode = (
  <Table
    label="Every state attribute"
    columns={[
      { key: "attribute", header: "Attribute" },
      { key: "values", header: "Values" },
      { key: "description", header: "Description" },
    ]}
    rows={[
      {
        id: "columns",
        cells: {
          attribute: <code>data-sprint-columns</code>,
          values: "a count",
          description: "How many columns the table has.",
        },
      },
      {
        id: "row",
        cells: {
          attribute: <code>data-sprint-row</code>,
          values: "a row id",
          description: "On a cell: which row it belongs to.",
        },
      },
    ]}
  />
);
