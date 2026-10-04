import {
  type ComponentPropsWithRef,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
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
import { selectMeta } from "./meta.ts";
import { SELECT_OPTION_TOOL } from "./tool.ts";
import "./Select.css";

export interface SelectOption {
  value: string;
  label: string;
  count?: number;
}

export interface SelectProps extends Omit<ComponentPropsWithRef<"div">, "onChange"> {
  label: string;
  options: readonly SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  agentName?: string;
  agentTool?: boolean;
}

const LISTBOX_TOP = "--sprint-select-top";
const LISTBOX_BOTTOM = "--sprint-select-bottom";
const LISTBOX_LEFT = "--sprint-select-left";
const LISTBOX_WIDTH = "--sprint-select-width";
const LISTBOX_ROOM = "--sprint-select-room";
const LISTBOX_CAP_REM = 16;

function optionSchema(options: readonly SelectOption[]): JsonSchemaObject {
  const option = SELECT_OPTION_TOOL.inputSchema.properties.option;
  return {
    ...SELECT_OPTION_TOOL.inputSchema,
    properties: {
      ...SELECT_OPTION_TOOL.inputSchema.properties,
      ...(option === undefined
        ? {}
        : { option: { ...option, enum: options.map((entry) => entry.label) } }),
    },
  };
}

function messagePart(error: string | undefined, hint: string | undefined): AgentPart[] {
  if (error !== undefined) return [{ part: "error", label: error, state: {} }];
  if (hint !== undefined) return [{ part: "hint", label: hint, state: {} }];
  return [];
}

function rootFontSize(): number {
  const size = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(size) ? size : 16;
}

function preferredHeight(layer: HTMLElement, list: HTMLElement): number {
  const chrome = layer.offsetHeight - list.clientHeight;
  return Math.min(list.scrollHeight + chrome, LISTBOX_CAP_REM * rootFontSize());
}

function place(layer: HTMLElement, list: HTMLElement, anchor: HTMLElement): void {
  const rect = anchor.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const below = viewportHeight - rect.bottom;
  const above = rect.top;
  const flip = below < preferredHeight(layer, list) && above > below;
  const width = Math.min(rect.width, window.innerWidth);
  const left = Math.max(0, Math.min(rect.left, window.innerWidth - width));

  layer.dataset.placement = flip ? "above" : "below";
  if (flip) {
    layer.style.removeProperty(LISTBOX_TOP);
    layer.style.setProperty(LISTBOX_BOTTOM, `${viewportHeight - rect.top}px`);
  } else {
    layer.style.removeProperty(LISTBOX_BOTTOM);
    layer.style.setProperty(LISTBOX_TOP, `${rect.bottom}px`);
  }
  layer.style.setProperty(LISTBOX_ROOM, `${flip ? above : below}px`);
  layer.style.setProperty(LISTBOX_LEFT, `${left}px`);
  layer.style.setProperty(LISTBOX_WIDTH, `${width}px`);
}

function canPopover(element: HTMLElement): boolean {
  return typeof element.showPopover === "function";
}

function showLayer(listbox: HTMLElement): void {
  if (!canPopover(listbox)) return;
  if (!listbox.matches(":popover-open")) listbox.showPopover();
}

function hideLayer(listbox: HTMLElement): void {
  if (!canPopover(listbox)) return;
  if (listbox.matches(":popover-open")) listbox.hidePopover();
}

export function Select(props: SelectProps) {
  const {
    label,
    options,
    value,
    onChange,
    placeholder,
    hint,
    error,
    name,
    disabled = false,
    required = false,
    agentName,
    agentTool = true,
    ...rest
  } = props;

  const view = useSprintView();
  const controls = useAgentControls();
  const formatter = useAgentFormat();
  const id = useId();

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const root = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const layer = useRef<HTMLDivElement | null>(null);
  const listbox = useRef<HTMLDivElement | null>(null);
  const elements = useRef(new Map<string, HTMLDivElement>());
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: selectMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const chosenIndex = options.findIndex((option) => option.value === value);
  const chosen = options[chosenIndex];

  const show = useCallback(
    (index?: number) => {
      if (disabled) return;
      setActive(index ?? Math.max(chosenIndex, 0));
      setOpen(true);
    },
    [disabled, chosenIndex],
  );

  const hide = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  useEffect(() => {
    if (disabled) hide();
  }, [disabled, hide]);

  useLayoutEffect(() => {
    const surface = layer.current;
    const list = listbox.current;
    const anchor = trigger.current;
    if (surface === null || list === null || anchor === null) return;
    if (!open) {
      hideLayer(surface);
      return;
    }

    showLayer(surface);
    place(surface, list, anchor);

    const reposition = () => place(surface, list, anchor);
    const dismiss = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && root.current?.contains(target)) return;
      hide();
    };

    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    document.addEventListener("pointerdown", dismiss, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
      document.removeEventListener("pointerdown", dismiss, true);
    };
  }, [open, hide]);

  useEffect(() => {
    if (!open || active < 0) return;
    const target = options[active];
    const element =
      target === undefined ? undefined : elements.current.get(target.value);
    if (element !== undefined && typeof element.scrollIntoView === "function") {
      element.scrollIntoView({ block: "nearest" });
    }
  }, [open, active, options]);

  const commit = useCallback(
    (next: string) => {
      hide();
      onChange(next);
    },
    [hide, onChange],
  );

  const choose = useCallback((next: string) => {
    const element = elements.current.get(next);
    if (element !== undefined) {
      element.click();
      return;
    }
    commitSync(() => onChangeRef.current(next));
  }, []);

  const execute = useCallback(
    async (inputs: Record<string, unknown>) => {
      const requested = typeof inputs.option === "string" ? inputs.option : "";
      const available = optionsRef.current;
      const match = available.find((entry) => entry.label === requested);

      if (match === undefined) {
        return `No option named "${requested}". This dropdown offers: ${available
          .map((entry) => `"${entry.label}"`)
          .join(", ")}.`;
      }

      choose(match.value);
      await afterCommit();
      if (!mounted.current) return "The selection removed this dropdown from the page.";
      return `Selected. The dropdown is now:\n${formatRef.current([nodeRef.current])}`;
    },
    [choose],
  );

  const schema = useMemo(() => optionSchema(options), [options]);

  const toolName = useAgentTool({
    spec: SELECT_OPTION_TOOL,
    label: agentName ?? label,
    inputSchema: schema,
    enabled: agentTool && !disabled,
    execute,
  });

  const optionParts: AgentPart[] = options.map((option, index) => ({
    part: "option",
    label: option.label,
    state: {
      ...(option.value === value ? { checked: true as const } : {}),
      ...(open && index === active ? { active: true as const } : {}),
      ...(option.count === undefined ? {} : { count: String(option.count) }),
      ...(disabled ? { disabled: true as const } : {}),
    },
  }));

  const node = buildAgentNode({
    component: selectMeta.name,
    label,
    tool: toolName,
    state: {
      ...(chosen === undefined ? {} : { value }),
      empty: chosen === undefined,
      disabled,
      required,
      invalid: error !== undefined,
    },
    parts: [...optionParts, ...messagePart(error, hint)],
  });
  nodeRef.current = node;

  if (view === "agent") {
    if (disabled || controls === "never") return <AgentLine node={node} />;
    return (
      <AgentControlGroup
        node={node}
        isActionable={(part) => part.part === "option"}
        onActivate={(_part, index) => {
          const target = options[index];
          if (target !== undefined) choose(target.value);
        }}
      />
    );
  }

  const labelId = `${id}-label`;
  const listId = `${id}-listbox`;
  const optionId = (index: number) => `${id}-option-${index}`;
  const messageId =
    error !== undefined ? `${id}-error` : hint !== undefined ? `${id}-hint` : undefined;

  const typeahead = (key: string): number => {
    const start = active < 0 ? chosenIndex : active;
    const lowered = key.toLowerCase();
    for (let step = 1; step <= options.length; step += 1) {
      const index = (start + step + options.length) % options.length;
      if (options[index]?.label.toLowerCase().startsWith(lowered)) return index;
    }
    return -1;
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    const key = event.key;

    if (!open) {
      if (key === "ArrowDown" || key === "ArrowUp" || key === "Enter" || key === " ") {
        event.preventDefault();
        show();
        return;
      }
      if (key === "Home" || key === "End") {
        event.preventDefault();
        show(key === "Home" ? 0 : last);
        return;
      }
      if (key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
        const match = typeahead(key);
        if (match >= 0) show(match);
      }
      return;
    }

    if (key === "Escape" || key === "Tab") {
      if (key === "Escape") event.preventDefault();
      hide();
      return;
    }
    if (key === "Enter" || key === " ") {
      event.preventDefault();
      const target = options[active];
      if (target !== undefined) commit(target.value);
      else hide();
      return;
    }
    if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") {
      event.preventDefault();
      const next =
        key === "Home"
          ? 0
          : key === "End"
            ? last
            : key === "ArrowDown"
              ? Math.min(active + 1, last)
              : Math.max(active - 1, 0);
      setActive(next);
      return;
    }
    if (key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const match = typeahead(key);
      if (match >= 0) setActive(match);
    }
  };

  const onKeyUp = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " ") event.preventDefault();
  };

  const onBlur = (event: ReactFocusEvent<HTMLButtonElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && root.current?.contains(next)) return;
    hide();
  };

  return (
    <div
      {...rest}
      {...agentAttributesFor(node)}
      ref={(target) => {
        root.current = target;
        const forwarded = rest.ref;
        if (typeof forwarded === "function") forwarded(target);
        else if (forwarded !== null && forwarded !== undefined)
          forwarded.current = target;
      }}
    >
      <label id={labelId} htmlFor={id}>
        {label}
      </label>
      <span {...agentPartAttributesFor({ part: "control", state: {} })}>
        <button
          id={id}
          type="button"
          role="combobox"
          {...agentPartAttributesFor({ part: "input", state: {} })}
          ref={(target) => {
            trigger.current = target;
          }}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
          aria-required={required || undefined}
          aria-invalid={error !== undefined || undefined}
          aria-describedby={messageId}
          onClick={() => (open ? hide() : show())}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onBlur={onBlur}
        >
          <span>{chosen === undefined ? (placeholder ?? "Choose") : chosen.label}</span>
          {chosen?.count === undefined ? null : (
            <span aria-hidden="true">{chosen.count}</span>
          )}
        </button>
        <div popover="manual" hidden={!open} ref={layer}>
          <div
            id={listId}
            role="listbox"
            aria-labelledby={labelId}
            tabIndex={-1}
            ref={listbox}
            onMouseDown={(event) => event.preventDefault()}
          >
            {options.map((option, index) => {
              const textId = `${optionId(index)}-label`;
              const countId = `${optionId(index)}-count`;
              return (
                // biome-ignore lint/a11y/useKeyWithClickEvents: focus stays on the combobox, whose keydown handler drives these options through aria-activedescendant
                <div
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  tabIndex={-1}
                  aria-selected={option.value === value}
                  aria-labelledby={
                    option.count === undefined ? undefined : `${textId} ${countId}`
                  }
                  ref={(element) => {
                    if (element === null) elements.current.delete(option.value);
                    else elements.current.set(option.value, element);
                  }}
                  {...agentPartAttributesFor(
                    optionParts[index] ?? { part: "option", state: {} },
                  )}
                  onPointerMove={() => {
                    if (index !== active) setActive(index);
                  }}
                  onClick={() => {
                    commit(option.value);
                    if (open) trigger.current?.focus();
                  }}
                >
                  <span id={textId}>{option.label}</span>
                  {option.count === undefined ? null : (
                    <span id={countId} aria-hidden="true">
                      {option.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </span>
      {name === undefined ? null : (
        <input type="hidden" name={name} value={chosen === undefined ? "" : value} />
      )}
      {error !== undefined ? (
        <p id={messageId} {...agentPartAttributesFor({ part: "error", state: {} })}>
          {error}
        </p>
      ) : hint !== undefined ? (
        <p id={messageId} {...agentPartAttributesFor({ part: "hint", state: {} })}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
