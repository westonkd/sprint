import {
  type ComponentPropsWithRef,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
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
import { useAgentTool } from "@/agent/webmcp/useAgentTool.ts";
import { useFloating } from "@/floating/useFloating.ts";
import { assignRef } from "../refs.ts";
import { Spinner } from "../Spinner/Spinner.tsx";
import { comboboxMeta } from "./meta.ts";
import { CHOOSE_COMBOBOX_TOOL } from "./tool.ts";
import "./Combobox.css";

export interface ComboboxOption {
  value: string;
  label: string;
  group?: string | undefined;
  description?: string | undefined;
  keywords?: readonly string[] | undefined;
  disabled?: boolean | undefined;
}

export type ComboboxFilter = (option: ComboboxOption, query: string) => boolean;

export interface ComboboxProps extends Omit<ComponentPropsWithRef<"div">, "onChange"> {
  label: string;
  options: readonly ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string | undefined;
  error?: string | undefined;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  hideLabel?: boolean;
  clearable?: boolean;
  clearLabel?: string;
  loading?: boolean;
  filter?: ComboboxFilter | false;
  onQueryChange?: (query: string) => void;
  groupLimit?: number;
  limit?: number;
  emptyLabel?: string;
  renderOption?: (option: ComboboxOption) => ReactNode;
  inputRef?: Ref<HTMLInputElement>;
  agentName?: string;
  agentTool?: boolean;
}

const AGENT_OPTION_LIMIT = 50;
const SEARCH_RESULT_LIMIT = 10;

function normalized(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export const matchesQuery: ComboboxFilter = (option, query) => {
  const needle = normalized(query);
  if (needle === "") return true;
  const haystack = [option.label, option.description ?? "", ...(option.keywords ?? [])]
    .map(normalized)
    .join(" ");
  return needle.split(/\s+/).every((word) => haystack.includes(word));
};

interface Section {
  group: string | undefined;
  options: ComboboxOption[];
  hidden: number;
}

function sectionsOf(
  options: readonly ComboboxOption[],
  groupLimit: number | undefined,
  limit: number,
): Section[] {
  const sections: Section[] = [];
  const byGroup = new Map<string | undefined, Section>();
  let shown = 0;
  for (const option of options) {
    let section = byGroup.get(option.group);
    if (section === undefined) {
      section = { group: option.group, options: [], hidden: 0 };
      byGroup.set(option.group, section);
      sections.push(section);
    }
    const full = groupLimit !== undefined && section.options.length >= groupLimit;
    if (full || shown >= limit) {
      section.hidden += 1;
      continue;
    }
    section.options.push(option);
    shown += 1;
  }
  return sections;
}

function messagePart(error: string | undefined, hint: string | undefined): AgentPart[] {
  if (error !== undefined) return [{ part: "error", label: error, state: {} }];
  if (hint !== undefined) return [{ part: "hint", label: hint, state: {} }];
  return [];
}

function optionPart(option: ComboboxOption, value: string): AgentPart {
  return {
    part: "option",
    label: option.label,
    state: {
      ...(option.value === value ? { checked: true as const } : {}),
      ...(option.group === undefined ? {} : { group: option.group }),
      ...(option.description === undefined ? {} : { description: option.description }),
      ...(option.disabled === true ? { disabled: true as const } : {}),
    },
  };
}

export function Combobox(props: ComboboxProps) {
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
    hideLabel = false,
    clearable = !required,
    clearLabel = "Clear",
    loading = false,
    filter = matchesQuery,
    onQueryChange,
    groupLimit,
    limit = 200,
    emptyLabel = "No matches",
    renderOption,
    inputRef,
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
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | undefined>(undefined);

  const root = useRef<HTMLDivElement | null>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const layer = useRef<HTMLDivElement | null>(null);
  const elements = useRef(new Map<string, HTMLDivElement>());
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const filterRef = useRef(filter);
  filterRef.current = filter;
  const clearableRef = useRef(clearable);
  clearableRef.current = clearable;
  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: comboboxMeta.name }));
  const mounted = useRef(true);
  const notifyQuery = useRef(onQueryChange);
  notifyQuery.current = onQueryChange;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const chosen = options.find((option) => option.value === value);

  const matches = useMemo(
    () =>
      filter === false || !open
        ? options
        : options.filter((option) => filter(option, query)),
    [options, filter, query, open],
  );
  const sections = useMemo(
    () => sectionsOf(matches, groupLimit, limit),
    [matches, groupLimit, limit],
  );
  const visible = useMemo(
    () =>
      sections.flatMap((section) =>
        section.options.filter((option) => option.disabled !== true),
      ),
    [sections],
  );

  const changeQuery = useCallback((next: string) => {
    setQuery(next);
    notifyQuery.current?.(next);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setActive(undefined);
    changeQuery("");
  }, [changeQuery]);

  useEffect(() => {
    if (disabled) close();
  }, [disabled, close]);

  useEffect(() => {
    if (!open) return;
    if (active !== undefined && visible.some((option) => option.value === active))
      return;
    setActive(visible[0]?.value);
  }, [open, visible, active]);

  useEffect(() => {
    if (!open || active === undefined) return;
    const element = elements.current.get(active);
    if (element !== undefined && typeof element.scrollIntoView === "function") {
      element.scrollIntoView({ block: "nearest" });
    }
  }, [open, active]);

  useFloating({
    open,
    anchor: input,
    floating: layer,
    matchWidth: true,
    boundary: root,
    onDismiss: close,
  });

  const commit = useCallback(
    (next: string) => {
      close();
      onChange(next);
    },
    [close, onChange],
  );

  const execute = useCallback(async (inputs: Record<string, unknown>) => {
    const requested = typeof inputs.option === "string" ? inputs.option : "";
    const available = optionsRef.current.filter((option) => option.disabled !== true);

    let target: ComboboxOption | undefined;
    if (requested.trim() === "") {
      if (!clearableRef.current)
        return "This field cannot be cleared; choose an option.";
    } else {
      const exact = available.filter(
        (option) => normalized(option.label) === normalized(requested),
      );
      const searched =
        exact.length > 0
          ? exact
          : available.filter((option) =>
              (filterRef.current === false ? matchesQuery : filterRef.current)(
                option,
                requested,
              ),
            );
      if (searched.length === 0) {
        return `No option matches "${requested}". Try a shorter search.`;
      }
      if (searched.length > 1) {
        const shown = searched.slice(0, SEARCH_RESULT_LIMIT);
        const more = searched.length - shown.length;
        return `"${requested}" matches ${searched.length} options. Call again with one exact label:\n${shown
          .map(
            (option) =>
              `- "${option.label}"${option.group === undefined ? "" : ` (${option.group})`}`,
          )
          .join("\n")}${more > 0 ? `\n- and ${more} more; search more narrowly.` : ""}`;
      }
      target = searched[0];
    }

    commitSync(() => onChangeRef.current(target?.value ?? ""));
    await afterCommit();
    if (!mounted.current) return "The change removed this field from the page.";
    return `${target === undefined ? "Cleared" : "Chosen"}. The field is now:\n${formatRef.current([nodeRef.current])}`;
  }, []);

  const toolName = useAgentTool({
    spec: CHOOSE_COMBOBOX_TOOL,
    label: agentName ?? label,
    enabled: agentTool && !disabled,
    execute,
  });

  const agentOptions = useMemo(() => {
    const enabled = options.filter((option) => option.disabled !== true);
    const first = enabled.slice(0, AGENT_OPTION_LIMIT);
    if (chosen === undefined || first.includes(chosen)) return first;
    return [chosen, ...first.slice(0, AGENT_OPTION_LIMIT - 1)];
  }, [options, chosen]);

  const shownParts =
    view === "agent" ? agentOptions : sections.flatMap((s) => s.options);
  const parts: AgentPart[] = [
    ...shownParts.map((option) => optionPart(option, value)),
    ...messagePart(error, hint),
  ];

  const node = buildAgentNode({
    component: comboboxMeta.name,
    label,
    tool: toolName,
    state: {
      value: chosen?.label,
      empty: chosen === undefined,
      options: String(options.length),
      ...(view === "agent" && options.length > agentOptions.length
        ? { listed: String(agentOptions.length) }
        : {}),
      loading,
      disabled,
      required,
      invalid: error !== undefined,
    },
    parts,
  });
  nodeRef.current = node;

  if (view === "agent") {
    if (disabled || controls === "never") return <AgentLine node={node} />;
    return (
      <AgentControlGroup
        node={node}
        isActionable={(part) => part.part === "option"}
        onActivate={(_part, index) => {
          const target = agentOptions[index];
          if (target !== undefined) commitSync(() => onChange(target.value));
        }}
      />
    );
  }

  const labelId = `${id}-label`;
  const listId = `${id}-listbox`;
  const optionId = (index: number) => `${id}-option-${index}`;
  const messageId =
    error !== undefined ? `${id}-error` : hint !== undefined ? `${id}-hint` : undefined;
  const indexOf = new Map(options.map((option, index) => [option.value, index]));
  const activeIndex = active === undefined ? undefined : indexOf.get(active);

  const move = (delta: 1 | -1 | "first" | "last") => {
    if (visible.length === 0) return;
    const position = visible.findIndex((option) => option.value === active);
    const next =
      delta === "first"
        ? 0
        : delta === "last"
          ? visible.length - 1
          : position < 0
            ? delta === 1
              ? 0
              : visible.length - 1
            : (position + delta + visible.length) % visible.length;
    setActive(visible[next]?.value);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    const key = event.key;
    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      move(key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (!open) return;
    if (key === "Home" || key === "End") {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        move(key === "Home" ? "first" : "last");
      }
      return;
    }
    if (key === "Enter") {
      event.preventDefault();
      if (active !== undefined) commit(active);
      return;
    }
    if (key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (key === "Tab") close();
  };

  const onBlur = (event: ReactFocusEvent<HTMLInputElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && root.current?.contains(next)) return;
    close();
  };

  const shownText = open ? query : (chosen?.label ?? "");

  return (
    <div
      {...rest}
      {...agentAttributesFor(node)}
      ref={(target) => {
        root.current = target;
        assignRef(ref, target);
      }}
    >
      <label
        id={labelId}
        htmlFor={id}
        {...(hideLabel ? { "data-sprint-visually-hidden": "" } : {})}
      >
        {label}
      </label>
      <div>
        <input
          id={id}
          type="text"
          role="combobox"
          {...agentPartAttributesFor({ part: "input", state: {} })}
          ref={(target) => {
            input.current = target;
            assignRef(inputRef, target);
          }}
          value={shownText}
          placeholder={chosen === undefined || open ? placeholder : undefined}
          disabled={disabled}
          required={required}
          autoComplete="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={
            open && activeIndex !== undefined ? optionId(activeIndex) : undefined
          }
          aria-invalid={error !== undefined || undefined}
          aria-describedby={messageId}
          aria-busy={loading || undefined}
          onChange={(event) => {
            changeQuery(event.currentTarget.value);
            setOpen(true);
          }}
          onClick={() => {
            if (!open && !disabled) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        />
        {loading ? <Spinner label="Loading options" size="small" /> : null}
        {clearable && chosen !== undefined && !disabled ? (
          <button
            type="button"
            aria-label={clearLabel}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              close();
              onChange("");
              input.current?.focus();
            }}
          >
            ×
          </button>
        ) : null}
      </div>
      <div popover="manual" hidden={!open} ref={layer}>
        <div
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          onMouseDown={(event) => event.preventDefault()}
        >
          {visible.length === 0 ? <p>{loading ? "Loading" : emptyLabel}</p> : null}
          {sections.map((section, position) => {
            const rendered = section.options.map((option) => {
              const index = indexOf.get(option.value) ?? 0;
              const part = optionPart(option, value);
              return (
                // biome-ignore lint/a11y/useKeyWithClickEvents: focus stays in the input, whose keydown handler drives these options through aria-activedescendant
                <div
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  tabIndex={-1}
                  aria-selected={option.value === value}
                  aria-disabled={option.disabled === true || undefined}
                  {...agentPartAttributesFor(
                    option.value === active && open
                      ? { ...part, state: { ...part.state, active: true } }
                      : part,
                  )}
                  ref={(element) => {
                    if (element === null) elements.current.delete(option.value);
                    else elements.current.set(option.value, element);
                  }}
                  onPointerMove={() => {
                    if (option.disabled !== true && option.value !== active)
                      setActive(option.value);
                  }}
                  onClick={() => {
                    if (option.disabled !== true) commit(option.value);
                  }}
                >
                  {renderOption === undefined ? (
                    <>
                      <span>{option.label}</span>
                      {option.description === undefined ? null : (
                        <span>{option.description}</span>
                      )}
                    </>
                  ) : (
                    renderOption(option)
                  )}
                </div>
              );
            });
            const more =
              section.hidden === 0 ? null : (
                <p aria-hidden="true">{section.hidden} more; keep typing to narrow</p>
              );
            if (section.group === undefined) {
              return (
                <div key={`ungrouped-${position}`} role="presentation">
                  {rendered}
                  {more}
                </div>
              );
            }
            const headingId = `${id}-group-${position}`;
            return (
              // biome-ignore lint/a11y/useSemanticElements: a fieldset groups form controls, and a listbox's options are not form controls
              <div key={section.group} role="group" aria-labelledby={headingId}>
                <span id={headingId}>{section.group}</span>
                {rendered}
                {more}
              </div>
            );
          })}
        </div>
      </div>
      {name === undefined ? null : <input type="hidden" name={name} value={value} />}
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
