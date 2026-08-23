import type { ReactNode } from "react";
import { Button, PageHeader, Tag, Text } from "../../src/index.ts";

export const pageHeaderSpecimens: Record<string, ReactNode> = {
  "A titled page with a lede": (
    <PageHeader label="Reports">
      <Text>Everything the quarter produced, in one place.</Text>
    </PageHeader>
  ),
  "Status tags and a page-level control": (
    <PageHeader
      label="Button"
      tags={
        <Tag tone="warning" filled>
          experimental
        </Tag>
      }
      actions={<Button agentTool={false}>Refresh</Button>}
    >
      <Text>A single action a person or an agent can trigger.</Text>
    </PageHeader>
  ),
};
