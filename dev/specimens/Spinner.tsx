import type { ReactNode } from "react";
import { Spinner } from "../../src/index.ts";

export const spinnerSpecimens: Record<string, ReactNode> = {
  "Saving beside a line": <Spinner label="Saving note" showLabel />,
  "A silent mark in a field": <Spinner label="Searching members" size="small" />,
};
