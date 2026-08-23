import type { ReactNode } from "react";
import { Link, Nav, Panel, Shell, Text } from "../../src/index.ts";

export const shellSpecimens: Record<string, ReactNode> = {
  "A sidebar app shell": (
    <Shell
      style={{ minHeight: "22rem" }}
      bar={<Link href="#/">ACME</Link>}
      side={
        <Nav label="Main">
          <Link href="#/reports" active>
            Reports
          </Link>
          <Link href="#/settings">Settings</Link>
        </Nav>
      }
    >
      <Panel label="Reports" headingLevel={2}>
        <Text>Quarterly numbers land here.</Text>
      </Panel>
    </Shell>
  ),
};
