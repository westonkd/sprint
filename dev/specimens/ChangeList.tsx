import type { ReactNode } from "react";
import { ChangeList } from "../../src/index.ts";

export const changeListSpecimens: Record<string, ReactNode> = {
  "A role change": (
    <ChangeList
      label="Role changes"
      changes={[
        { kind: "changed", label: "Ada Lovelace", from: "Write", to: "Maintain" },
      ]}
    />
  ),
  "A review before confirming": (
    <ChangeList
      label="Team changes"
      changes={[
        {
          kind: "added",
          label: "Grace Hopper",
          detail: "Gets read access to every repository.",
        },
        { kind: "removed", label: "Alan Turing" },
        { kind: "changed", label: "Ada Lovelace", from: "Write", to: "Maintain" },
      ]}
    />
  ),
  "Nothing to change": (
    <ChangeList label="Role changes" changes={[]} emptyLabel="No role changes" />
  ),
};

export const changeListGallery: ReactNode = (
  <>
    <ChangeList
      label="Every kind"
      changes={[
        { kind: "added", label: "Added row" },
        { kind: "removed", label: "Removed row" },
        { kind: "changed", label: "Changed row", from: "Before", to: "After" },
        { kind: "changed", label: "Only a new value", to: "After" },
        {
          kind: "removed",
          label: "With detail",
          detail: "A line of consequence beneath the row.",
        },
      ]}
    />
    <ChangeList label="Empty" changes={[]} />
  </>
);
