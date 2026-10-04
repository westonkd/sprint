import {
  type ComponentPropsWithRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
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
import {
  type FloatingAlign,
  type FloatingSide,
  useFloating,
} from "@/floating/useFloating.ts";
import type { ButtonSize } from "../Button/Button.tsx";
import { assignRef } from "../refs.ts";
import { Tooltip } from "../Tooltip/Tooltip.tsx";
import { menuMeta } from "./meta.ts";
import { CHOOSE_MENU_TOOL } from "./tool.ts";
import "../Button/Button.css";
import "./Menu.css";

export type MenuItemTone = "neutral" | "danger";

export interface MenuItem {
  label: string;
  onSelect?: () => void;
  href?: string;
  external?: boolean;
  tone?: MenuItemTone;
  disabled?: boolean;
  checked?: boolean;
  group?: string;
  icon?: ReactNode;
}

export interface MenuProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  label: string;
  items: readonly MenuItem[];
  icon?: ReactNode;
  hideLabel?: boolean;
  size?: ButtonSize;
  align?: FloatingAlign;
  side?: FloatingSide;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  agentName?: string;
  agentTool?: boolean;
}

interface Section {
  group: string | undefined;
  entries: { item: MenuItem; index: number }[];
}

function sections(items: readonly MenuItem[]): Section[] {
  const result: Section[] = [];
  items.forEach((item, index) => {
    const last = result.at(-1);
    if (last !== undefined && last.group === item.group)
      last.entries.push({ item, index });
    else result.push({ group: item.group, entries: [{ item, index }] });
  });
  return result;
}

function choosable(item: MenuItem): boolean {
  return item.href === undefined && item.disabled !== true;
}

function itemSchema(labels: readonly string[]): JsonSchemaObject {
  const item = CHOOSE_MENU_TOOL.inputSchema.properties.item;
  return {
    ...CHOOSE_MENU_TOOL.inputSchema,
    properties: {
      ...CHOOSE_MENU_TOOL.inputSchema.properties,
      ...(item === undefined ? {} : { item: { ...item, enum: [...labels] } }),
    },
  };
}

function itemPart(item: MenuItem): AgentPart {
  return {
    part: "item",
    label: item.label,
    state: {
      ...(item.group === undefined ? {} : { group: item.group }),
      ...(item.checked === true ? { checked: true as const } : {}),
      ...(item.tone === "danger" ? { tone: "danger" } : {}),
      ...(item.href === undefined ? {} : { href: item.href }),
      ...(item.external === true ? { external: true as const } : {}),
      ...(item.disabled === true ? { disabled: true as const } : {}),
    },
  };
}

