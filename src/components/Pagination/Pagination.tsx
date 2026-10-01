import {
  type ComponentPropsWithRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { AgentControlGroup, AgentLine } from "@/agent/view/AgentText.tsx";
import { useAgentControls, useAgentFormat, useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { afterCommit } from "@/agent/webmcp/afterCommit.ts";
import { commitSync } from "@/agent/webmcp/flush.ts";
import type { JsonSchemaObject } from "@/agent/webmcp/types.ts";
import { useAgentTool } from "@/agent/webmcp/useAgentTool.ts";
import { paginationMeta } from "./meta.ts";
import { TURN_PAGE_TOOL } from "./tool.ts";
import "./Pagination.css";

export interface PaginationProps
  extends Omit<ComponentPropsWithRef<"nav">, "children"> {
  label: string;
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (page: number) => void;
  href?: (page: number) => string;
  previousLabel?: string;
  nextLabel?: string;
  agentName?: string;
  agentTool?: boolean;
}

type Direction = "previous" | "next";

interface PageRange {
  page: number;
  pages: number;
  total: number;
  first: number;
  last: number;
}

function whole(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.floor(value) : fallback;
}

function paginate(page: number, pageSize: number, total: number): PageRange {
  const size = Math.max(1, whole(pageSize, 1));
  const count = Math.max(0, whole(total, 0));
  const pages = Math.max(1, Math.ceil(count / size));
  const current = Math.min(pages, Math.max(1, whole(page, 1)));
  const first = count === 0 ? 0 : (current - 1) * size + 1;
  const last = Math.min(count, current * size);
  return { page: current, pages, total: count, first, last };
}

function showing(range: PageRange): string {
  if (range.total === 0) return "Showing 0 of 0";
  return `Showing ${range.first}–${range.last} of ${range.total}`;
}

function turnSchema(pages: number): JsonSchemaObject {
  const page = TURN_PAGE_TOOL.inputSchema.properties.page;
  return {
    ...TURN_PAGE_TOOL.inputSchema,
    properties: {
      ...TURN_PAGE_TOOL.inputSchema.properties,
      ...(page === undefined
        ? {}
        : {
            page: {
              ...page,
              maximum: pages,
              description: `${page.description ?? ""} This set has ${pages} pages, so 1 to ${pages}.`,
            },
          }),
    },
  };
}

export function Pagination(props: PaginationProps) {
  const {
    label,
    page,
    pageSize,
    total,
    onPageChange,
    href,
    previousLabel = "Previous",
    nextLabel = "Next",
    agentName,
    agentTool = true,
    ...rest
  } = props;

  const view = useSprintView();
  const controls = useAgentControls();
  const formatter = useAgentFormat();

  const range = paginate(page, pageSize, total);
  const navigable = href !== undefined || onPageChange !== undefined;

  const targets: Record<Direction, number | null> = {
    previous: navigable && range.page > 1 ? range.page - 1 : null,
    next: navigable && range.page < range.pages ? range.page + 1 : null,
  };

  const elements = useRef(new Map<Direction, HTMLElement>());
  const onPageChangeRef = useRef(onPageChange);
  onPageChangeRef.current = onPageChange;
  const rangeRef = useRef(range);
  rangeRef.current = range;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: paginationMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const turn = useCallback((target: number) => {
    const current = rangeRef.current.page;
    const direction: Direction | null =
      target === current - 1 ? "previous" : target === current + 1 ? "next" : null;
    const element = direction === null ? undefined : elements.current.get(direction);
    if (element !== undefined) {
      element.click();
      return;
    }
    const handler = onPageChangeRef.current;
    if (handler !== undefined) commitSync(() => handler(target));
  }, []);

  const execute = useCallback(
    async (inputs: Record<string, unknown>) => {
      const requested = inputs.page;
      const { page: current, pages } = rangeRef.current;

      if (typeof requested !== "number" || !Number.isInteger(requested)) {
        return `Parameter "page" must be a whole page number from 1 to ${pages}.`;
      }
      if (requested < 1 || requested > pages) {
        return `There is no page ${requested}. This set has pages 1 to ${pages}.`;
      }
      if (requested === current) {
        return `Already on page ${current}. The pagination is:\n${formatRef.current([nodeRef.current])}`;
      }

      turn(requested);
      await afterCommit();
      if (!mounted.current)
        return "Turning the page removed this pagination from the page.";
      return `Turned. The pagination is now:\n${formatRef.current([nodeRef.current])}`;
    },
    [turn],
  );

  const schema = useMemo(() => turnSchema(range.pages), [range.pages]);

  const toolName = useAgentTool({
    spec: TURN_PAGE_TOOL,
    label: agentName ?? label,
    inputSchema: schema,
    enabled:
      agentTool && href === undefined && onPageChange !== undefined && range.pages > 1,
    execute,
  });

  const partFor = (direction: Direction): AgentPart => {
    const target = targets[direction];
    return {
      part: direction,
      label: direction === "previous" ? previousLabel : nextLabel,
      state:
        target === null
          ? { disabled: true }
          : href === undefined
            ? {}
            : { href: href(target) },
    };
  };

  const parts = [partFor("previous"), partFor("next")];

  const node = buildAgentNode({
    component: paginationMeta.name,
    label,
    tool: toolName,
    state: {
      page: String(range.page),
      pages: String(range.pages),
      total: String(range.total),
      first: String(range.first),
      last: String(range.last),
    },
    parts,
  });
  nodeRef.current = node;

  const actionable = targets.previous !== null || targets.next !== null;

  if (view === "agent") {
    if (!actionable || controls === "never") return <AgentLine node={node} />;
    return (
      <AgentControlGroup
        node={node}
        isActionable={(part) => part.state.disabled !== true}
        onActivate={(part) => {
          const target = targets[part.part as Direction];
          if (target === null || target === undefined) return;
          if (href === undefined) turn(target);
          else window.location.assign(href(target));
        }}
      />
    );
  }

  const register = (direction: Direction) => (element: HTMLElement | null) => {
    if (element === null) elements.current.delete(direction);
    else elements.current.set(direction, element);
  };

  const control = (direction: Direction, part: AgentPart) => {
    const target = targets[direction];
    const attributes = agentPartAttributesFor(part);
    const text = part.label;

    if (href !== undefined) {
      if (target === null) {
        return (
          <a {...attributes} aria-disabled="true">
            {text}
          </a>
        );
      }
      return (
        <a
          {...attributes}
          href={href(target)}
          rel={direction === "previous" ? "prev" : "next"}
          ref={register(direction)}
          onClick={() => onPageChange?.(target)}
        >
          {text}
        </a>
      );
    }

    return (
      <button
        {...attributes}
        type="button"
        disabled={target === null}
        ref={register(direction)}
        onClick={() => {
          if (target !== null) onPageChange?.(target);
        }}
      >
        {text}
      </button>
    );
  };

  return (
    <nav {...rest} {...agentAttributesFor(node)} aria-label={label}>
      <p aria-live="polite">{showing(range)}</p>
      <div>
        {control("previous", parts[0] ?? partFor("previous"))}
        <span>
          Page {range.page} of {range.pages}
        </span>
        {control("next", parts[1] ?? partFor("next"))}
      </div>
    </nav>
  );
}
