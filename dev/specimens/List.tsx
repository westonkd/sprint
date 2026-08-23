import type { ReactNode } from "react";
import { List } from "../../src/index.ts";

export const listSpecimens: Record<string, ReactNode> = {
  "A list of rules": (
    <List
      label="Tool rules"
      items={[
        <>
          <strong>One tool, one action.</strong> Overlapping tools make selection
          harder.
        </>,
        <>
          <strong>Register contextually.</strong> A tool that always fails is worse than
          one that is absent.
        </>,
      ]}
    />
  ),
  "A numbered sequence": (
    <List
      ordered
      label="Steps"
      items={["Register the tool.", "Drive the DOM.", "Return the new state."]}
    />
  ),
};
