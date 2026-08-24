import type { ReactNode } from "react";
import { Button, Panel, Table, Text } from "../../src/index.ts";

const COLUMNS = [
  { key: "name", header: "Convention" },
  { key: "value", header: "Value" },
];

const ROWS = [
  {
    id: "componentAttribute",
    cells: { name: "componentAttribute", value: <code>data-sprint</code> },
  },
  {
    id: "partAttribute",
    cells: { name: "partAttribute", value: <code>data-sprint-part</code> },
  },
];

export const panelSpecimens: Record<string, ReactNode> = {
  "A section of a page": (
    <Panel label="When to use" headingLevel={2}>
      <Text>Use it for any discrete action.</Text>
    </Panel>
  ),
  "A panel with a control in its header": (
    <Panel label="Preview" actions={<Button agentName="Reset preview">Reset</Button>}>
      <Button tone="action">Prepare launch</Button>
    </Panel>
  ),
  "A flush panel around a table": (
    <Panel label="Conventions" flush>
      <Table label="Conventions" columns={COLUMNS} rows={ROWS} />
    </Panel>
  ),
  "Nested panels": (
    <Panel label="The shape" headingLevel={2}>
      <Panel label="Human view" headingLevel={3}>
        <Panel label="Crew" headingLevel={4}>
          <Text>Registration fields live here.</Text>
        </Panel>
      </Panel>
    </Panel>
  ),
  "An empty region": (
    <Panel label="Registered tools" emptyLabel="No tools registered" />
  ),
};
