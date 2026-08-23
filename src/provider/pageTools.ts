import type { AgentToolSpec } from "@/agent/types.ts";
import type { SprintView } from "@/agent/view/mode.ts";
import type { AgentFormatter, AgentNode } from "@/agent/view/node.ts";
import { countNodes } from "@/agent/view/node.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { clamp, paginate } from "@/agent/view/truncate.ts";
import { TOOL_OUTPUT_LIMIT } from "@/agent/webmcp/adapter.ts";
import { afterCommit } from "@/agent/webmcp/afterCommit.ts";
import { commitSync } from "@/agent/webmcp/flush.ts";
import { slug } from "@/agent/webmcp/scope.ts";
import { useAgentTool } from "@/agent/webmcp/useAgentTool.ts";

const PAGE_FOOTER_BUDGET = 40;

export interface Region {
  key: string;
  node: AgentNode;
}

export function regionKey(node: AgentNode): string {
  const label = node.label === undefined ? "" : slug(node.label);
  const base = label === "" ? slug(node.component) : `${slug(node.component)}-${label}`;
  return base === "" ? "region" : base;
}

export function toRegions(nodes: readonly AgentNode[]): Region[] {
  const used = new Map<string, number>();
  return nodes.map((node) => {
    const base = regionKey(node);
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    return { key: seen === 0 ? base : `${base}-${seen + 1}`, node };
  });
}

function readRegions(): Region[] {
  if (typeof document === "undefined") return [];
  return toRegions(serializeWithin(document.body));
}

export const LIST_REGIONS_SPEC: AgentToolSpec = {
  verb: "list",
  description:
    "List the Sprint component regions on this page, with a one-line state summary for each. Call this first to discover region keys, then call read-region to read one in full.",
  inputSchema: { type: "object", properties: {} },
  readOnly: true,
  untrustedContent: true,
  registeredWhen: "A root SprintProvider is mounted and WebMCP is available.",
};

export const READ_REGION_SPEC: AgentToolSpec = {
  verb: "read",
  description:
    "Read one region of the page as Markdown, including every component in it, its current state, and the tools that drive it. Long regions are paginated; the response ends with the page number and total.",
  inputSchema: {
    type: "object",
    properties: {
      region: {
        type: "string",
        description: "A region key from list-page-regions.",
      },
      page: {
        type: "integer",
        description: "1-based page number. Defaults to 1.",
        minimum: 1,
      },
    },
    required: ["region"],
  },
  readOnly: true,
  untrustedContent: true,
  registeredWhen: "A root SprintProvider is mounted and WebMCP is available.",
};

export function listRegions(format: AgentFormatter): string {
  const regions = readRegions();
  if (regions.length === 0) return "This page has no Sprint components.";

  const lines = regions.map(({ key, node }) => {
    const nested = countNodes(node.children);
    const summary = format([{ ...node, children: [], parts: [] }])
      .split("\n")[0]
      ?.replace(/^-\s*/, "");
    const suffix = nested === 0 ? "" : ` (${nested} nested)`;
    return `- \`${key}\` — ${summary ?? node.component}${suffix}`;
  });

  return [`${regions.length} region(s):`, ...lines].join("\n");
}

export function readRegion(
  format: AgentFormatter,
  requested: unknown,
  page: unknown,
): string {
  const regions = readRegions();
  const keys = regions.map((region) => region.key);
  const match = regions.find((region) => region.key === requested);

  if (match === undefined) {
    return `No region named "${String(requested)}". Available regions: ${
      keys.join(", ") || "none"
    }.`;
  }

  const pages = paginate(format([match.node]), TOOL_OUTPUT_LIMIT - PAGE_FOOTER_BUDGET);
  const requestedPage = typeof page === "number" ? page : 1;

  if (requestedPage < 1 || requestedPage > pages.length) {
    return `Region "${match.key}" has ${pages.length} page(s); page ${requestedPage} does not exist.`;
  }

  return `${pages[requestedPage - 1] ?? ""}\n\n(page ${requestedPage} of ${pages.length})`;
}

export const SET_VIEW_SPEC: AgentToolSpec = {
  verb: "set",
  description:
    'Switch how this page renders. In "agent" view every Sprint component renders as plain Markdown text with no HTML elements, so the page can be read directly. In "human" view it renders normally. Tools keep working in both.',
  inputSchema: {
    type: "object",
    properties: {
      view: {
        type: "string",
        description: 'Either "agent" or "human".',
        enum: ["agent", "human"],
      },
    },
    required: ["view"],
  },
  readOnly: false,
  untrustedContent: true,
  registeredWhen: "A root SprintProvider is mounted and WebMCP is available.",
};

export function pageText(): string {
  if (typeof document === "undefined") return "";
  return (document.body.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
}

export interface UsePageToolsOptions {
  enabled: boolean;
  format: AgentFormatter;
  view: SprintView;
  setView: (view: SprintView) => void;
}

export function usePageTools(options: UsePageToolsOptions): void {
  const { enabled, format, view, setView } = options;

  useAgentTool({
    spec: LIST_REGIONS_SPEC,
    label: "page regions",
    enabled,
    execute: () =>
      view === "agent"
        ? 'This page is in agent view and renders as one text document. Call read-region with region "page", or read the page text directly.'
        : listRegions(format),
  });

  useAgentTool({
    spec: READ_REGION_SPEC,
    label: "region",
    enabled,
    execute: (inputs) =>
      view === "agent"
        ? readTextRegion(inputs.region, inputs.page)
        : readRegion(format, inputs.region, inputs.page),
  });

  useAgentTool({
    spec: SET_VIEW_SPEC,
    label: "page view",
    enabled,
    execute: async (inputs) => {
      const next = inputs.view === "agent" ? "agent" : "human";
      commitSync(() => setView(next));
      await afterCommit();
      return next === "agent"
        ? `Page is now in agent view:\n\n${clamp(pageText(), TOOL_OUTPUT_LIMIT - PAGE_FOOTER_BUDGET)}`
        : "Page is now in human view.";
    },
  });
}

function readTextRegion(requested: unknown, page: unknown): string {
  if (requested !== "page") {
    return `No region named "${String(requested)}". In agent view the whole page is one region, named "page".`;
  }

  const pages = paginate(pageText(), TOOL_OUTPUT_LIMIT - PAGE_FOOTER_BUDGET);
  const requestedPage = typeof page === "number" ? page : 1;

  if (requestedPage < 1 || requestedPage > pages.length) {
    return `Region "page" has ${pages.length} page(s); page ${requestedPage} does not exist.`;
  }

  return `${pages[requestedPage - 1] ?? ""}\n\n(page ${requestedPage} of ${pages.length})`;
}
