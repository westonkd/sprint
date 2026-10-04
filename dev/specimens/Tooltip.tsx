import type { ReactNode } from "react";
import { Button, Link, Tooltip } from "../../src/index.ts";

export const tooltipSpecimens: Record<string, ReactNode> = {
  "Naming a truncated line": (
    <Tooltip label="Elder Kestrel, second counselor in the elders quorum presidency">
      <Link href="#/Tooltip">Elder Kestrel, second counselor…</Link>
    </Tooltip>
  ),
  "A hint below its control": (
    <Tooltip label="Opens in the planner" side="below">
      <Button>Plan Sunday</Button>
    </Tooltip>
  ),
};