export function Menu(props: MenuProps) {
  const {
    label,
    items,
    icon,
    hideLabel = false,
    size = "medium",
    align = "start",
    side = "below",
    disabled = false,
    onOpenChange,
    agentName,
    agentTool = true,
    ref,
    ...rest
  } = props;

  const view = useSprintView();
  const controls = useAgentControls();
  const formatter = useAgentFormat();
  const id = useId();

  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);

  const root = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const surface = useRef<HTMLDivElement | null>(null);
  const elements = useRef(new Map<number, HTMLElement>());
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const notify = useRef(onOpenChange);
  notify.current = onOpenChange;
  const nodeRef = useRef(buildAgentNode({ component: menuMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const enabled = useMemo(
    () => items.flatMap((item, index) => (item.disabled === true ? [] : [index])),
    [items],
  );

  const change = useCallback((next: boolean) => {
    setOpen((current) => {
      if (current !== next) notify.current?.(next);
      return next;
    });
  }, []);

  const close = useCallback(
    (refocus: boolean) => {
      change(false);
      setFocusIndex(-1);
      if (refocus) trigger.current?.focus();
    },
    [change],
  );

  const dismiss = useCallback(() => close(false), [close]);

  const openAt = useCallback(
    (which: "first" | "last" | "checked") => {
      if (disabled || enabled.length === 0) return;
      const checked = enabled.find((index) => items[index]?.checked === true);
      const target =
        which === "last"
          ? enabled.at(-1)
          : which === "checked" && checked !== undefined
            ? checked
            : enabled[0];
      setFocusIndex(target ?? -1);
      change(true);
    },
    [disabled, enabled, items, change],
  );

  useEffect(() => {
    if (disabled) close(false);
  }, [disabled, close]);

  useFloating({
    open,
    anchor: trigger,
    floating: surface,
    side,
    align,
    boundary: root,
    onDismiss: dismiss,
  });

  useLayoutEffect(() => {
    if (!open || focusIndex < 0) return;
    elements.current.get(focusIndex)?.focus();
  }, [open, focusIndex]);

  const select = useCallback(
    (index: number) => {
      const item = itemsRef.current[index];
      if (item === undefined || item.disabled === true) return;
      close(true);
      item.onSelect?.();
    },
    [close],
  );

  const choose = useCallback((index: number) => {
    const element = elements.current.get(index);
    if (element !== undefined) {
      element.click();
      return;
    }
    const item = itemsRef.current[index];
    if (item?.onSelect !== undefined) commitSync(() => item.onSelect?.());
  }, []);

  const execute = useCallback(
    async (inputs: Record<string, unknown>) => {
      const requested = typeof inputs.item === "string" ? inputs.item : "";
      const available = itemsRef.current;
      const index = available.findIndex((entry) => entry.label === requested);
      const offered = available.filter(choosable).map((entry) => `"${entry.label}"`);
      const match = available[index];

      if (match === undefined || !choosable(match)) {
        return `No item named "${requested}" can be chosen. This menu offers: ${offered.join(", ")}.`;
      }

      choose(index);
      await afterCommit();
      if (!mounted.current) return "The choice removed this menu from the page.";
      return `Chosen. The menu is now:\n${formatRef.current([nodeRef.current])}`;
    },
    [choose],
  );

  const labels = useMemo(
    () => items.filter(choosable).map((item) => item.label),
    [items],
  );
  const schema = useMemo(() => itemSchema(labels), [labels]);

  const toolName = useAgentTool({
    spec: CHOOSE_MENU_TOOL,
    label: agentName ?? label,
    inputSchema: schema,
    enabled: agentTool && !disabled && labels.length > 0,
    execute,
  });

  const parts = items.map(itemPart);

  const node = buildAgentNode({
    component: menuMeta.name,
    label,
    tool: toolName,
    state: { open, disabled },
    parts,
  });
  nodeRef.current = node;

  if (view === "agent") {
    if (disabled || controls === "never") return <AgentLine node={node} />;
    return (
      <AgentControlGroup
        node={node}
        isActionable={(_part, index) => {
          const item = items[index];
          return item !== undefined && choosable(item);
        }}
        onActivate={(_part, index) => choose(index)}
      />
    );
  }

  const triggerId = `${id}-trigger`;
  const menuId = `${id}-menu`;

  const step = (from: number, delta: 1 | -1): number | undefined => {
    if (enabled.length === 0) return undefined;
    const position = enabled.indexOf(from);
    const next =
      position < 0 ? 0 : (position + delta + enabled.length) % enabled.length;
    return enabled[next];
  };

  const typeahead = (from: number, key: string): number | undefined => {
    const lowered = key.toLowerCase();
    const start = Math.max(enabled.indexOf(from), 0);
    for (let offset = 1; offset <= enabled.length; offset += 1) {
      const index = enabled[(start + offset) % enabled.length];
      if (index !== undefined && items[index]?.label.toLowerCase().startsWith(lowered))
        return index;
    }
    return undefined;
  };

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openAt("checked");
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openAt("last");
    }
  };

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const key = event.key;
    if (key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (key === "Tab") {
      close(false);
      return;
    }
    const target =
      key === "ArrowDown"
        ? step(focusIndex, 1)
        : key === "ArrowUp"
          ? step(focusIndex, -1)
          : key === "Home"
            ? enabled[0]
            : key === "End"
              ? enabled.at(-1)
              : key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey
                ? typeahead(focusIndex, key)
                : undefined;
    if (key === " ") {
      const current = elements.current.get(focusIndex);
      if (current instanceof HTMLAnchorElement) {
        event.preventDefault();
        current.click();
      }
      return;
    }
    if (target === undefined) return;
    event.preventDefault();
    setFocusIndex(target);
    elements.current.get(target)?.focus();
  };

  const register = (index: number) => (element: HTMLElement | null) => {
    if (element === null) elements.current.delete(index);
    else elements.current.set(index, element);
  };

  const renderItem = (item: MenuItem, index: number) => {
    const radio = item.checked !== undefined;
    const common = {
      ...agentPartAttributesFor(parts[index] ?? { part: "item", state: {} }),
      role: radio ? "menuitemradio" : "menuitem",
      tabIndex: index === focusIndex ? 0 : -1,
      ...(radio ? { "aria-checked": item.checked === true } : {}),
      onFocus: () => setFocusIndex(index),
    };
    const content = (
      <>
        {item.icon === undefined ? null : (
          <span data-sprint-icon="" aria-hidden="true">
            {item.icon}
          </span>
        )}
        <span>{item.label}</span>
      </>
    );

    if (item.href !== undefined) {
      return (
        <a
          key={index}
          {...common}
          ref={register(index)}
          {...(item.disabled === true
            ? { "aria-disabled": true }
            : {
                href: item.href,
                ...(item.external === true
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {}),
                onClick: () => close(false),
              })}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        key={index}
        type="button"
        {...common}
        ref={register(index)}
        disabled={item.disabled === true}
        onClick={() => select(index)}
      >
        {content}
      </button>
    );
  };

  const iconOnly = hideLabel && icon !== undefined;

  const triggerButton = (
    <button
      id={triggerId}
      type="button"
      data-sprint-control="button"
      {...(size === "small" ? { "data-sprint-size": "small" } : {})}
      ref={trigger}
      disabled={disabled}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={menuId}
      onClick={() => (open ? close(false) : openAt("checked"))}
      onKeyDown={onTriggerKeyDown}
    >
      {icon === undefined ? null : (
        <span data-sprint-icon="" aria-hidden="true">
          {icon}
        </span>
      )}
      {iconOnly ? <span data-sprint-visually-hidden="">{label}</span> : label}
    </button>
  );

  return (
    <div
      {...rest}
      {...agentAttributesFor(node)}
      ref={(target) => {
        root.current = target;
        assignRef(ref, target);
      }}
    >
      {iconOnly ? (
        <Tooltip label={label} describe={false} disabled={open || disabled}>
          {triggerButton}
        </Tooltip>
      ) : (
        triggerButton
      )}
      <div popover="manual" hidden={!open} ref={surface}>
        <div
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          onKeyDown={onMenuKeyDown}
        >
          {sections(items).map((section, position) =>
            section.group === undefined ? (
              section.entries.map(({ item, index }) => renderItem(item, index))
            ) : (
              // biome-ignore lint/a11y/useSemanticElements: a fieldset groups form controls, and a menu's items are not form controls
              <div
                key={`${section.group}-${position}`}
                role="group"
                aria-labelledby={`${id}-group-${position}`}
              >
                <span id={`${id}-group-${position}`} aria-hidden="true">
                  {section.group}
                </span>
                {section.entries.map(({ item, index }) => renderItem(item, index))}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
