import type { ReactNode } from "react";
import { Link, VisuallyHidden } from "../../src/index.ts";

export const visuallyHiddenSpecimens: Record<string, ReactNode> = {
  "Extra words for a screen reader": (
    <Link href="https://churchofjesuschrist.org" external>
      Gospel Library ↗<VisuallyHidden> (opens in a new tab)</VisuallyHidden>
    </Link>
  ),
  "A skip link": (
    <VisuallyHidden focusable>
      <Link href="#/VisuallyHidden">Skip to the board</Link>
    </VisuallyHidden>
  ),
};
