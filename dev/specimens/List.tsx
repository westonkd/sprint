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
  "Plain bullets": (
    <List
      marker="bullet"
      label="Caveats"
      items={["Chrome 149 only.", "Tools are a no-op without WebMCP."]}
    />
  ),
  "No marker": (
    <List
      marker="none"
      label="Related"
      items={["Table for records.", "Stack for layout."]}
    />
  ),
};

export const listGallery: ReactNode = (
  <>
    <List label="Plus" items={["The house mark.", "The default."]} />
    <List marker="bullet" label="Bullet" items={["A plain dot.", "For prose."]} />
    <List marker="number" label="Number" items={["Counted.", "In order."]} />
    <List marker="none" label="None" items={["No marker.", "Own lead."]} />
  </>
);
