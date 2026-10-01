import type { ReactNode } from "react";
import { Breadcrumb } from "../../src/index.ts";

const CATALOG = [
  {
    label: "action",
    children: [
      { href: "#/Button", label: "Button" },
      { href: "#/Switch", label: "Switch" },
    ],
  },
  {
    label: "display",
    children: [
      { href: "#/Table", label: "Table", active: true },
      { href: "#/Tag", label: "Tag" },
    ],
  },
];

const STORE = [
  {
    label: "Clothing",
    href: "#/clothing",
    children: [
      {
        label: "Outerwear",
        href: "#/clothing/outerwear",
        children: [
          {
            label: "Jackets",
            href: "#/clothing/outerwear/jackets",
            children: [
              { label: "Rain shell", href: "#/rain-shell", active: true },
              { label: "Down parka", href: "#/down-parka" },
            ],
          },
          { label: "Vests", href: "#/clothing/outerwear/vests" },
        ],
      },
      { label: "Knitwear", href: "#/clothing/knitwear" },
    ],
  },
  { label: "Footwear", href: "#/footwear" },
];

export const breadcrumbSpecimens: Record<string, ReactNode> = {
  "A path you can edit": <Breadcrumb label="Workbench" items={CATALOG} />,
  "A deep path that folds": <Breadcrumb label="Store" maxCrumbs={3} items={STORE} />,
  "Trailing actions": (
    <Breadcrumb
      label="Docs"
      items={[
        {
          label: "guides",
          children: [{ href: "#/guide/webmcp", label: "WebMCP", active: true }],
        },
      ]}
      actions={[
        {
          label: "Copy link",
          onSelect: () => navigator.clipboard.writeText(window.location.href),
        },
        { label: "Source", href: "https://github.com/westonkd/sprint", external: true },
      ]}
    />
  ),
  "A root that leads back": (
    <Breadcrumb
      label="People"
      href="#/people"
      items={[
        {
          label: "Admin",
          href: "#/people?role=admin",
          children: [{ label: "Tess Ocampo", href: "#/people/tess", active: true }],
        },
      ]}
    />
  ),
  "Recording where a person has been": (
    <Breadcrumb
      label="Docs"
      agentTool={false}
      defaultVisited={["#/guide/webmcp"]}
      items={[
        {
          label: "guides",
          children: [
            { href: "#/guide/webmcp", label: "WebMCP" },
            { href: "#/guide/philosophy", label: "Philosophy" },
          ],
        },
      ]}
    />
  ),
};
