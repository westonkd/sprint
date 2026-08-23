import type { ReactNode } from "react";
import { Link, NavGroup } from "../../src/index.ts";

export const navGroupSpecimens: Record<string, ReactNode> = {
  "A labelled group of links": (
    <NavGroup label="Reference">
      <Link href="https://developer.chrome.com/docs/ai/webmcp" external>
        Chrome docs
      </Link>
      <Link href="https://github.com/webmachinelearning/webmcp" external>
        Specification
      </Link>
    </NavGroup>
  ),
};
