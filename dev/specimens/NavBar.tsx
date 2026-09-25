import type { ReactNode } from "react";
import { NavBar } from "../../src/index.ts";

const CATALOG = [
  {
    label: "action",
    items: [
      { href: "#/Button", label: "Button" },
      { href: "#/Switch", label: "Switch" },
    ],
  },
  {
    label: "display",
    items: [
      { href: "#/Table", label: "Table", active: true },
      { href: "#/Tag", label: "Tag" },
    ],
  },
];

export const navBarSpecimens: Record<string, ReactNode> = {
  "A coordinate bar": <NavBar label="Workbench" groups={CATALOG} />,
  "Recording where a person has been": (
    <NavBar
      label="Docs"
      groups={[
        {
          label: "guides",
          items: [
            { href: "#/guide/webmcp", label: "WebMCP" },
            { href: "#/guide/philosophy", label: "Philosophy" },
          ],
        },
      ]}
    />
  ),
};
