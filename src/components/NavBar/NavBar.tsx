import {
  type ComponentPropsWithRef,
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AgentControlGroup } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { navBarMeta } from "./meta.ts";
import "./NavBar.css";

export interface NavBarDestination {
  href: string;
  label: string;
  active?: boolean;
  external?: boolean;
}

export interface NavBarGroup {
  label: string;
  items: readonly NavBarDestination[];
}

export type NavBarSegment = "trail" | "group" | "leaf";

export type NavBarOpening = NavBarSegment | "closed";

export interface NavBarProps extends Omit<ComponentPropsWithRef<"nav">, "children"> {
  label: string;
  groups: readonly NavBarGroup[];
  emptyLabel?: string;
  trailEmptyLabel?: string;
  open?: NavBarOpening;
  onOpenChange?: (opening: NavBarOpening) => void;
  onNavigate?: (destination: NavBarDestination) => void;
}

const TRAVEL = "[data-sprint-shown], button";

function reading(opening: NavBarOpening): NavBarSegment | undefined {
  return opening === "closed" ? undefined : opening;
}

function matches(text: string, needle: string): boolean {
  return text.toLowerCase().includes(needle);
}

export function NavBar(props: NavBarProps) {
  const {
    label,
    groups,
    emptyLabel = "No match",
    trailEmptyLabel = "Nothing visited yet",
    open: opening,
    onOpenChange,
    onNavigate,
    ref,
    ...rest
  } = props;

  const view = useSprintView();
  const [held, setHeld] = useState<NavBarSegment | undefined>(undefined);
  const open = opening === undefined ? held : reading(opening);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<string | undefined>(undefined);
  const [trail, setTrail] = useState<readonly string[]>([]);
  const field = useRef<HTMLInputElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement | null>(null);

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

  const announce = useCallback((next: NavBarSegment | undefined) => {
    setHeld(next);
    notify.current?.(next ?? "closed");
  }, []);

  useEffect(() => {
    if (open !== undefined) field.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open === undefined) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && root.current?.contains(target) === true) return;
      announce(undefined);
      setQuery("");
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open, announce]);

  const all = groups.flatMap((group) =>
    group.items.map((item) => ({ item, group: group.label })),
  );
  const current = all.find((entry) => entry.item.active === true);
  const here = current === undefined ? (groups[0]?.label ?? "") : current.group;
  const inspected = scope ?? here;
  const needle = query.trim().toLowerCase();
  const searching = needle !== "";

  const revealed: NavBarDestination[] = [];
  if (open === "trail") {
    for (const entry of all) {
      if (!trail.includes(entry.item.href)) continue;
      if (searching && !matches(`${entry.group} ${entry.item.label}`, needle)) continue;
      revealed.push(entry.item);
    }
  } else if (open === "leaf" || (open === "group" && searching)) {
    for (const entry of all) {
      const hit = searching
        ? matches(`${entry.group} ${entry.item.label}`, needle)
        : entry.group === inspected;
      if (hit) revealed.push(entry.item);
    }
  }

  const levels = open === "group" && !searching ? groups : [];

  const scoped = all.filter((entry) => entry.group === inspected).length;
  const total = searching
    ? all.length
    : open === "trail"
      ? trail.length
      : open === "group"
        ? groups.length
        : scoped;
  const shown = levels.length > 0 ? levels.length : revealed.length;

  const rows = all.map((entry) => {
    const part: AgentPart = {
      part: "destination",
      label: entry.item.label,
      state: {
        group: entry.group,
        href: entry.item.href,
        ...(entry.item.active === true ? { active: true } : {}),
        ...(entry.item.external === true ? { external: true } : {}),
        ...(revealed.includes(entry.item) ? { shown: true } : {}),
      },
    };
    return { ...entry, part };
  });

  const node = buildAgentNode({
    component: navBarMeta.name,
    label,
    region: true,
    state: {
      destinations: String(all.length),
      depth: String(trail.length),
      ...(open === undefined ? {} : { open, matches: String(shown) }),
    },
    parts: rows.map((row) => row.part),
  });

  const travel = (destination: NavBarDestination) => {
    setTrail((was) => [
      ...was.filter((href) => href !== destination.href),
      destination.href,
    ]);
    announce(undefined);
    setQuery("");
    onNavigate?.(destination);
  };

  if (view === "agent") {
    return (
      <AgentControlGroup
        node={node}
        onActivate={(_part, index) => {
          const entry = all[index];
          if (entry === undefined) return;
          travel(entry.item);
          window.location.assign(entry.item.href);
        }}
      />
    );
  }

  const close = () => {
    announce(undefined);
    setQuery("");
  };

  const reach = (segment: NavBarSegment) => {
    announce(open === segment ? undefined : segment);
    setQuery("");
  };

  const recency = (members: readonly { item: NavBarDestination }[]): number => {
    if (open !== "trail") return 0;
    const latest = members.reduce(
      (best, member) => Math.max(best, trail.indexOf(member.item.href)),
      -1,
    );
    return -latest;
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
      reach("trail");
      return;
    }
    if (event.key !== "Enter") return;
    event.preventDefault();
    const level = levels[0];
    if (level !== undefined) {
      setScope(level.label);
      setQuery("");
      announce("leaf");
      return;
    }
    const first = revealed[0];
    if (first === undefined) return;
    travel(first);
    window.location.assign(first.href);
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

  const segment = (name: NavBarSegment, text: string) =>
    open === name || (name === "leaf" && open === "trail") ? (
      <input
        ref={field}
        type="text"
        aria-label={`Search ${label}`}
        value={query}
        placeholder={
          open === "trail"
            ? `Search ${trail.length} visited`
            : `Search ${all.length} destinations`
        }
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={drive}
      />
    ) : (
      <button type="button" aria-expanded={false} onClick={() => reach(name)}>
        {text}
      </button>
    );

  const nothing = open === "trail" && trail.length === 0 ? trailEmptyLabel : emptyLabel;
  const count =
    open === undefined
      ? `${all.length} destinations`
      : searching
        ? `${shown} of ${all.length} match`
        : `${shown} of ${total}`;

  return (
    <nav {...rest} {...agentAttributesFor(node)} aria-label={label} ref={setRoot}>
      <p>
        <button
          type="button"
          aria-label={`Visited, ${trail.length}`}
          aria-expanded={open === "trail"}
          onClick={() => reach("trail")}
        >
          {String(trail.length).padStart(2, "0")}
        </button>
        <span>{label}</span>
        {segment("group", inspected)}
        {segment("leaf", current?.item.label ?? "—")}
        <span aria-live="polite">{count}</span>
      </p>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: the keys travel between the links inside, which handle their own activation */}
      <div
        ref={drawer}
        onKeyDown={steer}
        {...(open === undefined ? { hidden: true } : {})}
      >
        <div {...(levels.length === 0 ? { hidden: true } : {})}>
          <span>{label}</span>
          {levels.map((group) => (
            <button
              key={group.label}
              type="button"
              onClick={() => {
                setScope(group.label);
                setQuery("");
                announce("leaf");
              }}
            >
              {group.label}
            </button>
          ))}
        </div>
        {groups.map((group) => {
          const members = rows.filter((row) => row.group === group.label);
          const any = members.some((row) => revealed.includes(row.item));
          return (
            <div
              key={group.label}
              style={{ "--sprint-navbar-order": recency(members) } as CSSProperties}
              {...(any ? {} : { hidden: true })}
            >
              <span>{`${label} / ${group.label}`}</span>
              {members.map((entry) => (
                <a
                  key={entry.item.href}
                  {...agentPartAttributesFor(entry.part)}
                  href={entry.item.href}
                  aria-current={entry.item.active === true ? "page" : undefined}
                  target={entry.item.external === true ? "_blank" : undefined}
                  rel={entry.item.external === true ? "noreferrer noopener" : undefined}
                  onClick={() => travel(entry.item)}
                >
                  {entry.item.label}
                </a>
              ))}
            </div>
          );
        })}
        {shown === 0 ? <p>{nothing}</p> : null}
      </div>
    </nav>
  );
}
