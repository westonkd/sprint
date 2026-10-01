import type { ReactNode } from "react";
import { Breadcrumb, Divider, Stack, Text } from "../../src/index.ts";

export const dividerSpecimens: Record<string, ReactNode> = {
  "Separating the header from the body": (
    <Stack>
      <Breadcrumb
        label="Docs"
        agentTool={false}
        items={[
          {
            label: "guides",
            children: [{ href: "#/guide/webmcp", label: "WebMCP", active: true }],
          },
        ]}
      />
      <Divider />
      <Text>The body of the page starts here.</Text>
    </Stack>
  ),
  "A named segment": <Divider label="Results" weight="heavy" />,
  "The page's main break": <Divider label="Body" weight="band" />,
};

export const dividerGallery: ReactNode = (
  <>
    <Divider />
    <Divider weight="heavy" />
    <Divider weight="band" />
    <Divider label="Hairline" />
    <Divider label="Heavy" weight="heavy" />
    <Divider label="Band" weight="band" />
  </>
);
