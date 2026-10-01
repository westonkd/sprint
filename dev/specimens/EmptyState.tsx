import { type ReactNode, useState } from "react";
import { EmptyState, Stack, Text } from "../../src/index.ts";

function FilteredState() {
  const [cleared, setCleared] = useState(0);
  return (
    <Stack gap="tight">
      <EmptyState
        reason="filtered"
        label="No one matches these filters"
        description="Try a different role or clear the search."
        action={{ label: "Clear filters", onSelect: () => setCleared(cleared + 1) }}
      />
      <Text tone="muted" size="small">
        Cleared {cleared} time(s).
      </Text>
    </Stack>
  );
}

export const emptyStateSpecimens: Record<string, ReactNode> = {
  "Nothing matches": <FilteredState />,
  "Nothing yet": (
    <EmptyState
      label="No projects yet"
      description="Projects you create or are invited to appear here."
      action={{ label: "Create a project", href: "#/projects/new" }}
    />
  ),
  "Just the headline": <EmptyState label="No notifications" />,
};
