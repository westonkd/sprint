import type { ReactNode } from "react";
import { Link } from "../../src/index.ts";

export const linkSpecimens: Record<string, ReactNode> = {
  "A nav item": (
    <Link href="#/Button" active>
      Button
    </Link>
  ),
  "A link out": (
    <Link href="https://developer.chrome.com/docs/ai/webmcp" external>
      Chrome docs
    </Link>
  ),
  "A link an agent may follow itself": (
    <Link href="#/checkout" agentTool>
      Go to checkout
    </Link>
  ),
};
