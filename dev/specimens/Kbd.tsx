import type { ReactNode } from "react";
import { Kbd } from "../../src/index.ts";

export const kbdSpecimens: Record<string, ReactNode> = {
  "An undo shortcut": <Kbd>Ctrl+Z</Kbd>,
  "A single key": <Kbd>/</Kbd>,
};
