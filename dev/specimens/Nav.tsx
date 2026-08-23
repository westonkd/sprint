import type { ReactNode } from "react";
import { Link, Nav, NavGroup } from "../../src/index.ts";

export const navSpecimens: Record<string, ReactNode> = {
  "A grouped sidebar nav": (
    <Nav label="Docs">
      <NavGroup label="Guides">
        <Link href="#/guide/webmcp">WebMCP</Link>
      </NavGroup>
      <NavGroup label="Components">
        <Link href="#/Button" active>
          Button
        </Link>
        <Link href="#/Table">Table</Link>
      </NavGroup>
    </Nav>
  ),
  "A flat nav": (
    <Nav label="Site">
      <Link href="#/">Home</Link>
      <Link href="#/pricing">Pricing</Link>
    </Nav>
  ),
};
