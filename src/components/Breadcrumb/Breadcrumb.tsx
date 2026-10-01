import {
  type ComponentPropsWithRef,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AgentControlGroup } from "@/agent/view/AgentText.tsx";
import { useAgentFormat, useSprintView } from "@/agent/view/mode.ts";
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
import { breadcrumbMeta } from "./meta.ts";
import { ACT_BREADCRUMB_TOOL } from "./tool.ts";
import "./Breadcrumb.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
  external?: boolean;
  children?: readonly BreadcrumbItem[];
}

export interface BreadcrumbAction {
  label: string;
  href?: string;
  external?: boolean;
  onSelect?: () => void;
}

export type BreadcrumbOpening = number | "trail" | "closed";

export interface BreadcrumbProps
  extends Omit<ComponentPropsWithRef<"nav">, "children"> {
  label: string;
  items: readonly BreadcrumbItem[];
  actions?: readonly BreadcrumbAction[];
  maxCrumbs?: number;
  emptyLabel?: string;
  trailEmptyLabel?: string;
  open?: BreadcrumbOpening;
  onOpenChange?: (opening: BreadcrumbOpening) => void;
  onNavigate?: (item: BreadcrumbItem) => void;
  href?: string;
  visited?: readonly string[];
  defaultVisited?: readonly string[];
  agentName?: string;
  agentTool?: boolean;
}

interface Entry {
  item: BreadcrumbItem;
  id: string;
  parent: string;
  ancestors: readonly Entry[];
}

type Held = number | "trail" | undefined;

const ROOT = "";
const RECENCY_STEPS = 12;
const TRAVEL = "[data-sprint-shown], button:not([hidden])";

function flatten(
  items: readonly BreadcrumbItem[],
  ancestors: readonly Entry[] = [],
): Entry[] {
  const parent = ancestors.at(-1)?.id ?? ROOT;
  return items.flatMap((item, index) => {
    const entry: Entry = {
      item,
      id: parent === ROOT ? String(index) : `${parent}.${index}`,
      parent,
      ancestors,
    };
    return [entry, ...flatten(item.children ?? [], [...ancestors, entry])];
  });
}

function lineage(entry: Entry): Entry[] {
  return [...entry.ancestors, entry];
}

function branches(entry: Entry): boolean {
  return (entry.item.children?.length ?? 0) > 0;
}

function reading(opening: BreadcrumbOpening | undefined): Held {
  return opening === "closed" ? undefined : opening;
}

function joined(entries: readonly Entry[]): string {
  return entries.map((entry) => entry.item.label).join(" / ");
}

function actionSchema(labels: readonly string[]): JsonSchemaObject {
  const action = ACT_BREADCRUMB_TOOL.inputSchema.properties.action;
  return {
    ...ACT_BREADCRUMB_TOOL.inputSchema,
    properties: {
      ...ACT_BREADCRUMB_TOOL.inputSchema.properties,
      ...(action === undefined ? {} : { action: { ...action, enum: [...labels] } }),
    },
  };
}

