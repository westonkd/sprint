import { type ReactNode, useState } from "react";
import { Button, Link, Nav, Panel, Shell, Text } from "../../src/index.ts";

function ControlledDrawer() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <Shell
      style={{ minHeight: "22rem" }}
      drawerOpen={drawerOpen}
      onDrawerOpenChange={setDrawerOpen}
      bar={<Link href="#/">ACME</Link>}
      side={
        <Nav label="Main">
          <Link href="#/reports" active>
            Reports
          </Link>
        </Nav>
      }
    >
      <Button onClick={() => setDrawerOpen(true)}>Show me the menu</Button>
    </Shell>
  );
}

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
  "A sidebar that can be hidden": (
    <Shell
      collapsible
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
      <Text>Quarterly numbers land here.</Text>
    </Shell>
  ),
  "A drawer the page controls": <ControlledDrawer />,
};
