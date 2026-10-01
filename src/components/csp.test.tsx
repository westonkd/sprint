import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { DescriptionList } from "./DescriptionList/index.ts";
import { MetaLine } from "./MetaLine/index.ts";
import { STACK_MINS, Stack, type StackDirection } from "./Stack/index.ts";
import { TABLE_WIDTHS, Table } from "./Table/index.ts";

const DIRECTIONS: readonly StackDirection[] = ["row", "column", "grid"];

const ENTRIES = [
  { term: "Serial", detail: "NU-TYPE-CORE-A1" },
  { term: "Issued", detail: "2744.07.22" },
];

const CONFIGURATIONS: ReadonlyArray<readonly [string, ReactNode]> = [
  ...DIRECTIONS.map(
    (direction) =>
      [`Stack direction=${direction}`, <Stack direction={direction}>x</Stack>] as const,
  ),
  ...STACK_MINS.map(
    (min) =>
      [
        `Stack grid min=${min}`,
        <Stack direction="grid" min={min}>
          x
        </Stack>,
      ] as const,
  ),
  [
    "Stack row wrap collapse",
    <Stack direction="row" gap="tight" align="center" justify="between" wrap collapse>
      x
    </Stack>,
  ],
  ...TABLE_WIDTHS.map(
    (width) =>
      [
        `Table width=${width}`,
        <Table
          label="Props"
          columns={[
            { key: "prop", header: "Prop", width },
            { key: "kind", header: "Kind" },
          ]}
          rows={[{ id: "tone", cells: { prop: "tone", kind: "enum" } }]}
        />,
      ] as const,
  ),
  [
    "Table empty and loading",
    <Table
      label="Loadouts"
      loading
      columns={[{ key: "name", header: "Name" }]}
      rows={[]}
    />,
  ],
  [
    "DescriptionList",
    <DescriptionList
      label="Key sk-prod"
      items={[{ term: "Created", description: "2026-08-01" }]}
    />,
  ],
  [
    "DescriptionList empty and loading",
    <DescriptionList label="Recovery codes" items={[]} loading />,
  ],
  ["MetaLine", <MetaLine entries={ENTRIES} />],
  ["MetaLine wrap", <MetaLine entries={ENTRIES} wrap />],
];

describe("strict Content Security Policy", () => {
  it.each(CONFIGURATIONS)("%s writes no inline style attribute", (_, element) => {
    const { container } = render(element);
    expect(container.querySelector("[style]")).toBeNull();
  });
});