export function Breadcrumb(props: BreadcrumbProps) {
  const {
    label,
    items,
    actions = [],
    maxCrumbs = 4,
    emptyLabel = "No match",
    trailEmptyLabel = "Nothing visited yet",
    open: opening,
    onOpenChange,
    onNavigate,
    href: home,
    visited,
    defaultVisited = [],
    agentName,
    agentTool = true,
    ref,
    ...rest
  } = props;

  const view = useSprintView();
  const formatter = useAgentFormat();
  const [held, setHeld] = useState<Held>(undefined);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<string | undefined>(undefined);
  const [unfolded, setUnfolded] = useState(false);
  const [remembered, setRemembered] = useState<readonly string[]>(defaultVisited);
  const trail = visited ?? remembered;
  const field = useRef<HTMLInputElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement | null>(null);
  const pressers = useRef(new Map<string, HTMLButtonElement>());
  const actionsRef = useRef(actions);
  actionsRef.current = actions;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: breadcrumbMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const setRoot = useCallback(
    (target: HTMLElement | null) => {
      root.current = target;
      if (typeof ref === "function") ref(target);
      else if (ref !== null && ref !== undefined) ref.current = target;
    },
    [ref],
  );

  const notify = useRef(onOpenChange);
  notify.current = onOpenChange;

  const announce = useCallback((next: Held) => {
    setHeld(next);
    notify.current?.(next ?? "closed");
  }, []);

  const close = useCallback(() => {
    announce(undefined);
    setQuery("");
    setScope(undefined);
  }, [announce]);

  const all = useMemo(() => flatten(items), [items]);
  const current = all.find((entry) => entry.item.active === true);
  const path = current === undefined ? [] : lineage(current);
  const browsed = all.find((entry) => entry.id === scope);
  const route = browsed === undefined ? path : lineage(browsed);
  const last = route.at(-1);
  const tailed = last === undefined || branches(last);
  const crumbCount = route.length + (tailed ? 1 : 0);

  const asked = opening === undefined ? held : reading(opening);
  const open: Held =
    typeof asked === "number" ? Math.max(0, Math.min(asked, crumbCount - 1)) : asked;
  const fieldAt = open === "trail" ? crumbCount - 1 : open;

  useEffect(() => {
    if (open !== undefined) field.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open === undefined) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && root.current?.contains(target) === true) return;
      close();
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open, close]);

  const level =
    typeof open === "number"
      ? open === 0
        ? ROOT
        : (route[open - 1]?.id ?? ROOT)
      : ROOT;
  const needle = query.trim().toLowerCase();
  const searching = needle !== "";
  const browsing = typeof open === "number" && !searching;
  const matches = (entry: Entry) =>
    `${joined(entry.ancestors)} ${entry.item.label}`.toLowerCase().includes(needle);

  const revealed = new Set<Entry>();
  for (const entry of all) {
    const reachable = entry.item.href !== undefined;
    const hit =
      open === "trail"
        ? reachable &&
          trail.includes(entry.item.href ?? "") &&
          (!searching || matches(entry))
        : searching
          ? open !== undefined && reachable && matches(entry)
          : browsing && entry.parent === level;
    if (hit) revealed.add(entry);
  }

  const rows = [undefined, ...all.filter(branches)].map((owner) => ({
    id: owner?.id ?? ROOT,
    heading: [
      label,
      ...(owner === undefined ? [] : lineage(owner).map((entry) => entry.item.label)),
    ].join(" / "),
    members: all.filter((entry) => entry.parent === (owner?.id ?? ROOT)),
  }));

  const onPath = new Set(path);
  const destinationParts = rows.flatMap((row) =>
    row.members
      .filter((entry) => entry.item.href !== undefined)
      .map((entry) => {
        const part: AgentPart = {
          part: "destination",
          label: entry.item.label,
          state: {
            ...(entry.ancestors.length > 0 ? { parent: joined(entry.ancestors) } : {}),
            href: entry.item.href ?? "",
            ...(entry.item.active === true ? { active: true } : {}),
            ...(entry.item.active !== true && onPath.has(entry)
              ? { ancestor: true }
              : {}),
            ...(entry.item.external === true ? { external: true } : {}),
            ...(revealed.has(entry) ? { shown: true } : {}),
          },
        };
        return { entry, part };
      }),
  );
  const partOf = new Map(destinationParts.map(({ entry, part }) => [entry, part]));

  const actionParts: AgentPart[] = actions.map((action) => ({
    part: "action",
    label: action.label,
    state: {
      ...(action.href === undefined ? {} : { href: action.href }),
      ...(action.external === true ? { external: true } : {}),
    },
  }));

  const pressable = actions
    .filter((action) => action.href === undefined)
    .map((action) => action.label)
    .join("\n");
  const schema = useMemo(
    () => actionSchema(pressable === "" ? [] : pressable.split("\n")),
    [pressable],
  );

  const execute = useCallback(async (inputs: Record<string, unknown>) => {
    const requested = typeof inputs.action === "string" ? inputs.action : "";
    const available = actionsRef.current.filter((action) => action.href === undefined);
    const match = available.find((action) => action.label === requested);
    if (match === undefined) {
      return `No action named "${requested}". This breadcrumb offers: ${available
        .map((action) => `"${action.label}"`)
        .join(", ")}.`;
    }
    const element = pressers.current.get(match.label);
    if (element !== undefined) element.click();
    else commitSync(() => match.onSelect?.());
    await afterCommit();
    if (!mounted.current) return "The action removed this breadcrumb from the page.";
    return `Done. The breadcrumb is now:\n${formatRef.current([nodeRef.current])}`;
  }, []);

  const toolName = useAgentTool({
    spec: ACT_BREADCRUMB_TOOL,
    label: agentName ?? label,
    inputSchema: schema,
    enabled: agentTool && pressable !== "",
    execute,
  });

  const shown = browsing
    ? (rows.find((row) => row.id === level)?.members.length ?? 0)
    : revealed.size;

  const node = buildAgentNode({
    component: breadcrumbMeta.name,
    label,
    tool: toolName,
    region: true,
    state: {
      ...(home === undefined ? {} : { href: home }),
      ...(path.length > 0 ? { path: joined(path) } : {}),
      destinations: String(destinationParts.length),
      visited: String(trail.length),
      ...(open === undefined ? {} : { open: String(open), matches: String(shown) }),
    },
    parts: [...actionParts, ...destinationParts.map(({ part }) => part)],
  });
  nodeRef.current = node;

  const travel = (item: BreadcrumbItem) => {
    if (item.href !== undefined) {
      const href = item.href;
      setRemembered((was) => [...was.filter((seen) => seen !== href), href]);
    }
    close();
    onNavigate?.(item);
  };

  if (view === "agent") {
    return (
      <AgentControlGroup
        node={node}
        onActivate={(_part, index) => {
          const action = actions[index];
          if (action !== undefined) {
            if (action.href === undefined) action.onSelect?.();
            else window.location.assign(action.href);
            return;
          }
          const entry = destinationParts[index - actions.length]?.entry;
          if (entry?.item.href === undefined) return;
          travel(entry.item);
          window.location.assign(entry.item.href);
        }}
      />
    );
  }

  const reach = (depth: number) => {
    setQuery("");
    announce(open === depth ? undefined : depth);
  };

  const drill = (entry: Entry) => {
    setScope(entry.id);
    setQuery("");
    announce(lineage(entry).length);
  };

  const lastSeen = (members: readonly Entry[]): number =>
    members.reduce(
      (best, member) => Math.max(best, trail.indexOf(member.item.href ?? "")),
      -1,
    );

  const ranked =
    open === "trail"
      ? rows
          .map((row) => ({ id: row.id, seen: lastSeen(row.members) }))
          .filter((row) => row.seen >= 0)
          .sort((a, b) => b.seen - a.seen)
          .map((row) => row.id)
      : [];

  const recency = (id: string) => {
    const rank = ranked.indexOf(id) + 1;
    return rank > 0 && rank <= RECENCY_STEPS
      ? { "data-sprint-recency": String(rank) }
      : {};
  };

  const travellers = (): HTMLElement[] => {
    const within = drawer.current;
    if (within === null) return [];
    return Array.from(within.querySelectorAll<HTMLElement>(TRAVEL)).filter(
      (candidate) => candidate.closest("[hidden]") === null,
    );
  };

  const step = (from: number) => {
    const stops = travellers();
    const next = stops[from < 0 ? stops.length - 1 : from % stops.length];
    next?.focus();
  };

  const drive = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      step(0);
      return;
    }
    if (event.key === "ArrowUp" && open !== "trail") {
      event.preventDefault();
      setQuery("");
      announce("trail");
      return;
    }
    if (event.key !== "Enter") return;
    event.preventDefault();
    travellers()[0]?.click();
  };

  const steer = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      close();
      return;
    }
    const stops = travellers();
    const at = stops.indexOf(event.target as HTMLElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      step(at + 1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (at <= 0) field.current?.focus();
      else step(at - 1);
      return;
    }
    if (event.key.length !== 1 || event.metaKey || event.ctrlKey || event.altKey)
      return;
    event.preventDefault();
    setQuery((was) => `${was}${event.key}`);
    field.current?.focus();
  };

  const kept = Math.max(1, maxCrumbs - 2);
  const foldable =
    !unfolded &&
    crumbCount > maxCrumbs &&
    (fieldAt === undefined || fieldAt === 0 || fieldAt >= crumbCount - kept);
  const folded = (depth: number) => foldable && depth > 0 && depth < crumbCount - kept;

  const crumb = (depth: number) => {
    const entry = route[depth];
    const item = entry?.item;
    const parent = depth === 0 ? label : (route[depth - 1]?.item.label ?? label);
    const separator = (
      <button
        type="button"
        aria-expanded={open === depth}
        aria-label={`Browse ${parent}`}
        onClick={() => reach(depth)}
      />
    );
    if (fieldAt === depth) {
      return (
        <>
          {separator}
          <input
            ref={field}
            type="text"
            aria-label={`Search ${label}`}
            value={query}
            placeholder={
              open === "trail"
                ? `Search ${trail.length} visited`
                : `Search ${destinationParts.length} destinations`
            }
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={drive}
          />
        </>
      );
    }
    return (
      <>
        {separator}
        {item === undefined ? null : item.href === undefined ? (
          <span>{item.label}</span>
        ) : (
          <a
            href={item.href}
            aria-current={entry === current ? "page" : undefined}
            target={item.external === true ? "_blank" : undefined}
            rel={item.external === true ? "noreferrer noopener" : undefined}
            onClick={() => travel(item)}
          >
            {item.label}
          </a>
        )}
      </>
    );
  };

  const nothing = open === "trail" && trail.length === 0 ? trailEmptyLabel : emptyLabel;
  const total =
    open === "trail" ? trail.length : searching ? destinationParts.length : shown;
  const count =
    open === undefined
      ? `${destinationParts.length} destinations`
      : searching
        ? `${shown} of ${destinationParts.length} match`
        : `${shown} of ${total}`;

  return (
    <nav {...rest} {...agentAttributesFor(node)} aria-label={label} ref={setRoot}>
      <div>
        <button
          type="button"
          aria-label={`Visited, ${trail.length}`}
          aria-expanded={open === "trail"}
          onClick={() => {
            setQuery("");
            announce(open === "trail" ? undefined : "trail");
          }}
        >
          {String(trail.length).padStart(2, "0")}
        </button>
        <ol>
          <li>
            {home === undefined ? <span>{label}</span> : <a href={home}>{label}</a>}
          </li>
          {Array.from({ length: crumbCount }, (_, depth) => [
            <li
              key={route[depth]?.id ?? "tail"}
              {...(folded(depth) ? { hidden: true } : {})}
            >
              {crumb(depth)}
            </li>,
            depth === 0 && crumbCount > 1 ? (
              <li key="fold">
                <button
                  type="button"
                  aria-label="Show the whole path"
                  aria-expanded={unfolded}
                  onClick={() => setUnfolded((was) => !was)}
                >
                  …
                </button>
              </li>
            ) : null,
          ])}
        </ol>
        <span aria-live="polite">{count}</span>
        {actions.map((action, index) => {
          const part = actionParts[index];
          if (part === undefined) return null;
          return action.href === undefined ? (
            <button
              key={action.label}
              type="button"
              {...agentPartAttributesFor(part)}
              ref={(element) => {
                if (element === null) pressers.current.delete(action.label);
                else pressers.current.set(action.label, element);
              }}
              onClick={() => action.onSelect?.()}
            >
              {action.label}
            </button>
          ) : (
            <a
              key={action.label}
              {...agentPartAttributesFor(part)}
              href={action.href}
              target={action.external === true ? "_blank" : undefined}
              rel={action.external === true ? "noreferrer noopener" : undefined}
            >
              {action.label}
            </a>
          );
        })}
      </div>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: the keys travel between the links inside, which handle their own activation */}
      <div
        ref={drawer}
        onKeyDown={steer}
        {...(open === undefined ? { hidden: true } : {})}
      >
        {rows.map((row) => {
          const visible = row.members.some(
            (entry) =>
              revealed.has(entry) && (entry.item.href !== undefined || browsing),
          );
          return (
            <div
              key={row.id || "root"}
              {...recency(row.id)}
              {...(visible ? {} : { hidden: true })}
            >
              <span>{row.heading}</span>
              {row.members.map((entry) => {
                const part = partOf.get(entry);
                return (
                  <span key={entry.id}>
                    {part === undefined ? null : (
                      <a
                        {...agentPartAttributesFor(part)}
                        href={entry.item.href}
                        aria-current={entry.item.active === true ? "page" : undefined}
                        target={entry.item.external === true ? "_blank" : undefined}
                        rel={
                          entry.item.external === true
                            ? "noreferrer noopener"
                            : undefined
                        }
                        onClick={() => travel(entry.item)}
                      >
                        {entry.item.label}
                      </a>
                    )}
                    {branches(entry) ? (
                      <button
                        type="button"
                        aria-label={
                          part === undefined ? undefined : `Inside ${entry.item.label}`
                        }
                        onClick={() => drill(entry)}
                        {...(browsing && revealed.has(entry) ? {} : { hidden: true })}
                      >
                        {part === undefined ? entry.item.label : "›"}
                      </button>
                    ) : null}
                  </span>
                );
              })}
            </div>
          );
        })}
        {shown === 0 ? <p>{nothing}</p> : null}
      </div>
    </nav>
  );
}
