import type { ReactNode } from "react";
import { Button, Card, Heading, Stack, Tag } from "../../src/index.ts";

export const stackSpecimens: Record<string, ReactNode> = {
  "A row of actions": (
    <Stack direction="row" gap="tight" wrap>
      <Button>Cancel</Button>
      <Button tone="action">Confirm</Button>
    </Stack>
  ),
  "A responsive card grid": (
    <Stack direction="grid" min="16rem">
      <Card label="Button" href="#/Button">
        One action.
      </Card>
      <Card label="Table" href="#/Table">
        Rows and columns.
      </Card>
    </Stack>
  ),
  "A header bar that stacks on a phone": (
    <Stack direction="row" justify="between" align="center" collapse>
      <Heading level={1}>Button</Heading>
      <Tag tone="warning">experimental</Tag>
    </Stack>
  ),
};
