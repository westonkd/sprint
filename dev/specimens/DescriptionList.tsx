import type { ReactNode } from "react";
import { DescriptionList } from "../../src/index.ts";

export const descriptionListSpecimens: Record<string, ReactNode> = {
  "Token metadata": (
    <DescriptionList
      label="Key sk-prod"
      items={[
        { term: "Created", description: "2026-08-01" },
        { term: "Last used", description: "2 hours ago" },
        { term: "Scopes", description: "read, write" },
      ]}
    />
  ),
  "An empty list": (
    <DescriptionList label="Recovery codes" items={[]} emptyLabel="None generated" />
  ),
};
